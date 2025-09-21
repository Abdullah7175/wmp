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
import { MapPin, Image as ImageIcon, Upload, X, Eye } from 'lucide-react';

const validationSchema = Yup.object({
    workRequestId: Yup.number().required('Work Request ID is required'),
    description: Yup.string().required('Description is required'),
});

const ImageForm = () => {
    const params = useParams()
    const imageId = params.id;
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [imageData, setImageData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    useEffect(() => {
        const fetchImage = async () => {
            if (imageId) {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/images?id=${imageId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setImageData(data);
                        setPreviewUrl(data.link);
                    } else {
                        toast({
                            title: "Failed to fetch image data",
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching image data:', error);
                    toast({
                        title: "Error fetching image data",
                        variant: 'destructive'
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchImage();
    }, [imageId, toast]);

    const formik = useFormik({
        initialValues: {
            workRequestId: imageData?.work_request_id || '',
            description: imageData?.description || '',
            latitude: imageData?.geo_tag ? JSON.parse(imageData.geo_tag).coordinates[1] : '',
            longitude: imageData?.geo_tag ? JSON.parse(imageData.geo_tag).coordinates[0] : '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                
                const formData = new FormData();
                formData.append('id', imageId);
                formData.append('workRequestId', values.workRequestId);
                formData.append('description', values.description);
                formData.append('latitude', values.latitude);
                formData.append('longitude', values.longitude);
                
                if (selectedFile) {
                    formData.append('file', selectedFile);
                }

                const response = await fetch(`/api/images`, {
                    method: 'PUT',
                    body: formData,
                });

                if (response.ok) {
                    toast({
                        title: "Image updated successfully",
                        variant: 'default',
                    });
                    router.push('/dashboard/images');
                } else {
                    const errorData = await response.json();
                    toast({
                        title: "Failed to update image",
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
        setPreviewUrl(imageData?.link || null);
    };

    if (loading && !imageData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading image data...</p>
                </div>
            </div>
        );
    }

    if (!imageData) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Image Not Found</h2>
                <p className="text-gray-600 mb-4">The image you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/dashboard/images')}>
                    Back to Images
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Image Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Image Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Image ID</Label>
                            <p className="text-lg font-semibold">#{imageData.id}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Work Request ID</Label>
                            <p className="text-lg font-semibold">#{imageData.work_request_id}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                            <p className="text-sm">{new Date(imageData.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                            <p className="text-sm">{imageData.updated_at ? new Date(imageData.updated_at).toLocaleDateString() : 'Never'}</p>
                        </div>
                    </div>
                    
                    {imageData.address && (
                        <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-600 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                Address
                            </Label>
                            <p className="text-sm">{imageData.address}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Current Image Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Image</CardTitle>
                </CardHeader>
                <CardContent>
                    {previewUrl ? (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <img
                                    src={previewUrl}
                                    alt="Current image"
                                    className="max-w-full max-h-96 rounded-lg shadow-md object-contain"
                                />
                            </div>
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
                            No image available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Edit Image Details</CardTitle>
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
                                placeholder="Enter image description"
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
                            <Label htmlFor="file">Replace Image File</Label>
                            <div className="space-y-4">
                                <Input
                                    id="file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                                {selectedFile && (
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center">
                                            <ImageIcon className="w-4 h-4 mr-2 text-blue-600" />
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
                                Leave empty to keep current image. Upload a new file to replace the existing image.
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/images')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Image'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ImageForm;