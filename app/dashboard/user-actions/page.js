"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Filter, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function UserActionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [userType, setUserType] = useState('');
    const [actionType, setActionType] = useState('');
    const [entityType, setEntityType] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const limit = 50;

    // Check if user is admin - wait for session to load
    useEffect(() => {
        if (status === 'loading') return; // Still loading
        
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        
        if (session && session.user) {
            if (session.user.userType !== 'user' || session.user.role !== 1) {
                router.push('/unauthorized');
                return;
            }
        }
    }, [session, status, router]);

    useEffect(() => {
        if (!session?.user?.id || status === 'loading') return;
        
        const fetchActions = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `/api/user-actions?page=${page}&limit=${limit}`;
                if (filter) url += `&filter=${encodeURIComponent(filter)}`;
                if (dateFrom) url += `&date_from=${dateFrom}`;
                if (dateTo) url += `&date_to=${dateTo}`;
                if (userType) url += `&user_type=${userType}`;
                if (actionType) url += `&action_type=${actionType}`;
                if (entityType) url += `&entity_type=${entityType}`;
                
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setActions(data.data || []);
                    setTotal(data.total || 0);
                    setTotalPages(data.totalPages || 0);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    setError(errorData.error || 'Failed to fetch user actions');
                }
            } catch (error) {
                console.error('Error fetching user actions:', error);
                setError('Error fetching user actions: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActions();
    }, [session?.user?.id, status, page, filter, dateFrom, dateTo, userType, actionType, entityType]);

    const handleExport = async () => {
        try {
            let url = `/api/user-actions?limit=10000`; // Get all data for export
            if (filter) url += `&filter=${encodeURIComponent(filter)}`;
            if (dateFrom) url += `&date_from=${dateFrom}`;
            if (dateTo) url += `&date_to=${dateTo}`;
            if (userType) url += `&user_type=${userType}`;
            if (actionType) url += `&action_type=${actionType}`;
            if (entityType) url += `&entity_type=${entityType}`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const csvContent = convertToCSV(data.data || []);
                downloadCSV(csvContent, `user-actions-${new Date().toISOString().split('T')[0]}.csv`);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const convertToCSV = (data) => {
        const headers = [
            'ID', 'User ID', 'User Type', 'User Role', 'User Name', 'User Email',
            'Action Type', 'Entity Type', 'Entity ID', 'Entity Name', 'IP Address',
            'Created At'
        ];
        
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = [
                row.id,
                row.user_id,
                row.user_type,
                row.user_role,
                `"${row.user_name}"`,
                row.user_email,
                row.action_type,
                row.entity_type,
                row.entity_id || '',
                `"${row.entity_name || ''}"`,
                row.ip_address || '',
                row.created_at
            ];
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    };

    const downloadCSV = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        setFilter('');
        setDateFrom('');
        setDateTo('');
        setUserType('');
        setActionType('');
        setEntityType('');
        setPage(1);
    };

    // Show loading while session is loading
    if (status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading session...</p>
                </div>
            </div>
        );
    }

    if (loading && actions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading user actions...</p>
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
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold">User Actions</h1>
                    <p className="text-gray-600 mt-2">Track all user activities across the system</p>
                </div>
                <div className="flex gap-2 mt-4 lg:mt-0">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    <h3 className="text-lg font-medium mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <Input
                                placeholder="Search by user, action, entity..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                            <select
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">All User Types</option>
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="socialmediaperson">Social Media Person</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                            <select
                                value={actionType}
                                onChange={(e) => setActionType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">All Actions</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                                <option value="VIEW">View</option>
                                <option value="LOGIN">Login</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="UPLOAD">Upload</option>
                                <option value="DOWNLOAD">Download</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                            <select
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">All Entities</option>
                                <option value="request">Request</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="socialmediaperson">Social Media Person</option>
                                <option value="town">Town</option>
                                <option value="district">District</option>
                                <option value="subtown">Subtown</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-blue-600">{total}</div>
                    <div className="text-sm text-gray-600">Total Actions</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-green-600">
                        {actions.filter(a => a.action_type === 'CREATE').length}
                    </div>
                    <div className="text-sm text-gray-600">Create Actions</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-yellow-600">
                        {actions.filter(a => a.action_type === 'UPDATE').length}
                    </div>
                    <div className="text-sm text-gray-600">Update Actions</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-red-600">
                        {actions.filter(a => a.action_type === 'DELETE').length}
                    </div>
                    <div className="text-sm text-gray-600">Delete Actions</div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow">
                <DataTable 
                    columns={columns} 
                    data={actions}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
} 