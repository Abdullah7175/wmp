"use client"
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building2, Calendar, Filter } from 'lucide-react';

export default function DepartmentReportPage() {
    const [deptOptions, setDeptOptions] = useState([]);
    const [workTypeOptions, setWorkTypeOptions] = useState([]);
    const [selectedDepts, setSelectedDepts] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showWorkType, setShowWorkType] = useState(false);
    const [loading, setLoading] = useState(false);

    // New State for Nature of Work
    const [showNatureOfWork, setShowNatureOfWork] = useState(false);
    const [selectedNatures, setSelectedNatures] = useState([]);
    const [natureOptions] = useState([
        { id: 'Sunk Down', name: 'Sunk Down' },
        { id: 'Repairing And Maintenance(R&M)', name: 'Repairing And Maintenance(R&M)' },
        { id: 'Leakages', name: 'Leakages' },
        { id: 'Development Work', name: 'Development Work' },
        { id: 'new installation', name: 'new installation' },
        { id: 'repairing', name: 'repairing' },
        { id: 'null', name: 'Unspecified' }
    ]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [dRes, wRes] = await Promise.all([
                    fetch('/api/complaints/types'), 
                    fetch('/api/complaints/subtypes')
                ]);
                const dData = await dRes.json();
                const wData = await wRes.json();
                setDeptOptions(Array.isArray(dData) ? dData : dData.data || []);
                setWorkTypeOptions(Array.isArray(wData) ? wData : wData.data || []);
            } catch (err) {
                console.error("Failed to load filters");
            }
        };
        fetchFilters();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dashboard/reports/department', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dateFrom,
                    dateTo,
                    showWorkType,
                    showNatureOfWork, // Added
                    departments: selectedDepts,
                    workTypes: selectedWorkTypes,
                    naturesOfWork: showNatureOfWork ? selectedNatures : [] // Added
                })
            });

            if (!response.ok) throw new Error("Failed to generate report");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Department_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderFilterList = (title, options, selected, setSelected, displayKey) => (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">{title}</label>
                <button
                    onClick={() => setSelected([])}
                    className="text-[10px] text-blue-600 hover:underline"
                >
                    Clear All
                </button>
            </div>
            <div className="w-full border rounded-md bg-white h-40 overflow-y-auto p-2 space-y-1">
                {options.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-900"
                            checked={selected.includes(opt.id.toString())}
                            onChange={(e) => {
                                const val = opt.id.toString();
                                setSelected(prev =>
                                    e.target.checked ? [...prev, val] : prev.filter(id => id !== val)
                                );
                            }}
                        />
                        <span className="text-sm text-gray-700">{opt[displayKey]}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-950">
                <Building2 className="text-blue-600" /> Department-wise Report Generation
            </h1>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" /> Date Filters (Request Date)
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
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-600" /> Report Filters
                        </CardTitle>
                        
                        <div className="flex gap-4">
                            {/* Toggle Work Type */}
                            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                                <input type="checkbox" checked={showWorkType}
                                    onChange={(e) => {
                                        setShowWorkType(e.target.checked);
                                        if (e.target.checked) setShowNatureOfWork(false); // Mutual Exclusion
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-900" />
                                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tight">Show Work Type</span>
                            </label>

                            {/* Toggle Nature of Work */}
                            <label className="flex items-center gap-2 cursor-pointer bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                <input type="checkbox" checked={showNatureOfWork}
                                    onChange={(e) => {
                                        setShowNatureOfWork(e.target.checked);
                                        if (e.target.checked) setShowWorkType(false); // Mutual Exclusion
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-green-900" />
                                <span className="text-[10px] font-bold text-green-900 uppercase tracking-tight">Show Nature of Work</span>
                            </label>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderFilterList("Select Departments", deptOptions, selectedDepts, setSelectedDepts, 'type_name')}

                            {showWorkType ? (
                                renderFilterList("Select Work Types", workTypeOptions, selectedWorkTypes, setSelectedWorkTypes, 'subtype_name')
                            ) : showNatureOfWork ? (
                                renderFilterList("Select Nature of Work", natureOptions, selectedNatures, setSelectedNatures, 'name')
                            ) : (
                                <div className="flex items-center justify-center border-2 border-dashed rounded-md bg-gray-50 text-gray-400 text-sm p-4 text-center">
                                    Enable a distribution toggle above to filter by specific categories
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-blue-900 hover:bg-blue-800 h-14 text-lg shadow-lg transition-all"
                >
                    {loading ? (
                        <span className="flex items-center gap-2 animate-pulse text-white">
                            Processing Data...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-white font-semibold">
                            <FileText className="w-5 h-5" /> Generate PDF Report
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}