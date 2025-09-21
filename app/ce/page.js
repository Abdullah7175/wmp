import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import CESidebar from "./CESidebar";

export default async function CEPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has CE role (7)
  if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 7) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <CESidebar />
        <main className="flex-1">
          <div className="p-4 lg:p-6">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Chief Engineer Portal</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-2">
                Welcome to the Chief Engineer portal. Manage work requests and provide approvals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Requests</h3>
                <p className="text-3xl font-bold text-blue-600">-</p>
                <p className="text-sm text-gray-500 mt-1">All work requests</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
                <p className="text-3xl font-bold text-yellow-600">-</p>
                <p className="text-sm text-gray-500 mt-1">Awaiting your approval</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved Today</h3>
                <p className="text-3xl font-bold text-green-600">-</p>
                <p className="text-sm text-gray-500 mt-1">Requests approved today</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import CESidebar from "./CESidebar";

export default async function CEPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has CE role (7)
  if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 7) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <CESidebar />
        <main className="flex-1">
          <div className="p-4 lg:p-6">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Chief Engineer Portal</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-2">
                Welcome to the Chief Engineer portal. Manage work requests and provide approvals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Requests</h3>
                <p className="text-3xl font-bold text-blue-600">-</p>
                <p className="text-sm text-gray-500 mt-1">All work requests</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
                <p className="text-3xl font-bold text-yellow-600">-</p>
                <p className="text-sm text-gray-500 mt-1">Awaiting your approval</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved Today</h3>
                <p className="text-3xl font-bold text-green-600">-</p>
                <p className="text-sm text-gray-500 mt-1">Requests approved today</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
