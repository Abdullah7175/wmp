"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";

export default function CeAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ce/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600">Error loading analytics: {error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Works",
      value: analytics?.totalRequests || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: analytics?.totalRequestsChange || 0,
    },
    {
      title: "Pending CE Approval",
      value: analytics?.pendingCeApproval || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: analytics?.pendingCeApprovalChange || 0,
    },
    {
      title: "CE Approved",
      value: analytics?.ceApproved || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: analytics?.ceApprovedChange || 0,
    },
    {
      title: "CE Rejected",
      value: analytics?.ceRejected || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: analytics?.ceRejectedChange || 0,
    },
  ];

  const departmentStats = [
    {
      name: "Water Department",
      total: analytics?.waterRequests || 0,
      pending: analytics?.waterPending || 0,
      approved: analytics?.waterApproved || 0,
      rejected: analytics?.waterRejected || 0,
    },
    {
      name: "Sewerage Department", 
      total: analytics?.sewerageRequests || 0,
      pending: analytics?.seweragePending || 0,
      approved: analytics?.sewerageApproved || 0,
      rejected: analytics?.sewerageRejected || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change !== 0 && (
                      <div className={`flex items-center mt-1 text-sm ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <ChangeIcon className="w-4 h-4 mr-1" />
                        <span>{Math.abs(stat.change)}%</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Department-wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departmentStats.map((dept, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                {dept.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Requests:</span>
                  <Badge variant="outline">{dept.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending CE Approval:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{dept.pending}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CE Approved:</span>
                  <Badge className="bg-green-100 text-green-800">{dept.approved}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CE Rejected:</span>
                  <Badge className="bg-red-100 text-red-800">{dept.rejected}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Recent CE Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.recentActivities?.length > 0 ? (
              analytics.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'approved' ? 'bg-green-500' : 
                      activity.type === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.requestId}</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
