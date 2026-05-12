"use client"
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Filter, activity } from 'lucide-react';

export default function NatureOfWorkReportPage() {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Grouping Toggles (Mutually Exclusive)
    const [groupBy, setGroupBy] = useState(null); // 'district', 'department', or 'town'

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dashboard/reports/nature-of-work', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dateFrom,
                    dateTo,
                    groupBy // This tells the backend how to sub-group the nature of work
                })
            });

            if (!response.ok) throw new Error("Failed to generate report");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Nature_of_Work_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-950">
                Nature of Work Distribution Report
            </h1>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" /> Date Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">From Date</label>
                            <input type="date" className="w-full border p-2 rounded mt-1"
                                value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">To Date</label>
                            <input type="date" className="w-full border p-2 rounded mt-1"
                                value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-600" /> Distribution Grouping
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6">
                            {[
                                { id: 'district', label: 'Show Districts', color: 'blue' },
                                { id: 'department', label: 'Show Departments', color: 'orange' },
                                { id: 'town', label: 'Show Towns', color: 'green' }
                            ].map((item) => (
                                <label key={item.id} className={`flex items-center gap-2 cursor-pointer bg-${item.color}-50 px-4 py-2 rounded-full border border-${item.color}-100`}>
                                    <input 
                                        type="checkbox" 
                                        checked={groupBy === item.id}
                                        onChange={() => setGroupBy(groupBy === item.id ? null : item.id)}
                                        className="w-4 h-4 rounded-full text-blue-900" 
                                    />
                                    <span className={`text-sm font-bold text-${item.color}-900`}>{item.label}</span>
                                </label>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-gray-500 italic">
                            * Selecting one will show a breakdown of each Nature of Work by that category.
                        </p>
                    </CardContent>
                </Card>

                <Button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-900 hover:bg-blue-800 h-14 text-lg shadow-lg">
                    {loading ? "Processing..." : "Generate PDF Report"}
                </Button>
            </div>
        </div>
    );
}