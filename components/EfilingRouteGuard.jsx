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

    const isDualPortal = Boolean(session?.user?.isDualPortal);

    const checkAccessAndNetwork = async () => {
      let isInternal = false;
      let isDual = false;

      try {
        const netRes = await fetch("/api/auth/dual-portal-status");
        if (netRes.ok) {
          const netData = await netRes.json();
          isInternal = Boolean(netData.isInternalNetwork);
          isDual = Boolean(
            netData.isDualPortalUser ||
            session?.user?.isDualPortal
          );
        }
      } catch (err) {
        console.error("Network check failed:", err);
      }

      // If user is on an external network AND is NOT a dual-portal user -> block and redirect to login
      if (!isInternal && !isDual) {
        router.replace("/login");
        setAuthorized(false);
        setChecking(false);
        return;
      }

      // Dual-portal users (anywhere) or internal admins are authorized for E-Filing
      if (isDual || (isInternal && (isGlobal || roleNumber === 1))) {
        setAuthorized(true);
        setChecking(false);
        toastShownRef.current = false;
        return;
      }

      // For efilinguser routes, check if user has efiling profile
      if (pathname?.startsWith("/efilinguser")) {
        if (efilingUserId) {
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
          const hasDashboard = [1, 2, 3].includes(roleNumber);
          if (hasDashboard) {
            router.push("/dashboard");
          } else {
            router.push("/login");
          }
          setAuthorized(false);
          setChecking(false);
          return;
        }

        if (!efilingUserId) {
          setChecking(true);
          return;
        }
      }

      // Check role-based access for /efiling routes
      if (!roleAllowed) {
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
        }
        const hasDashboard = [1, 2, 3].includes(roleNumber);
        if (hasDashboard) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
        setAuthorized(false);
        setChecking(false);
        return;
      }

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
