"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    Plus, 
    Search, 
    Filter, 
    FileText, 
    Edit, 
    Eye, 
    Send, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Building2,
    User,
    Calendar,
    ArrowRight,
    FileEdit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

export default function FilesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const isAdmin = (session?.user?.role === 1 || session?.user?.role === 2);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        if (session?.user?.id) {
            fetchFiles();
            fetchDepartments();
            fetchStatuses();
        }
    }, [session?.user?.id]);

    useEffect(() => {
        filterFiles();
    }, [searchTerm, statusFilter, departmentFilter, files]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, statusFilter, departmentFilter]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/efiling/files');
            if (response.ok) {
                const data = await response.json();
                console.log('Files fetched from API:', data);
                setFiles(data.files || []);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            toast({
                title: "Error",
                description: "Failed to load files",
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

    const filterFiles = () => {
        let filtered = files;

        if (searchTerm) {
            filtered = filtered.filter(file =>
                file.file_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(file => file.status_id == statusFilter);
        }

        if (departmentFilter && departmentFilter !== 'all') {
            filtered = filtered.filter(file => file.department_id == departmentFilter);
        }

        setFilteredFiles(filtered);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
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

    const handleEditDocument = (fileId) => {
        router.push(`/efiling/files/${fileId}/edit-document`);
    };

    const handleViewFile = (fileId) => {
        router.push(`/efiling/files/${fileId}`);
    };

    const handleMarkTo = (fileId) => {
        router.push(`/efiling/files/${fileId}/edit-document`);
    };

    const handleDeleteFile = async (file) => {
        if (!isAdmin) {
            toast({ title: 'Forbidden', description: 'Only admin can delete files', variant: 'destructive' });
            return;
        }
        const confirmed = window.confirm(`Delete file ${file.file_number}? This will remove the file and all related data.`);
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/efiling/files/${file.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Delete failed');
            }
            toast({ title: 'Deleted', description: `${file.file_number} removed.` });
            await fetchFiles();
        } catch (e) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
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
                    <h1 className="text-3xl font-bold text-gray-900">E-Filing Files</h1>
                    <p className="text-gray-600 mt-2">Manage and track your e-filing documents</p>
                </div>
                <Button onClick={handleCreateFile} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create File Ticket
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem key={status.id} value={status.id.toString()}>
                                        {status.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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

                        <div className="flex items-center justify-end">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                {filteredFiles.length} Files
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Files Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Files ({filteredFiles.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredFiles.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No files found</h3>
                            <p className="text-sm mb-4">
                                {searchTerm || (statusFilter !== 'all') || (departmentFilter !== 'all')
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Get started by creating your first file ticket'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
                                <Button onClick={handleCreateFile} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create File Ticket
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Number</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFiles.map((file) => (
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
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="w-4 h-4 text-gray-500" />
                                                    <span>{file.department_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(file.status_code)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">
                                                        {new Date(file.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {file.status_code === 'DRAFT' ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditDocument(file.id)}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <FileEdit className="w-4 h-4 mr-1" />
                                                                Edit Document
                                                            </Button>
                                                            {isAdmin && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteFile(file)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewFile(file.id)}
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleMarkTo(file.id)}
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <Send className="w-4 h-4 mr-1" />
                                                                Mark To
                                                            </Button>
                                                            {isAdmin && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteFile(file)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {filteredFiles.length > 0 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredFiles.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Workflow Info */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        E-Filing Workflow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-sm mb-2">1. Create File Ticket</h4>
                            <p className="text-xs text-gray-600">Generate a file number with basic metadata</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileEdit className="w-6 h-6 text-green-600" />
                            </div>
                            <h4 className="font-medium text-sm mb-2">2. Edit Document</h4>
                            <p className="text-xs text-gray-600">Use MS Word-like editor to create content</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Send className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h4 className="font-medium text-sm mb-2">3. Mark To Users</h4>
                            <p className="text-xs text-gray-600">Send for approval to senior officials</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="w-6 h-6 text-purple-600" />
                            </div>
                            <h4 className="font-medium text-sm mb-2">4. E-Sign & Approve</h4>
                            <p className="text-xs text-gray-600">Digital signatures and approval workflow</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 