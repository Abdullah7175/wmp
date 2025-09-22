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
import { Upload, Image, Video, X, Save } from 'lucide-react';

const validationSchema = Yup.object({
  description: Yup.string().required('Description is required'),
});

const EditBeforeContentForm = ({ contentId }) => {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [workRequests, setWorkRequests] = useState([]);

  useEffect(() => {
    fetchContentData();
    fetchWorkRequests();
  }, [contentId]);

  const fetchContentData = async () => {
    try {
      const response = await fetch(`/api/before-content?id=${contentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setContentData(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching content data:', error);
      toast({
        title: "Error",
        description: "Failed to load content data",
        variant: "destructive",
      });
    }
  };

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
      description: '',
      workRequestId: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/before-content/${contentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: values.description,
            workRequestId: values.workRequestId,
          }),
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Before content updated successfully",
          });
          router.push('/dashboard/before-images');
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.message || "Failed to update before content",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error updating before content:', error);
        toast({
          title: "Error",
          description: "An error occurred while updating",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Update form values when contentData is loaded
  useEffect(() => {
    if (contentData) {
      formik.setValues({
        description: contentData.description || '',
        workRequestId: contentData.work_request_id || '',
      });
    }
  }, [contentData]);

  if (!contentData) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading content data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Before Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Current Content Preview */}
            <div className="space-y-2">
              <Label>Current Content</Label>
              <div className="border rounded-lg p-4">
                {contentData.content_type === 'video' ? (
                  <video
                    src={contentData.link}
                    className="w-full h-48 object-cover rounded"
                    controls
                  />
                ) : (
                  <img
                    src={contentData.link}
                    alt={contentData.description || 'Before content'}
                    className="w-full h-48 object-cover rounded"
                  />
                )}
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Type:</strong> {contentData.content_type}</p>
                  <p><strong>Work Request:</strong> #{contentData.work_request_id}</p>
                  <p><strong>Created:</strong> {new Date(contentData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Work Request Selection */}
            <div className="space-y-2">
              <Label htmlFor="workRequestId">Work Request *</Label>
              <Select
                value={formik.values.workRequestId}
                onValueChange={(value) => formik.setFieldValue('workRequestId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work request" />
                </SelectTrigger>
                <SelectContent>
                  {workRequests.map((request) => (
                    <SelectItem key={request.id} value={request.id.toString()}>
                      #{request.id} - {request.description?.substring(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.workRequestId && formik.errors.workRequestId && (
                <p className="text-sm text-red-600">{formik.errors.workRequestId}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter description for this content"
                rows={4}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-600">{formik.errors.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/before-images')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formik.isValid}>
                {loading ? 'Updating...' : 'Update Content'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBeforeContentForm;
