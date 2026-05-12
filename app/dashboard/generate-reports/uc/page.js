"use client"
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, Calendar, Filter } from 'lucide-react';

export default function UCWiseReportPage() {
    const [townOptions, setTownOptions] = useState([]);
    const [ucOptions, setUcOptions] = useState([]); // These are 'subtowns' in DB
    const [workTypeOptions, setWorkTypeOptions] = useState([]);

    const [selectedTown, setSelectedTown] = useState(''); // Single select for town
    const [selectedUCs, setSelectedUCs] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showWorkType, setShowWorkType] = useState(false);
    const [loading, setLoading] = useState(false);
    const [natureOptions, setNatureOptions] = useState([
        { id: 'Sunk Down', name: 'Sunk Down' },
        { id: 'Repairing And Maintenance(R&M)', name: 'Repairing And Maintenance(R&M)' },
        { id: 'Leakages', name: 'Leakages' },
        { id: 'Development Work', name: 'Development Work' },
        { id: 'new installation', name: 'new installation' },
        { id: 'repairing', name: 'repairing' },
        { id: 'null', name: 'Unspecified' }
    ]);
    const [showNatureOfWork, setShowNatureOfWork] = useState(false);
    const [selectedNatures, setSelectedNatures] = useState([]);

    // Initial load for Towns and Work Types
    useEffect(() => {
        const fetchInitialFilters = async () => {
            try {
                const [tRes, wRes] = await Promise.all([
                    fetch('/api/towns'),
                    fetch('/api/complaints/subtypes')
                ]);
                const tData = await tRes.json();
                const wData = await wRes.json();
                setTownOptions(Array.isArray(tData) ? tData : tData.data || []);
                setWorkTypeOptions(Array.isArray(wData) ? wData : wData.data || []);
            } catch (err) {
                console.error("Failed to load filters");
            }
        };
        fetchInitialFilters();
    }, []);

    // Load UCs whenever the selected Town changes
    useEffect(() => {
        const fetchUCs = async () => {
            if (!selectedTown) {
                setUcOptions([]);
                setSelectedUCs([]);
                return;
            }
            try {
                // Assuming your API can filter subtowns by town_id
                const res = await fetch(`/api/subtowns?town_id=${selectedTown}`);
                const data = await res.json();
                setUcOptions(Array.isArray(data) ? data : data.data || []);
                setSelectedUCs([]); // Reset selection when town changes
            } catch (err) {
                console.error("Failed to load UCs");
            }
        };
        fetchUCs();
    }, [selectedTown]);

    const handleGenerate = async () => {
        if (!selectedTown) {
            alert("Please select a town");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/dashboard/reports/uc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dateFrom,
                    dateTo,
                    showWorkType,
                    showNatureOfWork,
                    townId: selectedTown,
                    townName: townOptions.find(t => t.id.toString() === selectedTown)?.town || '',
                    ucs: selectedUCs,
                    workTypes: selectedWorkTypes,
                    naturesOfWork: showNatureOfWork ? selectedNatures : []
                })
            });

            if (!response.ok) throw new Error("Failed to generate report");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `UC_Wise_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderMultiFilterList = (title, options, selected, setSelected, displayKey) => (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">{title}</label>
                <button onClick={() => setSelected([])} className="text-[10px] text-blue-600 hover:underline">
                    Clear All
                </button>
            </div>
            <div className="w-full border rounded-md bg-white h-40 overflow-y-auto p-2 space-y-1">
                {options.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center pt-4">No options available</div>
                ) : (
                    options.map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-blue-900"
                                checked={selected.includes(opt.id.toString())}
                                onChange={(e) => {
                                    const val = opt.id.toString();
                                    setSelected(prev => e.target.checked ? [...prev, val] : prev.filter(id => id !== val));
                                }}
                            />
                            <span className="text-sm text-gray-700">{opt[displayKey]}</span>
                        </label>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-950">
                <MapPin className="text-blue-600" /> UC-wise Performance Report
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
                            <input type="date" className="w-full border p-2 rounded mt-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">To Date</label>
                            <input type="date" className="w-full border p-2 rounded mt-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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
                                <input
                                    type="checkbox"
                                    checked={showWorkType}
                                    onChange={(e) => {
                                        setShowWorkType(e.target.checked);
                                        if (e.target.checked) setShowNatureOfWork(false); // Mutually Exclusive
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-900"
                                />
                                <span className="text-[10px] font-bold text-blue-900 uppercase">Show Work Type</span>
                            </label>

                            {/* Toggle Nature of Work */}
                            <label className="flex items-center gap-2 cursor-pointer bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                <input
                                    type="checkbox"
                                    checked={showNatureOfWork}
                                    onChange={(e) => {
                                        setShowNatureOfWork(e.target.checked);
                                        if (e.target.checked) setShowWorkType(false); // Mutually Exclusive
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-green-900"
                                />
                                <span className="text-[10px] font-bold text-green-900 uppercase">Show Nature of Work</span>
                            </label>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Single Select Town */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-gray-700">Select Town (Required)</label>
                                    <button onClick={() => setSelectedTown('')} className="text-[10px] text-blue-600 hover:underline">Clear</button>
                                </div>
                                <select
                                    className="w-full border rounded-md bg-white p-2 text-sm h-[42px]"
                                    value={selectedTown}
                                    onChange={(e) => setSelectedTown(e.target.value)}
                                >
                                    <option value="">Choose a Town...</option>
                                    {townOptions.map(t => <option key={t.id} value={t.id}>{t.town}</option>)}
                                </select>
                            </div>

                            {/* Dependent UC Filter */}
                            {renderMultiFilterList("Select UCs", ucOptions, selectedUCs, setSelectedUCs, 'subtown')}

                            {/* Dynamic Third Filter */}
                            {showWorkType ? (
                                renderMultiFilterList("Select Work Types", workTypeOptions, selectedWorkTypes, setSelectedWorkTypes, 'subtype_name')
                            ) : showNatureOfWork ? (
                                renderMultiFilterList("Select Nature of Work", natureOptions, selectedNatures, setSelectedNatures, 'name')
                            ) : (
                                <div className="flex items-center justify-center border-2 border-dashed rounded-md bg-gray-50 text-gray-400 text-xs p-4 text-center">
                                    Enable a distribution toggle above to filter by specific categories
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-900 hover:bg-blue-800 h-14 text-lg shadow-lg transition-all">
                    {loading ? <span className="flex items-center gap-2 animate-pulse text-white">Processing Data...</span> : <span className="flex items-center gap-2 text-white font-semibold"><FileText className="w-5 h-5" /> Generate PDF Report</span>}
                </Button>
            </div>
        </div>
    );
}