// logoutUtils.js
// Centralized logout utility for consistent session clearing across the application

import { signOut } from "next-auth/react";

/**
 * Perform a complete logout:
 * 1. Call the logout API to clear server-side session cookies
 * 2. Call NextAuth signOut to clear client-side session
 * 3. Redirect to the specified URL
 * 
 * @param {string} redirectUrl - URL to redirect after logout (default: '/')
 * @param {boolean} useHardRedirect - Use window.location.href instead of router.push for immediate redirect
 * @param {object} router - Next.js router object (required if useHardRedirect is false)
 * @returns {Promise<void>}
 */
export async function performLogout(redirectUrl = "/", useHardRedirect = false, router = null) {
    try {
        // Step 1: Call the logout API to clear server-side session cookies
        console.log("Clearing server-side session...");
        const response = await fetch("/api/users/logout", { method: "POST" });

        if (!response.ok) {
            console.warn(`Logout API returned status ${response.status}, but continuing with client-side logout`);
        }

        // Step 2: Clear client-side session data
        console.log("Clearing client-side session...");
        localStorage.removeItem("user");
        sessionStorage.clear();

        // Step 3: Call NextAuth signOut to clear NextAuth session
        // IMPORTANT: This must be called AFTER the API logout to avoid session validation issues
        console.log("Signing out from NextAuth...");
        await signOut({ redirect: false });

        // Step 4: Redirect to the specified URL
        console.log(`Redirecting to ${redirectUrl}`);
        if (useHardRedirect) {
            // Hard redirect - immediate browser navigation
            window.location.href = redirectUrl;
        } else if (router) {
            // Soft redirect using Next.js router
            router.push(redirectUrl);
        } else {
            // Fallback to hard redirect if router not provided
            window.location.href = redirectUrl;
        }
    } catch (error) {
        console.error("Error during logout:", error);

        // Even if there's an error, attempt to redirect
        // This prevents users from being stuck if logout fails
        try {
            if (useHardRedirect) {
                window.location.href = redirectUrl;
            } else if (router) {
                router.push(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }
        } catch (redirectError) {
            console.error("Failed to redirect during logout error:", redirectError);
        }
    }
}

/**
 * Quick logout without NextAuth signOut (for components that don't use NextAuth)
 * Useful for legacy logout flows
 * 
 * @param {string} redirectUrl - URL to redirect after logout
 * @param {object} router - Next.js router object (required)
 * @returns {Promise<void>}
 */
export async function performQuickLogout(redirectUrl = "/", router) {
    try {
        // Call the logout API to clear server-side session
        await fetch("/api/users/logout", { method: "POST" });

        // Clear local storage
        localStorage.removeItem("user");
        sessionStorage.clear();

        // Redirect
        if (router) {
            router.push(redirectUrl);
        } else {
            window.location.href = redirectUrl;
        }
    } catch (error) {
        console.error("Error during quick logout:", error);
        // Redirect anyway
        window.location.href = redirectUrl;
    }
}
