"use client"
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, Calendar, Filter } from 'lucide-react';

export default function DistrictReportPage() {
    const [districtOptions, setDistrictOptions] = useState([]);
    const [workTypeOptions, setWorkTypeOptions] = useState([]);
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showTownDetails, setShowTownDetails] = useState(false);
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
                    fetch('/api/districts'),
                    fetch('/api/complaints/subtypes')
                ]);
                const dData = await dRes.json();
                const wData = await wRes.json();
                setDistrictOptions(Array.isArray(dData) ? dData : dData.data || []);
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
            const response = await fetch('/api/dashboard/reports/district', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dateFrom,
                    dateTo,
                    showTownDetails,
                    showWorkType,
                    showNatureOfWork, // New parameter
                    districts: selectedDistricts,
                    workTypes: selectedWorkTypes,
                    naturesOfWork: showNatureOfWork ? selectedNatures : [] // New parameter
                })
            });

            if (!response.ok) throw new Error("Generation failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `District_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
        } catch (err) {
            alert("Error generating report: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderFilterList = (title, options, selected, setter, labelKey) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> {title}
                </h4>
                <button
                    onClick={() => setter([])}
                    className="text-[10px] text-blue-600 hover:underline font-medium"
                >
                    Clear All
                </button>
            </div>
            <div className="border rounded-md h-48 overflow-y-auto p-2 bg-white shadow-sm">
                {options.map((opt) => (
                    <label key={opt.id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selected.includes(opt.id.toString())}
                            onChange={(e) => {
                                const val = opt.id.toString();
                                if (e.target.checked) setter([...selected, val]);
                                else setter(selected.filter(id => id !== val));
                            }}
                        />
                        <span className="text-sm text-gray-600">{opt[labelKey]}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-blue-950">District Wise Report</h1>
                <p className="text-gray-500">Generate statistical PDF reports filtered by districts and parameters.</p>
            </div>

            <div className="grid gap-6">
                <Card className="shadow-md">
                    <CardHeader className="border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-900" /> Date Range & Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Date From</label>
                                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Date To</label>
                                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input type="checkbox" checked={showTownDetails} onChange={(e) => setShowTownDetails(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-blue-950">Show Town Details</span>
                                            <span className="text-xs text-gray-500">Break down each district by its constituent towns</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-blue-50/50 border-blue-100 cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={showWorkType} 
                                            onChange={(e) => {
                                                setShowWorkType(e.target.checked);
                                                if(e.target.checked) setShowNatureOfWork(false);
                                            }} 
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600" 
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-blue-950">Show Work Distribution</span>
                                            <span className="text-xs text-gray-500">Break down requests by work type (sub-types)</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-green-50/50 border-green-100 cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={showNatureOfWork} 
                                            onChange={(e) => {
                                                setShowNatureOfWork(e.target.checked);
                                                if(e.target.checked) setShowWorkType(false);
                                            }} 
                                            className="w-5 h-5 rounded border-gray-300 text-green-600" 
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-green-900">Show Nature of Work</span>
                                            <span className="text-xs text-gray-500">Break down requests by Nature (Sunk down, Leakage, etc)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {renderFilterList("Select Districts", districtOptions, selectedDistricts, setSelectedDistricts, 'title')}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            {showWorkType ? (
                                renderFilterList("Select Work Types", workTypeOptions, selectedWorkTypes, setSelectedWorkTypes, 'subtype_name')
                            ) : showNatureOfWork ? (
                                renderFilterList("Select Nature of Work", natureOptions, selectedNatures, setSelectedNatures, 'name')
                            ) : (
                                <div className="flex items-center justify-center border-2 border-dashed rounded-md bg-gray-50 text-gray-400 text-sm p-8">
                                    Enable a distribution toggle above to filter by specific categories
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-900 hover:bg-blue-800 h-14 text-lg shadow-lg transition-all">
                    {loading ? <span className="flex items-center gap-2 animate-pulse text-white">Processing Data...</span> : <span className="flex items-center gap-2 text-white font-semibold"><FileText className="w-5 h-5" /> Generate District PDF Report</span>}
                </Button>
            </div>
        </div>
    );
}