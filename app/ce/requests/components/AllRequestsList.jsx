"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Building2
} from "lucide-react";
import Link from "next/link";

export default function AllRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [ceUser, setCeUser] = useState(null);

  useEffect(() => {
    fetchCeUser();
    fetchRequests();
  }, []);

  const fetchCeUser = async () => {
    try {
      const response = await fetch('/api/ce/user-info');
      if (response.ok) {
        const userData = await response.json();
        setCeUser(userData);
      }
    } catch (error) {
      console.error('Error fetching CE user info:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ce/requests');
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCeApprovalColor = (ceApprovalStatus) => {
    switch (ceApprovalStatus?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCeApprovalIcon = (ceApprovalStatus) => {
    switch (ceApprovalStatus?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "pending" && request.status_name?.toLowerCase() === 'pending') ||
                         (statusFilter === "approved" && request.status_name?.toLowerCase() === 'approved') ||
                         (statusFilter === "rejected" && request.status_name?.toLowerCase() === 'rejected');
    
    const matchesDepartment = departmentFilter === "all" || 
                            (departmentFilter === "water" && request.complaint_type?.toLowerCase().includes('water')) ||
                            (departmentFilter === "sewerage" && request.complaint_type?.toLowerCase().includes('sewerage'));

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600">Error loading requests: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CE User Info */}
      {ceUser && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">
                Logged in as: {ceUser.name} - {ceUser.department || 'Chief Engineer'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by address, type, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Departments</option>
                <option value="water">Water</option>
                <option value="sewerage">Sewerage</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request #{request.id}
                      </h3>
                      <Badge className={getStatusColor(request.status_name)}>
                        {request.status_name || 'Unknown'}
                      </Badge>
                      <Badge className={getCeApprovalColor(request.ce_approval_status)}>
                        <div className="flex items-center">
                          {getCeApprovalIcon(request.ce_approval_status)}
                          <span className="ml-1">CE: {request.ce_approval_status || 'Pending'}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{request.address || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{request.complaint_type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatDate(request.request_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{request.district_name || 'N/A'}</span>
                      </div>
                    </div>

                    {request.description && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{request.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:flex-col lg:space-y-2 lg:space-x-0">
                    <Link href={`/ce/requests/${request.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/ce/requests/${request.id}`}>
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        CE Approval
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
