"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  Users,
  TrendingUp
} from "lucide-react";

export default function CEDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState({
    totalRequests: 0,
    pendingApprovals: 0,
    approvedToday: 0,
    rejectedToday: 0,
    ceUser: null,
    departmentStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/ce/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.error('Failed to fetch dashboard data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CE User Info */}
      {dashboardData.ceUser && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700">
              <p><strong>Designation:</strong> {dashboardData.ceUser.designation || 'Chief Engineer'}</p>
              <p><strong>Assigned Departments:</strong> {dashboardData.ceUser.departments?.length || 0} department(s)</p>
              {dashboardData.ceUser.departments && dashboardData.ceUser.departments.length > 0 && (
                <div className="mt-2">
                  <p><strong>Department Types:</strong></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dashboardData.ceUser.departments.map((dept, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {dept.type_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.totalRequests}</div>
            <p className="text-xs text-muted-foreground">All work requests</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dashboardData.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.approvedToday}</div>
            <p className="text-xs text-muted-foreground">Requests approved today</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.rejectedToday}</div>
            <p className="text-xs text-muted-foreground">Requests rejected today</p>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Stats */}
      {dashboardData.departmentStats && dashboardData.departmentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Department-wise Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.departmentStats.map((stat, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{stat.department_name}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{stat.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-medium text-yellow-600">{stat.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-medium text-green-600">{stat.approved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected:</span>
                      <span className="font-medium text-red-600">{stat.rejected}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
