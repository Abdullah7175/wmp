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
  AlertTriangle,
  Eye,
  MessageSquare,
  Image,
  Video,
  CheckCircle,
  XCircle,
  Minus
} from "lucide-react";

export default function AllRequestsList() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/ceo/requests');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.approval_status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Requests', count: requests.length },
            { key: 'pending', label: 'Pending', count: requests.filter(r => r.approval_status === 'pending').length },
            { key: 'approved', label: 'Approved', count: requests.filter(r => r.approval_status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.approval_status === 'rejected').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'No work requests have been created yet.' : `No ${filter} requests found.`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Request #{request.id}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.approval_status)}`}>
                      {getStatusIcon(request.approval_status)}
                      <span className="ml-1">
                        {request.approval_status === 'pending' ? 'Pending Review' : 
                         request.approval_status === 'approved' ? 'Approved' : 
                         request.approval_status === 'rejected' ? 'Rejected' : 'No Status'}
                      </span>
                    </span>
                  </div>
                  
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    {request.complaint_type}
                    {request.complaint_subtype && (
                      <span className="text-gray-600 font-normal"> - {request.complaint_subtype}</span>
                    )}
                  </h4>
                  
                  <p className="text-gray-700 mb-4 line-clamp-2">{request.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{request.district} - {request.town}</p>
                        {request.subtown && (
                          <p className="text-sm text-gray-600">{request.subtown}</p>
                        )}
                        <p className="text-sm text-gray-600">{request.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Created By</p>
                        <p className="text-sm text-gray-600">{request.creator_name}</p>
                        <p className="text-sm text-gray-500">{request.creator_email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(request.request_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{request.contact_number}</span>
                    </div>
                    {request.nature_of_work && (
                      <div className="flex items-center space-x-1">
                        <Wrench className="w-4 h-4" />
                        <span>{request.nature_of_work}</span>
                      </div>
                    )}
                  </div>

                  {/* Media Count */}
                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                    {request.before_images_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Image className="w-4 h-4" />
                        <span>{request.before_images_count} Before Images</span>
                      </div>
                    )}
                    {request.images_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Image className="w-4 h-4" />
                        <span>{request.images_count} Images</span>
                      </div>
                    )}
                    {request.videos_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Video className="w-4 h-4" />
                        <span>{request.videos_count} Videos</span>
                      </div>
                    )}
                    {request.final_videos_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Video className="w-4 h-4" />
                        <span>{request.final_videos_count} Final Videos</span>
                      </div>
                    )}
                  </div>

                  {/* CEO Comments */}
                  {request.ceo_comments && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">CEO Comment</span>
                      </div>
                      <p className="text-sm text-blue-800">{request.ceo_comments}</p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <Link
                    href={`/ceo/requests/${request.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                  
                  <Link
                    href={`/ceo/requests/${request.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Comment
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
