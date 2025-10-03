"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, User, Phone, Map, Image as ImageIcon, Video, Users, FileText } from 'lucide-react';
import Image from 'next/image';

const ViewRequestPage = () => {
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [finalVideos, setFinalVideos] = useState([]);
    const [assignedAgents, setAssignedAgents] = useState([]);
    const [assignedSmAgents, setAssignedSmAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchRequestData = async () => {
            try {
                // Fetch main request data
                const requestRes = await fetch(`/api/requests?id=${id}`);
                if (requestRes.ok) {
                    const requestData = await requestRes.json();
                    setRequest(requestData);
                }

                // Fetch images
                const imagesRes = await fetch(`/api/images/work-request?work_request_id=${id}`);
                if (imagesRes.ok) {
                    const imagesData = await imagesRes.json();
                    setImages(imagesData.data || imagesData || []);
                }

                // Fetch videos
                const videosRes = await fetch(`/api/videos/work-request?work_request_id=${id}`);
                if (videosRes.ok) {
                    const videosData = await videosRes.json();
                    setVideos(videosData.data || videosData || []);
                }

                // Fetch final videos
                const finalVideosRes = await fetch(`/api/final-videos?workRequestId=${id}`);
                if (finalVideosRes.ok) {
                    const finalVideosData = await finalVideosRes.json();
                    setFinalVideos(finalVideosData.data || finalVideosData || []);
                }

                // Fetch assigned agents
                const agentsRes = await fetch(`/api/agents?work_request_id=${id}`);
                if (agentsRes.ok) {
                    const agentsData = await agentsRes.json();
                    setAssignedAgents(agentsData.data || agentsData || []);
                }

                // Fetch assigned social media agents
                const smAgentsRes = await fetch(`/api/socialmediaperson?work_request_id=${id}`);
                if (smAgentsRes.ok) {
                    const smAgentsData = await smAgentsRes.json();
                    setAssignedSmAgents(smAgentsData.data || smAgentsData || []);
                }

            } catch (error) {
                console.error('Error fetching request data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load request data",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRequestData();
    }, [id, toast]);

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading request details...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Request Not Found</h1>
                    <p className="text-gray-600 mb-4">The requested work request could not be found.</p>
                    <Button onClick={() => router.back()}>
                        Back to Requests
                    </Button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            "Pending": "bg-yellow-100 text-yellow-800",
            "Assigned": "bg-blue-100 text-blue-800",
            "In Progress": "bg-orange-100 text-orange-800",
            "Completed": "bg-green-100 text-green-800",
            "Cancelled": "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const openMapLink = (lat, lng) => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Request #{request.id}</h1>
                    <p className="text-gray-600 mt-1">Work Request Details</p>
                </div>
                <div className="flex space-x-3">
                    <Button 
                        variant="outline" 
                        onClick={() => router.push(`/dashboard/requests/${id}/edit`)}
                    >
                        Edit Request
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => router.back()}
                    >
                        Back to List
                    </Button>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
                <Badge className={`px-4 py-2 text-lg ${getStatusColor(request.status_name)}`}>
                    {request.status_name || 'Unknown Status'}
                </Badge>
            </div>

            {/* Main Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Request ID</label>
                                <p className="text-lg font-semibold">#{request.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Request Date</label>
                                <p className="text-lg font-semibold flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(request.request_date)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Town</label>
                                <p className="text-lg font-semibold">{request.town_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Sub Town</label>
                                <p className="text-lg font-semibold">{request.subtown_name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Department</label>
                                <p className="text-lg font-semibold">{request.complaint_type || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nature of Work</label>
                                <p className="text-lg font-semibold">{request.complaint_subtype || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Work Type</label>
                            <p className="text-lg font-semibold">{request.nature_of_work || 'N/A'}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-line">
                                {request.description || 'No description provided'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact & Location Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Contact & Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Contact Number</label>
                            <p className="text-lg font-semibold flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {request.contact_number || 'N/A'}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Address</label>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                {request.address || 'No address provided'}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Main Location</label>
                            {request.latitude && request.longitude ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Lat: {request.latitude}, Lng: {request.longitude}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openMapLink(request.latitude, request.longitude)}
                                        className="flex items-center gap-2"
                                    >
                                        <Map className="h-4 w-4" />
                                        View on Map
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No location coordinates available</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Created By</label>
                            <p className="text-lg font-semibold flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {request.creator_name || 'Unknown'} ({request.creator_type || 'Unknown'})
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Locations */}
            {request.additional_locations && request.additional_locations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Map className="h-5 w-5" />
                            Additional Locations ({request.additional_locations.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {request.additional_locations.map((location, index) => (
                                <div key={location.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-semibold text-gray-800 mb-2">Location {index + 1}</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Coordinates:</span><br />
                                            Lat: {location.latitude}<br />
                                            Lng: {location.longitude}
                                        </p>
                                        {location.description && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Description:</span><br />
                                                {location.description}
                                            </p>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openMapLink(location.latitude, location.longitude)}
                                            className="w-full flex items-center gap-2"
                                        >
                                            <Map className="h-4 w-4" />
                                            View on Map
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Assigned People */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Executive Engineer & Contractor */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Project Team
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Executive Engineer</label>
                            <p className="text-lg font-semibold">
                                {request.executive_engineer_name || 'Not assigned'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Contractor</label>
                            <p className="text-lg font-semibold">
                                {request.contractor_name || 'Not assigned'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Assistant</label>
                            <p className="text-lg font-semibold">
                                {request.assistant_name || 'Not assigned'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media Agents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Media Team
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assignedSmAgents.length > 0 ? (
                            <div className="space-y-3">
                                {assignedSmAgents.map((agent, index) => (
                                    <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{agent.name}</p>
                                            <p className="text-sm text-gray-600">{agent.email}</p>
                                        </div>
                                        <Badge variant="secondary">Agent {index + 1}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No social media agents assigned</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Media Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Images ({images.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {images.map((image, index) => (
                                    <div key={image.id || index} className="relative">
                                        <Image
                                            src={image.link}
                                            alt={`Work request image ${index + 1}`}
                                            width={200}
                                            height={150}
                                            className="rounded-lg object-cover w-full h-32"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div className="hidden bg-gray-100 rounded-lg w-full h-32 flex items-center justify-center text-gray-500">
                                            Image not available
                                        </div>
                                        {image.description && (
                                            <p className="text-xs text-gray-600 mt-1 truncate">
                                                {image.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No images uploaded for this request</p>
                        )}
                    </CardContent>
                </Card>

                {/* Videos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5" />
                            Videos ({videos.length + finalVideos.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Regular Videos */}
                            {videos.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Work Videos ({videos.length})</h4>
                                    <div className="space-y-2">
                                        {videos.map((video, index) => (
                                            <div key={video.id || index} className="p-3 bg-gray-50 rounded-lg">
                                                <p className="font-medium text-sm">Video {index + 1}</p>
                                                {video.description && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {video.description}
                                                    </p>
                                                )}
                                                <a 
                                                    href={video.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                                                >
                                                    View Video →
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Final Videos */}
                            {finalVideos.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Final Videos ({finalVideos.length})</h4>
                                    <div className="space-y-2">
                                        {finalVideos.map((video, index) => (
                                            <div key={video.id || index} className="p-3 bg-green-50 rounded-lg">
                                                <p className="font-medium text-sm">Final Video {index + 1}</p>
                                                {video.description && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {video.description}
                                                    </p>
                                                )}
                                                <a 
                                                    href={video.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-800 text-sm mt-1 inline-block"
                                                >
                                                    View Final Video →
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {videos.length === 0 && finalVideos.length === 0 && (
                                <p className="text-gray-500 italic">No videos uploaded for this request</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Budget Code</label>
                            <p className="text-lg font-semibold">{request.budget_code || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">File Type</label>
                            <p className="text-lg font-semibold">{request.file_type || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">District</label>
                            <p className="text-lg font-semibold">{request.district_name || 'Not specified'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
                <Button 
                    variant="outline" 
                    onClick={() => router.push(`/dashboard/requests/${id}/edit`)}
                >
                    Edit Request
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => router.push(`/dashboard/requests/${id}`)}
                >
                    Manage Assignment
                </Button>
                {request.status_name === 'Completed' && (
                    <Button
                        onClick={() => router.push(`/dashboard/requests/performa/${request.id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        View Performa
                    </Button>
                )}
                <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                >
                    Back to Requests
                </Button>
            </div>
        </div>
    );
};

export default ViewRequestPage;
