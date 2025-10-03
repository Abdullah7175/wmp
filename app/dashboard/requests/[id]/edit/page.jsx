"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { RequestForm } from "@/app/dashboard/requests/add/RequestForm";
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

const EditRequestPage = () => {
    const { id } = useParams();
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await fetch(`/api/requests?id=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setRequestData(data);
                } else {
                    throw new Error('Failed to fetch request');
                }
            } catch (error) {
                console.error('Error fetching request:', error);
                toast({
                    title: "Error",
                    description: "Failed to load request data",
                    variant: "destructive"
                });
                router.back();
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [id, router, toast]);

    // Check if user can edit this request
    const canEdit = () => {
        if (!session?.user || !requestData) return false;
        
        const userRole = parseInt(session.user.role);
        const userType = session.user.userType;
        const creatorType = requestData.creator_type;
        const creatorId = requestData.creator_id;
        const userId = session.user.id;

        // Debug logging
        console.log('Debug - User Role:', userRole, typeof userRole);
        console.log('Debug - User Type:', userType);
        console.log('Debug - Creator Type:', creatorType);
        console.log('Debug - Creator ID:', creatorId);
        console.log('Debug - User ID:', userId);

        // Admin (role = 1) can edit any request
        if (userRole === 1) return true;
        
        // Manager (role = 2) can edit any request
        if (userRole === 2) return true;
        
        // Users can only edit their own requests
        if (userType === 'user' && creatorType === 'user' && creatorId === userId) return true;
        
        // Agents can only edit their own requests
        if (userType === 'agent' && creatorType === 'agent' && creatorId === userId) return true;
        
        // Social media agents can only edit their own requests
        if (userType === 'socialmedia' && creatorType === 'socialmedia' && creatorId === userId) return true;
        
        return false;
    };

    const handleSubmit = async (values) => {
        try {
            const response = await fetch(`/api/requests`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    ...values
                }),
            });

            if (response.ok) {
                toast({
                    title: "Request updated successfully",
                    variant: 'success',
                });
                router.back();
            } else {
                throw new Error('Failed to update request');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            toast({
                title: "Error",
                description: "Failed to update request",
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return <div className="container mx-auto py-6">Loading request data...</div>;
    }

    if (!requestData) {
        return <div className="container mx-auto py-6">Request not found</div>;
    }

    if (!canEdit()) {
        return (
            <div className="container mx-auto py-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
                    <p className="text-red-600 mt-2">
                        You don&apos;t have permission to edit this request. Only the creator, managers, and admins can edit requests.
                    </p>
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold">Debug Information:</h3>
                        <p>User Role: {session?.user?.role} (type: {typeof session?.user?.role})</p>
                        <p>User Type: {session?.user?.userType}</p>
                        <p>User ID: {session?.user?.id}</p>
                        <p>Creator Type: {requestData?.creator_type}</p>
                        <p>Creator ID: {requestData?.creator_id}</p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => router.back()}
                        className="mt-4"
                    >
                        Back to Requests
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Edit Work Request</h1>
                    <p className="text-gray-600 mt-1">
                        Created by: {requestData.creator_name} ({requestData.creator_type})
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                >
                    Back to Requests
                </Button>
            </div>
            <RequestForm 
                initialValues={{
                    town_id: requestData.town_id,
                    subtown_id: requestData.subtown_id || '',
                    complaint_type_id: requestData.complaint_type_id,
                    complaint_subtype_id: requestData.complaint_subtype_id || '',
                    contact_number: requestData.contact_number,
                    address: requestData.address,
                    description: requestData.description,
                    latitude: requestData.latitude,
                    longitude: requestData.longitude,
                    creator_id: requestData.creator_id,
                    creator_type: requestData.creator_type,
                    nature_of_work: requestData.nature_of_work || '',
                    budget_code: requestData.budget_code || '',
                    file_type: requestData.file_type || '',
                    executive_engineer_id: requestData.executive_engineer_id || '',
                    contractor_id: requestData.contractor_id || '',
                    assigned_sm_agents: requestData.assigned_sm_agents || [],
                }}
                onSubmit={handleSubmit}
                isEditMode={true}
            />
        </div>
    );
};

export default EditRequestPage; 