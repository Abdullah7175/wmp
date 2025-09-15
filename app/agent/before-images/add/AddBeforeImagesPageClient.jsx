"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddBeforeImageForm from './addBeforeImageForm';

export default function AddBeforeImagesPageClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workRequestId = searchParams.get('requestId');

  const handleClose = () => {
    if (workRequestId) {
      router.push('/agent/requests');
    } else {
      router.push('/agent/before-images');
    }
  };

  if (!session?.user) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Before Images</h1>
        {workRequestId && (
          <p className="text-gray-600">Work Request ID: {workRequestId}</p>
        )}
      </div>
      <AddBeforeImageForm 
        workRequestId={workRequestId} 
        onClose={handleClose} 
      />
    </div>
  );
}