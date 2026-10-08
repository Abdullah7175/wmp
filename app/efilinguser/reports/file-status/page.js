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
            
            const [createdRes, assignedRes, historyRes] = await Promise.all([
                fetch(`/api/efiling/files?created_by=${efilingUserId}`),
                fetch(`/api/efiling/files?assigned_to=${efilingUserId}`),
                // Every file ever marked (MARK_TO) to the logged-in user, from efiling_file_movements
                fetch('/api/efiling/files/marked-history')
            ]);
            
            const createdData = createdRes.ok ? await createdRes.json() : { files: [] };
            const assignedData = assignedRes.ok ? await assignedRes.json() : { files: [] };
            const historyData = historyRes.ok ? await historyRes.json() : { files: [] };

            // History has one row per marking (a file marked to this user several times appears
            // several times, each with its own Marked By / Marked On). Currently assigned files
            // that have no MARK_TO movement are kept so nothing from the old list is lost.
            const historyFiles = historyData.files || [];
            const historyFileIds = new Set(historyFiles.map((f) => f.id));
            const currentOnlyFiles = (assignedData.files || []).filter((f) => !historyFileIds.has(f.id));

            setCreatedFiles(createdData.files || []);
            setMarkedFiles([...historyFiles, ...currentOnlyFiles]);
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

    // dateField: which date the Date Range filter applies to (created_at for created files, marked_on for marked files)
    const filterList = (fileList, dateField = 'created_at') => {
        return fileList.filter(file => {
            const matchesDepartment = filters.department === 'all' || file.department_id == filters.department;
            const matchesFileType = filters.fileType === 'all' || file.file_type_id == filters.fileType;
            const matchesStatus = filters.status === 'all' || file.status_name === filters.status;
            
            let matchesDate = true;
            if (filters.dateRange !== 'all') {
                const fileDate = new Date(file[dateField]);
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

    const filteredCreatedFiles = filterList(createdFiles, 'created_at');
    const filteredMarkedFiles = filterList(markedFiles, 'marked_on');

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

    // Format a timestamp as e.g. "01 Oct 2026"
    const formatDate = (value) => {
        if (!value) return 'N/A';
        const d = new Date(value);
        return isNaN(d.getTime())
            ? 'N/A'
            : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // ---- Excel layout helpers -------------------------------------------------
    const EMU_PER_PX = 9525;

    // Approximate Excel column width (chars) -> pixels at 100% zoom
    const excelColWidthToPx = (width) => Math.round((width || 8.43) * 7 + 5);

    // Approximate rendered width (px) of single-line bold uppercase text
    const estimateTitleWidthPx = (text, fontSizePt) => String(text || '').length * fontSizePt * 0.66;

    // Approximate rendered width of a string in "column character units" (uppercase is wider)
    const estimateTextUnits = (str) => [...String(str ?? '')].reduce((sum, ch) => sum + (/[A-Z]/.test(ch) ? 1.25 : 1), 0);

    // Auto-fit column widths to the longest cell (header included), never narrower than the
    // original width. MAX_COL_WIDTH keeps printouts compact: anything longer wraps onto more lines.
    const MAX_COL_WIDTH = 36;
    const fitColumnWidths = (baseColumns, headers, rowsData, fixedColIndexes = []) =>
        baseColumns.map((col, i) => {
            if (fixedColIndexes.includes(i + 1)) return col;
            const longestCell = rowsData.reduce((max, row) => {
                const longestLine = String(row[i] ?? '')
                    .split(/\r?\n/)
                    .reduce((m, line) => Math.max(m, estimateTextUnits(line)), 0);
                return Math.max(max, longestLine);
            }, 0);
            const headerUnits = estimateTextUnits(headers[i]) * 1.15; // header is bold 11pt
            const needed = Math.ceil(Math.max(longestCell, headerUnits)) + 2;
            return { ...col, width: Math.min(MAX_COL_WIDTH, Math.max(col.width || 8.43, needed)) };
        });

    // Estimate how many lines a text needs in a wrapped cell (greedy word wrap).
    // Uppercase characters are wider, so they are weighted heavier. Slightly conservative
    // on purpose so text is never clipped.
    const estimateWrappedLines = (text, colWidthChars) => {
        const value = String(text ?? '');
        const maxUnits = Math.max(1, (colWidthChars - 2) * 0.95);
        const unitsOf = estimateTextUnits;

        let lines = 0;
        value.split(/\r?\n/).forEach((paragraph) => {
            let current = 0;
            let paragraphLines = 1;
            paragraph.split(/\s+/).filter(Boolean).forEach((word) => {
                const wordUnits = unitsOf(word);
                if (wordUnits > maxUnits) {
                    // Very long word: starts on a new line and breaks across several
                    if (current > 0) paragraphLines += 1;
                    const wordLines = Math.ceil(wordUnits / maxUnits);
                    paragraphLines += wordLines - 1;
                    current = wordUnits - (wordLines - 1) * maxUnits;
                } else if (current === 0) {
                    current = wordUnits;
                } else if (current + 1 + wordUnits <= maxUnits) {
                    current += 1 + wordUnits;
                } else {
                    paragraphLines += 1;
                    current = wordUnits;
                }
            });
            lines += paragraphLines;
        });
        return Math.max(1, lines);
    };

    // Row height (points) needed to fully show wrapped text (Calibri 10 => ~13pt per line)
    const MIN_ROW_HEIGHT = 24;
    const MAX_ROW_HEIGHT = 409; // Excel hard limit
    const calcWrappedRowHeight = (text, colWidthChars) => {
        const lines = estimateWrappedLines(text, colWidthChars);
        return Math.min(MAX_ROW_HEIGHT, Math.max(MIN_ROW_HEIGHT, lines * 13 + 8));
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
            const buildSheet = (sheetName, sectionTitle, baseColumns, headers, rowsData, subjectColIndex) => {
                const worksheet = workbook.addWorksheet(sheetName);

                // Widths grow with the longest content (subject column stays fixed; it wraps instead)
                const columns = fitColumnWidths(baseColumns, headers, rowsData, [subjectColIndex]);

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

                // Add Header Logo Image placed immediately to the left of the centered title text
                if (imageBuffer) {
                    const imageId = workbook.addImage({
                        buffer: imageBuffer,
                        extension: 'png',
                    });

                    const LOGO_SIZE_PX = 55;
                    const LOGO_GAP_PX = 10;
                    const colPx = columns.map((col) => excelColWidthToPx(col.width));

                    // Title/subtitle are merged across columns B:H (index 1..7) and centered
                    const mergedStartPx = colPx[0];
                    const mergedWidthPx = colPx.slice(1, 8).reduce((sum, w) => sum + w, 0);
                    const textWidthPx = Math.max(
                        estimateTitleWidthPx(mainTitle.value, 16),
                        estimateTitleWidthPx(subTitle.value, 11)
                    );

                    // Left edge of the widest heading line, minus logo width and gap
                    let logoLeftPx = mergedStartPx + (mergedWidthPx - textWidthPx) / 2 - LOGO_SIZE_PX - LOGO_GAP_PX;
                    logoLeftPx = Math.max(logoLeftPx, 5);

                    // Convert absolute pixel offset into (column, offset-within-column)
                    let nativeCol = 0;
                    let remainingPx = logoLeftPx;
                    while (nativeCol < colPx.length - 1 && remainingPx >= colPx[nativeCol]) {
                        remainingPx -= colPx[nativeCol];
                        nativeCol += 1;
                    }

                    worksheet.addImage(imageId, {
                        tl: {
                            nativeCol,
                            nativeColOff: Math.round(remainingPx * EMU_PER_PX),
                            nativeRow: 0,
                            nativeRowOff: 32000
                        },
                        ext: { width: LOGO_SIZE_PX, height: LOGO_SIZE_PX }
                    });
                }

                worksheet.addRow([]); // Blank row gap

                // Section Header
                const sectionRow = worksheet.addRow([sectionTitle]);
                worksheet.mergeCells(sectionRow.number, 1, sectionRow.number, columns.length); // span all table columns (A -> last column)
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
                    // Auto-fit row height to the tallest wrapped cell in the row
                    row.height = Math.max(
                        ...data.map((value, i) => calcWrappedRowHeight(value, columns[i]?.width || 10))
                    );
                    row.eachCell((cell) => {
                        cell.font = { name: 'Calibri', size: 10 };

                        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

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
                { width: 24 }, // Marked To Me By
                { width: 16 }, // Marked To Me On
                { width: 24 }, // Marked By Me To
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
                'Marked To Me By',
                'Marked To Me On',
                'Marked By Me To',
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
                file.marked_by_name || 'N/A',
                formatDate(file.marked_on),
                file.marked_by_me_to_name || 'N/A',
                file.current_assignee_user_name || file.current_holder || 'N/A',
                file.status_name || 'N/A'
            ]);
            buildSheet('Marked To Me', `FILES MARKED TO ME (Total: ${filteredMarkedFiles.length})`, markedCols, markedHeaders, markedRows, 5);

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
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
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
                                        <TableHead>Marked To Me By</TableHead>
                                        <TableHead>Marked To Me On</TableHead>
                                        <TableHead>Marked By Me To</TableHead>
                                        <TableHead>Currently Marked To</TableHead>
                                        <TableHead>File Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedMarkedFiles.map((file) => (
                                        <TableRow key={file.movement_id ?? file.id}>
                                            <TableCell className="font-medium">{file.file_number || 'N/A'}</TableCell>
                                            <TableCell className="font-medium">{file.creator_user_name || 'N/A'}</TableCell>
                                            <TableCell>{file.department_name || 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs whitespace-normal break-words">{file.subject || 'N/A'}</TableCell>
                                            <TableCell>{file.file_type_name || 'N/A'}</TableCell>
                                            <TableCell>{file.budget_head || 'N/A'}</TableCell>

                                            <TableCell className="font-semibold text-gray-900">
                                                PKR {formatCurrency(file.costing || file.proposed_estimated_cost)}
                                            </TableCell>
                                            <TableCell>{file.marked_by_name || 'N/A'}</TableCell>
                                            <TableCell>{formatDate(file.marked_on)}</TableCell>
                                            <TableCell>{file.marked_by_me_to_name || 'N/A'}</TableCell>
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