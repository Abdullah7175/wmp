"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Upload, X, Video, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { UploadProgressCard } from "@/components/UploadProgressCard";

export default function EditFinalVideoPage({ params }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const videoId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    workRequestId: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  // File upload hook
  const { uploading, progress, uploadStatus, error, uploadFile, reset } = useFileUpload();

  useEffect(() => {
    const fetchVideo = async () => {
      if (videoId) {
        try {
          setLoading(true);
          const response = await fetch(`/api/final-videos?id=${videoId}`);
          if (response.ok) {
            const data = await response.json();
            setVideoData(data);
            setPreviewUrl(data.link);
            setFormData({
              workRequestId: data.work_request_id || "",
              description: data.description || "",
              latitude: data.latitude || "",
              longitude: data.longitude || "",
            });
          } else {
            toast({
              title: "Failed to fetch video data",
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Error fetching video data:', error);
          toast({
            title: "Error fetching video data",
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVideo();
  }, [videoId, toast]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.workRequestId || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
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

    setSaving(true);
    
    try {
      const data = new FormData();
      data.append("id", videoId);
      data.append("workRequestId", formData.workRequestId);
      data.append("description", formData.description);
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      
      // Only append file if a new one is selected
      if (selectedFile) {
        data.append("videoFile", selectedFile);
      }

      const response = await fetch("/api/final-videos", {
        method: "PUT",
        body: data
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Final video updated successfully!",
          variant: "success"
        });
        
        // Redirect back to final videos list
        window.location.href = "/dashboard/final-videos";
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update final video");
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update final video",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center h-96 text-lg">Loading video data...</div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Video Not Found</div>
            <div className="text-gray-600 mb-4">The video you're looking for doesn't exist.</div>
            <Link href="/dashboard/final-videos">
              <Button>Back to Final Videos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/final-videos" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Final Videos
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Edit Final Video</h1>
        <p className="text-gray-600">
          Update the final video information
        </p>
      </div>

      <Card className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="workRequestId" className="block text-sm font-medium text-gray-700 mb-2">
                Work Request ID *
              </Label>
              <Input
                type="number"
                id="workRequestId"
                value={formData.workRequestId}
                onChange={(e) => setFormData(prev => ({ ...prev, workRequestId: e.target.value }))}
                placeholder="Enter work request ID"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Location Coordinates (Optional)
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {gettingLocation ? "Getting..." : "Get Location"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude (Optional)
              </Label>
              <Input
                type="number"
                id="latitude"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="Enter latitude"
              />
            </div>

            <div>
              <Label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude (Optional)
              </Label>
              <Input
                type="number"
                id="longitude"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="Enter longitude"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter video description"
              rows={4}
              required
            />
          </div>

          {/* Current Video Preview */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Current Video
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {previewUrl && (
                <div className="space-y-2">
                  <video 
                    src={previewUrl} 
                    controls 
                    className="w-full max-w-md h-48 object-cover rounded"
                  />
                  <p className="text-sm text-gray-600">
                    Current video file
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* New Video Upload */}
          <div>
            <Label htmlFor="videoFile" className="block text-sm font-medium text-gray-700 mb-2">
              Replace Video File (Optional)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                id="videoFile"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="videoFile"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to select a new video file
                </span>
                <span className="text-xs text-gray-500">
                  Leave empty to keep current video
                </span>
              </label>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-blue-700">
                        ({formatFileSize(selectedFile.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(videoData.link);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Update Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Updated by:</span>
                <span className="ml-2 font-medium">{session?.user?.name || "Loading..."}</span>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <span className="ml-2 font-medium">{session?.user?.role || "Loading..."}</span>
              </div>
              <div>
                <span className="text-gray-600">Update Type:</span>
                <span className="ml-2 font-medium">admin_update</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/final-videos">
              <Button
                type="button"
                variant="outline"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
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
        fileName={selectedFile?.name || ''}
        fileSize={selectedFile?.size || 0}
        onClose={() => reset()}
        onRetry={() => {
          reset();
          handleSubmit({ preventDefault: () => {} });
        }}
        onCancel={() => {
          reset();
          setSaving(false);
        }}
      />
    </div>
  );
}
