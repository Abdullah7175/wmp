"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Video, Download, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function FinalVideosPage() {
  const { data: session } = useSession();
  const [finalVideos, setFinalVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Increased from 5 to 10 for better admin view

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    // Remove creator filtering for admin - show ALL final videos
    let url = `/api/final-videos`;
    const params = [];
    if (search) params.push(`filter=${encodeURIComponent(search)}`);
    if (dateFrom) params.push(`date_from=${dateFrom}`);
    if (dateTo) params.push(`date_to=${dateTo}`);
    if (params.length) url += '?' + params.join('&');
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFinalVideos(data);
        } else {
          throw new Error("Invalid data format");
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [session?.user?.id, search, dateFrom, dateTo]);

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
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading final videos...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Final Videos</h1>
          <p className="text-gray-600">
            Your created final videos from source materials
          </p>
        </div>
        <Link href="/dashboard/final-videos/add">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Final Video
          </button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Input
          placeholder="Search by ID, description, work request ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
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
            setSearch("");
            setDateFrom("");
            setDateTo("");
            setCurrentPage(1);
          }}
          className="h-10"
        >
          Reset Filters
        </Button>
      </div>

      {finalVideos.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No final videos yet</h3>
            <p>You haven&apos;t created any final videos yet.</p>
            <Link href="/dashboard/final-videos/add">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create Your First Final Video
              </button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {finalVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((video) => (
            <Card key={video.id} className="p-6 flex flex-col gap-3 bg-white border-2 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-600">Final Video</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  #{video.id}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-1">{video.description}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Request:</span> #{video.work_request_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span> {video.created_at ? new Date(video.created_at).toLocaleDateString() : "-"}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    View
                  </button>
                  <a 
                    href={video.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </a>
                  <button 
                    onClick={() => handleDelete(video.id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {finalVideos.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, finalVideos.length)} of {finalVideos.length} entries
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
                  Page {currentPage} of {Math.ceil(finalVideos.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === Math.ceil(finalVideos.length / itemsPerPage)}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.ceil(finalVideos.length / itemsPerPage))}
                  disabled={currentPage === Math.ceil(finalVideos.length / itemsPerPage)}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedVideo(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">View Final Video</h2>
            <video
              src={selectedVideo.link}
              controls
              className="w-full rounded-lg border"
              style={{ maxHeight: 500 }}
            />
            <div className="mt-2 text-gray-700">
              <div><span className="font-semibold">Description:</span> {selectedVideo.description}</div>
              <div><span className="font-semibold">Request ID:</span> {selectedVideo.work_request_id}</div>
              <div><span className="font-semibold">Created:</span> {selectedVideo.created_at ? new Date(selectedVideo.created_at).toLocaleString() : '-'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 