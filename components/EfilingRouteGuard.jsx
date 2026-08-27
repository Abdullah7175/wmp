"use client";

import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { EfilingUserContext } from "@/context/EfilingUserContext";

export function EfilingRouteGuard({ children, allowedRoles = [] }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const efilingContext = useContext(EfilingUserContext);
  const profileLoading = efilingContext?.loading ?? false;
  const isGlobal = efilingContext?.isGlobal ?? false;
  const efilingUserId = efilingContext?.efilingUserId ?? null;
  const contextRoleNumber = efilingContext?.userRoleNumber;

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  // Track if we've already shown a toast to prevent infinite loops
  const toastShownRef = useRef(false);

  const roleNumber = useMemo(() => {
    if (typeof contextRoleNumber === "number" && !Number.isNaN(contextRoleNumber)) {
      return contextRoleNumber;
    }
    const raw = session?.user?.role;
    const parsed = typeof raw === "number" ? raw : Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }, [contextRoleNumber, session?.user?.role]);

  useEffect(() => {
    // Wait for session and profile to finish loading
    if (status === "loading" || profileLoading) {
      setChecking(true);
      return;
    }

    // If no session, redirect to login
    if (!session?.user?.id) {
      router.push("/login");
      setChecking(false);
      setAuthorized(false);
      return;
    }

    const normalizedAllowedRoles = allowedRoles ?? [];
    const roleAllowed =
      normalizedAllowedRoles.length === 0 ||
      (roleNumber !== null && normalizedAllowedRoles.includes(roleNumber));

    const isDualPortal = Boolean(session?.user?.isDualPortal || roleNumber === 1);

    const checkAccessAndNetwork = async () => {
      // 1. Mandatory IP verification: E-Filing is strictly restricted to allowed IP ranges in .env
      try {
        const netRes = await fetch("/api/auth/dual-portal-status");
        if (netRes.ok) {
          const netData = await netRes.json();
          if (!netData.isInternalNetwork) {
            if (!toastShownRef.current) {
              toastShownRef.current = true;
              toast({
                title: "Access Restricted",
                description: "E-Filing can only be accessed from the authorized office network. Redirecting to Works Portal...",
                variant: "destructive",
              });
            }
            router.replace("/dashboard");
            setAuthorized(false);
            setChecking(false);
            return;
          }
        }
      } catch (err) {
        console.error("Network check failed:", err);
      }

      // 2. For efilinguser routes, check if user has efiling profile or dual-portal authorization
      if (pathname?.startsWith("/efilinguser")) {
        if (isDualPortal || isGlobal || efilingUserId) {
          setAuthorized(true);
          setChecking(false);
          toastShownRef.current = false;
          return;
        }
        
        if (profileLoading) {
          setChecking(true);
          return;
        }
        
        if (!efilingUserId && !toastShownRef.current) {
          toastShownRef.current = true;
          toast({
            title: "Access Unavailable",
            description: "E-filing profile could not be found for your account.",
            variant: "destructive",
          });
          router.push("/dashboard");
          setAuthorized(false);
          setChecking(false);
          return;
        }
        
        if (!efilingUserId) {
          setChecking(true);
          return;
        }
      }

      // 3. For other routes, check global access or dual portal access
      if (isGlobal || isDualPortal) {
        setAuthorized(true);
        setChecking(false);
        toastShownRef.current = false;
        return;
      }

      // 4. Check role-based access
      if (!roleAllowed) {
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
        }
        router.push("/dashboard");
        setAuthorized(false);
        setChecking(false);
        return;
      }

      // Default: authorize access
      setAuthorized(true);
      setChecking(false);
      toastShownRef.current = false;
    };

    checkAccessAndNetwork();
  }, [
    session?.user?.id,
    session?.user?.isDualPortal,
    roleNumber,
    allowedRoles,
    profileLoading,
    status,
    router,
    pathname,
    efilingUserId,
    isGlobal,
  ]);

  if (status === "loading" || profileLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access & network permissions...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page from this network.</p>
        </div>
      </div>
    );
  }

  return children;
}
