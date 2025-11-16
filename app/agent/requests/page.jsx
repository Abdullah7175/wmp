"use client"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable } from './data-table';
import { columns, getAgentRequestColumns } from './columns';
import { useSession } from 'next-auth/react';
import ImageForm from '../images/add/addImageForm';
import VideoForm from '../videos/add/addVideoForm';
import AddBeforeContentForm from '../before-images/add/addBeforeImageForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] relative flex flex-col">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <div className="overflow-y-auto p-6 flex-1 min-h-0">
        {children}
      </div>
    </div>
  </div>
);

const RequestsPage = () => {
    const { data: session } = useSession();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [showImageForm, setShowImageForm] = useState(false);
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [showBeforeContentForm, setShowBeforeContentForm] = useState(false);
    
    // Search and pagination state
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filteredRequests, setFilteredRequests] = useState([]);

    // Filter requests based on search term and status
    useEffect(() => {
        let filtered = requests;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(req => 
                req.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.complaint_subtype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.town_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.division_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.id?.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(req => {
                const statusId = Number(req.status_id);
                if (statusFilter === "pending") return statusId === 1;
                if (statusFilter === "assigned") return statusId === 2;
                if (statusFilter === "in_progress") return statusId === 3;
                if (statusFilter === "completed") return statusId === 4;
                if (statusFilter === "cancelled") return statusId === 5;
                return true;
            });
        }

        setFilteredRequests(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [requests, searchTerm, statusFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRequests = filteredRequests.slice(startIndex, endIndex);

    // Pagination handlers
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    useEffect(() => {
        if (!session?.user?.id) return;
        const fetchRequests = async () => {
            try {
                const res = await fetch(`/api/requests?creator_id=${session.user.id}&creator_type=agent&limit=1000&include_approval_status=true`);
                if (!res.ok) {
                    throw new Error('Failed to fetch requests');
                }
                const data = await res.json();
                setRequests(data.data || []);
            } catch (error) {
                console.error('Error fetching requests:', error);
                setError(error.message);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [router, session?.user?.id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => router.push('/agent/requests')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const columns = getAgentRequestColumns({
        onAddImage: (id) => {
            setSelectedRequestId(id);
            setShowImageForm(true);
        },
        onAddVideo: (id) => {
            setSelectedRequestId(id);
            setShowVideoForm(true);
        },
        onAddBeforeContent: (id) => {
            setSelectedRequestId(id);
            setShowBeforeContentForm(true);
        },
    });

    const closeForms = () => {
        setShowImageForm(false);
        setShowVideoForm(false);
        setShowBeforeContentForm(false);
        setSelectedRequestId(null);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Work Requests</h1>
                <Button onClick={() => router.push('/agent/requests/new')}>
                    Create New Request
                </Button>
            </div>
            
            {/* Search and Filter Controls */}
            <Card className="p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search by address, complaint type, division, town, or request ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                {/* Results summary */}
                <div className="mt-4 text-sm text-gray-600">
                    Showing {currentRequests.length} of {filteredRequests.length} requests
                    {searchTerm && ` matching "${searchTerm}"`}
                    {statusFilter !== "all" && ` with status "${statusFilter}"`}
                </div>
            </Card>
            
            <div className="bg-white rounded-lg shadow">
                <DataTable 
                    columns={columns} 
                    data={currentRequests} 
                    meta={{
                        onAddImage: (id) => {
                            setSelectedRequestId(id);
                            setShowImageForm(true);
                        },
                        onAddVideo: (id) => {
                            setSelectedRequestId(id);
                            setShowVideoForm(true);
                        },
                        onAddBeforeContent: (id) => {
                            setSelectedRequestId(id);
                            setShowBeforeContentForm(true);
                        },
                    }}
                />
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <Card className="p-4 mt-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages} ({filteredRequests.length} total requests)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            
                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => goToPage(pageNum)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
            {showImageForm && selectedRequestId && (
                <Modal onClose={closeForms}>
                  <ImageForm workRequestId={selectedRequestId} onClose={closeForms} />
                </Modal>
            )}
            {showVideoForm && selectedRequestId && (
                <Modal onClose={closeForms}>
                  <VideoForm workRequestId={selectedRequestId} onClose={closeForms} />
                </Modal>
            )}
            {showBeforeContentForm && selectedRequestId && (
                <Modal onClose={closeForms}>
                  <AddBeforeContentForm workRequestId={selectedRequestId} onClose={closeForms} />
                </Modal>
            )}
        </div>
    );
};

export default RequestsPage;