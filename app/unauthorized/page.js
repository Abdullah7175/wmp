"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const handleLogout = async () => {
    await signOut({ redirect: false });
    localStorage.removeItem('jwtToken');
    document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 text-sm">
          You do not have authorization to access this portal from your account or network location.
        </p>
        <div className="pt-2">
          <Button onClick={handleLogout} className="w-full bg-blue-900 hover:bg-blue-800 text-white gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
} 