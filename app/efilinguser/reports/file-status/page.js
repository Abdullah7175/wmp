"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Filter, Clock, BarChart3 } from 'lucide-react';
import { logEfilingUserAction, EFILING_ACTIONS } from '@/lib/efilingUserActionLogger';
import { useSession } from 'next-auth/react';
import { Pagination } from '@/components/ui/pagination';
import { useEfilingUser } from "@/context/EfilingUserContext";

export default function FileStatusReport() {
    const { data: session } = useSession();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    
    // Separate state for created and marked files
    const [createdFiles, setCreatedFiles] = useState([]);
    const [markedFiles, setMarkedFiles] = useState([]);

    const [departments, setDepartments] = useState([]);
    const [fileTypes, setFileTypes] = useState([]);
    const [filters, setFilters] = useState({
        department: 'all',
        fileType: 'all',
        status: 'all',
        dateRange: 'all'
    });

    const { efilingUserId } = useEfilingUser();

    const itemsPerPage = 4;
    const [createdPage, setCreatedPage] = useState(1);
    const [markedPage, setMarkedPage] = useState(1);

    useEffect(() => {
        if (efilingUserId) {
            loadData();
        }
    }, [efilingUserId]);

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadFiles(),
                loadDepartments(),
                loadFileTypes()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            toast({
                title: "Error",
                description: "Failed to load report data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const loadFiles = async () => {
        if (!efilingUserId) return;

        try {
            setLoading(true);
            
            const [createdRes, assignedRes] = await Promise.all([
                fetch(`/api/efiling/files?created_by=${efilingUserId}`),
                fetch(`/api/efiling/files?assigned_to=${efilingUserId}`)
            ]);
            
            const createdData = createdRes.ok ? await createdRes.json() : { files: [] };
            const assignedData = assignedRes.ok ? await assignedRes.json() : { files: [] };

            setCreatedFiles(createdData.files || []);
            setMarkedFiles(assignedData.files || []);
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const response = await fetch('/api/efiling/departments?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setDepartments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    };

    const loadFileTypes = async () => {
        try {
            const response = await fetch('/api/efiling/file-types?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setFileTypes(data.fileTypes || []);
            }
        } catch (error) {
            console.error('Error loading file types:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'on_hold':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'draft':
                return <Clock className="w-4 h-4" />;
            case 'in_progress':
                return <BarChart3 className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const filterList = (fileList) => {
        return fileList.filter(file => {
            const matchesDepartment = filters.department === 'all' || file.department_id == filters.department;
            const matchesFileType = filters.fileType === 'all' || file.file_type_id == filters.fileType;
            const matchesStatus = filters.status === 'all' || file.status_name === filters.status;
            
            let matchesDate = true;
            if (filters.dateRange !== 'all') {
                const fileDate = new Date(file.created_at);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                const lastMonth = new Date(today);
                lastMonth.setMonth(lastMonth.getMonth() - 1);

                switch (filters.dateRange) {
                    case 'today':
                        matchesDate = fileDate.toDateString() === today.toDateString();
                        break;
                    case 'yesterday':
                        matchesDate = fileDate.toDateString() === yesterday.toDateString();
                        break;
                    case 'lastWeek':
                        matchesDate = fileDate >= lastWeek;
                        break;
                    case 'lastMonth':
                        matchesDate = fileDate >= lastMonth;
                        break;
                }
            }
            
            return matchesDepartment && matchesFileType && matchesStatus && matchesDate;
        });
    };

    const filteredCreatedFiles = filterList(createdFiles);
    const filteredMarkedFiles = filterList(markedFiles);

    // Calculate pagination for Created Files
    const createdTotalPages = Math.ceil(filteredCreatedFiles.length / itemsPerPage);
    const createdStartIndex = (createdPage - 1) * itemsPerPage;
    const paginatedCreatedFiles = filteredCreatedFiles.slice(createdStartIndex, createdStartIndex + itemsPerPage);

    // Calculate pagination for Marked Files
    const markedTotalPages = Math.ceil(filteredMarkedFiles.length / itemsPerPage);
    const markedStartIndex = (markedPage - 1) * itemsPerPage;
    const paginatedMarkedFiles = filteredMarkedFiles.slice(markedStartIndex, markedStartIndex + itemsPerPage);

    useEffect(() => {
        setCreatedPage(1);
        setMarkedPage(1);
    }, [filters]);

    // CSV Export featuring both sections
    const exportToCSV = () => {
        const headers = ['File Number', 'File Subject', 'File Type', 'File Category', 'Last Comment Added By User', 'Currently Marked To', 'File Status'];

        const formatRow = (file) => [
            file.file_number || 'N/A',
            file.subject || 'N/A',
            file.file_type_name || 'N/A',
            file.category_name || file.category || 'N/A',
            file.user_last_comment || file.user_last_comment || 'N/A',
            file.current_assignee_user_name || 'N/A',
            file.status_name || 'N/A'
        ];

        const createdRows = filteredCreatedFiles.map(formatRow);
        const markedRows = filteredMarkedFiles.map(formatRow);

        let csvLines = [];

        // Section 1: Files Created By Me
        csvLines.push(['--- FILES CREATED BY ME ---']);
        csvLines.push(headers);
        createdRows.forEach(row => csvLines.push(row));
        csvLines.push([]); // Blank separator line

        // Section 2: Files Marked To Me
        csvLines.push(['--- FILES MARKED TO ME ---']);
        csvLines.push(headers);
        markedRows.forEach(row => csvLines.push(row));

        const csvContent = csvLines
            .map(row => row.map(cell => `"${cell || ''}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `file_status_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
            title: "Success",
            description: "Report exported to CSV successfully",
        });
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My File Status Report</h1>
                    <p className="text-gray-600">Track the status and progress of e-filing documents created by or marked to you</p>
                </div>
                <Button onClick={() => {
                    if (session?.user?.id) {
                        logEfilingUserAction({
                            user_id: session.user.id,
                            action_type: EFILING_ACTIONS.REPORT_EXPORTED,
                            description: 'Exported My File Status Report to CSV',
                            entity_type: 'report_export',
                            entity_name: 'My File Status Report CSV'
                        });
                    }
                    exportToCSV();
                }} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium">Department</label>
                            <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">File Type</label>
                            <Select value={filters.fileType} onValueChange={(value) => setFilters(prev => ({ ...prev, fileType: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All File Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All File Types</SelectItem>
                                    {fileTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Date Range</label>
                            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="yesterday">Yesterday</SelectItem>
                                    <SelectItem value="lastWeek">Last 7 Days</SelectItem>
                                    <SelectItem value="lastMonth">Last 30 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 1: Files Created By Me */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Files Created By Me ({filteredCreatedFiles.length})</CardTitle>
                    <CardDescription>
                        List of files created by you
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-lg">Loading files...</div>
                        </div>
                    ) : filteredCreatedFiles.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-base">No files created by you found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Number</TableHead>
                                        <TableHead>File Subject</TableHead>
                                        <TableHead>File Type</TableHead>
                                        <TableHead>File Category</TableHead>
                                        <TableHead>Last Comment Added by User</TableHead>
                                        <TableHead>Currently Marked To</TableHead>
                                        <TableHead>File Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCreatedFiles.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell className="font-medium">{file.file_number || 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{file.subject || 'N/A'}</TableCell>
                                            <TableCell>{file.file_type_name || 'N/A'}</TableCell>
                                            <TableCell>{file.category_name || file.category || 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{file.user_last_comment || file.user_last_comment || 'N/A'}</TableCell>
                                            <TableCell>{file.current_assignee_user_name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(file.status_name)}>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(file.status_name)}
                                                        {file.status_name || 'Unknown'}
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {filteredCreatedFiles.length > 0 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={createdPage}
                                totalPages={createdTotalPages}
                                totalItems={filteredCreatedFiles.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCreatedPage}
                                showItemsPerPageSelector={false}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SECTION 2: Files Marked To Me */}
            <Card>
                <CardHeader>
                    <CardTitle>Files Marked To Me ({filteredMarkedFiles.length})</CardTitle>
                    <CardDescription>
                        List of files currently or previously marked to you
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-lg">Loading files...</div>
                        </div>
                    ) : filteredMarkedFiles.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-base">No files marked to you found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Number</TableHead>
                                        <TableHead>Created by</TableHead>
                                        <TableHead>File Subject</TableHead>
                                        <TableHead>File Type</TableHead>
                                        <TableHead>File Category</TableHead>
                                        <TableHead>Last Comment Added by User</TableHead>
                                        <TableHead>Currently Marked To</TableHead>
                                        <TableHead>File Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedMarkedFiles.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell className="font-medium">{file.file_number || 'N/A'}</TableCell>
                                            <TableCell className="font-medium">{file.creator_user_name || 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{file.subject || 'N/A'}</TableCell>
                                            <TableCell>{file.file_type_name || 'N/A'}</TableCell>
                                            <TableCell>{file.category_name || file.category || 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{file.user_last_comment || file.user_last_comment || 'N/A'}</TableCell>
                                            <TableCell>{file.current_assignee_user_name || file.current_holder || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(file.status_name)}>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(file.status_name)}
                                                        {file.status_name || 'Unknown'}
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {filteredMarkedFiles.length > 0 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={markedPage}
                                totalPages={markedTotalPages}
                                totalItems={filteredMarkedFiles.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setMarkedPage}
                                showItemsPerPageSelector={false}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}