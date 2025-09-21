"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Building2, 
  CheckCircle, 
  Clock,
  Eye
} from "lucide-react";
import Link from "next/link";

export default function ApprovedRequestsList() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      const response = await fetch('/api/ce/requests');
      const data = await response.json();
      
      if (data.success) {
        // Filter only approved requests
        const approvedRequests = data.data.filter(request => 
          request.ce_approval_status === 'approved'
        );
        setRequests(approvedRequests);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch approved requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching approved requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch approved requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'not_approved': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading approved requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Approved Requests</h3>
              <p>You haven't approved any requests yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow border-green-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Request #{request.id}
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority || 'Normal'} Priority
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Created by {request.creator_name} ({request.creator_designation})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(request.status_name)}>
                    {request.status_name}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span><strong>Date:</strong> {formatDate(request.request_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span><strong>Type:</strong> {request.complaint_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span><strong>Location:</strong> {request.town}, {request.district}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span><strong>Contact:</strong> {request.contact_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span><strong>Created:</strong> {formatDate(request.created_date)}</span>
                  </div>
                  {request.nature_of_work && (
                    <div className="flex items-center gap-2 text-sm">
                      <span><strong>Nature:</strong> {request.nature_of_work}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Description:</strong> {request.description}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Address:</strong> {request.address}
                </p>
              </div>

              {/* CE Approval Details */}
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-2">Your Approval</div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Approved on: {request.ce_approval_date ? formatDate(request.ce_approval_date) : 'N/A'}
                  </span>
                </div>
                {request.ce_comments && (
                  <p className="text-sm text-gray-700">
                    <strong>Comments:</strong> {request.ce_comments}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link href={`/ce/requests/${request.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}