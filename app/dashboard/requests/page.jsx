"use client"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { columns } from './columns';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';

const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { data: session } = useSession();
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                let url = '/api/requests';
                const params = [];
                if (search) params.push(`filter=${encodeURIComponent(search)}`);
                if (dateFrom) params.push(`date_from=${dateFrom}`);
                if (dateTo) params.push(`date_to=${dateTo}`);
                if (params.length) url += '?' + params.join('&');
                const res = await fetch(url);
                
                if (!res.ok) {
                    throw new Error('Failed to fetch requests');
                }
                
                const data = await res.json();
                setRequests(data.data || data || []);
            } catch (error) {
                console.error('Error fetching requests:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [search, dateFrom, dateTo]);

    const handleEdit = (requestId) => {
        router.push(`/dashboard/requests/${requestId}/edit`);
    };

    const handleAssign = (requestId) => {
        router.push(`/dashboard/requests/${requestId}`);
    };

    const handleGeneratePerforma = (requestId) => {
        router.push(`/dashboard/requests/performa/${requestId}`);
    };

    const handleView = (requestId) => {
        router.push(`/dashboard/requests/${requestId}/view`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Work Requests</h1>
                <Button onClick={() => router.push('/dashboard/requests/new')}>
                    Create New Request
                </Button>
            </div>
            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <Input
                    placeholder="Search by ID, address, town, type, status, creator..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-64"
                />
                <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1" />
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => {
                        setSearch("");
                        setDateFrom("");
                        setDateTo("");
                    }}
                    className="h-10"
                >
                    Reset Filters
                </Button>
            </div>
            <div className="bg-white rounded-lg shadow">
                <EnhancedDataTable 
                    columns={columns} 
                    data={requests} 
                    meta={{
                        onEdit: handleEdit,
                        onAssign: handleAssign,
                        onGeneratePerforma: handleGeneratePerforma,
                        onView: handleView,
                        userRole: session?.user?.role
                    }}
                    pageSize={5}
                />
            </div>
        </div>
    );
};

export default RequestsPage;