"use client";

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, Image, Video, X } from 'lucide-react';

const validationSchema = Yup.object({
  workRequestId: Yup.number().required('Work Request ID is required'),
  description: Yup.string().required('Description is required'),
  contentType: Yup.string().oneOf(['image', 'video']).required('Content type is required'),
  files: Yup.array().min(1, 'At least one file is required')
});

const AddBeforeContentForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const [workRequests, setWorkRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileInputs, setFileInputs] = useState([{ file: null, description: '', latitude: '', longitude: '' }]);

  useEffect(() => {
    fetchWorkRequests();
  }, []);

  const fetchWorkRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        setWorkRequests(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Error fetching work requests:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      workRequestId: '',
      description: '',
      contentType: 'image',
      files: []
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('work_request_id', values.workRequestId);
        formData.append('description', values.description);
        formData.append('content_type', values.contentType);

        fileInputs.forEach((input, index) => {
          if (input.file) {
            formData.append('files', input.file);
            formData.append(`descriptions`, input.description);
            formData.append(`latitudes`, input.latitude);
            formData.append(`longitudes`, input.longitude);
          }
        });

        const response = await fetch('/api/before-content', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Before content uploaded successfully",
          });
          router.push('/dashboard');
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.message || "Failed to upload before content",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error uploading before content:', error);
        toast({
          title: "Error",
          description: "An error occurred while uploading",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const addFileInput = () => {
    setFileInputs([...fileInputs, { file: null, description: '', latitude: '', longitude: '' }]);
  };

  const removeFileInput = (index) => {
    if (fileInputs.length > 1) {
      setFileInputs(fileInputs.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (index, file) => {
    if (!file) return;
    
    // Validate file size based on content type
    const contentType = formik.values.contentType;
    const maxSize = contentType === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024; // 100MB for videos, 5MB for images
    const maxSizeMB = contentType === 'video' ? '100MB' : '5MB';
    
    if (file.size > maxSize) {
      toast({
        title: "Invalid File",
        description: `File size exceeds limit. Maximum allowed: ${maxSizeMB}`,
        variant: "destructive",
      });
      return;
    }
    
    const newFileInputs = [...fileInputs];
    newFileInputs[index].file = file;
    setFileInputs(newFileInputs);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {formik.values.contentType === 'image' ? (
              <Image className="w-5 h-5 mr-2" />
            ) : (
              <Video className="w-5 h-5 mr-2" />
            )}
            Add Before Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Work Request Selection */}
            <div className="space-y-2">
              <Label htmlFor="workRequestId">Work Request *</Label>
              <Select
                value={formik.values.workRequestId}
                onValueChange={(value) => formik.setFieldValue('workRequestId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a work request" />
                </SelectTrigger>
                <SelectContent>
                  {workRequests.map((request) => (
                    <SelectItem key={request.id} value={request.id.toString()}>
                      #{request.id} - {request.address || 'No address'} - {request.complaint_type || 'No type'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.errors.workRequestId && formik.touched.workRequestId && (
                <div className="text-red-600 text-sm">{formik.errors.workRequestId}</div>
              )}
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type *</Label>
              <Select
                value={formik.values.contentType}
                onValueChange={(value) => formik.setFieldValue('contentType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              {formik.errors.contentType && formik.touched.contentType && (
                <div className="text-red-600 text-sm">{formik.errors.contentType}</div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Enter description for the before content..."
                rows={3}
              />
              {formik.errors.description && formik.touched.description && (
                <div className="text-red-600 text-sm">{formik.errors.description}</div>
              )}
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Files *</Label>
                <Button type="button" onClick={addFileInput} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Add File
                </Button>
              </div>

              {fileInputs.map((input, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">File {index + 1}</h4>
                    {fileInputs.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeFileInput(index)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`file-${index}`}>
                        {formik.values.contentType === 'image' ? 'Image File' : 'Video File'} *
                      </Label>
                      <Input
                        id={`file-${index}`}
                        type="file"
                        accept={formik.values.contentType === 'image' ? 'image/*' : 'video/*'}
                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`description-${index}`}>File Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={input.description}
                        onChange={(e) => {
                          const newFileInputs = [...fileInputs];
                          newFileInputs[index].description = e.target.value;
                          setFileInputs(newFileInputs);
                        }}
                        placeholder="Optional description for this file"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`latitude-${index}`}>Latitude</Label>
                        <Input
                          id={`latitude-${index}`}
                          type="number"
                          step="any"
                          value={input.latitude}
                          onChange={(e) => {
                            const newFileInputs = [...fileInputs];
                            newFileInputs[index].latitude = e.target.value;
                            setFileInputs(newFileInputs);
                          }}
                          placeholder="Optional latitude"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`longitude-${index}`}>Longitude</Label>
                        <Input
                          id={`longitude-${index}`}
                          type="number"
                          step="any"
                          value={input.longitude}
                          onChange={(e) => {
                            const newFileInputs = [...fileInputs];
                            newFileInputs[index].longitude = e.target.value;
                            setFileInputs(newFileInputs);
                          }}
                          placeholder="Optional longitude"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Before Content'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBeforeContentForm;