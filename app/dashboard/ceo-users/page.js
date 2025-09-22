import { Suspense } from "react";
import { connectToDatabase } from "@/lib/db";
import CeoUsersList from "./components/CeoUsersList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";

// Force dynamic rendering to prevent build-time database connections
export const dynamic = 'force-dynamic';

async function getCeoUsers() {
  let client;
  try {
    // Check if we're in build mode
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping database connection during build phase');
      return [];
    }

    client = await connectToDatabase();
    const result = await client.query(`
      SELECT 
        id,
        name,
        email,
        contact_number,
        image,
        created_date,
        updated_date
      FROM users 
      WHERE role = 5
      ORDER BY created_date DESC
    `);

    // Extract rows from the PostgreSQL result object
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching CEO users:', {
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
    return [];
  } finally {
    if (client && client.release) {
      client.release();
    }
  }
}

export default async function CeoUsersPage() {
  const session = await getServerSession(authOptions);
  
  // Only allow admins (role 1) to access this page
  if (!session?.user || session.user.userType !== 'user' || parseInt(session.user.role) !== 1) {
    redirect('/unauthorized');
  }

  const ceoUsers = await getCeoUsers();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CEO Users Management</h1>
        <p className="text-gray-600 mt-2">
          Manage CEO accounts for KW&SC Water Corporation
        </p>
      </div>

      <Suspense fallback={<div>Loading CEO users...</div>}>
        <CeoUsersList ceoUsers={ceoUsers} />
      </Suspense>
    </div>
  );
}
