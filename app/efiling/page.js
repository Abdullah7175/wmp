"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    Plus, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    Users, 
    Building2,
    TrendingUp,
    Calendar,
    ArrowRight,
    DocumentText,
    Shield,
    Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EFileDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [stats, setStats] = useState({
        totalFiles: 0,
        draftFiles: 0,
        inProgressFiles: 0,
        pendingApprovalFiles: 0,
        approvedFiles: 0,
        totalUsers: 0,
        totalDepartments: 0
    });
    const [recentFiles, setRecentFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetchDashboardData();
        }
    }, [session?.user?.id]);
        
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
            // Fetch files for statistics
            const filesResponse = await fetch('/api/efiling/files');
            if (filesResponse.ok) {
                const files = await filesResponse.json();
                const filesArray = files.files || [];
                
                setStats({
                    totalFiles: filesArray.length,
                    draftFiles: filesArray.filter(f => f.status_code === 'DRAFT').length,
                    inProgressFiles: filesArray.filter(f => f.status_code === 'IN_PROGRESS').length,
                    pendingApprovalFiles: filesArray.filter(f => f.status_code === 'PENDING_APPROVAL').length,
                    approvedFiles: filesArray.filter(f => f.status_code === 'APPROVED').length,
                    totalUsers: 0, // Will be fetched separately
                    totalDepartments: 0 // Will be fetched separately
                });

                // Get recent files
                setRecentFiles(filesArray.slice(0, 5));
            }

            // Fetch users count
            try {
                const usersResponse = await fetch('/api/efiling/users?is_active=true');
                if (usersResponse.ok) {
                    const users = await usersResponse.json();
                    setStats(prev => ({ ...prev, totalUsers: Array.isArray(users) ? users.length : 0 }));
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }

            // Fetch departments count
            try {
                const deptResponse = await fetch('/api/efiling/departments?is_active=true');
                if (deptResponse.ok) {
                    const depts = await deptResponse.json();
                    setStats(prev => ({ ...prev, totalDepartments: Array.isArray(depts) ? depts.length : 0 }));
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
                
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            toast({
                title: "Error",
                description: "Failed to load dashboard data",
                variant: "destructive",
            });
            } finally {
                setLoading(false);
            }
        };
        
    const getStatusBadge = (status) => {
        const statusConfig = {
            'DRAFT': { variant: 'secondary', icon: FileText },
            'IN_PROGRESS': { variant: 'default', icon: Clock },
            'PENDING_APPROVAL': { variant: 'default', icon: AlertCircle },
            'APPROVED': { variant: 'default', icon: CheckCircle },
            'REJECTED': { variant: 'destructive', icon: AlertCircle },
            'COMPLETED': { variant: 'default', icon: CheckCircle }
        };

        const config = statusConfig[status] || { variant: 'secondary', icon: FileText };
        const IconComponent = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <IconComponent className="w-3 h-3" />
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    const handleCreateFile = () => {
        router.push('/efiling/files/new');
    };

    const handleViewFiles = () => {
        router.push('/efiling/files');
    };

    const handleViewFile = (fileId) => {
        router.push(`/efiling/files/${fileId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">E-Filing Dashboard</h1>
                <p className="text-xl text-gray-600">Welcome to the Karachi Water and Sewerage Corporation E-Filing System</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCreateFile}>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Plus className="w-6 h-6 text-blue-600" />
            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Create File Ticket</h3>
                                <p className="text-sm text-gray-600">Start a new e-filing process</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewFiles}>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">View All Files</h3>
                                <p className="text-sm text-gray-600">Browse and manage files</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">E-Signatures</h3>
                                <p className="text-sm text-gray-600">Manage digital signatures</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Files</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.inProgressFiles}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovalFiles}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approvedFiles}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            System Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Users</span>
                                <span className="font-semibold">{stats.totalUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Departments</span>
                                <span className="font-semibold">{stats.totalDepartments}</span>
                            </div>
                            <div className="pt-4">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Users className="w-4 h-4 mr-2" />
                                    Manage Users
                                </Button>
                                    </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-600">New file created</span>
                                <span className="text-gray-400">2 hours ago</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-600">Document signed</span>
                                <span className="text-gray-400">4 hours ago</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-gray-600">File marked for approval</span>
                                <span className="text-gray-400">6 hours ago</span>
                                    </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Files */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Recent Files
                        </span>
                        <Button variant="outline" size="sm" onClick={handleViewFiles}>
                            View All
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentFiles.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No files yet</h3>
                            <p className="text-sm mb-4">Create your first file ticket to get started</p>
                            <Button onClick={handleCreateFile}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create File Ticket
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleViewFile(file.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <h4 className="font-medium text-gray-900">{file.file_number}</h4>
                                            <p className="text-sm text-gray-600">{file.subject || 'No subject'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {getStatusBadge(file.status_code)}
                                        <span className="text-sm text-gray-500">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Workflow Information */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        E-Filing Workflow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-600">1</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Create File Ticket</h4>
                            <p className="text-sm text-gray-600">Generate a file number with basic metadata</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">2</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Edit Document</h4>
                            <p className="text-sm text-gray-600">Use MS Word-like editor to create content</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-yellow-600">3</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Mark To Users</h4>
                            <p className="text-sm text-gray-600">Send for approval to senior officials</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-600">4</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">E-Sign & Approve</h4>
                            <p className="text-sm text-gray-600">Digital signatures and approval workflow</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 