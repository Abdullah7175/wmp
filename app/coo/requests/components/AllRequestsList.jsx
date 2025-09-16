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
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/coo/requests');
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
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'completed') return request.status_name === 'Completed';
    if (filter === 'pending') return request.status_name === 'Pending';
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading works...</div>
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
    <div className="space-y-4 lg:space-y-6">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap lg:flex-nowrap space-x-2 lg:space-x-8 overflow-x-auto">
          {[
            { key: 'all', label: 'All Works', count: requests.length },
            { key: 'pending', label: 'Pending', count: requests.filter(r => r.status_name === 'Pending').length },
            { key: 'completed', label: 'Completed', count: requests.filter(r => r.status_name === 'Completed').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${
                filter === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Works List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No works found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'No works have been created yet.' : `No ${filter} works found.`}
            </p>
          </div>
        ) : (
          paginatedRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 lg:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mb-3">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                      Work #{request.id}
                    </h3>
                    <span className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status_name?.toLowerCase())} w-fit`}>
                      {getStatusIcon(request.status_name?.toLowerCase())}
                      <span className="ml-1">
                        {request.status_name || 'No Status'}
                      </span>
                    </span>
                  </div>
                  
                  <h4 className="text-sm lg:text-base font-medium text-gray-900 mb-2">
                    {request.complaint_type}
                    {request.complaint_subtype && (
                      <span className="text-gray-600 font-normal"> - {request.complaint_subtype}</span>
                    )}
                  </h4>
                  
                  <p className="text-sm lg:text-base text-gray-700 mb-4 line-clamp-2">{request.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm font-medium text-gray-900">Location</p>
                        <p className="text-xs lg:text-sm text-gray-600 truncate">{request.district} - {request.town}</p>
                        {request.subtown && (
                          <p className="text-xs lg:text-sm text-gray-600 truncate">{request.subtown}</p>
                        )}
                        <p className="text-xs lg:text-sm text-gray-600 truncate">{request.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm font-medium text-gray-900">Created By</p>
                        <p className="text-xs lg:text-sm text-gray-600 truncate">{request.creator_name}</p>
                        <p className="text-xs lg:text-sm text-gray-500 truncate">{request.creator_email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>{new Date(request.request_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="truncate">{request.contact_number}</span>
                    </div>
                    {request.nature_of_work && (
                      <div className="flex items-center space-x-1">
                        <Wrench className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span className="truncate">{request.nature_of_work}</span>
                      </div>
                    )}
                  </div>

                  {/* Media Count */}
                  <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-3 lg:mt-4 text-xs lg:text-sm text-gray-500">
                    {request.before_images_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Image className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>{request.before_images_count} Before Images</span>
                      </div>
                    )}
                    {request.images_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Image className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>{request.images_count} Images</span>
                      </div>
                    )}
                    {request.videos_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Video className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>{request.videos_count} Videos</span>
                      </div>
                    )}
                    {request.final_videos_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Video className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>{request.final_videos_count} Final Videos</span>
                      </div>
                    )}
                  </div>

                  {/* CEO/COO Comments */}
                  {(request.ceo_comments || request.coo_comments) && (
                    <div className="mt-3 lg:mt-4 space-y-2">
                      {request.ceo_comments && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                            <span className="text-xs lg:text-sm font-medium text-blue-900">CEO Comment</span>
                          </div>
                          <p className="text-xs lg:text-sm text-blue-800">{request.ceo_comments}</p>
                        </div>
                      )}
                      {request.coo_comments && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                            <span className="text-xs lg:text-sm font-medium text-green-900">COO Comment</span>
                          </div>
                          <p className="text-xs lg:text-sm text-green-800">{request.coo_comments}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col lg:flex-col space-y-2 lg:ml-6">
                  <Link
                    href={`/coo/requests/${request.id}`}
                    className="inline-flex items-center justify-center px-3 lg:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs lg:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    View Details
                  </Link>
                  
                  <Link
                    href={`/coo/requests/${request.id}`}
                    className="inline-flex items-center justify-center px-3 lg:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs lg:text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    Add Comment
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredRequests.length > itemsPerPage && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-4 lg:pt-6 border-t border-gray-200 space-y-4 lg:space-y-0">
          <div className="text-sm text-gray-500 text-center lg:text-left">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} works
          </div>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
