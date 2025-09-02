"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function EfilingRouteGuard({ children, allowedRoles = [1] }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthorization = async () => {
            if (status === "loading") return;
            
            if (!session?.user?.id) {
                router.push('/elogin');
                return;
            }

            try {
                // Fetch user details to get role
                const response = await fetch(`/api/users/${session.user.id}`);
                if (response.ok) {
                    const userData = await response.json();
                    const userRole = userData.role;
                    
                    // Check if user role is in allowed roles
                    if (allowedRoles.includes(userRole)) {
                        setIsAuthorized(true);
                    } else {
                        // User not authorized for this page
                        toast({
                            title: "Access Denied",
                            description: "You don't have permission to access this page.",
                            variant: "destructive",
                        });
                        
                        // Redirect based on role
                        if (userRole === 4) {
                            router.push('/efilinguser');
                        } else {
                            router.push('/elogin');
                        }
                    }
                } else {
                    // Error fetching user data
                    toast({
                        title: "Error",
                        description: "Unable to verify your permissions.",
                        variant: "destructive",
                    });
                    router.push('/elogin');
                }
            } catch (error) {
                console.error('Error checking authorization:', error);
                toast({
                    title: "Error",
                    description: "An error occurred while checking permissions.",
                    variant: "destructive",
                });
                router.push('/elogin');
            } finally {
                setLoading(false);
            }
        };

        checkAuthorization();
    }, [session, status, router, allowedRoles, toast]);

    if (status === "loading" || loading) {
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
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return children;
}
