"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Download, ArrowLeft, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
// Using regular img tag instead of Next.js Image for better special character handling

export default function DownloadImagesPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRequestId, setFilterRequestId] = useState("");
  const [filteredImages, setFilteredImages] = useState([]);

  // Check if user has permission (Video Editor or Manager)
  const hasPermission = session?.user?.role === 4 || session?.user?.role === 5; // 4=Video Editor, 5=Manager

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/images");
      if (response.ok) {
        const data = await response.json();
        setImages(data.data || data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch images",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to fetch images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchImages();
    }
  }, [session?.user?.id, fetchImages]);

  useEffect(() => {
    const filtered = images.filter((image) => {
      const matchesSearch = searchTerm === "" || 
        (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (image.creator_name && image.creator_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRequestId = filterRequestId === "" || 
        image.work_request_id.toString().includes(filterRequestId);
      
      return matchesSearch && matchesRequestId;
    });
    setFilteredImages(filtered);
  }, [images, searchTerm, filterRequestId]);

  // Show loading while session is loading
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">
            Please log in to access this page.
          </p>
          <Link href="/login">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDownload = async (image) => {
    try {
      const response = await fetch(image.link);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image_${image.id}_${image.description || 'untitled'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Image download has begun",
        variant: "success"
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Failed to download image",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAll = async () => {
    if (filteredImages.length === 0) {
      toast({
        title: "No images",
        description: "No images to download",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Downloading...",
        description: `Starting download of ${filteredImages.length} images`,
        variant: "success"
      });

      // Download images one by one
      for (let i = 0; i < filteredImages.length; i++) {
        const image = filteredImages[i];
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
        
        const response = await fetch(image.link);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image_${image.id}_${image.description || 'untitled'}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast({
        title: "Download complete",
        description: `Successfully downloaded ${filteredImages.length} images`,
        variant: "success"
      });
    } catch (error) {
      console.error("Bulk download error:", error);
      toast({
        title: "Download failed",
        description: "Some images failed to download",
        variant: "destructive"
      });
    }
  };

  if (!hasPermission) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Only Video Editors and Managers can access this page.
          </p>
          <Link href="/smagent">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
        <h1 className="text-3xl font-bold mb-2">Download Source Images</h1>
        <p className="text-gray-600">
          Download source images for video editing and content creation
        </p>
      </div>

      <Card className="max-w-6xl mx-auto p-6">
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by description or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                placeholder="Filter by Request ID..."
                value={filterRequestId}
                onChange={(e) => setFilterRequestId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleDownloadAll}
              disabled={filteredImages.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All ({filteredImages.length})
            </button>
          </div>
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading images...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(filteredImages) ? filteredImages : []).map((image) => (
              <div key={image.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  {image.link ? (
                    <img
                      src={image.link}
                      alt={image.description || "Image"}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-48 bg-gray-200 flex items-center justify-center"
                    style={{ display: image.link ? 'none' : 'flex' }}
                  >
                    <span className="text-gray-500">No image available</span>
                  </div>
                  <button
                    onClick={() => handleDownload(image)}
                    className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    title="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 truncate">
                    {image.description || "No description"}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Request ID:</span> {image.work_request_id}</p>
                    <p><span className="font-medium">Creator:</span> {image.creator_name || "Unknown"}</p>
                    <p><span className="font-medium">Date:</span> {new Date(image.created_at).toLocaleDateString()}</p>
                    {image.latitude && image.longitude && (
                      <p><span className="font-medium">Location:</span> {image.latitude}, {image.longitude}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && filteredImages.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Showing {filteredImages.length} of {images.length} total images
            </p>
          </div>
        )}
      </Card>
    </div>
  );
} 