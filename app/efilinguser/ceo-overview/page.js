'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ArrowLeft, 
    FileText, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    FileEdit, 
    XCircle,
    Loader2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CEOOverview() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [fiscalYear, setFiscalYear] = useState('2025-26');

    const fetchCEOStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/efiling/ceo/stats?fiscalYear=${fiscalYear}`);
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    }, [fiscalYear]);

    useEffect(() => {
        fetchCEOStats();
    }, [fetchCEOStats]);

    return (
        <div className="container mx-auto p-6 space-y-6 bg-gray-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
                    <span className="text-sm font-semibold text-gray-600 ml-2">Fiscal Year:</span>
                    <Select value={fiscalYear} onValueChange={setFiscalYear}>
                        <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024-25">2024-2025</SelectItem>
                            <SelectItem value="2025-26">2025-2026</SelectItem>
                            <SelectItem value="2026-27">2026-2027</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Total Files" 
                    value={stats?.total_files} 
                    icon={<FileText className="h-5 w-5 text-blue-600" />} 
                    color="blue"
                    loading={loading}
                />
                <KPICard 
                    title="In Progress" 
                    value={stats?.in_progress} 
                    icon={<Clock className="h-5 w-5 text-amber-500" />} 
                    color="amber"
                    loading={loading}
                />
                <KPICard 
                    title="Approved" 
                    value={stats?.approved} 
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} 
                    color="emerald"
                    loading={loading}
                />
                <KPICard 
                    title="SLA Breached" 
                    value={stats?.overdue} 
                    icon={<AlertCircle className="h-5 w-5 text-red-600" />} 
                    color="red"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MiniStat title="Drafts" value={stats?.draft} loading={loading} icon={<FileEdit className="h-4 w-4 text-gray-500" />} />
                <MiniStat title="Pending" value={stats?.pending} loading={loading} icon={<Clock className="h-4 w-4 text-amber-500" />} />
                <MiniStat title="Rejected" value={stats?.rejected} loading={loading} icon={<XCircle className="h-4 w-4 text-red-500" />} />
                <MiniStat title="Completed" value={stats?.completed} loading={loading} icon={<CheckCircle2 className="h-4 w-4 text-purple-500" />} />
            </div>
            
            {/* Charts section can be added below */}
        </div>
    );
}

function KPICard({ title, value, icon, color, loading }) {
    const colors = {
        blue: "bg-blue-50 border-blue-100",
        amber: "bg-amber-50 border-amber-100",
        emerald: "bg-emerald-50 border-emerald-100",
        red: "bg-red-50 border-red-100"
    };

    return (
        <Card className={`border shadow-sm ${colors[color]}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</CardTitle>
                <div className="p-2 bg-white rounded-md shadow-sm border">{icon}</div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                    <div className="text-3xl font-bold text-gray-900">{parseInt(value || 0).toLocaleString()}</div>
                )}
            </CardContent>
        </Card>
    );
}

function MiniStat({ title, value, loading, icon }) {
    return (
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-full">{icon}</div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
                <p className="text-lg font-bold text-gray-900">
                    {loading ? "..." : parseInt(value || 0).toLocaleString()}
                </p>
            </div>
        </div>
    );
}