"use client"
import { useState, useEffect, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { columns } from './columns';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';

const RequestsPageContent = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    
    // Initialize state from URL parameters
    const [search, setSearch] = useState(searchParams.get('search') || "");
    const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || "");
    const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || "");
    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = searchParams.get('page');
        return pageParam ? parseInt(pageParam) - 1 : 0; // Convert from 1-based URL to 0-based state
    });
    const [sorting, setSorting] = useState(() => {
        const sortParam = searchParams.get('sort');
        if (sortParam) {
            try {
                return JSON.parse(decodeURIComponent(sortParam));
            } catch {
                return [];
            }
        }
        return [];
    });

    // Function to update URL parameters
    const updateURL = useCallback((newParams) => {
        const params = new URLSearchParams(searchParams);
        
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        
        const newURL = `${window.location.pathname}?${params.toString()}`;
        router.replace(newURL, { scroll: false });
    }, [searchParams, router]);

    // Update URL when filters change
    useEffect(() => {
        updateURL({
            search,
            dateFrom,
            dateTo,
            page: currentPage > 0 ? (currentPage + 1).toString() : null, // Convert from 0-based state to 1-based URL
            sort: sorting.length > 0 ? encodeURIComponent(JSON.stringify(sorting)) : null
        });
    }, [search, dateFrom, dateTo, currentPage, sorting, updateURL]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                let url = '/api/requests';
                const params = [];
                if (search) params.push(`filter=${encodeURIComponent(search)}`);
                if (dateFrom) params.push(`date_from=${dateFrom}`);
                if (dateTo) params.push(`date_to=${dateTo}`);
                
                // Add pagination
                params.push(`page=${currentPage + 1}`); // API uses 1-based pagination (currentPage is 0-based)
                params.push(`limit=5`);
                
                // Add sorting
                if (sorting && sorting.length > 0) {
                    const sort = sorting[0];
                    params.push(`sortBy=${sort.id}`);
                    params.push(`sortOrder=${sort.desc ? 'desc' : 'asc'}`);
                }
                
                if (params.length) url += '?' + params.join('&');
                const res = await fetch(url);
                
                if (!res.ok) {
                    throw new Error('Failed to fetch requests');
                }
                
                const data = await res.json();
                setRequests(data.data || data || []);
                
                // Update pagination info if available
                if (data.total !== undefined) {
                    // Store total for pagination
                    setTotalItems(data.total);
                }
            } catch (error) {
                console.error('Error fetching requests:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [search, dateFrom, dateTo, currentPage, sorting]);

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
                    placeholder="Search by ID, address, town, department, status, creator..."
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
                        setCurrentPage(0);
                        setSorting([]);
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
                    totalItems={totalItems}
                    initialState={{
                        pagination: {
                            pageIndex: currentPage,
                            pageSize: 5,
                        },
                        sorting: sorting,
                    }}
                    onSortingChange={setSorting}
                    onPaginationChange={(updater) => {
                        if (typeof updater === 'function') {
                            const newState = updater({ pageIndex: currentPage, pageSize: 5 });
                            setCurrentPage(newState.pageIndex);
                        } else {
                            setCurrentPage(updater.pageIndex);
                        }
                    }}
                />
            </div>
        </div>
    );
};

const RequestsPage = () => {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <RequestsPageContent />
        </Suspense>
    );
};

export default RequestsPage;