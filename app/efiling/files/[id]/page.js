"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Download, Eye, Clock, User, Building2, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FileDetail() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id || !params.id) return;
        fetchFile();
    }, [session?.user?.id, params.id]);

    const fetchFile = async () => {
        setLoading(true);
        try {
            const fileRes = await fetch(`/api/efiling/files/${params.id}`);
            if (!fileRes.ok) {
                throw new Error(`File not found: ${fileRes.status}`);
            }
            const fileData = await fileRes.json();
            setFile(fileData);
        } catch (error) {
            console.error('Error fetching file:', error);
            toast({
                title: "Error",
                description: "Failed to load file details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'low': return 'bg-gray-100 text-gray-800';
            case 'normal': return 'bg-blue-100 text-blue-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConfidentialityColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'normal': return 'bg-green-100 text-green-800';
            case 'confidential': return 'bg-yellow-100 text-yellow-800';
            case 'secret': return 'bg-orange-100 text-orange-800';
            case 'top_secret': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading file details...</div>
            </div>
        );
    }

    if (!file) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-red-600">File not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">File Details</h1>
                        <p className="text-gray-600">View comprehensive file information</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button
                        onClick={() => router.push(`/efiling/files/${file.id}/edit`)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit File
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* File Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                File Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">File Number</label>
                                    <p className="text-lg font-semibold">{file.file_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <div className="mt-1">
                                        <Badge className={getStatusColor(file.status_name)}>
                                            {file.status_name}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-600">Subject</label>
                                <p className="text-lg">{file.subject}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Department</label>
                                    <p className="flex items-center">
                                        <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                        {file.department_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Category</label>
                                    <p>{file.category_name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Priority</label>
                                    <div className="mt-1">
                                        <Badge className={getPriorityColor(file.priority)}>
                                            {file.priority}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Confidentiality Level</label>
                                    <div className="mt-1">
                                        <Badge className={getConfidentialityColor(file.confidentiality_level)}>
                                            {file.confidentiality_level}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {file.remarks && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Remarks</label>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{file.remarks}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assignment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Assignment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Marked To</label>
                                    <p className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-500" />
                                        {file.assigned_to_name || 'Not assigned'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Work Request</label>
                                    <p>{file.work_request_id ? `WR-${file.work_request_id}` : 'Not linked'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* File Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>File Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Created Date</label>
                                <p className="flex items-center text-sm">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                    {formatDate(file.created_at)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Last Modified</label>
                                <p className="flex items-center text-sm">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                    {formatDate(file.updated_at)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Created By</label>
                                <p className="flex items-center text-sm">
                                    <User className="w-4 h-4 mr-2 text-gray-500" />
                                    {file.created_by_name || 'Unknown'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Eye className="w-4 h-4 mr-2" />
                                View History
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="w-4 h-4 mr-2" />
                                Download File
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Report Issue
                            </Button>
                        </CardContent>
                    </Card>

                    {/* File Status Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">File Created</p>
                                        <p className="text-xs text-gray-500">{formatDate(file.created_at)}</p>
                                    </div>
                                </div>
                                {file.status_name !== 'Draft' && (
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Status: {file.status_name}</p>
                                            <p className="text-xs text-gray-500">{formatDate(file.updated_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 