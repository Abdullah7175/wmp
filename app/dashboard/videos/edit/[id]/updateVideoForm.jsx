"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Video, Upload, X, Eye } from 'lucide-react';

const validationSchema = Yup.object({
    workRequestId: Yup.number().required('Work Request ID is required'),
    description: Yup.string().required('Description is required'),
});

const VideoForm = () => {
    const params = useParams()
    const videoId = params.id;
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [videoData, setVideoData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    useEffect(() => {
        const fetchVideo = async () => {
            if (videoId) {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/videos?id=${videoId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setVideoData(data);
                        setPreviewUrl(data.link);
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

    const formik = useFormik({
        initialValues: {
            workRequestId: videoData?.work_request_id || '',
            description: videoData?.description || '',
            latitude: videoData?.latitude || '',
            longitude: videoData?.longitude || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                
                const formData = new FormData();
                formData.append('id', videoId);
                formData.append('workRequestId', values.workRequestId);
                formData.append('description', values.description);
                formData.append('latitude', values.latitude);
                formData.append('longitude', values.longitude);
                
                if (selectedFile) {
                    formData.append('file', selectedFile);
                }

                const response = await fetch(`/api/videos`, {
                    method: 'PUT',
                    body: formData,
                });

                if (response.ok) {
                    toast({
                        title: "Video updated successfully",
                        variant: 'default',
                    });
                    router.push('/dashboard/videos');
                } else {
                    const errorData = await response.json();
                    toast({
                        title: "Failed to update video",
                        description: errorData.error || "An error occurred",
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred",
                    description: "Please try again",
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(videoData?.link || null);
    };

    if (loading && !videoData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading video data...</p>
                </div>
            </div>
        );
    }

    if (!videoData) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Video Not Found</h2>
                <p className="text-gray-600 mb-4">The video you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/dashboard/videos')}>
                    Back to Videos
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Video className="w-5 h-5 mr-2" />
                        Video Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Video ID</Label>
                            <p className="text-lg font-semibold">#{videoData.id}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Work Request ID</Label>
                            <p className="text-lg font-semibold">#{videoData.work_request_id}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                            <p className="text-sm">{new Date(videoData.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                            <p className="text-sm">{videoData.updated_at ? new Date(videoData.updated_at).toLocaleDateString() : 'Never'}</p>
                        </div>
                    </div>
                    
                    {videoData.address && (
                        <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-600 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                Address
                            </Label>
                            <p className="text-sm">{videoData.address}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Current Video Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Video</CardTitle>
                </CardHeader>
                <CardContent>
                    {previewUrl ? (
                        <div className="space-y-4">
                            <video
                                src={previewUrl}
                                controls
                                className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                                style={{ maxHeight: '400px' }}
                            />
                            <div className="text-center">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(previewUrl, '_blank')}
                                    className="mr-2"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Open in New Tab
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No video available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Edit Video Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Work Request ID */}
                        <div className="space-y-2">
                            <Label htmlFor="workRequestId">Work Request ID *</Label>
                            <Input
                                id="workRequestId"
                                name="workRequestId"
                                type="number"
                                value={formik.values.workRequestId}
                                onChange={formik.handleChange}
                                placeholder="Enter work request ID"
                            />
                            {formik.errors.workRequestId && formik.touched.workRequestId && (
                                <div className="text-red-600 text-sm">{formik.errors.workRequestId}</div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                placeholder="Enter video description"
                                rows={3}
                            />
                            {formik.errors.description && formik.touched.description && (
                                <div className="text-red-600 text-sm">{formik.errors.description}</div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    value={formik.values.latitude}
                                    onChange={formik.handleChange}
                                    placeholder="Optional latitude"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    value={formik.values.longitude}
                                    onChange={formik.handleChange}
                                    placeholder="Optional longitude"
                                />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="file">Replace Video File</Label>
                            <div className="space-y-4">
                                <Input
                                    id="file"
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                                {selectedFile && (
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Video className="w-4 h-4 mr-2 text-blue-600" />
                                            <span className="text-sm font-medium">{selectedFile.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={removeFile}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                Leave empty to keep current video. Upload a new file to replace the existing video.
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/videos')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Video'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoForm;