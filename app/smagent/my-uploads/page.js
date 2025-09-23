"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Image as ImageIcon, 
  Video, 
  Download, 
  Eye, 
  Calendar,
  FileText,
  MapPin,
  User
} from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MyUploadsPage() {
  const { data: session } = useSession();
  const [uploads, setUploads] = useState({
    images: [],
    videos: [],
    finalVideos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('images');

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchUploads = async () => {
      try {
        setLoading(true);
        
        // Fetch images uploaded by this user
        const imagesRes = await fetch(`/api/images?creator_id=${session.user.id}&creator_type=socialmedia&limit=100`);
        const imagesData = await imagesRes.json();
        
        // Fetch videos uploaded by this user
        const videosRes = await fetch(`/api/videos?creator_id=${session.user.id}&creator_type=socialmedia&limit=100`);
        const videosData = await videosRes.json();
        
        // Fetch final videos uploaded by this user
        const finalVideosRes = await fetch(`/api/final-videos?creator_id=${session.user.id}&creator_type=socialmedia&limit=100`);
        const finalVideosData = await finalVideosRes.json();
        
        setUploads({
          images: imagesData.data || [],
          videos: videosData.data || [],
          finalVideos: Array.isArray(finalVideosData) ? finalVideosData : []
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUploads();
  }, [session?.user?.id]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (fileType?.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const renderFileCard = (file, type) => {
    const fileUrl = `/uploads/${file.file_path || file.file_name}`;
    const isImage = file.file_type?.startsWith('image/') || type === 'images';
    const isVideo = file.file_type?.startsWith('video/') || type === 'videos' || type === 'finalVideos';

    return (
      <Card key={file.id} className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {isImage ? (
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={fileUrl} 
                  alt={file.description || 'Uploaded image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {file.file_name || file.description || 'Untitled'}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {file.description || 'No description provided'}
                </p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {getFileTypeIcon(file.file_type)}
                    <span>{formatFileSize(file.file_size || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(file.created_at || file.uploaded_at)}</span>
                  </div>
                  {file.work_request_id && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Request #{file.work_request_id}</span>
                    </div>
                  )}
                </div>
                
                {(file.latitude && file.longitude) && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{parseFloat(file.latitude).toFixed(4)}, {parseFloat(file.longitude).toFixed(4)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fileUrl, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = file.file_name || 'download';
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center h-96 text-lg">Loading your uploads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>
      </div>
    );
  }

  const totalUploads = uploads.images.length + uploads.videos.length + uploads.finalVideos.length;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/smagent" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">My Uploads</h1>
        <p className="text-gray-600">
          View and manage all your uploaded files
        </p>
        
        <div className="mt-4">
          <Badge variant="secondary" className="text-sm">
            Total Files: {totalUploads}
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('images')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'images'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Images ({uploads.images.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'videos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Videos ({uploads.videos.length})
            </button>
            <button
              onClick={() => setActiveTab('finalVideos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'finalVideos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Final Videos ({uploads.finalVideos.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'images' && (
          <div>
            {uploads.images.length === 0 ? (
              <Card className="p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded</h3>
                <p className="text-gray-600 mb-4">You haven't uploaded any images yet.</p>
                <Link href="/smagent/images/add">
                  <Button>Upload Images</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {uploads.images.map(file => renderFileCard(file, 'images'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            {uploads.videos.length === 0 ? (
              <Card className="p-8 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos uploaded</h3>
                <p className="text-gray-600 mb-4">You haven't uploaded any videos yet.</p>
                <Link href="/smagent/videos/add">
                  <Button>Upload Videos</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {uploads.videos.map(file => renderFileCard(file, 'videos'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'finalVideos' && (
          <div>
            {uploads.finalVideos.length === 0 ? (
              <Card className="p-8 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No final videos uploaded</h3>
                <p className="text-gray-600 mb-4">You haven't uploaded any final videos yet.</p>
                <Link href="/smagent/final-videos/add">
                  <Button>Upload Final Video</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {uploads.finalVideos.map(file => renderFileCard(file, 'finalVideos'))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
