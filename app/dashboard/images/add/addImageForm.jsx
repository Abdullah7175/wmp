"use client"

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import Image from 'next/image';
import * as Yup from 'yup';
import { useImageContext } from '../ImageContext';
import { useToast } from "@/hooks/use-toast";
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useFileUpload } from "@/hooks/useFileUpload";
import { UploadProgressCard } from "@/components/UploadProgressCard";

const validationSchema = Yup.object({
    workRequestId: Yup.number().required('Work Request ID is required'),
    description: Yup.string().required('Description is required'),
    img: Yup.mixed().required('Image file is required')
});

const ImageForm = () => {
    const { image, updateImage } = useImageContext();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [preview, setPreview] = useState(null);
    const [size, setSize] = useState(null);
    const [workRequests, setWorkRequests] = useState([]);
    const [loadingWorkRequests, setLoadingWorkRequests] = useState(true);
    const [fileInputs, setFileInputs] = useState([]);
    const router = useRouter();
    const session = useSession();
    const [workRequestStatus, setWorkRequestStatus] = useState(null);
    const [isUploadAllowed, setIsUploadAllowed] = useState(true);

    // File upload hook
    const { uploading, progress, uploadStatus, error, uploadFile, reset } = useFileUpload();

    useEffect(() => {
        const fetchWorkRequests = async () => {
            try {
                const response = await fetch('/api/requests');
                if (response.ok) {
                    const data = await response.json();
                    console.log('API Response:', data); // Debug log
                    // Handle both array and object responses - Fixed data.map error
                    const requestsArray = Array.isArray(data) ? data : (data.data || []);
                    console.log('Processed requests:', requestsArray); // Debug log
                    setWorkRequests(requestsArray.map(request => ({
                        value: Number(request.id),
                        label: `#${request.id} - ${request.description || 'No description'} (${request.status_name || 'Unknown Status'})`
                    })));
                }
            } catch (error) {
                console.error('Error fetching work requests:', error);
                toast({
                    title: 'Failed to load work requests',
                    description: 'Please try again later',
                    variant: 'destructive',
                });
            } finally {
                setLoadingWorkRequests(false);
            }
        };

        fetchWorkRequests();
    }, [toast]);

    const [workRequestId, setWorkRequestId] = useState(image?.workRequestId || '');

    // Fetch status when workRequestId changes
    useEffect(() => {
        if (!workRequestId) return;
        fetch(`/api/requests?id=${workRequestId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.status_name) {
                    setWorkRequestStatus(data.status_name);
                    // Check permission
                    const userType = session?.user?.userType;
                    const role = Number(session?.user?.role);
                    if (data.status_name === 'Completed') {
                        // Allow uploads for admins (role 1), managers (role 2), and Media Cell editors
                        if (
                            (userType === 'user' && (role === 1 || role === 2)) ||
                            (userType === 'socialmedia' && session?.user?.role === 'editor')
                        ) {
                            setIsUploadAllowed(true);
                        } else {
                            setIsUploadAllowed(false);
                        }
                    } else {
                        setIsUploadAllowed(true);
                    }
                }
            });
    }, [workRequestId, session]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const errors = [];

        files.forEach(file => {
            // Validate file size (5MB max for images)
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`${file.name}: File size exceeds limit. Maximum allowed: 5MB`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            toast({
                title: "Invalid Files",
                description: errors.join('\n'),
                variant: "destructive",
            });
        }

        setFileInputs(validFiles.map(file => ({
            file,
            description: '',
            latitude: '',
            longitude: ''
        })));
    };

    const handleInputChange = (idx, field, value) => {
        setFileInputs(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!workRequestId) {
            toast({ title: 'Work Request is required', variant: 'destructive' });
            return;
        }
        if (fileInputs.length === 0) {
            toast({ title: 'Please select at least one image', variant: 'destructive' });
            return;
        }
        for (let i = 0; i < fileInputs.length; i++) {
            const { description, latitude, longitude } = fileInputs[i];
            if (!description || !latitude || !longitude) {
                toast({ title: `All fields are required for image #${i + 1}`, variant: 'destructive' });
                return;
            }
        }
        try {
            // Upload images one by one with progress tracking
            for (let i = 0; i < fileInputs.length; i++) {
                const item = fileInputs[i];
                
                const data = new FormData();
                data.append('workRequestId', workRequestId);
                data.append('img', item.file);
                data.append('description', item.description);
                data.append('latitude', item.latitude);
                data.append('longitude', item.longitude);

                await uploadFile(item.file, '/api/images', data, {
                    onProgress: (progress) => {
                        // Calculate overall progress across all files
                        const overallProgress = Math.round(((i + progress / 100) / fileInputs.length) * 100);
                        console.log(`Uploading ${item.file.name}: ${overallProgress}%`);
                    },
                    onSuccess: (response) => {
                        console.log(`Successfully uploaded ${item.file.name}`);
                    },
                    onError: (error) => {
                        console.error(`Failed to upload ${item.file.name}:`, error);
                        throw error;
                    }
                });
            }
            
                toast({
                    title: 'Image(s) uploaded successfully',
                    description: `Images added to work request ${workRequestId}`,
                    variant: 'success',
                });
                setIsSuccess(true);
            reset(); // Reset upload progress
            
        } catch (error) {
            console.error('Upload error:', error);
                toast({
                    title: 'Failed to upload image(s)',
                description: error.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        if (isSuccess) {
            router.push('/dashboard/images');
        }
    }, [isSuccess, router]);

    return (
        <div className='container'>
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                {workRequestStatus === 'Completed' && !isUploadAllowed && (
                    <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">Uploads are disabled for completed requests. Only managers, admins, or Media Cell editors can upload.</div>
                )}
                <fieldset disabled={!isUploadAllowed} style={{ opacity: isUploadAllowed ? 1 : 0.6 }}>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label htmlFor="workRequestId" className="block text-gray-700 text-sm font-medium">
                                Work Request
                            </label>
                            <select
                                id="workRequestId"
                                name="workRequestId"
                                value={workRequestId}
                                onChange={e => setWorkRequestId(Number(e.target.value))}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select a work request...</option>
                                {workRequests.map((req) => (
                                    <option key={req.value} value={req.value}>
                                        {req.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="img" className="block text-gray-700 text-sm font-medium">Upload Images</label>
                        <input
                            id="img"
                            name="img"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="mt-1"
                        />
                    </div>
                    {fileInputs.length > 0 && (
                        <div className="space-y-6">
                            {fileInputs.map((item, idx) => (
                                <div key={idx} className="border rounded-md p-4 bg-gray-50">
                                    <div className="font-medium mb-2">Image {idx + 1}: {item.file.name} ({Math.round(item.file.size / 1024)} KB)</div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600">Description</label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={e => handleInputChange(idx, 'description', e.target.value)}
                                                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md"
                                                placeholder="Enter description"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600">Latitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={item.latitude}
                                                onChange={e => handleInputChange(idx, 'latitude', e.target.value)}
                                                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md"
                                                placeholder="Latitude"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600">Longitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={item.longitude}
                                                onChange={e => handleInputChange(idx, 'longitude', e.target.value)}
                                                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md"
                                                placeholder="Longitude"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex items-center gap-2"
                                            onClick={() => {
                                                if (!navigator.geolocation) {
                                                    toast({ title: 'Geolocation not supported', variant: 'destructive' });
                                                    return;
                                                }
                                                navigator.geolocation.getCurrentPosition(
                                                    (position) => {
                                                        handleInputChange(idx, 'latitude', position.coords.latitude);
                                                        handleInputChange(idx, 'longitude', position.coords.longitude);
                                                        toast({
                                                            title: 'Location captured',
                                                            description: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`,
                                                            variant: 'success',
                                                        });
                                                    },
                                                    (error) => {
                                                        toast({
                                                            title: 'Geolocation error',
                                                            description: error.message,
                                                            variant: 'destructive',
                                                        });
                                                    }
                                                );
                                            }}
                                        >
                                            <MapPin className="w-4 h-4" /> Get Location
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className='flex justify-end'>
                        <button
                            type="submit"
                            className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Add Image(s)
                        </button>
                    </div>
                </fieldset>
            </form>

            {/* Upload Progress Card */}
            <UploadProgressCard
                isVisible={uploading}
                uploading={uploading}
                progress={progress}
                uploadStatus={uploadStatus}
                error={error}
                fileName={fileInputs.length > 0 ? fileInputs[0]?.file?.name : ''}
                fileSize={fileInputs.length > 0 ? fileInputs[0]?.file?.size : 0}
                onClose={() => reset()}
                onRetry={() => {
                    reset();
                    handleSubmit({ preventDefault: () => {} });
                }}
                onCancel={() => {
                    reset();
                }}
            />
        </div>
    );
};

export default ImageForm;