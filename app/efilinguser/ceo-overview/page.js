'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, FileText, Clock, CheckCircle2, AlertCircle, 
    FileEdit, XCircle, Loader2, Search, ChevronLeft, ChevronRight, ChevronsRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CEOOverview() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [allFiles, setAllFiles] = useState([]);
    const [fiscalYear, setFiscalYear] = useState('2025-26');


    // Table States
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [fileNumFilter, setFileNumFilter] = useState('all');

    const [categoryData, setCategoryData] = useState([]);
    const [catPage, setCatPage] = useState(1);
    const catItemsPerPage = 5;
    const itemsPerPage = 8;

    const fetchCEOData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/efiling/ceo/stats?fiscalYear=${fiscalYear}`);
            const result = await response.json();
            if (result.success) {
                setStats(result.data.stats);
                setAllFiles(result.data.files);
                setCategoryData(result.data.categoryAnalytics || []);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    }, [fiscalYear]);

    useEffect(() => {
        fetchCEOData();
    }, [fetchCEOData]);

    const filteredFiles = useMemo(() => {
        return allFiles.filter(file => {
            const matchesStatus = statusFilter === 'all' || file.status === statusFilter;
            const matchesFileNum = fileNumFilter === 'all' || file.file_number === fileNumFilter;
            return matchesStatus && matchesFileNum;
        });
    }, [allFiles, statusFilter, fileNumFilter]);

    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const paginatedFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        // Changed container to max-w-full and reduced horizontal padding to p-4
        <div className="max-w-full mx-auto p-4 space-y-4 bg-gray-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">E-Filing CEO Dashboard</h1>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border shadow-sm">
                    <span className="text-xs font-semibold text-gray-600 ml-2">Fiscal Year:</span>
                    <Select value={fiscalYear} onValueChange={setFiscalYear}>
                        <SelectTrigger className="h-8 w-[120px] border-none shadow-none focus:ring-0 text-sm">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024-25">2024-2025</SelectItem>
                            <SelectItem value="2025-26">2025-2026</SelectItem>
                            <SelectItem value="2026-27">2026-2027</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main KPI Cards - Tighter gap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <KPICard 
                    title="Total Files Created" 
                    value={stats?.total_files} 
                    workRelated={stats?.total_work_related}
                    icon={<FileText className="h-4 w-4 text-blue-600" />} 
                    color="blue"
                    loading={loading}
                />
                <KPICard 
                    title="In Progress" 
                    value={stats?.in_progress} 
                    workRelated={stats?.in_progress_work_related}
                    icon={<Clock className="h-4 w-4 text-amber-500" />} 
                    color="amber"
                    loading={loading}
                />
                <KPICard 
                    title="Approved" 
                    value={stats?.approved} 
                    workRelated={stats?.approved_work_related}
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} 
                    color="emerald"
                    loading={loading}
                />
                <KPICard 
                    title="SLA Breached" 
                    value={stats?.overdue} 
                    workRelated={stats?.overdue_work_related}
                    icon={<AlertCircle className="h-4 w-4 text-red-600" />} 
                    color="red"
                    loading={loading}
                />
            </div>

            {/* Mini Stats - Smaller text and padding */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat title="Drafts" value={stats?.draft} workRelated={stats?.draft_work_related} loading={loading} icon={<FileEdit className="h-4 w-4 text-gray-500" />} />
                <MiniStat title="Pending" value={stats?.pending} workRelated={stats?.pending_work_related} loading={loading} icon={<Clock className="h-4 w-4 text-amber-500" />} />
                <MiniStat title="Rejected" value={stats?.rejected} workRelated={stats?.rejected_work_related} loading={loading} icon={<XCircle className="h-4 w-4 text-red-500" />} />
                <MiniStat title="Completed" value={stats?.completed} workRelated={stats?.completed_work_related} loading={loading} icon={<CheckCircle2 className="h-4 w-4 text-purple-500" />} />
            </div>

            {/* Category Wise Analytics Section */}
            <Card className="border shadow-sm">
                <CardHeader className="py-3 px-4 border-b bg-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" /> Category Wise Expenditure & Volume
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="text-xs font-bold uppercase">Category</TableHead>
                                <TableHead className="text-xs font-bold uppercase">Files</TableHead>
                                <TableHead className="text-xs font-bold uppercase">Est. Total Cost</TableHead>
                                <TableHead className="text-xs font-bold uppercase">Status Breakdown</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categoryData.slice((catPage - 1) * catItemsPerPage, catPage * catItemsPerPage).map((cat) => (
                                <TableRow key={cat.id} className="text-sm">
                                    <TableCell className="font-semibold">{cat.category_name}</TableCell>
                                    <TableCell>{cat.total_files}</TableCell>
                                    <TableCell className="font-bold text-emerald-700">
                                        Rs. {parseFloat(cat.total_estimated_cost || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(cat.status_distribution || {}).map(([status, count]) => (
                                                count > 0 && (
                                                    <Badge key={status} variant="secondary" className="text-[10px] px-1 h-5">
                                                        {status}: {count}
                                                    </Badge>
                                                )
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    {/* Simple Pagination for Category Table */}
                    <div className="flex items-center justify-end p-2 gap-2 border-t bg-gray-50/30">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCatPage(p => Math.max(1, p - 1))} 
                            disabled={catPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium">Page {catPage}</span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCatPage(p => p + 1)} 
                            disabled={catPage * catItemsPerPage >= categoryData.length}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Files Tracking */}

            <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-white py-3 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Search className="h-4 w-4 text-gray-500" /> Files Tracking
                        </CardTitle>
                        
                        <div className="flex flex-wrap gap-2">
                            <Select value={fileNumFilter} onValueChange={(v) => {setFileNumFilter(v); setCurrentPage(1);}}>
                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                    <SelectValue placeholder="File #" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All File Numbers</SelectItem>
                                    {Array.from(new Set(allFiles.map(f => f.file_number))).map(num => (
                                        <SelectItem key={num} value={num}>{num}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={(v) => {setStatusFilter(v); setCurrentPage(1);}}>
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {Array.from(new Set(allFiles.map(f => f.status))).map(st => (
                                        <SelectItem key={st} value={st}>{st}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Reset Button: Only shows when a filter is active */}
                            {(fileNumFilter !== 'all' || statusFilter !== 'all') && (
                                <Button 
                                    variant="ghost" 
                                    className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setFileNumFilter('all');
                                        setStatusFilter('all');
                                        setCurrentPage(1);
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="font-bold text-sm py-3">File Number</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Subject</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Category</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Dept</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Status</TableHead>
                                    <TableHead className="font-bold text-sm py-3">SLA</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Created Date</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Aging</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Created By</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Currently Assigned to</TableHead>
                                    <TableHead className="font-bold text-sm py-3">Work ID</TableHead>



                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={9} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                                ) : paginatedFiles.length === 0 ? (
                                    <TableRow><TableCell colSpan={9} className="text-center py-10 text-gray-500">No files found</TableCell></TableRow>
                                ) : (
                                    paginatedFiles.map((file, idx) => {
                                        // Status badge color logic with full status coverage
                                        const getStatusStyles = (status) => {
                                            const s = status?.toLowerCase();
                                            
                                            switch (s) {
                                                // Red - Critical / Action Required
                                                case 'pending':
                                                case 'rejected':
                                                case 'escalated':
                                                    return "bg-red-100 text-red-700 border-red-200";
                                                    
                                                // Yellow/Amber - In Motion / Warning
                                                case 'in progress':
                                                case 'pending approval':
                                                case 'on hold':
                                                    return "bg-amber-100 text-amber-700 border-amber-200";
                                                    
                                                // Blue - Review / Process
                                                case 'under review':
                                                case 'draft':
                                                    return "bg-blue-100 text-blue-700 border-blue-200";
                                                    
                                                // Green - Success / Finalized
                                                case 'approved':
                                                case 'completed':
                                                case 'closed':
                                                    return "bg-green-100 text-green-700 border-green-200";
                                                    
                                                // Gray - Inactive / Neutral
                                                case 'archived':
                                                    return "bg-gray-100 text-gray-600 border-gray-200";
                                                    
                                                default:
                                                    return "bg-gray-50 text-gray-500 border-gray-200";
                                            }
                                        };

                                        return (
                                            <TableRow key={idx} className="hover:bg-gray-50/50">
                                                <TableCell className="text-sm font-medium whitespace-nowrap py-3">{file.file_number}</TableCell>
                                                <TableCell className="max-w-[200px] truncate text-sm py-3" title={file.subject}>{file.subject}</TableCell>
                                                <TableCell className="text-sm py-3">{file.category}</TableCell>
                                                <TableCell className="text-sm py-3">{file.department}</TableCell>
                                                <TableCell className="py-3">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-xs px-1 h-8 capitalize font-semibold ${getStatusStyles(file.status)}`}
                                                    >
                                                        {file.status?.toLowerCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    {file.sla_breached ? 
                                                        <Badge variant="destructive" className="text-xs px-2 h-6">Breached</Badge> : 
                                                        <Badge variant="secondary" className="text-xs px-1 h-8">On Track</Badge>
                                                    }
                                                </TableCell>

                                                <TableCell className="text-sm whitespace-nowrap py-3">
                                                    {new Date(file.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-semibold text-center text-sm py-3 whitespace-nowrap">
                                                    {(() => {
                                                        const totalDays = parseInt(file.aging);
                                                        if (totalDays === 0) return "Today";
                                                        
                                                        const years = Math.floor(totalDays / 365);
                                                        const months = Math.floor((totalDays % 365) / 30);
                                                        const days = totalDays % 30;

                                                        let parts = [];
                                                        if (years > 0) parts.push(`${years} y`);
                                                        if (months > 0) parts.push(`${months} months`);
                                                        if (days > 0 || parts.length === 0) parts.push(`${days} days`);

                                                        return parts.join(' ');
                                                    })()}
                                                </TableCell>
                                                <TableCell className=" text-center text-sm py-3">{file.created_by_name}</TableCell>
                                                <TableCell className=" text-center text-sm py-3">{file.assigned_to_name || "Unassigned"} </TableCell>

                                                <TableCell className="text-blue-600 font-bold text-sm py-3">{file.work_request_id || '-'}</TableCell>

                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{paginatedFiles.length}</span> of <span className="font-medium">{filteredFiles.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" className="h-8 text-sm px-3" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                First
                            </Button>
                            <Button variant="outline" className="h-8 text-sm px-3" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                                Prev
                            </Button>
                            <div className="text-sm font-medium px-3">
                                {currentPage}/{totalPages || 1}
                            </div>
                            <Button variant="outline" className="h-8 text-sm px-3" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function KPICard({ title, value, workRelated, icon, color, loading }) {
    const colors = {
        blue: "bg-blue-50 border-blue-100",
        amber: "bg-amber-50 border-amber-100",
        emerald: "bg-emerald-50 border-emerald-100",
        red: "bg-red-50 border-red-100"
    };

    return (
        <Card className={`border shadow-sm ${colors[color]}`}>
            {/* Reduced padding in CardHeader and CardContent */}
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3">
                <CardTitle className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{title}</CardTitle>
                <div className="p-1.5 bg-white rounded-md shadow-sm border">{icon}</div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-none">{parseInt(value || 0).toLocaleString()}</div>
                        <p className="text-[15px] font-medium text-gray-500 mt-1">
                            Work Related: <span className="text-gray-800 font-bold">{workRelated || 0}</span>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function MiniStat({ title, value, workRelated, loading, icon }) {
    return (
        // Reduced padding and gaps
        <div className="bg-white p-2.5 rounded-xl border shadow-sm flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-full h-fit shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-800 uppercase truncate">{title}</p>
                <p className="text-base font-bold text-gray-900 leading-tight">
                    {loading ? "..." : parseInt(value || 0).toLocaleString()}
                </p>
                {!loading && (
                    <p className="text-[12px] text-gray-500 leading-none mt-0.5">
                        Work Related: <span className="font-bold text-gray-700">{workRelated || 0}</span>
                    </p>
                )}
            </div>
        </div>
    );
}