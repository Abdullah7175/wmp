"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, Eye, Download, Video, Plus } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ViewFinalVideosPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [finalVideos, setFinalVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRequestId, setFilterRequestId] = useState("");
  const [filteredVideos, setFilteredVideos] = useState([]);

  // Check if user has permission (Video Editor, Manager, or Content Creator)
  const hasPermission = session?.user?.role === 4 || session?.user?.role === 5 || session?.user?.role === 6;

  const fetchFinalVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/final-videos?creator_id=${session.user.id}&creator_type=socialmedia`);
      if (response.ok) {
        const data = await response.json();
        setFinalVideos(Array.isArray(data) ? data : []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch final videos",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching final videos:", error);
      toast({
        title: "Error",
        description: "Failed to fetch final videos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id && hasPermission) {
      fetchFinalVideos();
    }
  }, [session?.user?.id, hasPermission]);

  useEffect(() => {
    let filtered = finalVideos;

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.work_request_id?.toString().includes(searchTerm) ||
        video.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRequestId) {
      filtered = filtered.filter(video =>
        video.work_request_id?.toString().includes(filterRequestId)
      );
    }

    setFilteredVideos(filtered);
  }, [finalVideos, searchTerm, filterRequestId]);

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
        toast({
          title: "Success",
          description: "Final video deleted successfully",
        });
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete final video",
        variant: "destructive"
      });
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center h-96 text-lg">Loading...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to view final videos.</p>
          <Link href="/smagent" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/smagent" className="flex items-center text-blue-600 hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Final Videos</h1>
            <p className="text-gray-600">View and manage final videos you have created</p>
          </div>
          <Link href="/smagent/final-videos/add">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Upload Final Video
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by description, request ID, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter by Request ID..."
            value={filterRequestId}
            onChange={(e) => setFilterRequestId(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-96 text-lg">Loading final videos...</div>
      ) : filteredVideos.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No final videos found</h3>
            <p className="text-gray-400 mb-4">
              {finalVideos.length === 0 
                ? "You haven't created any final videos yet." 
                : "No final videos match your search criteria."
              }
            </p>
            {finalVideos.length === 0 && (
              <Link href="/smagent/final-videos/add">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Create Your First Final Video
                </button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <video
                  src={video.link}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Request #{video.work_request_id}
                </div>
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  Final Video
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {video.description || "No description"}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Request ID:</strong> {video.work_request_id}</p>
                  <p><strong>Address:</strong> {video.address || "N/A"}</p>
                  <p><strong>Created:</strong> {new Date(video.created_at).toLocaleDateString()}</p>
                  {video.creator_name && (
                    <p><strong>Creator:</strong> {video.creator_name}</p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => window.open(video.link, '_blank')}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <a
                    href={video.link}
                    download
                    className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && filteredVideos.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          Showing {filteredVideos.length} of {finalVideos.length} final videos
        </div>
      )}
    </div>
  );
}
