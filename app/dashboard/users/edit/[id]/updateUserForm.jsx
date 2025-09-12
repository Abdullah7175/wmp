"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUserContext } from './UserContext';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters'),
    contact: Yup.string()
        .required('Number is required')
        .min(11, 'Number must be 11 digits'),
    role: Yup.number()
        .required('Role is required')
        .min(1, 'Please select a role'),
});

const UserForm = () => {
    const params = useParams()
    const userId = params.id;
    const { user, updateUser } = useUserContext();
    const { toast } = useToast();
    const [initialValues, setInitialValues] = useState({
        name: '',
        email: '',
        password: '',
        contact: '',
        role: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                try {
                    const response = await fetch(`/api/users?id=${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setInitialValues({
                            name: data.name,
                            email: data.email,
                            password: '',
                            contact: data.contact_number,
                            role: data.role,
                            image: data.image
                        });
                        if (data.image) {
                            setPreviewImage(data.image);
                        }
                    } else {
                        toast({
                            title: "Failed to fetch user data",
                            description: '',
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    toast({
                        title: "Error fetching user data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };

        fetchUser();
    }, [userId, toast]);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('id', userId);
            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('contact', values.contact);
            formData.append('role', values.role);
            
            // Only append password if it was changed
            if (values.password) {
                formData.append('password', values.password);
            }
            
            if (values.image && typeof values.image !== 'string') {
                formData.append('image', values.image);
            }

            try {
                const response = await fetch(`/api/users`, {
                    method: 'PUT',
                    body: formData,
                });

                if (response.ok) {
                    toast({
                        title: "User updated successfully",
                        description: '',
                        variant: 'success',
                    });
                    router.push('/dashboard/users'); 
                } else {
                    const errorData = await response.json();
                    toast({
                        title: "Failed to update user",
                        description: errorData.error || '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while processing the user",
                    description: '',
                    variant: 'destructive'
                });
            }
        },
    });

    const handleImageChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            formik.setFieldValue('image', file);
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='container'>
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                {/* Image Upload */}
                <div>
                    <label htmlFor="image" className="block text-gray-700 text-sm font-medium mb-2">
                        Profile Image
                    </label>
                    <div className="flex items-center space-x-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300">
                        {previewImage ? (
                            <Image 
                            src={previewImage} 
                            alt="Preview" 
                            width={80}  
                            height={80} 
                            className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No image</span>
                            </div>
                        )}
                        </div>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <label 
                            htmlFor="image"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-sm"
                        >
                            Change Image
                        </label>
                    </div>
                </div>

                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-medium">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.name}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.name && formik.touched.name && <div className="text-red-600 text-sm mt-2">{formik.errors.name}</div>}
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.email && formik.touched.email && <div className="text-red-600 text-sm mt-2">{formik.errors.email}</div>}
                </div>

                {/* Contact Field */}
                <div>
                    <label htmlFor="contact" className="block text-gray-700 text-sm font-medium">Contact</label>
                    <input
                        id="contact"
                        name="contact"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.contact}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.contact && formik.touched.contact && <div className="text-red-600 text-sm mt-2">{formik.errors.contact}</div>}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            onChange={formik.handleChange}
                            value={formik.values.password}
                            placeholder="Leave blank to keep current password"
                            className="mt-1 block w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 mt-1"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {formik.errors.password && formik.touched.password && <div className="text-red-600 text-sm mt-2">{formik.errors.password}</div>}
                </div>

                {/* Role Field */}
                <div>
                    <label htmlFor="role" className="block text-gray-700 text-sm font-medium">Role</label>
                    <select
                        id="role"
                        name="role"
                        onChange={formik.handleChange}
                        value={formik.values.role}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a role</option>
                        <option value="1">Admin</option>
                        <option value="2">Manager</option>
                        <option value="3">User</option>
                    </select>
                    {formik.errors.role && formik.touched.role && <div className="text-red-600 text-sm mt-2">{formik.errors.role}</div>}
                </div>

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Update User
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;