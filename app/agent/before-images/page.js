"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BeforeImagesPage() {
  const { data: session } = useSession();
  const [beforeImages, setBeforeImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Agents can only upload, not edit or delete
  const canUpload = true;
  const canEdit = false;
  const canDelete = false;

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchBeforeImages = async () => {
      try {
        const response = await fetch(`/api/before-images?creator_id=${session.user.id}&creator_type=agent`);
        if (response.ok) {
          const data = await response.json();
          setBeforeImages(data);
        } else {
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

  const filteredImages = beforeImages.filter(img => 
    img.work_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* <Link href="/agent/before-images/add">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Before Images
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

      {filteredImages.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No before images yet</h3>
            <p>You haven&apos;t uploaded any before images yet.</p>
            {/* <Link href="/agent/before-images/add">
              <Button className="mt-4">
                Upload Your First Before Images
              </Button>
            </Link> */}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative">
                <Image
                  src={image.link}
                  alt={image.description || 'Before image'}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
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
                        onClick={() => window.open(image.link, '_blank')}
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
    </div>
  );
}
