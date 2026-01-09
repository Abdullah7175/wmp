"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Plus, Search, Image as ImageIcon, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BeforeContentPage() {
  const { data: session } = useSession();
  const [beforeContent, setBeforeContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestIdFilter, setRequestIdFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [filteredContent, setFilteredContent] = useState([]);

  // Agents can only upload, not edit or delete
  const canUpload = true;
  const canEdit = false;
  const canDelete = false;

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchBeforeContent = async () => {
      try {
        const response = await fetch(`/api/before-content?creator_id=${session.user.id}&creator_type=agent`);
        if (response.ok) {
          const data = await response.json();
          setBeforeContent(data);
        } else {
          setError('Failed to fetch before content');
        }
      } catch (error) {
        console.error('Error fetching before content:', error);
        setError('Error fetching before content');
      } finally {
        setLoading(false);
      }
    };

    fetchBeforeContent();
  }, [session?.user?.id]);

  // Filter content based on search term and request ID
  useEffect(() => {
    let filtered = beforeContent;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.work_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply request ID filter
    if (requestIdFilter) {
      filtered = filtered.filter(item => 
        item.work_request_id?.toString().includes(requestIdFilter)
      );
    }

    setFilteredContent(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [beforeContent, searchTerm, requestIdFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContent = filteredContent.slice(startIndex, endIndex);

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
    return <div className="flex items-center justify-center h-96 text-lg">Loading before content...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Before Content</h1>
          <p className="text-gray-600">
            Images and videos captured before work completion
          </p>
        </div>
        {/* <Link href="/agent/before-content/add">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Before Content
          </Button>
        </Link> */}
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
          Showing {currentContent.length} of {filteredContent.length} items
          {searchTerm && ` matching "${searchTerm}"`}
          {requestIdFilter && ` with request ID "${requestIdFilter}"`}
        </div>
      </Card>

      {currentContent.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No before content yet</h3>
            <p>You haven&apos;t uploaded any before content yet.</p>
            {/* <Link href="/agent/before-content/add">
              <Button className="mt-4">
                Upload Your First Before Content
              </Button>
            </Link> */}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentContent.map((item) => {
                // Convert /uploads/ to /api/uploads/ for secure access
                const getMediaUrl = (url) => {
                    if (!url) return '';
                    if (url.startsWith('/uploads/')) {
                        return url.replace('/uploads/', '/api/uploads/');
                    }
                    return url;
                };
                const mediaUrl = getMediaUrl(item.link);
                return (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                {item.content_type === 'video' ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-48 object-cover"
                    controls
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.fallback-message');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={item.description || 'Before content'}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.fallback-message');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                )}
                <div className="fallback-message hidden w-full h-48 bg-gray-100 items-center justify-center text-gray-500 text-sm">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Media file not available</p>
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge>
                    Request #{item.work_request_id}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {item.content_type === 'video' ? (
                      <Video className="w-3 h-3 mr-1" />
                    ) : (
                      <ImageIcon className="w-3 h-3 mr-1" />
                    )}
                    {item.content_type}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">
                    {item.address || 'No address'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {item.complaint_type || 'Unknown type'}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(mediaUrl, '_blank')}
                        className="h-6 px-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card className="p-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({filteredContent.length} total items)
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
  );
}
