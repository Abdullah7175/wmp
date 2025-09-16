"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

const RequestDetailPage = () => {
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [smAgents, setSmAgents] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedSmAgents, setSelectedSmAgents] = useState([]);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await fetch(`/api/requests?id=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setRequest(data);
                    
                    // Set initial values for selects
                    if (data.status_id) {
                        setSelectedStatus({
                            value: data.status_id,
                            label: data.status_name
                        });
                    }

                    if (data.assigned_sm_agents) {
                        setSelectedSmAgents(data.assigned_sm_agents.map(sm => ({
                            value: sm.sm_agent_id,
                            label: sm.sm_agent_name,
                            status: sm.status
                        })));
                    }
                }
            } catch (error) {
                console.error('Error fetching request:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSmAgents = async () => {
            try {
                const res = await fetch('/api/socialmediaperson');
                if (res.ok) {
                    const data = await res.json();
                    // The API returns { data: [...], total } structure
                    setSmAgents(data.data || data);
                }
            } catch (error) {
                console.error('Error fetching social media agents:', error);
            }
        };

        const fetchStatuses = async () => {
            try {
                const res = await fetch('/api/status');
                if (res.ok) {
                    const data = await res.json();
                    setStatuses(data);
                }
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };

        fetchRequest();
        fetchSmAgents();
        fetchStatuses();
    }, [id]);

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/requests`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status_id: selectedStatus?.value,
                    assigned_sm_agents: selectedSmAgents.map(sm => ({
                        sm_agent_id: sm.value,
                        status: sm.status || 1
                    }))
                }),
            });

            if (response.ok) {
                toast({
                    title: "Request updated successfully",
                    variant: 'success',
                });
                router.push('/dashboard/requests');
            } else {
                toast({
                    title: "Failed to update request",
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error updating request:', error);
            toast({
                title: "An error occurred",
                variant: 'destructive',
            });
        }
    };

    const handleSmAgentChange = (selectedOptions) => {
        setSelectedSmAgents(selectedOptions || []);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!request) {
        return <div>Request not found</div>;
    }

    const smAgentOptions = (smAgents || []).map(sm => ({
        value: sm.id,
        label: sm.name
    }));

    const statusOptions = (statuses || []).map(status => ({
        value: status.id,
        label: status.name
    }));

    return (
        <div className="container mx-auto py-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Request Details</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
                        <div className="space-y-2">
                            <p><span className="font-medium">Request ID:</span> {request.id}</p>
                            <p><span className="font-medium">Date:</span> {new Date(request.request_date).toLocaleDateString()}</p>
                            <p><span className="font-medium">Town:</span> {request.town_name}</p>
                            {request.subtown_name && <p><span className="font-medium">Sub Town:</span> {request.subtown_name}</p>}
                            <p><span className="font-medium">Department:</span> {request.complaint_type}</p>
                            {request.complaint_subtype && <p><span className="font-medium">Nature of Work:</span> {request.complaint_subtype}</p>}
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
                        <div className="space-y-2">
                            <p><span className="font-medium">Contact Number:</span> {request.contact_number}</p>
                            <p><span className="font-medium">Address:</span> {request.address}</p>
                            <p><span className="font-medium">Created By:</span> {request.creator_name} ({request.creator_type})</p>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-semibold mb-2">Work Description</h2>
                        <p className="whitespace-pre-line">{request.description}</p>
                    </div>

                    {/* CEO/COO Comments Section */}
                    {(request.ceo_comments || request.coo_comments) && (
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-semibold mb-4">Executive Comments</h2>
                            <div className="space-y-4">
                                {request.ceo_comments && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                CEO
                                            </span>
                                            <span className="text-sm text-blue-600 font-medium">
                                                {request.ceo_approval_status === 'approved' ? 'Approved' : 
                                                 request.ceo_approval_status === 'not_approved' ? 'Not Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-blue-800">{request.ceo_comments}</p>
                                    </div>
                                )}
                                
                                {request.coo_comments && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                COO
                                            </span>
                                            <span className="text-sm text-green-600 font-medium">
                                                {request.coo_approval_status === 'approved' ? 'Approved' : 
                                                 request.coo_approval_status === 'not_approved' ? 'Not Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-green-800">{request.coo_comments}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Assignment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <Select
                                options={statusOptions}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                className="basic-select"
                                classNamePrefix="select"
                                placeholder="Select status"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Media Cell Agents</label>
                            <Select
                                isMulti
                                options={smAgentOptions}
                                value={selectedSmAgents}
                                onChange={handleSmAgentChange}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholder="Select social media agents"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button 
                            variant="outline" 
                            onClick={() => router.push('/dashboard/requests')}
                        >
                            Back to List
                        </Button>
                        <Button onClick={handleUpdate}>
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Performa Button - only if status is Completed */}
                {request.status_name === 'Completed' && (
                    <div className="mt-8 flex justify-end">
                        <Button
                            onClick={() => router.push(`/dashboard/requests/performa/${request.id}`)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Generate/View Performa
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestDetailPage;