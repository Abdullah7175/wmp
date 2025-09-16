"use client"
import { useState, useEffect } from 'react';
import { 
  ChartPie, 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  MapPin, 
  Calendar,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartWithValues } from "@/components/lineChart";
import { PieChartWithValues } from "@/components/pieChart";

const ReportsPage = () => {
  const [reportsData, setReportsData] = useState({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    activeRequests: 0,
    totalUsers: 0,
    totalAgents: 0,
    departmentDistribution: [],
    districtDistribution: [],
    townDistribution: [],
    monthlyTrends: [],
    requestTypeDistribution: [],
    statusDistribution: [],
    completionRate: 0,
    avgCompletionTime: 0,
    topDepartment: '',
    topDistrict: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("all");

  useEffect(() => {
    fetchReportsData();
  }, [dateFrom, dateTo, reportType]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      let url = '/api/dashboard/reports';
      const params = [];
      if (dateFrom) params.push(`date_from=${dateFrom}`);
      if (dateTo) params.push(`date_to=${dateTo}`);
      if (reportType !== "all") params.push(`report_type=${reportType}`);
      if (params.length) url += '?' + params.join('&');
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReportsData(data.data || data);
      } else {
        setError('Failed to fetch reports data');
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setError('Error fetching reports data');
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async (reportType) => {
    try {
      const response = await fetch('/api/dashboard/reports/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          dateFrom,
          dateTo,
          data: reportsData
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate PDF report');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report');
    }
  };

  const reportTypes = [
    { id: 'all', name: 'All Reports', icon: ChartPie },
    { id: 'department', name: 'Department-wise', icon: Building2 },
    { id: 'district', name: 'District-wise', icon: MapPin },
    { id: 'town', name: 'Town-wise', icon: MapPin },
    { id: 'works', name: 'Works Summary', icon: FileText },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'users', name: 'Users & Agents', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white shadow-sm border rounded-lg p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Comprehensive Reports Dashboard</h1>
            <p className="mt-2 text-gray-600">Generate detailed reports and analytics for KW&SC operations</p>
          </div>
          <ChartPie className="w-8 h-8 text-blue-950" />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                  className="border rounded px-3 py-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                  className="border rounded px-3 py-2" 
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setReportType("all");
                }}
                className="h-10"
              >
                Reset Filters
              </Button>
              <Button 
                onClick={fetchReportsData}
                className="h-10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <FileText className="text-blue-700 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Works</p>
                  <p className="text-2xl font-bold text-blue-800">{reportsData.totalRequests.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <CheckCircle className="text-green-700 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-green-900">Completed Works</p>
                  <p className="text-2xl font-bold text-green-800">{reportsData.completedRequests.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Clock className="text-yellow-700 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Pending Works</p>
                  <p className="text-2xl font-bold text-yellow-800">{reportsData.pendingRequests.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Target className="text-purple-700 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-800">{reportsData.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Users className="text-indigo-700 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">Total Users</p>
                  <p className="text-2xl font-bold text-indigo-800">{reportsData.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Building2 className="text-teal-700 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-teal-900">Field Agents</p>
                  <p className="text-2xl font-bold text-teal-800">{reportsData.totalAgents.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Clock className="text-orange-700 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-orange-800">{reportsData.avgCompletionTime} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <MapPin className="text-cyan-700 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-cyan-900">Top District</p>
                  <p className="text-lg font-bold text-cyan-800 truncate">{reportsData.topDistrict || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Works Trends
              </CardTitle>
              <CardDescription>Monthly trends of work requests over time</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartWithValues />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartPie className="w-5 h-5" />
                Works Distribution
              </CardTitle>
              <CardDescription>Breakdown by request types and status</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartWithValues />
            </CardContent>
          </Card>
        </div>

        {/* Distribution Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Department-wise Distribution
              </CardTitle>
              <CardDescription>Works distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportsData.departmentDistribution?.slice(0, 5).map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                    <span className="text-sm font-bold text-blue-600">{dept.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* District Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                District-wise Distribution
              </CardTitle>
              <CardDescription>Works distribution across districts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportsData.districtDistribution?.slice(0, 5).map((district, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{district.district}</span>
                    <span className="text-sm font-bold text-green-600">{district.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Town Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Town-wise Distribution
              </CardTitle>
              <CardDescription>Works distribution across towns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportsData.townDistribution?.slice(0, 5).map((town, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{town.town}</span>
                    <span className="text-sm font-bold text-purple-600">{town.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PDF Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Generate PDF Reports
            </CardTitle>
            <CardDescription>Download comprehensive reports in PDF format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.slice(1).map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    variant="outline"
                    onClick={() => generatePDFReport(type.id)}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{type.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;