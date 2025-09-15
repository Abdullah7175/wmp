"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  MapPin,
  Phone,
  Calendar,
  User,
  AlertTriangle,
  BarChart3
} from "lucide-react";

export default function CeoDashboard() {
  const [data, setData] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    recentRequests: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/ceo/dashboard');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
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

  const { pendingCount, approvedCount, rejectedCount, recentRequests } = data;

  const stats = [
    {
      name: "Pending Approvals",
      value: pendingCount,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      href: "/ceo/requests"
    },
    {
      name: "Approved (30 days)",
      value: approvedCount,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/ceo/approved"
    },
    {
      name: "Rejected (30 days)",
      value: rejectedCount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      href: "/ceo/rejected"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Analytics Dashboard Link */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Comprehensive Analytics</h3>
              <p className="text-blue-700">View detailed analytics, charts, and geographic distribution of all operations</p>
            </div>
          </div>
          <Link
            href="/ceo/analytics"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <BarChart3 className="w-5 h-5" />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* Recent Pending Requests */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Pending Approvals</h2>
            <Link
              href="/ceo/requests"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentRequests.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending approvals at the moment</p>
            </div>
          ) : (
            recentRequests.map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                      <span className="text-sm text-gray-500">
                        Request #{request.id}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {request.complaint_type}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{request.town} {request.subtown && `- ${request.subtown}`}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{request.contact_number}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(request.request_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{request.creator_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href={`/ceo/requests/${request.id}`}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
