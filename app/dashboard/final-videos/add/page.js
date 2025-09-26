"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Upload, ArrowLeft, MapPin, Plus, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { UploadProgressCard } from "@/components/UploadProgressCard";

export default function AddFinalVideoPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    workRequestId: "",
    description: "",
    latitude: "",
    longitude: "",
    videos: []
  });

  // File upload hook
  const { uploading, progress, uploadStatus, error, uploadFile, reset } = useFileUpload();

  // Get current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setGettingLocation(false);
          toast({
            title: "Location obtained",
            description: "Current location has been set",
            variant: "success"
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
          toast({
            title: "Location error",
            description: "Could not get current location. Please enter manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      setGettingLocation(false);
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
    }
  };

  const handleAddVideo = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.multiple = true;
    
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      const newVideos = files.map(file => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size
      }));
      
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...newVideos]
      }));
    };
    
    fileInput.click();
  };

  const handleRemoveVideo = (videoId) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter(video => video.id !== videoId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.workRequestId || !formData.description || formData.videos.length === 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and select at least one video file.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "Location required",
        description: "Please provide location coordinates (auto or manual).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Upload videos one by one with progress tracking
      for (let i = 0; i < formData.videos.length; i++) {
        const video = formData.videos[i];
        
        const data = new FormData();
        data.append("workRequestId", formData.workRequestId);
        data.append("description", formData.description);
        data.append("videoFile", video.file);
        data.append("latitude", formData.latitude);
        data.append("longitude", formData.longitude);
        data.append("creator_id", session.user.id);
        data.append("creator_type", "socialmedia");
        data.append("creator_name", session.user.name);

        await uploadFile(video.file, "/api/final-videos", data, {
          onProgress: (progress) => {
            // Calculate overall progress across all files
            const overallProgress = Math.round(((i + progress / 100) / formData.videos.length) * 100);
            console.log(`Uploading ${video.name}: ${overallProgress}%`);
          },
          onSuccess: (response) => {
            console.log(`Successfully uploaded ${video.name}`);
          },
          onError: (error) => {
            console.error(`Failed to upload ${video.name}:`, error);
            throw error;
          }
        });
      }
      
      toast({
        title: "Success",
        description: `${formData.videos.length} final video(s) uploaded successfully!`,
        variant: "success"
      });
      
      setFormData({
        workRequestId: "",
        description: "",
        latitude: "",
        longitude: "",
        videos: []
      });
      
      reset(); // Reset upload progress
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload final videos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/smagent/final-videos" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Final Videos
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">Upload Final Video(s)</h1>
        <p className="text-gray-600">
          Upload compiled final videos for work requests with location data
        </p>
      </div>

      <Card className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="workRequestId" className="block text-sm font-medium text-gray-700 mb-2">
                Work Request ID *
              </label>
              <input
                type="number"
                id="workRequestId"
                value={formData.workRequestId}
                onChange={(e) => setFormData(prev => ({ ...prev, workRequestId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter work request ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Coordinates *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {gettingLocation ? "Getting..." : "Get Location"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                id="latitude"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter latitude"
                required
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                id="longitude"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter longitude"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe the final video content"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Files * ({formData.videos.length} selected)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <button
                type="button"
                onClick={handleAddVideo}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Click to select video files
              </button>
              <p className="text-sm text-gray-500 mt-2">
                MP4, M4V, AVI, MOV, MKV, WebM, or other video formats (multiple files supported)
              </p>
            </div>
            
            {formData.videos.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.videos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <Upload className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{video.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(video.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(video.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Creator Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Creator ID:</span>
                <span className="ml-2 font-medium">{session?.user?.id || "Loading..."}</span>
              </div>
              <div>
                <span className="text-gray-600">Creator Name:</span>
                <span className="ml-2 font-medium">{session?.user?.name || "Loading..."}</span>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <span className="ml-2 font-medium">{session?.user?.role || "Loading..."}</span>
              </div>
              <div>
                <span className="text-gray-600">Creator Type:</span>
                <span className="ml-2 font-medium">socialmedia</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/smagent/final-videos">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading || formData.videos.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : `Upload ${formData.videos.length} Video(s)`}
            </button>
          </div>
        </form>
      </Card>

      {/* Upload Progress Card */}
      <UploadProgressCard
        isVisible={uploading}
        uploading={uploading}
        progress={progress}
        uploadStatus={uploadStatus}
        error={error}
        fileName={formData.videos.length > 0 ? formData.videos[0]?.name : ''}
        fileSize={formData.videos.length > 0 ? formData.videos[0]?.size : 0}
        onClose={() => reset()}
        onRetry={() => {
          reset();
          handleSubmit({ preventDefault: () => {} });
        }}
        onCancel={() => {
          reset();
          setLoading(false);
        }}
      />
    </div>
  );
} 