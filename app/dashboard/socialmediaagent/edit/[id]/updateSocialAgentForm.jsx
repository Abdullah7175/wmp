"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSocialAgentContext } from '../../SocialAgentContext';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    contact: Yup.number()
        .min(11, 'Number must be 11 digits'),
    address: Yup.string()
        .min(3, 'Address must be at least 3 characters'),
    role: Yup.number().required('Role is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .nullable(),
    image: Yup.mixed(),
});

const SocialAgentForm = () => {
    const params = useParams()
    const socialagentId = params.id;
    const { socialagent, updateSocialAgent } = useSocialAgentContext();
    const { toast } = useToast();
    const [initialValues, setInitialValues] = useState({
        name: '',
        email: '',
        contact: '',
        address: '',
        role: '',
        password: '',
    });
    const router = useRouter();

    // Social Media Agent role options
    const socialAgentRoles = [
        { value: 1, label: 'Camera Man' },
        { value: 2, label: 'Helper' },
        { value: 3, label: 'Photographer' },
        { value: 4, label: 'Video Editor' },
        { value: 5, label: 'Content Creator' },
        { value: 6, label: 'Social Media Manager' }
    ];

    useEffect(() => {
        const fetchAgent = async () => {
            if (socialagentId) {
                try {
                    const response = await fetch(`/api/socialmediaperson?id=${socialagentId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setInitialValues({
                            name: data.name,
                            email: data.email,
                            contact: data.contact_number,
                            address: data.address,
                            role: data.role,
                        });
                    } else {
                        toast({
                            title: "Failed to fetch Videographer data",
                            description: '',
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching Videographer  data:', error);
                    toast({
                        title: "Error fetching Videographer  data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };

        fetchAgent();
    }, [socialagentId, toast]);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                for (const key in values) {
                    if (key !== 'image') {
                        formData.append(key, values[key]);
                    }
                }
                if (values.image) {
                    formData.append('image', values.image);
                }

                const response = socialagentId
                    ? await fetch(`/api/socialmediaperson/${socialagentId}`, {
                        method: 'PUT',
                        body: formData,
                    })
                    : await fetch('/api/socialmediaperson', {
                        method: 'POST',
                        body: formData,
                    });

                if (response.ok) {
                    toast({
                        title: socialagentId ? "Videographer updated successfully" : "Videographer added successfully",
                        description: '',
                        variant: 'success',
                    });
                    router.push('/dashboard/socialmediaagent');
                } else {
                    toast({
                        title: socialagentId ? "Failed to update Videographer" : "Failed to add Videographer",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while processing the Videographer",
                    description: '',
                    variant: 'destructive'
                });
            }
        },
    });

    const handleImageChange = (e) => {
        formik.setFieldValue('image', e.currentTarget.files[0]);
    };

    return (
        <div className='container'>
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border" encType="multipart/form-data">
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

                <div>
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Password (optional)</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        onChange={formik.handleChange}
                        value={formik.values.password}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Leave blank to keep current password"
                    />
                    {formik.errors.password && formik.touched.password && <div className="text-red-600 text-sm mt-2">{formik.errors.password}</div>}
                </div>

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

                <div>
                    <label htmlFor="address" className="block text-gray-700 text-sm font-medium">Address</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.address}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.address && formik.touched.address && <div className="text-red-600 text-sm mt-2">{formik.errors.address}</div>}
                </div>

                <div>
                    <label htmlFor="role" className="block text-gray-700 text-sm font-medium">Role</label>
                    <select
                        id="role"
                        name="role"
                        onChange={formik.handleChange}
                        value={formik.values.role}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select a role...</option>
                        {socialAgentRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    {formik.errors.role && formik.touched.role && <div className="text-red-600 text-sm mt-2">{formik.errors.role}</div>}
                </div>

                <div>
                    <label htmlFor="image" className="block text-gray-700 text-sm font-medium">Image (optional)</label>
                    <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                    {formik.errors.image && formik.touched.image && <div className="text-red-600 text-sm mt-2">{formik.errors.image}</div>}
                </div>

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Update Media Agent
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocialAgentForm;
