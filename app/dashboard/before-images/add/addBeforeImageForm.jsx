"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Upload, MapPin, Plus, Trash2, X, Image as ImageIcon, Video } from 'lucide-react';
import Image from 'next/image';

export default function AddBeforeContentForm({ workRequestId, onClose }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locationAccess, setLocationAccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(workRequestId || '');
  const [formData, setFormData] = useState({
    description: '',
    latitude: '',
    longitude: '',
    content: []
  });

  // Fetch requests if no workRequestId provided
  useEffect(() => {
    if (!workRequestId && session?.user) {
      fetch('/api/requests?limit=1000')
        .then(res => res.json())
        .then(({ data }) => {
          if (Array.isArray(data)) {
            setRequests(data);
          }
        })
        .catch(error => {
          console.error('Error fetching requests:', error);
          toast({
            title: "Error loading requests",
            description: 'Failed to load work requests. Please try again.',
            variant: 'destructive',
          });
        });
    }
  }, [workRequestId, session?.user, toast]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setLocationAccess(true);
          setLocationLoading(false);
          toast({
            title: "Location captured successfully",
            variant: 'success',
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          toast({
            title: "Location access denied",
            description: 'Please enter coordinates manually or try again.',
            variant: 'destructive',
          });
        }
      );
    } else {
      setLocationLoading(false);
      toast({
        title: "Geolocation not supported",
        description: 'Please enter coordinates manually.',
        variant: 'destructive',
      });
    }
  };

  const handleContentUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? maxVideoSize : maxImageSize;
      const maxSizeMB = isVideo ? '100MB' : '5MB';
      
      if (file.size > maxSize) {
        invalidFiles.push({ name: file.name, maxSize: maxSizeMB });
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Size",
        description: `${invalidFiles.length} file(s) exceed size limit. Maximum allowed: ${invalidFiles[0].maxSize}`,
        variant: "destructive",
      });
      e.target.value = ''; // Clear the input
      return;
    }
    
    const newContent = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      description: '',
      contentType: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, ...newContent]
    }));
  };

  const removeContent = (contentId) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter(item => item.id !== contentId)
    }));
  };

  const updateContentDescription = (contentId, description) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map(item => 
        item.id === contentId ? { ...item, description } : item
      )
    }));
  };

  const uploadContentToServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'before-content');

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload failed:', response.status, errorData);
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      return { link: result.link, contentType: result.contentType };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.content.length === 0) {
      toast({
        title: "No content selected",
        description: 'Please select at least one image or video to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedRequestId) {
      toast({
        title: "No request selected",
        description: 'Please select a work request to attach the content to.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const uploadedContent = [];
      
      // Upload main content
      const mainContent = formData.content[0];
      const mainContentResult = await uploadContentToServer(mainContent.file);
      uploadedContent.push({
        link: mainContentResult.link,
        contentType: mainContentResult.contentType,
        description: mainContent.description || formData.description
      });

      // Upload additional content
      for (let i = 1; i < formData.content.length; i++) {
        const content = formData.content[i];
        const contentResult = await uploadContentToServer(content.file);
        uploadedContent.push({
          link: contentResult.link,
          contentType: contentResult.contentType,
          description: content.description || ''
        });
      }

      const response = await fetch('/api/before-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workRequestId: selectedRequestId,
          description: formData.description,
          link: uploadedContent[0].link,
          contentType: uploadedContent[0].contentType,
          latitude: formData.latitude || '0',
          longitude: formData.longitude || '0',
          additionalContent: uploadedContent.slice(1)
        }),
      });

      if (response.ok) {
        toast({
          title: "Before content uploaded successfully",
          description: 'Your before content has been uploaded.',
          variant: 'success',
        });
        onClose();
      } else {
        throw new Error('Failed to upload before content');
      }
    } catch (error) {
      console.error('Error uploading before content:', error);
      toast({
        title: "Upload failed",
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Before Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Work Request Selection */}
            {!workRequestId && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Work Request *
                </label>
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a work request...</option>
                  {requests.map((request) => (
                    <option key={request.id} value={request.id}>
                      #{request.id} - {request.address || 'No address'} ({request.complaint_type || 'No type'})
                    </option>
                  ))}
                </select>
                {requests.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">No work requests available</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the before content..."
                rows={3}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Location (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                />
                <Input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="mt-2"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {locationLoading ? 'Getting Location...' : 'Get Current Location'}
              </Button>
              {locationAccess && (
                <p className="mt-2 text-sm text-green-600">Location access granted</p>
              )}
            </div>

            {/* Content Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Before Content (Images & Videos) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleContentUpload}
                  className="hidden"
                  id="content-upload"
                />
                <label
                  htmlFor="content-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload images and videos or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    Images: PNG, JPG, JPEG, GIF, WebP up to 10MB each<br/>
                    Videos: MP4, AVI, MOV, WMV, WebM up to 100MB each
                  </span>
                </label>
              </div>
            </div>

            {/* Content Preview */}
            {formData.content.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Selected Content ({formData.content.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.content.map((item, index) => (
                    <div key={item.id} className="relative border rounded-lg p-3">
                      <div className="relative">
                        {item.contentType === 'video' ? (
                          <video
                            src={item.preview}
                            className="w-full h-32 object-cover rounded"
                            controls
                          />
                        ) : (
                          <Image
                            src={item.preview}
                            alt={`Before content ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded"
                          />
                        )}
                        <div className="absolute top-2 left-2">
                          {item.contentType === 'video' ? (
                            <Video className="w-4 h-4 text-white bg-black bg-opacity-50 rounded p-1" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-white bg-black bg-opacity-50 rounded p-1" />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeContent(item.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <Input
                          placeholder={`${item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)} description (optional)`}
                          value={item.description}
                          onChange={(e) => updateContentDescription(item.id, e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || formData.content.length === 0 || !selectedRequestId}
              >
                {loading ? 'Uploading...' : `Upload ${formData.content.length} Item${formData.content.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
