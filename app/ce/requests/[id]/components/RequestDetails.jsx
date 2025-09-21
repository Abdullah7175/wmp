"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  MessageSquare,
  Eye
} from "lucide-react";
import Link from "next/link";

export default function RequestDetails() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchRequestDetails();
    }
  }, [params.id]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch('/api/ce/requests');
      const data = await response.json();
      
      if (data.success) {
        const requestData = data.data.find(req => req.id === parseInt(params.id));
        if (requestData) {
          setRequest(requestData);
          setSelectedRequest(requestData);
          setApprovalStatus(requestData.ce_approval_status || '');
          setComments(requestData.ce_comments || '');
        } else {
          toast({
            title: "Error",
            description: "Request not found or you don't have access to it",
            variant: "destructive",
          });
          router.push('/ce/requests');
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch request details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch request details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!approvalStatus) {
      toast({
        title: "Error",
        description: "Please select an approval status",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/ce/requests/${params.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approval_status: approvalStatus,
          comments: comments
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
          variant: "default",
        });
        
        // Refresh the request details
        await fetchRequestDetails();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit approval",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting approval:', error);
      toast({
        title: "Error",
        description: "Failed to submit approval",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
        <div className="text-lg">Loading request details...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Request not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ce/requests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Request #{request.id}
            </h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              Work request details and approval
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(request.priority)}>
            {request.priority || 'Normal'} Priority
          </Badge>
          <Badge className={getStatusColor(request.status_name)}>
            {request.status_name}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span><strong>Request Date:</strong> {formatDate(request.request_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span><strong>Type:</strong> {request.complaint_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span><strong>Location:</strong> {request.town}, {request.district}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span><strong>Contact:</strong> {request.contact_number}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span><strong>Created:</strong> {formatDate(request.created_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span><strong>Creator:</strong> {request.creator_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span><strong>Designation:</strong> {request.creator_designation}</span>
                  </div>
                  {request.nature_of_work && (
                    <div className="flex items-center gap-2 text-sm">
                      <span><strong>Nature:</strong> {request.nature_of_work}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                  <p className="text-sm text-gray-600">{request.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Address:</p>
                  <p className="text-sm text-gray-600">{request.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approval Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700 mb-2">CEO Approval</div>
                  <Badge className={getStatusColor(request.approval_status)}>
                    {request.approval_status === 'approved' ? 'Approved' : 
                     request.approval_status === 'not_approved' ? 'Rejected' : 'Pending'}
                  </Badge>
                  {request.ceo_comments && (
                    <p className="text-xs text-gray-600 mt-2">{request.ceo_comments}</p>
                  )}
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700 mb-2">COO Approval</div>
                  <Badge className={getStatusColor(request.coo_approval_status)}>
                    {request.coo_approval_status === 'approved' ? 'Approved' : 
                     request.coo_approval_status === 'not_approved' ? 'Rejected' : 'Pending'}
                  </Badge>
                  {request.coo_comments && (
                    <p className="text-xs text-gray-600 mt-2">{request.coo_comments}</p>
                  )}
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700 mb-2">CE Approval</div>
                  <Badge className={getStatusColor(request.ce_approval_status)}>
                    {request.ce_approval_status === 'approved' ? 'Approved' : 
                     request.ce_approval_status === 'not_approved' ? 'Rejected' : 'Pending'}
                  </Badge>
                  {request.ce_comments && (
                    <p className="text-xs text-gray-600 mt-2">{request.ce_comments}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* CE Approval */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CE Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {request.ce_approval_status ? 'Update Approval' : 'Add Approval'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>CE Approval - Request #{request.id}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="approval_status">Approval Status</Label>
                      <Select value={approvalStatus} onValueChange={setApprovalStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select approval status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="not_approved">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comments">Comments</Label>
                      <Textarea
                        id="comments"
                        placeholder="Add your comments..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleApproval}
                      disabled={submitting || !approvalStatus}
                    >
                      {submitting ? 'Submitting...' : 'Submit Approval'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Media Counts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Media Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Before Images</span>
                <Badge variant="outline">{request.before_images_count}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Images</span>
                <Badge variant="outline">{request.images_count}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Videos</span>
                <Badge variant="outline">{request.videos_count}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Final Videos</span>
                <Badge variant="outline">{request.final_videos_count}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}