"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  FileText, 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  Clock,
  Building,
  DollarSign,
  Wrench,
  AlertTriangle
} from "lucide-react";

export default function PendingRequestsList() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/ceo/requests?status=pending');
        const result = await response.json();
        
        if (result.success) {
          setRequests(result.data);
        } else {
          setError(result.message || 'Failed to fetch requests');
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to fetch requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading requests...</div>
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
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
        <p className="text-gray-500">All work requests have been reviewed and processed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Work Requests Pending Approval ({requests.length})
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {requests.map((request) => (
          <div key={request.id} className="px-6 py-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-4 h-4 mr-1" />
                    Pending
                  </span>
                  <span className="text-sm text-gray-500">
                    Request #{request.id}
                  </span>
                  <span className="text-sm text-gray-500">
                    Submitted: {new Date(request.request_date).toLocaleDateString()}
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
              </div>
              
              <div className="ml-6 flex flex-col space-y-2">
                <Link
                  href={`/ceo/requests/${request.id}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
                >
                  Review Request
                </Link>
                
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
