"use client"

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import Image from 'next/image';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

const validationSchema = Yup.object({
    workRequestId: Yup.number().required('Work Request ID is required'),
    description: Yup.string().required('Description is required'),
    img: Yup.mixed().required('Image file is required')
});

const ImageForm = ({ workRequestId: propWorkRequestId, onClose }) => {
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [workRequests, setWorkRequests] = useState([]);
    const [loadingWorkRequests, setLoadingWorkRequests] = useState(true);
    const [fileInputs, setFileInputs] = useState([]); // [{file, description, latitude, longitude}]
    const router = useRouter();
    const { data: session } = useSession();
    const [workRequestId, setWorkRequestId] = useState(propWorkRequestId || '');
    const [workRequestStatus, setWorkRequestStatus] = useState(null);
    const [isUploadAllowed, setIsUploadAllowed] = useState(true);

    useEffect(() => {
        const fetchWorkRequests = async () => {
            try {
                const response = await fetch('/api/requests');
                if (response.ok) {
                    const data = await response.json();
                    // Handle both array and object responses
                    const requestsArray = Array.isArray(data) ? data : (data.data || []);
                    setWorkRequests(requestsArray.map(request => ({
                        value: Number(request.id),
                        label: `${request.id}`
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
            const { description } = fileInputs[i];
            if (!description) {
                toast({ title: `Description is required for image #${i + 1}`, variant: 'destructive' });
                return;
            }
        }
        const formData = new FormData();
        formData.append('workRequestId', workRequestId);
        fileInputs.forEach((item, idx) => {
            formData.append('img', item.file);
            formData.append('description', item.description);
            formData.append('latitude', item.latitude || '0');
            formData.append('longitude', item.longitude || '0');
        });
        if (session?.user?.id) {
            formData.append('creator_id', session.user.id);
            formData.append('creator_type', 'agent');
        }
        try {
            const response = await fetch('/api/images', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                toast({
                    title: 'Image(s) uploaded successfully',
                    description: `Images added to work request ${workRequestId}`,
                    variant: 'success',
                });
                setIsSuccess(true);
            } else {
                const errorData = await response.json();
                toast({
                    title: 'Failed to upload image(s)',
                    description: errorData.error || 'Please try again.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: 'An error occurred',
                description: 'Unable to upload image(s).',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        if (isSuccess) {
            if (typeof onClose === 'function') {
                onClose();
            } else {
                router.push('/agent/images');
            }
        }
    }, [isSuccess, router, onClose]);

    return (
        <div className='container'>
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                {workRequestStatus === 'Completed' && !isUploadAllowed && (
                    <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">Uploads are disabled for completed requests. Only managers, admins, or Media cell editors can upload.</div>
                )}
                <fieldset disabled={!isUploadAllowed} style={{ opacity: isUploadAllowed ? 1 : 0.6 }}>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                        {!propWorkRequestId && (
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
                        )}
                        {propWorkRequestId && (
                            <input type="hidden" name="workRequestId" value={propWorkRequestId} />
                        )}
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
                                            <label className="block text-xs text-gray-600">Latitude (Optional)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={item.latitude}
                                                onChange={e => handleInputChange(idx, 'latitude', e.target.value)}
                                                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md"
                                                placeholder="Latitude (optional)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600">Longitude (Optional)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={item.longitude}
                                                onChange={e => handleInputChange(idx, 'longitude', e.target.value)}
                                                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md"
                                                placeholder="Longitude (optional)"
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
                </fieldset>
                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add Image(s)
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImageForm;