"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
    Plus,
    Search,
    FileText,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    FileEdit,
    Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logEfilingUserAction, EFILING_ACTIONS } from '@/lib/efilingUserActionLogger';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import MarkToModal from "../components/MarkToModal";
import { useEfilingUser } from "@/context/EfilingUserContext";

export default function FilesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const { efilingUserId, profile: userProfile, isGlobal } = useEfilingUser();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [myFiles, setMyFiles] = useState([]);
    const [assignedToMe, setAssignedToMe] = useState([]);
    const [activeTab, setActiveTab] = useState('mine');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [markModalFile, setMarkModalFile] = useState(null);

    useEffect(() => {
        if (efilingUserId) {
            fetchFiles();
        }
    }, [efilingUserId]);

    useEffect(() => {
        fetchDepartments();
        fetchStatuses();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, departmentFilter, activeTab]);

    const fetchFiles = async () => {
        if (!efilingUserId) return;
        setLoading(true);
        try {
            const [createdRes, assignedRes] = await Promise.all([
                fetch(`/api/efiling/files?created_by=${efilingUserId}&limit=200`),
                fetch(`/api/efiling/files?assigned_to=${efilingUserId}&limit=200`)
            ]);

            const createdJson = createdRes.ok ? await createdRes.json() : { files: [] };
            const assignedJson = assignedRes.ok ? await assignedRes.json() : { files: [] };

            const createdList = Array.isArray(createdJson.files) ? createdJson.files : [];
            const assignedList = Array.isArray(assignedJson.files) ? assignedJson.files : [];

            setMyFiles(createdList);
            setAssignedToMe(assignedList);

            if (session?.user?.id) {
                const uniqueCount = new Set([...createdList, ...assignedList].map((file) => file.id)).size;
                logEfilingUserAction({
                    user_id: session.user.id,
                    action_type: EFILING_ACTIONS.FILE_VIEWED,
                    description: `Accessed files list - found ${uniqueCount} files`,
                    entity_type: 'files_list',
                    entity_name: 'My Files List'
                });
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            toast({
                title: "Error",
                description: "Failed to load your files",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/efiling/departments?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setDepartments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await fetch('/api/efiling/file-status');
            if (response.ok) {
                const data = await response.json();
                setStatuses(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const filterRows = (rows) => {
        return rows.filter((file) => {
            const matchesSearch = searchTerm
                ? [file.file_number, file.subject, file.department_name, file.category_name]
                    .some((value) => (value || "").toString().toLowerCase().includes(searchTerm.toLowerCase()))
                : true;

            const matchesStatus = statusFilter === 'all' || String(file.status_id) === String(statusFilter);
            const matchesDepartment = departmentFilter === 'all' || String(file.department_id) === String(departmentFilter);

            return matchesSearch && matchesStatus && matchesDepartment;
        });
    };

    const filteredMyFiles = useMemo(() => filterRows(myFiles), [myFiles, searchTerm, statusFilter, departmentFilter]);
    const filteredAssignedFiles = useMemo(() => filterRows(assignedToMe), [assignedToMe, searchTerm, statusFilter, departmentFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const getStatusBadge = (file) => {
        const status = file.status_code;
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
            <Badge
                variant={config.variant}
                className="flex items-center gap-1"
                style={file.status_color ? { backgroundColor: file.status_color, color: '#fff' } : undefined}
            >
                <IconComponent className="w-3 h-3" />
                {(file.status_name || status || '').replace('_', ' ')}
            </Badge>
        );
    };

    const formatTimeRemaining = (file) => {
        if (!file?.sla_deadline) return '-';
        if (file.sla_paused) return 'Paused';
        if (file.is_sla_breached) return 'Breached';

        const minutesRemaining = file.minutes_remaining ?? Math.floor((new Date(file.sla_deadline).getTime() - Date.now()) / 60000);
        if (Number.isNaN(minutesRemaining)) return '-';
        if (minutesRemaining <= 0) return 'Breached';

        const days = Math.floor(minutesRemaining / 1440);
        const hours = Math.floor((minutesRemaining % 1440) / 60);
        const minutes = minutesRemaining % 60;

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const handleCreateFile = () => {
        // Log file creation attempt
        if (session?.user?.id) {
            logEfilingUserAction({
                user_id: session.user.id,
                action_type: EFILING_ACTIONS.FILE_CREATED,
                description: 'Initiated new file creation',
                entity_type: 'file_creation',
                entity_name: 'New E-Filing File'
            });
        }
        router.push('/efilinguser/files/new');
    };

    const handleEditDocument = (fileId) => {
        // Log document edit action
        if (session?.user?.id) {
            logEfilingUserAction({
                user_id: session.user.id,
                action_type: EFILING_ACTIONS.DOCUMENT_EDITED,
                description: `Initiated document editing for file ${fileId}`,
                file_id: fileId
            });
        }
        router.push(`/efilinguser/files/${fileId}/edit-document`);
    };

    const handleViewFile = (fileId) => {
        // Log file view action
        if (session?.user?.id) {
            logEfilingUserAction({
                user_id: session.user.id,
                action_type: EFILING_ACTIONS.FILE_VIEWED,
                description: `Viewed file ${fileId}`,
                file_id: fileId
            });
        }
        router.push(`/efilinguser/files/${fileId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading files...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
                    <p className="text-gray-600 mt-2">Files I created or that are assigned to me</p>
                </div>
                <Button onClick={handleCreateFile} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New File
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="file-search" className="mb-1 block text-sm font-medium">Search</Label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <Input
                                    id="file-search"
                                    placeholder="Search by file number, subject, department, or category"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="mb-1 block text-sm font-medium">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.id} value={String(status.id)}>
                                            {status.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-1 block text-sm font-medium">Department</Label>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All departments</SelectItem>
                                    {departments.map((department) => (
                                        <SelectItem key={department.id} value={String(department.id)}>
                                            {department.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setDepartmentFilter('all');
                            }}
                        >
                            Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setCurrentPage(1); }}>
                <TabsList>
                    <TabsTrigger value="mine">My Files</TabsTrigger>
                    <TabsTrigger value="assigned">Marked To Me</TabsTrigger>
                </TabsList>

                <TabsContent value="mine">
                    {renderFilesTable(
                        filteredMyFiles,
                        currentPage,
                        itemsPerPage,
                        handlePageChange,
                        handleItemsPerPageChange,
                        (fileId) => router.push(`/efilinguser/files/${fileId}`),
                        (fileId) => router.push(`/efilinguser/files/${fileId}/edit-document`),
                        setMarkModalFile,
                        efilingUserId,
                        isGlobal,
                        getStatusBadge,
                        formatTimeRemaining
                    )}
                </TabsContent>

                <TabsContent value="assigned">
                    {renderFilesTable(
                        filteredAssignedFiles,
                        currentPage,
                        itemsPerPage,
                        handlePageChange,
                        handleItemsPerPageChange,
                        (fileId) => router.push(`/efilinguser/files/${fileId}`),
                        (fileId) => router.push(`/efilinguser/files/${fileId}/edit-document`),
                        setMarkModalFile,
                        efilingUserId,
                        isGlobal,
                        getStatusBadge,
                        formatTimeRemaining
                    )}
                </TabsContent>
            </Tabs>
            {markModalFile && (
                <MarkToModal
                    showMarkToModal={Boolean(markModalFile)}
                    fileId={markModalFile.id}
                    fileNumber={markModalFile.file_number}
                    subject={markModalFile.subject}
                    onClose={() => {
                        setMarkModalFile(null);
                        fetchFiles();
                    }}
                />
            )}
        </div>
    );
}

function renderFilesTable(
    rows,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    handleView,
    handleEdit,
    handleMark,
    efilingUserId,
    isGlobal,
    getStatusBadge,
    formatTimeRemaining
) {
    // Calculate pagination for this specific table
    const totalPages = Math.ceil(rows.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRows = rows.slice(startIndex, endIndex);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Files ({rows.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">No files found</h3>
                        <p className="text-sm mb-4">No files in this list</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Number</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Currently Marked To</TableHead>
                                    <TableHead>Last Signed By</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>TAT</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedRows.map((file) => {
                                    const isCreator = Number(file.created_by) === Number(efilingUserId);
                                    const isAssignee = Number(file.assigned_to) === Number(efilingUserId);
                                    const canEdit = isCreator || isGlobal;
                                    const canMark = (handleMark && (isCreator || isAssignee || isGlobal));
                                    return (
                                        <TableRow key={file.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    <span>{file.file_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate" title={file.subject}>
                                                    {file.subject || 'No subject'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{file.creator_user_name || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    {file.current_assignee_user_name ? (
                                                        <>
                                                            {file.assigned_to_role_name && (
                                                                <Badge variant="secondary">{file.assigned_to_role_name}</Badge>
                                                            )}
                                                            <span>{file.current_assignee_user_name}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500">Unassigned</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{file.last_signed_by_name || '-'}</span>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(file)}</TableCell>
                                            <TableCell>
                                                <span className={`text-sm ${file.is_sla_breached ? 'text-red-600' : 'text-gray-700'}`}>
                                                    {formatTimeRemaining(file)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">{new Date(file.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleView(file.id)}>
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View
                                                    </Button>
                                                    {canEdit && (
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(file.id)}>
                                                            <FileEdit className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                    )}
                                                    {canMark && (
                                                        <Button variant="outline" size="sm" onClick={() => handleMark(file)}>
                                                            <Send className="w-4 h-4 mr-1" />
                                                            Mark To
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {rows.length > 0 && (
                    <div className="mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={rows.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 