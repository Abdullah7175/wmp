"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Plus, Search, Image as ImageIcon, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BeforeContentPage() {
  const { data: session } = useSession();
  const [beforeContent, setBeforeContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const filteredContent = beforeContent.filter(item => 
    item.work_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContent = filteredContent.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by work description, address, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

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
          {currentContent.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                {item.content_type === 'video' ? (
                  <video
                    src={item.link}
                    className="w-full h-48 object-cover"
                    controls
                  />
                ) : (
                  <Image
                    src={item.link}
                    alt={item.description || 'Before content'}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                )}
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
                        onClick={() => window.open(item.link, '_blank')}
                        className="h-6 px-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredContent.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </p>
            <p className="text-sm text-muted-foreground">
              ({filteredContent.length} total items)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
