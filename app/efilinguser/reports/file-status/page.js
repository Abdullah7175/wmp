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
import ExcelJS from 'exceljs';

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

    // Total Costing sum calculation for Created Files
    const totalCreatedCosting = filteredCreatedFiles.reduce((sum, file) => {
        const val = parseFloat(file.costing || file.proposed_estimated_cost || 0);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

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

    // Format currency helper
    const formatCurrency = (amount) => {
        const val = parseFloat(amount || 0);
        return isNaN(val) ? '0.00' : val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Excel Export featuring header logo, report titles, and multi-sheet structure
    const exportToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();

            // Fetch Logo Image Buffer once
            let imageBuffer = null;
            try {
                const response = await fetch('/logo.png');
                if (response.ok) {
                    const blob = await response.blob();
                    imageBuffer = await blob.arrayBuffer();
                }
            } catch (err) {
                console.warn('Logo image could not be loaded into Excel:', err);
            }

            const currentDateStr = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).toUpperCase();

            // Helper to build a styled sheet
            const buildSheet = (sheetName, sectionTitle, columns, headers, rowsData, subjectColIndex) => {
                const worksheet = workbook.addWorksheet(sheetName);

                // Set Column Widths
                worksheet.columns = columns;

                // Report Main Title Header
                worksheet.mergeCells('B1:H1');
                const mainTitle = worksheet.getCell('B1');
                mainTitle.value = 'KARACHI WATER & SEWERAGE CORPORATION';
                mainTitle.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
                mainTitle.alignment = { vertical: 'middle', horizontal: 'center' };

                // Generated Date Subheader
                worksheet.mergeCells('B2:H2');
                const subTitle = worksheet.getCell('B2');
                subTitle.value = `USER FILE REPORT GENERATED FROM EFILING PORTAL ON ${currentDateStr}`;
                subTitle.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF4B5563' } };
                subTitle.alignment = { vertical: 'middle', horizontal: 'center' };

                // Add Header Logo Image directly aligned with top text line
                if (imageBuffer) {
                    const imageId = workbook.addImage({
                        buffer: imageBuffer,
                        extension: 'png',
                    });

                    worksheet.addImage(imageId, {
                        tl: { col: 0.100, row: 0.2 },
                        ext: { width: 55, height: 55 }
                    });
                }

                worksheet.addRow([]); // Blank row gap

                // Section Header
                const sectionRow = worksheet.addRow([sectionTitle]);
                worksheet.mergeCells(`A${sectionRow.number}:H${sectionRow.number}`);
                const sectionCell = sectionRow.getCell(1);
                sectionCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
                sectionCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1E40AF' }
                };
                sectionCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
                sectionRow.height = 28;

                // Table Header
                const headerRow = worksheet.addRow(headers);
                headerRow.height = 24;
                headerRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1F2937' } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE5E7EB' }
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                        bottom: { style: 'medium', color: { argb: 'FF9CA3AF' } },
                        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
                    };
                });

                // Data Rows with text wrapping on Subject
                rowsData.forEach((data, index) => {
                    const row = worksheet.addRow(data);
                    row.height = 24;
                    row.eachCell((cell, colNumber) => {
                        cell.font = { name: 'Calibri', size: 10 };

                        if (colNumber === subjectColIndex) {
                            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                        } else {
                            cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        }

                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB' }
                        };
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                        };
                    });
                });
            };

            // SHEET 1: FILES CREATED BY ME
            const createdCols = [
                { width: 26 }, // File Number
                { width: 24 }, // Department
                { width: 40 }, // File Subject
                { width: 28 }, // File Type
                { width: 20 }, // Budget
                { width: 20 }, // Costing
                { width: 28 }, // Currently Marked To
                { width: 18 }  // File Status
            ];
            const createdHeaders = [
                'File Number',
                'Department',
                'File Subject',
                'File Type',
                'Budget Head',
                'Costing',
                'Currently Marked To',
                'File Status'
            ];
            const createdRows = filteredCreatedFiles.map(file => [
                file.file_number || 'N/A',
                file.department_name || 'N/A',
                file.subject || 'N/A',
                file.file_type_name || 'N/A',
                file.budget_head || 'N/A',
                formatCurrency(file.costing || file.proposed_estimated_cost),
                file.current_assignee_user_name || 'N/A',
                file.status_name || 'N/A'
            ]);
            buildSheet('Created By Me', `FILES CREATED BY ME (Total: ${filteredCreatedFiles.length} | Total Costing: PKR ${formatCurrency(totalCreatedCosting)})`, createdCols, createdHeaders, createdRows, 3);

            // SHEET 2: FILES MARKED TO ME
            const markedCols = [
                { width: 26 }, // File Number
                { width: 24 }, // Created by
                { width: 24 }, // Department
                { width: 40 }, // File Subject
                { width: 28 }, // File Type
                { width: 20 }, // Budget 

                { width: 20 }, // Costing
                { width: 28 }, // Currently Marked To
                { width: 18 }  // File Status
            ];
            const markedHeaders = [
                'File Number',
                'Created by',
                'Department',
                'File Subject',
                'File Type',
                'Budget Head',
                'Costing',
                'Currently Marked To',
                'File Status'
            ];
            const markedRows = filteredMarkedFiles.map(file => [
                file.file_number || 'N/A',
                file.creator_user_name || 'N/A',
                file.department_name || 'N/A',
                file.subject || 'N/A',
                file.file_type_name || 'N/A',
                file.budget_head || 'N/A',
                formatCurrency(file.costing || file.proposed_estimated_cost),
                file.current_assignee_user_name || file.current_holder || 'N/A',
                file.status_name || 'N/A'
            ]);
            buildSheet('Marked To Me', `FILES MARKED TO ME (Total: ${filteredMarkedFiles.length})`, markedCols, markedHeaders, markedRows, 4);

            // Generate and Download Excel File
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `file_status_report_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);

            toast({
                title: "Success",
                description: "Report exported to Excel successfully",
            });
        } catch (err) {
            console.error('Error generating Excel file:', err);
            toast({
                title: "Export Failed",
                description: "Failed to generate Excel file",
                variant: "destructive"
            });
        }
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
                            description: 'Exported My File Status Report to Excel',
                            entity_type: 'report_export',
                            entity_name: 'My File Status Report Excel'
                        });
                    }
                    exportToExcel();
                }} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Report (CSV)
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <CardTitle>Files Created By Me (Total: {filteredCreatedFiles.length})</CardTitle>
                        <span className="text-base font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                            Total Costing: PKR {formatCurrency(totalCreatedCosting)}
                        </span>
                    </div>
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
                                        <TableHead>Department</TableHead>
                                        <TableHead>File Subject</TableHead>
                                        <TableHead>File Type</TableHead>
                                        <TableHead>Budget Head</TableHead>
                                        <TableHead>Costing</TableHead>
                                        <TableHead>Currently Marked To</TableHead>
                                        <TableHead>File Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCreatedFiles.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell className="font-medium">{file.file_number || 'N/A'}</TableCell>
                                            <TableCell>{file.department_name || 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs whitespace-normal break-words">{file.subject || 'N/A'}</TableCell>
                                            <TableCell>{file.file_type_name || 'N/A'}</TableCell>
                                            <TableCell>{file.budget_head || 'N/A'}</TableCell>
                                            <TableCell className="font-semibold text-gray-900">
                                                PKR {formatCurrency(file.costing || file.proposed_estimated_cost)}
                                            </TableCell>
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
                    <CardTitle>Files Marked To Me (Total: {filteredMarkedFiles.length})</CardTitle>
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
                                        <TableHead>Department</TableHead>
                                        <TableHead>File Subject</TableHead>
                                        <TableHead>File Type</TableHead>
                                        <TableHead>Budget Head</TableHead>
                                        <TableHead>Costing</TableHead>
                                        <TableHead>Currently Marked To</TableHead>
                                        <TableHead>File Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedMarkedFiles.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell className="font-medium">{file.file_number || 'N/A'}</TableCell>
                                            <TableCell className="font-medium">{file.creator_user_name || 'N/A'}</TableCell>
                                            <TableCell>{file.department_name || 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs whitespace-normal break-words">{file.subject || 'N/A'}</TableCell>
                                            <TableCell>{file.file_type_name || 'N/A'}</TableCell>
                                            <TableCell>{file.budget_head || 'N/A'}</TableCell>

                                            <TableCell className="font-semibold text-gray-900">
                                                PKR {formatCurrency(file.costing || file.proposed_estimated_cost)}
                                            </TableCell>
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