"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function EfilingRouteGuard({ children, allowedRoles = [4] }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const safety = setTimeout(() => setLoading(false), 6000);

        async function checkAuth() {
            if (status === 'loading') return;
            if (!session?.user?.id) {
                router.push('/elogin');
                setLoading(false);
                return;
            }

            // Fast-path: for efilinguser area, any authenticated user can enter (feature-level checks in pages)
            if (pathname?.startsWith('/efilinguser')) {
                setIsAuthorized(true);
                setLoading(false);
                return;
            }

            // Coerce role to number if possible
            const rawRole = session?.user?.role;
            const roleNum = typeof rawRole === 'number' ? rawRole : Number(rawRole);

            if (!Number.isNaN(roleNum)) {
                if (allowedRoles.includes(roleNum)) {
                    setIsAuthorized(true);
                    setLoading(false);
                    return;
                }
                toast({ title: 'Access Denied', description: "You don't have permission to access this page.", variant: 'destructive' });
                router.push('/elogin');
                setLoading(false);
                return;
            }

            // Fallback: fetch e-filing profile to decide
            try {
                const res = await fetch('/api/efiling/users/profile', { signal: controller.signal });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.id) {
                        setIsAuthorized(true);
                        setLoading(false);
                        return;
                    }
                }
            } catch {}

            toast({ title: 'Access Denied', description: "Unable to verify your permissions.", variant: 'destructive' });
            router.push('/elogin');
            setLoading(false);
        }

        checkAuth();
        return () => {
            clearTimeout(safety);
            controller.abort();
        };
    }, [session, status, router, pathname, allowedRoles, toast]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking permissions...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return children;
}
