"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/login");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="text-center p-8">
                <div className="flex justify-center mb-6">
                    <Image src="/logo.png" width={100} height={100} alt="KW&SC Logo" className="shadow-lg rounded-xl" priority />
                </div>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h1 className="text-xl font-semibold text-gray-800">Works Management Portal</h1>
                <p className="text-sm text-gray-500 mt-1">Karachi Water & Sewerage Corporation</p>
                <p className="text-xs text-gray-400 mt-4">Redirecting to login...</p>
            </div>
        </div>
    );
}
