"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  XCircle,
  Building,
  DollarSign,
  Wrench,
  Eye,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import WorkRequestStatus from "@/components/WorkRequestStatus";

export default function RejectedRequestsList({ requests }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleReactivate = async (requestId) => {
    if (!confirm('Are you sure you want to reactivate this rejected request? This will change its status back to pending CEO approval.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/ceo/reactivate-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workRequestId: requestId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate request');
      }

      alert('Request reactivated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error reactivating request:', error);
      alert('Error reactivating request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Requests</h3>
        <p className="text-gray-500">No work requests have been rejected yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Rejected Work Requests ({requests.length})
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {requests.map((request) => (
          <div key={request.id} className="px-6 py-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <WorkRequestStatus 
                    approvalStatus={request.approval_status}
                    status={request.status_name}
                  />
                  <span className="text-sm text-gray-500">
                    Request #{request.id}
                  </span>
                  <span className="text-sm text-gray-500">
                    Rejected: {new Date(request.approval_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {request.complaint_type}
                      {request.complaint_subtype && (
                        <span className="text-gray-600 font-normal"> - {request.complaint_subtype}</span>
                      )}
                    </h3>
                    
                    <p className="text-gray-700 mb-3 line-clamp-3">
                      {request.description}
                    </p>
                    
                    {request.nature_of_work && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <Wrench className="w-4 h-4" />
                        <span>{request.nature_of_work}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{request.district} - {request.town} {request.subtown && `- ${request.subtown}`}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{request.address}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{request.contact_number}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Request Date: {new Date(request.request_date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Created by: {request.creator_name}</span>
                    </div>
                    
                    {request.budget_code && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Budget Code: {request.budget_code}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Reason */}
                {request.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h4>
                        <p className="text-sm text-red-700">{request.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CEO Comments */}
                {request.ceo_comments && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">CEO Comments</h4>
                    <p className="text-sm text-yellow-700">{request.ceo_comments}</p>
                  </div>
                )}
              </div>
              
              <div className="ml-6 flex flex-col space-y-2">
                <Link
                  href={`/ceo/requests/${request.id}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </Link>
                
                <button
                  onClick={() => handleReactivate(request.id)}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200 text-center flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isLoading ? 'Reactivating...' : 'Reactivate'}</span>
                </button>
                
                <Link
                  href={`/ceo/requests/${request.id}/before-images`}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 text-center"
                >
                  View Before Images
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
