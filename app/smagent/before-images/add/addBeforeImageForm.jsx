"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Upload, MapPin, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';

export default function AddBeforeImageForm({ workRequestId, onClose }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locationAccess, setLocationAccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    latitude: '',
    longitude: '',
    images: []
  });

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (file.size > maxImageSize) {
        invalidFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Size",
        description: `${invalidFiles.length} image(s) exceed size limit. Maximum allowed: 5MB`,
        variant: "destructive",
      });
      e.target.value = ''; // Clear the input
      return;
    }
    
    const newImages = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      description: ''
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const updateImageDescription = (imageId, description) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === imageId ? { ...img, description } : img
      )
    }));
  };

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'before-image');

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
      return result.link;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast({
        title: "No images selected",
        description: 'Please select at least one image to upload.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Upload images directly to before-images API (similar to other upload forms)
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i];
        
        const data = new FormData();
        data.append("workRequestId", workRequestId);
        data.append("description", image.description || formData.description || '');
        data.append("img", image.file);
        data.append("latitude", formData.latitude || '0');
        data.append("longitude", formData.longitude || '0');
        data.append("creator_id", session.user.id);
        data.append("creator_type", "socialmedia");

        const response = await fetch('/api/before-images', {
          method: 'POST',
          body: data,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }
      }

      toast({
        title: "Before images uploaded successfully",
        description: 'Your before images have been uploaded.',
        variant: 'success',
      });
      onClose();
    } catch (error) {
      console.error('Error uploading before images:', error);
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
            Upload Before Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the before images..."
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Before Images *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload before images or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, JPEG up to 10MB each
                  </span>
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Selected Images ({formData.images.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={image.id} className="relative border rounded-lg p-3">
                      <div className="relative">
                        <Image
                          src={image.preview}
                          alt={`Before image ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <Input
                          placeholder="Image description (optional)"
                          value={image.description}
                          onChange={(e) => updateImageDescription(image.id, e.target.value)}
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
                disabled={loading || formData.images.length === 0}
              >
                {loading ? 'Uploading...' : `Upload ${formData.images.length} Image${formData.images.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
