"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { 
    MessageCircleWarning, 
    Activity, 
    CheckCheck, 
    Clock,
    Users,
    Building2,
    TrendingUp,
    AlertTriangle,
    FileText,
    MapPin,
    Calendar,
    DollarSign,
    BarChart3,
    PieChart,
    Map,
    Eye,
    Target,
    Zap,
    Globe,
    Building,
    Home,
    TrendingDown
} from "lucide-react"
import { LineChartWithValues } from "@/components/lineChart"
import { PieChartWithValues } from "@/components/pieChart"
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

const CooAnalyticsPage = () => {
    const [stats, setStats] = useState({
        totalRequests: 0,
        activeRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        totalUsers: 0,
        totalAgents: 0,
        totalBudget: 0,
        recentRequests: [],
        // New analytics data
        departmentDistribution: [],
        districtDistribution: [],
        townDistribution: [],
        monthlyTrends: [],
        requestTypeDistribution: [],
        statusDistribution: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentRequestsPage, setRecentRequestsPage] = useState(1);
    const [recentRequestsPerPage] = useState(5);
    const [showAllRecent, setShowAllRecent] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/coo/analytics');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setStats(data.data);
                    } else {
                        setError(data.message || 'Failed to fetch analytics data');
                    }
                } else {
                    setError('Failed to fetch analytics data');
                }
            } catch (error) {
                console.error('Error fetching COO analytics:', error);
                setError('Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Pagination logic for recent requests
    const getPaginatedRecentRequests = () => {
        if (showAllRecent) {
            return stats.recentRequests;
        }
        
        const startIndex = (recentRequestsPage - 1) * recentRequestsPerPage;
        const endIndex = startIndex + recentRequestsPerPage;
        return stats.recentRequests.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(stats.recentRequests.length / recentRequestsPerPage);
    const hasMorePages = recentRequestsPage < totalPages;
    const hasPreviousPages = recentRequestsPage > 1;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading COO Analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-3 lg:px-6">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">COO Analytics Dashboard</h1>
                <p className="text-sm lg:text-base text-gray-600">Comprehensive overview of KW&SC operations</p>
            </div>

            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 shadow-md">
                    <div className="flex items-center space-x-3 lg:space-x-4 rounded-md p-4 lg:p-6">
                        <MessageCircleWarning className="text-blue-700 w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm lg:text-lg font-semibold leading-none text-blue-900 truncate">
                                Total Works
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-blue-800">
                                {stats.totalRequests.toLocaleString()}
                            </p>
                            <p className="text-xs lg:text-sm text-blue-600">
                                All time works
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 shadow-md">
                    <div className="flex items-center space-x-3 lg:space-x-4 rounded-md p-4 lg:p-6">
                        <Activity className="text-purple-700 w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm lg:text-lg font-semibold leading-none text-purple-900 truncate">
                                Active Works
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-purple-800">
                                {stats.activeRequests.toLocaleString()}
                            </p>
                            <p className="text-xs lg:text-sm text-purple-600">
                                Currently in progress
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 shadow-md">
                    <div className="flex items-center space-x-3 lg:space-x-4 rounded-md p-4 lg:p-6">
                        <Users className="text-indigo-700 w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm lg:text-lg font-semibold leading-none text-indigo-900 truncate">
                                Total Users
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-indigo-800">
                                {stats.totalUsers.toLocaleString()}
                            </p>
                            <p className="text-xs lg:text-sm text-indigo-600">
                                System users
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-2 shadow-md">
                    <div className="flex items-center space-x-3 lg:space-x-4 rounded-md p-4 lg:p-6">
                        <Building2 className="text-teal-700 w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm lg:text-lg font-semibold leading-none text-teal-900 truncate">
                                Field Agents
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-teal-800">
                                {stats.totalAgents.toLocaleString()}
                            </p>
                            <p className="text-xs lg:text-sm text-teal-600">
                                Active agents
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="py-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <Link href="/coo/requests">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View All Works
                        </button>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-lg min-h-[300px]">
                <CardHeader className="p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                        <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                            <CardTitle className="text-lg lg:text-xl font-semibold">Recent Activity</CardTitle>
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
                            <span className="text-xs lg:text-sm text-gray-500">
                                {stats.recentRequests.length} total works
                            </span>
                        </div>
                    </div>
                    <CardDescription className="text-sm lg:text-base">
                        Latest works requiring attention
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                    {stats.recentRequests && stats.recentRequests.length > 0 ? (
                        <div className="space-y-3 lg:space-y-4">
                            <div className="max-h-80 lg:max-h-96 overflow-y-auto space-y-3 lg:space-y-4 pr-1 lg:pr-2">
                                {getPaginatedRecentRequests().map((request) => (
                                    <div key={request.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors space-y-2 lg:space-y-0">
                                        <div className="flex items-center space-x-3 lg:space-x-4">
                                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm lg:text-base font-medium text-gray-900 truncate">Work #{request.id}</p>
                                                <p className="text-xs lg:text-sm text-gray-600 truncate">{request.complaint_type}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {request.town} • {new Date(request.request_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end lg:text-right">
                                            <Link
                                                href={`/coo/requests/${request.id}`}
                                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No recent activity to display</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CooAnalyticsPage;
