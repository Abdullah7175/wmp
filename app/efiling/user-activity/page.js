"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Clock, User, FileText, Calendar, Download, Eye, X } from "lucide-react";
import Link from "next/link";

export default function UserActivityPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterUser, setFilterUser] = useState("all");
    const [filterAction, setFilterAction] = useState("all");
    const [filterDate, setFilterDate] = useState("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [totalPages, setTotalPages] = useState(1);

    // States for all available users and actions across the system
    const [allUsers, setAllUsers] = useState([]);
    const [allActions, setAllActions] = useState([]);

    // State for viewing full details modal popup
    const [selectedDetail, setSelectedDetail] = useState(null);

    useEffect(() => {
        if (status === "loading") return;
        
        if (!session) {
            router.push("/login");
            return;
        }

        loadFilterOptions();
    }, [session, status, router]);

    useEffect(() => {
        if (status === "loading" || !session) return;
        loadActivities();
    }, [page, limit]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/efiling/user-actions?page=${page}&limit=${limit}`);
            if (response.ok) {
                const data = await response.json();
                setActivities(data?.data || []);
                setTotalPages(data?.totalPages || 1);
            } else {
                throw new Error('Failed to load activities');
            }
        } catch (error) {
            console.error('Error loading activities:', error);
            toast({
                title: "Error",
                description: "Failed to load user activities",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch all records once with a high limit to populate all existing filter dropdown options globally
    const loadFilterOptions = async () => {
        try {
            const response = await fetch(`/api/efiling/user-actions?page=1&limit=1000`);
            if (response.ok) {
                const data = await response.json();
                const allData = data?.data || [];
                setAllUsers([...new Set(allData.map(a => a.user_name).filter(Boolean))]);
                setAllActions([...new Set(allData.map(a => a.action_type).filter(Boolean))]);
            }
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    };

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUser = filterUser === "all" || activity.user_name === filterUser;
        const matchesAction = filterAction === "all" || activity.action_type === filterAction;
        
        return matchesSearch && matchesUser && matchesAction;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getActionColor = (action) => {
        const actionColors = {
            'FILE_CREATED': 'bg-green-100 text-green-800',
            'FILE_UPDATED': 'bg-blue-100 text-blue-800',
            'FILE_DELETED': 'bg-red-100 text-red-800',
            'WORKFLOW_STARTED': 'bg-purple-100 text-purple-800',
            'WORKFLOW_COMPLETED': 'bg-green-100 text-green-800',
            'USER_CREATED': 'bg-blue-100 text-blue-800',
            'USER_UPDATED': 'bg-yellow-100 text-yellow-800',
            'default': 'bg-gray-100 text-gray-800'
        };
        return actionColors[action] || actionColors.default;
    };

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session) {
        return null;
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Clock className="w-8 h-8" />
                        User Activity Log
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Monitor user actions and system activities
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { loadActivities(); loadFilterOptions(); }}>
                        <Clock className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search activities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <Select value={filterUser} onValueChange={setFilterUser}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {allUsers.map(user => (
                                    <SelectItem key={user} value={user}>
                                        {user}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Select value={filterAction} onValueChange={setFilterAction}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {allActions.map(action => (
                                    <SelectItem key={action} value={action}>
                                        {action.replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setFilterUser("all");
                                setFilterAction("all");
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading activities...</div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No activities found
                        </div>
                    ) : (
                        <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredActivities.map((activity, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                {activity.user_name || 'System'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getActionColor(activity.action_type)}>
                                                {activity.action_type?.replace(/_/g, ' ') || 'Unknown'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate">{activity.description || 'No details'}</span>
                                                {activity.description && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-7 px-2 text-blue-600 hover:text-blue-800 shrink-0"
                                                        onClick={() => setSelectedDetail(activity.description)}
                                                        title="View full details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                {activity.entity_type || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {activity.ip_address || 'N/A'}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                {formatDate(activity.timestamp)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                                <Select value={String(limit)} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1); }}>
                                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                            </div>
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* View Details Popup Modal */}
            {selectedDetail && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
                        <div className="flex items-center justify-between mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Activity Details</h3>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full" 
                                onClick={() => setSelectedDetail(null)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="max-h-96 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
                            {selectedDetail}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button onClick={() => setSelectedDetail(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}