"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EFileLoginPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect all visits to the unified login page
        router.replace("/login");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
        </div>
    );
}
