import { Suspense } from "react";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import EditCeoUserForm from "./components/EditCeoUserForm";

async function getCeoUserDetails(userId) {
  try {
    const user = await query(`
      SELECT 
        id,
        name,
        email,
        contact_number,
        image,
        role,
        created_date,
        updated_date
      FROM users 
      WHERE id = $1 AND role = 5
    `, [userId]);

    if (!user.rows || user.rows.length === 0) {
      return null;
    }

    return user.rows[0];
  } catch (error) {
    console.error('Error fetching CEO user details:', error);
    return null;
  }
}

export default async function EditCeoUserPage({ params }) {
  const userData = await getCeoUserDetails(params.id);

  if (!userData) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit CEO User</h1>
        <p className="text-gray-600 mt-2">
          Update CEO user information and settings
        </p>
      </div>

      <Suspense fallback={<div>Loading user details...</div>}>
        <EditCeoUserForm userData={userData} />
      </Suspense>
    </div>
  );
}
