"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Download, Eye, Clock, User, Building2, FileText, AlertCircle, Printer } from "lucide-react";
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

    const handlePrint = () => {
        window.print();
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
        <>
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .print-only {
                        display: block !important;
                    }
                    
                    /* Hide navigation and sidebar on print */
                    nav, aside, .no-print {
                        display: none !important;
                    }
                    
                    /* Make main content full width */
                    .container {
                        max-width: 100% !important;
                        padding: 20mm !important;
                    }
                    
                    /* Show document content */
                    .lg\\:col-span-2 {
                        grid-column: span 1 !important;
                    }
                    
                    /* Show all content cards */
                    .space-y-6 > div {
                        display: block !important;
                    }
                    
                    /* Ensure document content is visible and properly styled */
                    .prose {
                        color: #000 !important;
                        font-size: 12pt !important;
                        line-height: 1.5 !important;
                    }
                    
                    /* Make sure images and logos are visible */
                    img {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                    
                    /* Style document headers */
                    h1, h2, h3, h4, h5, h6 {
                        color: #000 !important;
                        font-weight: bold !important;
                    }
                    
                    /* Print header on each page */
                    @page {
                        @top-center {
                            content: "Karachi Water & Sewerage Corporation - E-Filing System";
                            font-size: 10pt;
                            color: #666;
                        }
                        @bottom-right {
                            content: "Page " counter(page) " of " counter(pages);
                            font-size: 9pt;
                            color: #666;
                        }
                        @bottom-left {
                            content: "File: ${file?.file_number || 'N/A'}";
                            font-size: 9pt;
                            color: #666;
                        }
                    }
                    
                    /* File info styling */
                    .print-file-header {
                        border: 2px solid #333;
                        padding: 15mm;
                        margin-bottom: 10mm;
                        page-break-inside: avoid;
                        background: #f9f9f9;
                    }
                    
                    .print-file-header h1 {
                        font-size: 18pt;
                        font-weight: bold;
                        margin-bottom: 5mm;
                        color: #000;
                        text-align: center;
                        border-bottom: 2px solid #333;
                        padding-bottom: 3mm;
                    }
                    
                    .print-info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 5mm;
                        margin-top: 5mm;
                    }
                    
                    .print-info-item {
                        margin-bottom: 3mm;
                    }
                    
                    .print-info-label {
                        font-weight: bold;
                        color: #333;
                        font-size: 10pt;
                    }
                    
                    .print-info-value {
                        color: #000;
                        font-size: 11pt;
                        margin-top: 1mm;
                    }
                    
                    .print-full-width {
                        grid-column: 1 / -1;
                    }
                }
                
                .print-only {
                    display: none;
                }
            `}</style>
            
            {/* Print-only file information */}
            <div className="print-only">
                <div className="print-file-header">
                    <h1>KWSC E-Filing Document</h1>
                    <div className="print-info-grid">
                        <div className="print-info-item">
                            <div className="print-info-label">File Number:</div>
                            <div className="print-info-value">{file?.file_number}</div>
                        </div>
                        <div className="print-info-item">
                            <div className="print-info-label">Status:</div>
                            <div className="print-info-value">{file?.status_name}</div>
                        </div>
                        <div className="print-info-item print-full-width">
                            <div className="print-info-label">Subject:</div>
                            <div className="print-info-value">{file?.subject}</div>
                        </div>
                        <div className="print-info-item">
                            <div className="print-info-label">Department:</div>
                            <div className="print-info-value">{file?.department_name}</div>
                        </div>
                        <div className="print-info-item">
                            <div className="print-info-label">Category:</div>
                            <div className="print-info-value">{file?.category_name}</div>
                        </div>
                        <div className="print-info-item">
                            <div className="print-info-label">Priority:</div>
                            <div className="print-info-value">{file?.priority}</div>
                        </div>
                        <div className="print-info-item">
                            <div className="print-info-label">Confidentiality:</div>
                            <div className="print-info-value">{file?.confidentiality_level}</div>
                        </div>
                        <div className="print-info-item">
                            <div className="print-info-label">Created Date:</div>
                            <div className="print-info-value">{formatDate(file?.created_at)}</div>
                        </div>
                        <div className="print-info-item">
                            <div className="print-info-label">Created By:</div>
                            <div className="print-info-value">{file?.created_by_name}</div>
                        </div>
                        {file?.assigned_to_name && (
                            <div className="print-info-item">
                                <div className="print-info-label">Assigned To:</div>
                                <div className="print-info-value">{file?.assigned_to_name}</div>
                            </div>
                        )}
                        {file?.work_request_id && (
                            <div className="print-info-item">
                                <div className="print-info-label">Work Request:</div>
                                <div className="print-info-value">WR-{file?.work_request_id}</div>
                            </div>
                        )}
                        {file?.remarks && (
                            <div className="print-info-item print-full-width">
                                <div className="print-info-label">Remarks:</div>
                                <div className="print-info-value">{file?.remarks}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 no-print">
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
                <div className="flex space-x-2 no-print">
                    <Button
                        onClick={() => router.push(`/efiling/files/${file.id}/edit`)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit File
                    </Button>
                    <Button onClick={handlePrint} variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
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
                    <Card className="print:border-2 print:border-gray-300 print:shadow-none">
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
                    <Card className="print:border-2 print:border-gray-300 print:shadow-none print:page-break-before-auto">
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
                <div className="space-y-6 no-print">
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
        </>
    );
} 