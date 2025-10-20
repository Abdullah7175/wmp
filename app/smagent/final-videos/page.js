"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Video, Download, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FinalVideosPage() {
  const { data: session } = useSession();
  const [finalVideos, setFinalVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [requestIdFilter, setRequestIdFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [filteredVideos, setFilteredVideos] = useState([]);

  // Filter videos based on search term and request ID
  useEffect(() => {
    let filtered = finalVideos;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.work_request_id?.toString().includes(searchTerm)
      );
    }

    // Apply request ID filter
    if (requestIdFilter) {
      filtered = filtered.filter(video => 
        video.work_request_id?.toString().includes(requestIdFilter)
      );
    }

    setFilteredVideos(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [finalVideos, searchTerm, requestIdFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

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
    setLoading(true);
    
    fetch(`/api/final-videos?creator_id=${session.user.id}&creator_type=socialmedia`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFinalVideos(data);
        } else {
          throw new Error("Invalid data format");
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [session?.user?.id]);

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this final video?')) return;
    
    try {
      const response = await fetch('/api/final-videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: videoId }),
      });

      if (response.ok) {
        setFinalVideos(prev => prev.filter(video => video.id !== videoId));
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading final videos...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Final Videos</h1>
          <p className="text-gray-600">
            Your created final videos from source materials
          </p>
        </div>
        <Link href="/smagent/final-videos/add">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Final Video
          </button>
        </Link>
      </div>

      {finalVideos.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No final videos yet</h3>
            <p>You haven&apos;t created any final videos yet.</p>
            <Link href="/smagent/final-videos/add">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create Your First Final Video
              </button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Search and Filter Controls */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by description or request ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filter by Request ID..."
                  value={requestIdFilter}
                  onChange={(e) => setRequestIdFilter(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
            
            {/* Results summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {currentVideos.length} of {filteredVideos.length} videos
              {searchTerm && ` matching "${searchTerm}"`}
              {requestIdFilter && ` with request ID "${requestIdFilter}"`}
            </div>
          </Card>

          {/* Videos Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentVideos.map((video) => (
            <Card key={video.id} className="p-6 flex flex-col gap-3 bg-white border-2 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-600">Final Video</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  #{video.id}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-1">{video.description}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Request:</span> #{video.work_request_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span> {video.created_at ? new Date(video.created_at).toLocaleDateString() : "-"}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <a 
                    href={video.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </a>
                  {/* <button 
                    onClick={() => handleDelete(video.id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button> */}
                </div>
              </div>
            </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card className="p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({filteredVideos.length} total videos)
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
        </>
      )}
    </div>
  );
}