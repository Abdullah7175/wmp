"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, Eye, Download } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ViewUploadedImagesPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRequestId, setFilterRequestId] = useState("");
  const [filteredImages, setFilteredImages] = useState([]);

  // Check if user has permission (Video Editor, Manager, or Content Creator)
  const hasPermission = session?.user?.role === 4 || session?.user?.role === 5 || session?.user?.role === 6;

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/images?creator_id=${session.user.id}&creator_type=socialmedia`);
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
  };

  useEffect(() => {
    if (session?.user?.id && hasPermission) {
      fetchImages();
    }
  }, [session?.user?.id, hasPermission]);

  useEffect(() => {
    let filtered = images;

    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.work_request_id?.toString().includes(searchTerm) ||
        image.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRequestId) {
      filtered = filtered.filter(image =>
        image.work_request_id?.toString().includes(filterRequestId)
      );
    }

    setFilteredImages(filtered);
  }, [images, searchTerm, filterRequestId]);

  if (status === "loading") {
    return <div className="flex items-center justify-center h-96 text-lg">Loading...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to view uploaded images.</p>
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
        <h1 className="text-3xl font-bold mb-2">My Uploaded Images</h1>
        <p className="text-gray-600">View and manage images you have uploaded</p>
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
        <div className="flex items-center justify-center h-96 text-lg">Loading images...</div>
      ) : filteredImages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 text-lg">No images found</p>
          <p className="text-gray-400 mt-2">
            {images.length === 0 
              ? "You haven't uploaded any images yet." 
              : "No images match your search criteria."
            }
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={image.link}
                  alt={image.description}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.svg';
                  }}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Request #{image.work_request_id}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {image.description || "No description"}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Request ID:</strong> {image.work_request_id}</p>
                  <p><strong>Address:</strong> {image.address || "N/A"}</p>
                  <p><strong>Uploaded:</strong> {new Date(image.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => window.open(image.link, '_blank')}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <a
                    href={image.link}
                    download
                    className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && filteredImages.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          Showing {filteredImages.length} of {images.length} images
        </div>
      )}
    </div>
  );
}
