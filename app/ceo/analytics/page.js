"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { 
    MessageCircleWarning, 
    Activity, 
    CheckCheck, 
    Plus, 
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
    ChevronDown,
    ChevronUp,
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

const CeoAnalyticsPage = () => {
    const [stats, setStats] = useState({
        totalRequests: 0,
        activeRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        pendingApprovals: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
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
                const response = await fetch('/api/ceo/analytics');
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
                console.error('Error fetching CEO analytics:', error);
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
                <div className="text-gray-500">Loading CEO Analytics...</div>
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
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-sm lg:text-base text-gray-600">Comprehensive overview of KW&SC operations</p>
            </div>

            {/* Quick Actions */}
            {/* <div className="py-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <Link href="/ceo/requests">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Review Pending Approvals
                        </button>
                    </Link>
                    <Link href="/ceo/approved">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                            <CheckCheck className="w-4 h-4" />
                            View Approved Requests
                        </button>
                    </Link>
                    <Link href="/ceo/rejected">
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Review Rejected Requests
                        </button>
                    </Link>
                </div>
            </div> */}

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
                                Field Engineer
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-teal-800">
                                {stats.totalAgents.toLocaleString()}
                            </p>
                            <p className="text-xs lg:text-sm text-teal-600">
                                Active Engineer
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* New KPI Cards - Department, District, Town Wise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {/* Completion Rate Card */}
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-2 shadow-md">
                    <div className="flex items-center space-x-3 lg:space-x-4 rounded-md p-4 lg:p-6">
                        <Target className="text-green-700 w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm lg:text-lg font-semibold leading-none text-green-900 truncate">
                                Completion Rate
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-green-800">
                                {stats.completionRate}%
                            </p>
                            <p className="text-xs lg:text-sm text-green-600">
                                Last 30 days
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Average Completion Time Card */}
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 shadow-md">
                    <div className="flex items-center space-x-3 lg:space-x-4 rounded-md p-4 lg:p-6">
                        <Clock className="text-orange-700 w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm lg:text-lg font-semibold leading-none text-orange-900 truncate">
                                Avg. Completion Time
                            </p>
                            <p className="text-xl lg:text-2xl font-bold text-orange-800">
                                {stats.avgCompletionTime} days
                            </p>
                            <p className="text-xs lg:text-sm text-orange-600">
                                Average processing time
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Top Department Card */}
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 shadow-md">
                    <div className="flex items-center space-x-3 lg:space-x-4 rounded-md p-4 lg:p-6">
                        <Building className="text-purple-700 w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm lg:text-lg font-semibold leading-none text-purple-900 truncate">
                                Top Department
                            </p>
                            <p className="text-lg lg:text-xl font-bold text-purple-800 truncate">
                                {stats.departmentDistribution?.[0]?.department || 'N/A'}
                            </p>
                            <p className="text-xs lg:text-sm text-purple-600">
                                {stats.departmentDistribution?.[0]?.count || 0} works
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Top District Card */}
                <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-2 shadow-md">
                    <div className="flex items-center space-x-3 lg:space-x-4 rounded-md p-4 lg:p-6">
                        <Globe className="text-cyan-700 w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm lg:text-lg font-semibold leading-none text-cyan-900 truncate">
                                Top District
                            </p>
                            <p className="text-lg lg:text-xl font-bold text-cyan-800 truncate">
                                {stats.districtDistribution?.[0]?.district || 'N/A'}
                            </p>
                            <p className="text-xs lg:text-sm text-cyan-600">
                                {stats.districtDistribution?.[0]?.count || 0} works
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Department-wise Distribution */}
            <div className="mb-6 lg:mb-8">
                <Card className="shadow-lg">
                    <CardHeader className="p-4 lg:p-6">
                        <div className="flex items-center space-x-2">
                            <Building className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                            <CardTitle className="text-lg lg:text-xl font-semibold">Department-wise Works Distribution</CardTitle>
                        </div>
                        <CardDescription className="text-sm lg:text-base">
                            Works distribution across different departments
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.departmentDistribution?.slice(0, 6).map((dept, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 text-sm lg:text-base">{dept.department}</h4>
                                        <span className="text-lg font-bold text-blue-600">{dept.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ 
                                                width: `${(dept.count / Math.max(...stats.departmentDistribution.map(d => d.count))) * 100}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* District-wise Distribution */}
            <div className="mb-6 lg:mb-8">
                <Card className="shadow-lg">
                    <CardHeader className="p-4 lg:p-6">
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                            <CardTitle className="text-lg lg:text-xl font-semibold">District-wise Works Distribution</CardTitle>
                        </div>
                        <CardDescription className="text-sm lg:text-base">
                            Works distribution across different districts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.districtDistribution?.slice(0, 6).map((district, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 text-sm lg:text-base">{district.district}</h4>
                                        <span className="text-lg font-bold text-green-600">{district.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full" 
                                            style={{ 
                                                width: `${(district.count / Math.max(...stats.districtDistribution.map(d => d.count))) * 100}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Town-wise Distribution */}
            <div className="mb-6 lg:mb-8">
                <Card className="shadow-lg">
                    <CardHeader className="p-4 lg:p-6">
                        <div className="flex items-center space-x-2">
                            <Home className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                            <CardTitle className="text-lg lg:text-xl font-semibold">Town-wise Works Distribution</CardTitle>
                        </div>
                        <CardDescription className="text-sm lg:text-base">
                            Works distribution across different towns
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.townDistribution?.slice(0, 9).map((town, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 text-sm lg:text-base">{town.town}</h4>
                                        <span className="text-lg font-bold text-purple-600">{town.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-600 h-2 rounded-full" 
                                            style={{ 
                                                width: `${(town.count / Math.max(...stats.townDistribution.map(t => t.count))) * 100}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Statistics */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <Clock className="text-yellow-700 w-8 h-8" />
                        <div className="flex-1 space-y-1">
                            <p className="text-lg font-semibold leading-none text-yellow-900">
                                Pending Approvals
                            </p>
                            <p className="text-2xl font-bold text-yellow-800">
                                {stats.pendingApprovals.toLocaleString()}
                            </p>
                            <p className="text-sm text-yellow-600">
                                Awaiting CEO decision
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <CheckCheck className="text-green-700 w-8 h-8" />
                        <div className="flex-1 space-y-1">
                            <p className="text-lg font-semibold leading-none text-green-900">
                                Approved Requests
                            </p>
                            <p className="text-2xl font-bold text-green-800">
                                {stats.approvedRequests.toLocaleString()}
                            </p>
                            <p className="text-sm text-green-600">
                                CEO approved (30 days)
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <AlertCircle className="text-red-700 w-8 h-8" />
                        <div className="flex-1 space-y-1">
                            <p className="text-lg font-semibold leading-none text-red-900">
                                Rejected Requests
                            </p>
                            <p className="text-2xl font-bold text-red-800">
                                {stats.rejectedRequests.toLocaleString()}
                            </p>
                            <p className="text-sm text-red-600">
                                CEO rejected (30 days)
                            </p>
                        </div>
                    </div>
                </Card>
                
            </div> */}

            {/* Map Component */}
            <div className="mb-6 lg:mb-8">
                <Card className="shadow-lg">
                    <CardHeader className="p-4 lg:p-6">
                        <div className="flex items-center space-x-2">
                            <Map className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                            <CardTitle className="text-lg lg:text-xl font-semibold">Geographic Distribution</CardTitle>
                        </div>
                        <CardDescription className="text-sm lg:text-base">
                            Real-time map view of all work requests and their locations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                        <div className="h-[300px] lg:h-[600px] w-full rounded shadow relative overflow-hidden">
                            <div className="absolute inset-0 z-10">
                                <MapComponent />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-6 lg:mb-8">
                <div className="lg:col-span-2">
                    <Card className="shadow-lg">
                        <CardHeader className="p-4 lg:p-6">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                                <CardTitle className="text-lg lg:text-xl font-semibold">Works Trends</CardTitle>
                            </div>
                            <CardDescription className="text-sm lg:text-base">
                                Monthly trends of work requests over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                            <div className="w-full overflow-x-auto">
                                <div className="min-w-[300px] lg:min-w-0">
                                    <LineChartWithValues />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div>
                    <Card className="shadow-lg">
                        <CardHeader className="p-4 lg:p-6">
                            <div className="flex items-center space-x-2">
                                <PieChart className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                                <CardTitle className="text-lg lg:text-xl font-semibold">Works Distribution</CardTitle>
                            </div>
                            <CardDescription className="text-sm lg:text-base">
                                Breakdown by request types and status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                            <div className="w-full overflow-x-auto">
                                <div className="min-w-[250px] lg:min-w-0">
                                    <PieChartWithValues />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                            {stats.recentRequests.length > recentRequestsPerPage && (
                                <button
                                    onClick={() => setShowAllRecent(!showAllRecent)}
                                    className="text-xs lg:text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                >
                                    {showAllRecent ? (
                                        <>
                                            <ChevronUp className="w-3 h-3 lg:w-4 lg:h-4" />
                                            <span>Show Less</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4" />
                                            <span>Show All</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <CardDescription className="text-sm lg:text-base">
                        Latest works requiring attention
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                    {stats.recentRequests && stats.recentRequests.length > 0 ? (
                        <div className="space-y-3 lg:space-y-4">
                            {/* Fixed height container with scroll */}
                            <div className="max-h-80 lg:max-h-96 overflow-y-auto space-y-3 lg:space-y-4 pr-1 lg:pr-2">
                                {getPaginatedRecentRequests().map((request) => (
                                    <div key={request.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors space-y-2 lg:space-y-0">
                                        <div className="flex items-center space-x-3 lg:space-x-4">
                                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
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
                                            <span className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                request.approval_status === 'pending' 
                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                    : request.approval_status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {request.approval_status === 'pending' ? 'Pending Approval' : 
                                                 request.approval_status === 'approved' ? 'Approved' : 'Rejected'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {!showAllRecent && stats.recentRequests.length > recentRequestsPerPage && (
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-3 lg:pt-4 border-t border-gray-200 space-y-2 lg:space-y-0">
                                    <div className="text-xs lg:text-sm text-gray-500 text-center lg:text-left">
                                        Showing {((recentRequestsPage - 1) * recentRequestsPerPage) + 1} to {Math.min(recentRequestsPage * recentRequestsPerPage, stats.recentRequests.length)} of {stats.recentRequests.length} works
                                    </div>
                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            onClick={() => setRecentRequestsPage(prev => Math.max(1, prev - 1))}
                                            disabled={!hasPreviousPages}
                                            className="px-2 lg:px-3 py-1 text-xs lg:text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-xs lg:text-sm text-gray-600">
                                            Page {recentRequestsPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setRecentRequestsPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={!hasMorePages}
                                            className="px-2 lg:px-3 py-1 text-xs lg:text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
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

export default CeoAnalyticsPage;
