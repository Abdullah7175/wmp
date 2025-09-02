'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
    FileText, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    User, 
    Calendar,
    ArrowRight,
    Filter,
    Search
} from 'lucide-react';
import { logEfilingUserAction, getUserInfoFromSession, EFILING_ACTIONS } from '@/lib/efilingUserActionLogger';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function EFileUserDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [dataError, setDataError] = useState(false);
    const [userData, setUserData] = useState(null);
    const [assignedFiles, setAssignedFiles] = useState([]);
    const [pendingActions, setPendingActions] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [stats, setStats] = useState({
        totalFiles: 0,
        pendingFiles: 0,
        completedFiles: 0,
        overdueFiles: 0
    });
    const { toast } = useToast();

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userData?.id) {
            loadDashboardData();
            // Log dashboard access
            if (session?.user?.id) {
                logEfilingUserAction({
                    user_id: session.user.id,
                    action_type: EFILING_ACTIONS.FILE_VIEWED,
                    description: 'Accessed e-filing user dashboard',
                    entity_type: 'dashboard',
                    entity_name: 'E-Filing User Dashboard'
                });
            }
        }
    }, [userData, session]);

    const loadUserData = async () => {
        try {
            const userData = localStorage.getItem('users');
            if (userData) {
                const user = JSON.parse(userData);
                setUserData(user);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Check if user data is available
            if (!userData?.id) {
                console.warn('User data not available, skipping API calls');
                setAssignedFiles([]);
                setPendingActions([]);
                setRecentActivities([]);
                setStats({
                    totalFiles: 0,
                    pendingFiles: 0,
                    completedFiles: 0,
                    overdueFiles: 0
                });
                return;
            }
            
            // Load user's created files and assigned files
            const [myFilesRes, assignedFilesRes] = await Promise.all([
                fetch(`/api/efiling/files?created_by=${userData.id}`),
                fetch(`/api/efiling/files?assigned_to=${userData.id}`)
            ]);

            const myFiles = myFilesRes.ok ? await myFilesRes.json() : { files: [] };
            const assignedFiles = assignedFilesRes.ok ? await assignedFilesRes.json() : { files: [] };
            
            console.log('My files API response:', myFiles);
            console.log('Assigned files API response:', assignedFiles);
            
            // Combine and deduplicate files
            const allFiles = [...(myFiles.files || []), ...(assignedFiles.files || [])];
            const uniqueFiles = allFiles.filter((file, index, self) => 
                index === self.findIndex(f => f.id === file.id)
            );
            
            setAssignedFiles(uniqueFiles);

            // Load pending actions
            const actionsResponse = await fetch('/api/efiling/workflows?userId=' + userData.id);
            if (actionsResponse.ok) {
                const actionsData = await actionsResponse.json();
                console.log('Pending actions API response:', actionsData);
                setPendingActions(Array.isArray(actionsData) ? actionsData : []);
            } else {
                console.error('Failed to load pending actions:', actionsResponse.status);
                setPendingActions([]);
            }

            // Load recent activities
            const activitiesResponse = await fetch('/api/efiling/user-actions?userId=' + userData.id);
            if (actionsResponse.ok) {
                const activitiesData = await activitiesResponse.json();
                console.log('Recent activities API response:', activitiesData);
                setRecentActivities(Array.isArray(activitiesData) ? activitiesData.slice(0, 10) : []);
            } else {
                console.error('Failed to load recent activities:', actionsResponse.status);
                setRecentActivities([]);
            }

            // Calculate stats
            if (Array.isArray(uniqueFiles) && uniqueFiles.length > 0) {
                const pending = uniqueFiles.filter(f => f.status_code === 'PENDING' || f.status_code === 'DRAFT').length;
                const completed = uniqueFiles.filter(f => f.status_code === 'COMPLETED' || f.status_code === 'APPROVED').length;
                const overdue = uniqueFiles.filter(f => {
                    if (!f.due_date) return false;
                    return new Date(f.due_date) < new Date() && f.status_code !== 'COMPLETED';
                }).length;
                
                setStats({
                    totalFiles: uniqueFiles.length,
                    pendingFiles: pending,
                    completedFiles: completed,
                    overdueFiles: overdue
                });
            } else {
                setStats({
                    totalFiles: 0,
                    pendingFiles: 0,
                    completedFiles: 0,
                    overdueFiles: 0
                });
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setDataError(true);
            toast({
                title: "Error",
                description: "Failed to load dashboard data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status, slaBreached = false) => {
        if (slaBreached) {
            return <Badge variant="destructive">Overdue</Badge>;
        }
        
        switch (status) {
            case 'DRAFT':
                return <Badge variant="secondary">Draft</Badge>;
            case 'PENDING':
                return <Badge variant="default">Pending</Badge>;
            case 'IN_PROGRESS':
                return <Badge variant="default">In Progress</Badge>;
            case 'COMPLETED':
                return <Badge variant="default">Completed</Badge>;
            case 'RETURNED':
                return <Badge variant="destructive">Returned</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            case 'high':
                return <Badge variant="default">High</Badge>;
            case 'normal':
                return <Badge variant="secondary">Normal</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="outline">Normal</Badge>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFileAction = (fileId, action) => {
        // Log the file action
        if (session?.user?.id) {
            const actionType = action === 'view' ? EFILING_ACTIONS.FILE_VIEWED : 
                             action === 'edit-document' ? EFILING_ACTIONS.FILE_EDITED :
                             action === 'progress-workflow' ? EFILING_ACTIONS.WORKFLOW_STARTED :
                             EFILING_ACTIONS.FILE_VIEWED;
            
            logEfilingUserAction({
                user_id: session.user.id,
                action_type: actionType,
                description: `Performed ${action} action on file ${fileId}`,
                file_id: fileId,
                details: { action }
            });
        }

        // Navigate to appropriate page based on action
        if (action === 'view') {
            router.push(`/efilinguser/files/${fileId}`);
        } else if (action === 'edit-document') {
            router.push(`/efilinguser/files/${fileId}/edit-document`);
        } else {
            router.push(`/efilinguser/files/${fileId}/${action}`);
        }
    };

    const retryLoadingData = () => {
        setDataError(false);
        loadDashboardData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {userData?.name || 'User'}!</h1>
                    <p className="text-muted-foreground">
                        Here&apos;s your personal e-filing dashboard - your files and assignments
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/efilinguser/files/new')}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New File
                    </Button>
                    <Button variant="outline" onClick={loadDashboardData}>
                        <Filter className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {dataError && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-800 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Data Loading Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-700 mb-4">
                            There was an error loading your dashboard data. This might be due to:
                        </p>
                        <ul className="text-red-700 text-sm mb-4 list-disc list-inside">
                            <li>Database connection issues</li>
                            <li>Missing or corrupted data</li>
                            <li>API endpoint problems</li>
                        </ul>
                        <div className="flex gap-2">
                            <Button onClick={retryLoadingData} variant="outline">
                                Retry Loading Data
                            </Button>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Refresh Page
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="border-gray-200 bg-gray-50">
                    <CardHeader>
                        <CardTitle className="text-gray-800 text-sm">Debug Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p><strong>Assigned Files:</strong> {Array.isArray(assignedFiles) ? `${assignedFiles.length} items` : typeof assignedFiles}</p>
                                <p><strong>Pending Actions:</strong> {Array.isArray(pendingActions) ? `${pendingActions.length} items` : typeof pendingActions}</p>
                                <p><strong>Recent Activities:</strong> {Array.isArray(recentActivities) ? `${recentActivities.length} items` : typeof recentActivities}</p>
                            </div>
                            <div>
                                <p><strong>User Data:</strong> {userData ? 'Loaded' : 'Not loaded'}</p>
                                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                                <p><strong>Data Error:</strong> {dataError ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Files</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFiles}</div>
                        <p className="text-xs text-muted-foreground">
                            Files I created or assigned to me
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Action</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingFiles}</div>
                        <p className="text-xs text-muted-foreground">
                            Files requiring my attention
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedFiles}</div>
                        <p className="text-xs text-muted-foreground">
                            Files I've completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.overdueFiles}</div>
                        <p className="text-xs text-muted-foreground">
                            My overdue files
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="assigned" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="assigned">My Files</TabsTrigger>
                    <TabsTrigger value="pending">Pending Actions</TabsTrigger>
                    <TabsTrigger value="activities">My Activities</TabsTrigger>
                </TabsList>

                <TabsContent value="assigned" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Files</CardTitle>
                            <CardDescription>
                                Files I created or that are assigned to me
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!Array.isArray(assignedFiles) || assignedFiles.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No files found.</p>
                                    <p className="text-sm">Create your first file or wait for assignments</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignedFiles.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="font-semibold">{file.file_number}</h3>
                                                    {getStatusBadge(file.status_code, file.sla_breached)}
                                                    {getPriorityBadge(file.priority)}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {file.subject}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                    <span>Department: {file.department_name}</span>
                                                    <span>Category: {file.category_name}</span>
                                                    <span>Created: {formatDate(file.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleFileAction(file.id, 'view')}
                                                >
                                                    View
                                                </Button>
                                                {file.status_code === 'PENDING' && (
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleFileAction(file.id, 'edit-document')}
                                                    >
                                                        Take Action
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Workflow Actions</CardTitle>
                            <CardDescription>
                                Workflow stages waiting for your approval or action
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!Array.isArray(pendingActions) || pendingActions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No pending workflow actions.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingActions.map((workflow) => (
                                        <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="font-semibold">{workflow.file_number}</h3>
                                                    <Badge variant="default">Stage: {workflow.current_stage_name}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {workflow.subject}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                    <span>Template: {workflow.template_name}</span>
                                                    <span>Started: {formatDate(workflow.started_at)}</span>
                                                    {workflow.sla_deadline && (
                                                        <span className={workflow.sla_breached ? 'text-red-500' : ''}>
                                                            Deadline: {formatDate(workflow.sla_deadline)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleFileAction(workflow.file_id, 'view')}
                                                >
                                                    View
                                                </Button>
                                                <Button 
                                                    size="sm"
                                                    onClick={() => handleFileAction(workflow.file_id, 'progress-workflow')}
                                                >
                                                    Process
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activities</CardTitle>
                            <CardDescription>
                                Your recent actions and file activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentActivities.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No recent activities found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.action_type}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 text-sm text-gray-500">
                                                {formatDate(activity.timestamp)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
