"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Trash2, Plus, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BeforeImagesPage() {
  const { data: session } = useSession();
  const [beforeImages, setBeforeImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [requestIdFilter, setRequestIdFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [filteredImages, setFilteredImages] = useState([]);

  // Check permissions
  const canEdit = session?.user?.userType === 'user' && [1, 2].includes(session?.user?.role);
  const canDelete = session?.user?.userType === 'user' && [1, 2].includes(session?.user?.role) || 
                   session?.user?.userType === 'socialmedia';

  useEffect(() => {
    if (!session?.user?.id) return;
    
    console.log('SM Agent session:', session.user);
    
    const fetchBeforeImages = async () => {
      try {
        const response = await fetch(`/api/before-images?creator_id=${session.user.id}&creator_type=socialmedia`);
        console.log('Before images API response:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Before images data:', data);
          setBeforeImages(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch before images:', response.status, errorData);
          setError('Failed to fetch before images');
        }
      } catch (error) {
        console.error('Error fetching before images:', error);
        setError('Error fetching before images');
      } finally {
        setLoading(false);
      }
    };

    fetchBeforeImages();
  }, [session?.user?.id]);

  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this before image?')) return;
    
    try {
      const response = await fetch(`/api/before-images?id=${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBeforeImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  // Filter images based on search term and request ID
  useEffect(() => {
    let filtered = beforeImages;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.work_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply request ID filter
    if (requestIdFilter) {
      filtered = filtered.filter(img => 
        img.work_request_id?.toString().includes(requestIdFilter)
      );
    }

    setFilteredImages(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [beforeImages, searchTerm, requestIdFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);

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

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading before images...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Before Images</h1>
          <p className="text-gray-600">
            Images captured before work completion
          </p>
        </div>
        <Link href="/smagent/before-images/add">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Before Images
          </Button>
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by work description, address, complaint type, or description..."
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
          Showing {currentImages.length} of {filteredImages.length} images
          {searchTerm && ` matching "${searchTerm}"`}
          {requestIdFilter && ` with request ID "${requestIdFilter}"`}
        </div>
      </Card>

      {filteredImages.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No before images yet</h3>
            <p>You haven&apos;t uploaded any before images yet.</p>
            <Link href="/smagent/before-images/add">
              <Button className="mt-4">
                Upload Your First Before Images
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentImages.map((image) => {
                // Convert /uploads/ to /api/uploads/ for secure access
                const getImageUrl = (url) => {
                    if (!url) return '';
                    if (url.startsWith('/uploads/')) {
                        return url.replace('/uploads/', '/api/uploads/');
                    }
                    return url;
                };
                const imageUrl = getImageUrl(image.link);
                return (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={image.description || 'Before image'}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.fallback-message');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="fallback-message hidden w-full h-48 bg-gray-100 items-center justify-center text-gray-500 text-sm">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Image file not available</p>
                  </div>
                </div>
                <Badge className="absolute top-2 left-2">
                  Request #{image.work_request_id}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">
                    {image.address || 'No address'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {image.complaint_type || 'Unknown type'}
                  </p>
                  {image.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(imageUrl, '_blank')}
                        className="h-6 px-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(image.id)}
                          className="h-6 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card className="p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({filteredImages.length} total images)
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
