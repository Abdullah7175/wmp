"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Video, Download, Search, Filter, ArrowLeft, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Role mapping function
const getRoleDisplay = (roleId) => {
  const roleMap = {
    1: "CAMERA MAN",
    2: "ASSISTANT", 
    3: "PHOTOGRAPHER",
    4: "VIDEO EDITOR",
    5: "MANAGER",
  };
  return roleMap[roleId] || "UNKNOWN ROLE";
};

// Check if user has special role (video editor or manager)
const isSpecialRole = (roleId) => {
  return roleId === 4 || roleId === 5; // video_editor or manager
};

export default function VideoDownloadPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const userRole = session?.user?.role;
  const userHasSpecialRole = isSpecialRole(userRole);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    if (!userHasSpecialRole) {
      setError("Access denied. Only Video Editors and Managers can access this page.");
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos?limit=1000');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setVideos(data);
        } else if (data.data) {
          setVideos(data.data);
        } else {
          setVideos([]);
        }
        
        setLoading(false);
      } catch (e) {
        setError("Failed to load videos");
        setLoading(false);
      }
    };

    fetchVideos();
  }, [session?.user?.id, userHasSpecialRole]);

  // Filter videos based on search term and status
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.work_request_id?.toString().includes(searchTerm) ||
                         video.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "recent" && isRecentVideo(video.created_at));
    
    return matchesSearch && matchesStatus;
  });

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

  const isRecentVideo = (createdAt) => {
    if (!createdAt) return false;
    const videoDate = new Date(createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return videoDate > weekAgo;
  };

  const handleSelectVideo = (videoId) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVideos.length === filteredVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(filteredVideos.map(video => video.id));
    }
  };

  const handleDownloadVideo = async (video) => {
    try {
      const response = await fetch(video.link);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${video.id}-${video.description || 'unnamed'}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `Downloading ${video.description || 'video'}`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download video",
        variant: "destructive"
      });
    }
  };

  const handleBulkDownload = async () => {
    if (selectedVideos.length === 0) {
      toast({
        title: "No videos selected",
        description: "Please select videos to download",
        variant: "destructive"
      });
      return;
    }

    const selectedVideoData = videos.filter(video => selectedVideos.includes(video.id));
    
    for (const video of selectedVideoData) {
      try {
        await handleDownloadVideo(video);
        // Add a small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to download video ${video.id}:`, error);
      }
    }

    toast({
      title: "Bulk download completed",
      description: `Downloaded ${selectedVideos.length} video(s)`,
      variant: "success"
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading videos...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Link href="/smagent">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/smagent" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">Download Videos</h1>
        <p className="text-gray-600">
          Download source videos for editing and compilation ({getRoleDisplay(userRole)})
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by description, request ID, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Videos</option>
              <option value="recent">Recent (Last 7 days)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              {selectedVideos.length === filteredVideos.length && filteredVideos.length > 0 ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedVideos.length === filteredVideos.length && filteredVideos.length > 0 ? "Deselect All" : "Select All"}
            </button>
            
            {selectedVideos.length > 0 && (
              <button
                onClick={handleBulkDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Download Selected ({selectedVideos.length})
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {currentVideos.length} of {filteredVideos.length} video(s)
          </div>
        </div>
      </Card>

      {filteredVideos.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No videos found</h3>
            <p>
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "No videos have been uploaded yet."
              }
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentVideos.map((video) => (
            <Card key={video.id} className="p-6 flex flex-col gap-3 bg-white border-2 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-600">Source Video</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedVideos.includes(video.id)}
                    onChange={() => handleSelectVideo(video.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    #{video.id}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-1">{video.description || "Untitled Video"}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Request:</span> #{video.work_request_id}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Address:</span> {video.address || "No address"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Uploaded:</span> {video.created_at ? new Date(video.created_at).toLocaleDateString() : "-"}
                </p>
                {video.latitude && video.longitude && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {video.latitude}, {video.longitude}
                  </p>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleDownloadVideo(video)}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Video
                </button>
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
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
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
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-8 h-8 rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}