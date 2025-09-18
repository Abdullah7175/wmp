"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  User, 
  Calendar, 
  Building2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function RequestApprovalForm({ requestId }) {
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ceComment, setCeComment] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequestData();
  }, [requestId]);

  const fetchRequestData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ce/requests/${requestId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch request data');
      }
      const data = await response.json();
      setRequestData(data);
      setCeComment(data.ce_comment || "");
      setApprovalStatus(data.ce_approval_status || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (status) => {
    if (!ceComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a comment before submitting your decision.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/ce/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          comment: ceComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit approval');
      }

      const result = await response.json();
      
      toast({
        title: "Approval Submitted",
        description: `Request ${status} successfully.`,
        variant: "default",
      });

      // Refresh the data
      await fetchRequestData();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600">Error loading request: {error}</p>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">Request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Link href="/ce/requests">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Requests
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Request Information</span>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(requestData.status_name)}>
                    {requestData.status_name || 'Unknown'}
                  </Badge>
                  <Badge className={getCeApprovalColor(requestData.ce_approval_status)}>
                    <div className="flex items-center">
                      {getCeApprovalIcon(requestData.ce_approval_status)}
                      <span className="ml-1">CE: {requestData.ce_approval_status || 'Pending'}</span>
                    </div>
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Request ID:</span>
                  <span className="text-sm font-medium">#{requestData.id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-sm font-medium">{requestData.address || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">{requestData.complaint_type || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium">{formatDate(requestData.request_date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">District:</span>
                  <span className="text-sm font-medium">{requestData.district_name || "N/A"}</span>
                </div>
                {requestData.contact_number && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Contact:</span>
                    <span className="text-sm font-medium">{requestData.contact_number}</span>
                  </div>
                )}
              </div>

              {requestData.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description:</h4>
                  <p className="text-sm text-gray-600">{requestData.description}</p>
                </div>
              )}

              {/* Before Content */}
              {requestData.beforeContent && requestData.beforeContent.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Before Content ({requestData.beforeContent.length} items):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {requestData.beforeContent.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="relative">
                          {item.content_type === 'video' ? (
                            <video
                              src={item.link}
                              className="w-full h-24 object-cover rounded"
                              controls
                            />
                          ) : (
                            <img
                              src={item.link}
                              alt={item.description || 'Before content'}
                              className="w-full h-24 object-cover rounded"
                            />
                          )}
                          <div className="absolute top-1 left-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.content_type === 'video' ? '🎥 Video' : '📷 Image'}
                            </Badge>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Uploaded by: {item.creator_name || 'Unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CE Approval Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                CE Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ce-comment">CE Comment</Label>
                <Textarea
                  id="ce-comment"
                  placeholder="Enter your comments about this request..."
                  value={ceComment}
                  onChange={(e) => setCeComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleApproval('approved')}
                  disabled={submitting || requestData.ce_approval_status === 'approved'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Request
                </Button>
                <Button
                  onClick={() => handleApproval('rejected')}
                  disabled={submitting || requestData.ce_approval_status === 'rejected'}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Request
                </Button>
              </div>

              {requestData.ce_approval_status && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Current CE Status:</h4>
                  <Badge className={getCeApprovalColor(requestData.ce_approval_status)}>
                    <div className="flex items-center">
                      {getCeApprovalIcon(requestData.ce_approval_status)}
                      <span className="ml-1">{requestData.ce_approval_status}</span>
                    </div>
                  </Badge>
                  {requestData.ce_comment && (
                    <p className="text-sm text-gray-600 mt-2">{requestData.ce_comment}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
