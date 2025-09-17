"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Trash2, Plus, Search, Edit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BeforeContentPage() {
  const { data: session } = useSession();
  const [beforeContent, setBeforeContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Admins and managers can upload, edit, and delete
  const canUpload = true;
  const canEdit = true;
  const canDelete = true;

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchBeforeContent = async () => {
      try {
        // For admins, we can fetch all before content or just their own
        // Let's fetch all before content for admins to see everything
        const response = await fetch(`/api/before-content`);
        if (response.ok) {
          const data = await response.json();
          setBeforeContent(data || []);
        } else {
          console.error('Failed to fetch before content:', response.status);
          setBeforeContent([]); // Set empty array instead of error
        }
      } catch (error) {
        console.error('Error fetching before content:', error);
        setBeforeContent([]); // Set empty array instead of error
      } finally {
        setLoading(false);
      }
    };

    fetchBeforeContent();
  }, [session?.user?.id]);

  const handleDelete = async (contentId) => {
    if (!confirm('Are you sure you want to delete this before content?')) return;
    
    try {
      const response = await fetch(`/api/before-content?id=${contentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBeforeContent(prev => prev.filter(item => item.id !== contentId));
      } else {
        throw new Error('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const filteredContent = beforeContent.filter(item => 
    item.work_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading before content...</div>;
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
        <Link href="/dashboard/before-content/add">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Before Content
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by work description, address, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setDateFrom("");
              setDateTo("");
              setCurrentPage(1);
            }}
            className="h-10"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {filteredContent.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No before content yet</h3>
            <p>No before content has been uploaded by agents or social media personnel yet.</p>
            <Link href="/dashboard/before-content/add">
              <Button className="mt-4">
                Add Before Content
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
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
                    {item.content_type === 'video' ? 'Video' : 'Image'}
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
                          onClick={() => handleDelete(item.id)}
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
            ))}
          </div>
          
          {/* Pagination */}
          {filteredContent.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredContent.length)} of {filteredContent.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {Math.ceil(filteredContent.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredContent.length / itemsPerPage)}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.ceil(filteredContent.length / itemsPerPage))}
                  disabled={currentPage === Math.ceil(filteredContent.length / itemsPerPage)}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
