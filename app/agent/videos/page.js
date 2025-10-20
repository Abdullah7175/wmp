"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Page() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [requestIdFilter, setRequestIdFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredVideos, setFilteredVideos] = useState([]);

  // Filter videos based on search term and request ID
  useEffect(() => {
    let filtered = videos;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  }, [videos, searchTerm, requestIdFilter]);

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
    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/videos?creator_id=${session.user.id}&creator_type=agent`, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setVideos(data.data || data || []);
        } else {
          setError('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Error fetching videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [session?.user?.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-4">Engineer Videos</h1>
        
        {/* Search and Filter Controls */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by description, file name, or request ID..."
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
      </div>
      
      <DataTable columns={columns} data={currentVideos} />
      
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
    </div>
  )
}