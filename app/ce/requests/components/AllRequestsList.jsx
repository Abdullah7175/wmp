"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Eye,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

export default function AllRequestsList() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ceUser, setCeUser] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/ce/requests');
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
        setCeUser(data.ce_user);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch requests",
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
      const response = await fetch(`/api/ce/requests/${selectedRequest.id}/approve`, {
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
        
        // Refresh the requests list
        await fetchRequests();
        
        // Reset form
        setSelectedRequest(null);
        setApprovalStatus('');
        setComments('');
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
        <div className="text-lg">Loading requests...</div>
      </div>
    );
  }

  if (!ceUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Departments Assigned</h3>
            <p>You don't have any departments assigned. Please contact your administrator.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* CE User Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Your Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700">
            <p><strong>Designation:</strong> {ceUser.designation || 'Chief Engineer'}</p>
            <p><strong>Assigned Departments:</strong> {ceUser.departments?.length || 0} department(s)</p>
            {ceUser.departments && ceUser.departments.length > 0 && (
              <div className="mt-2">
                <p><strong>Department Types:</strong></p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ceUser.departments.map((dept, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {dept.type_name || `Department ${dept}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Requests Found</h3>
                <p>No work requests found for your assigned departments.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Request #{request.id}
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority || 'Normal'} Priority
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
                    {request.ce_approval_status && (
                      <Badge className={getStatusColor(request.ce_approval_status)}>
                        CE: {request.ce_approval_status === 'approved' ? 'Approved' : 
                              request.ce_approval_status === 'not_approved' ? 'Rejected' : 'Pending'}
                      </Badge>
                    )}
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

                {/* Approval Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700">CEO Approval</div>
                    <Badge className={getStatusColor(request.approval_status)}>
                      {request.approval_status === 'approved' ? 'Approved' : 
                       request.approval_status === 'not_approved' ? 'Rejected' : 'Pending'}
                    </Badge>
                    {request.ceo_comments && (
                      <p className="text-xs text-gray-600 mt-1">{request.ceo_comments}</p>
                    )}
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700">COO Approval</div>
                    <Badge className={getStatusColor(request.coo_approval_status)}>
                      {request.coo_approval_status === 'approved' ? 'Approved' : 
                       request.coo_approval_status === 'not_approved' ? 'Rejected' : 'Pending'}
                    </Badge>
                    {request.coo_comments && (
                      <p className="text-xs text-gray-600 mt-1">{request.coo_comments}</p>
                    )}
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700">CE Approval</div>
                    <Badge className={getStatusColor(request.ce_approval_status)}>
                      {request.ce_approval_status === 'approved' ? 'Approved' : 
                       request.ce_approval_status === 'not_approved' ? 'Rejected' : 'Pending'}
                    </Badge>
                    {request.ce_comments && (
                      <p className="text-xs text-gray-600 mt-1">{request.ce_comments}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link href={`/ce/requests/${request.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setApprovalStatus(request.ce_approval_status || '');
                          setComments(request.ce_comments || '');
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}