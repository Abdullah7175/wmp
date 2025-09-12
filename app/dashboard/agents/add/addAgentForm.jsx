"use client"

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAgentContext } from './AgentContext';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from 'lucide-react';


const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    designation: Yup.string()
        .min(3, 'Address must be at least 3 characters'),
    contact: Yup.number()
        .min(11, 'Number must be 11 digits'),
    address: Yup.string()
        .min(3, 'Address must be at least 3 characters'),
    department: Yup.string()
        .min(3, 'Address must be at least 3 characters'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    town_id: Yup.number().required('Town is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    complaint_type_id: Yup.number().required('Department is required'),
    role: Yup.number().required('Role is required'),
    image: Yup.mixed(), // optional
});

const AgentForm = () => {
    const { agent, updateAgent } = useAgentContext();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [towns, setTowns] = useState([]);
    const [townsLoading, setTownsLoading] = useState(true);
    const [complaintTypes, setComplaintTypes] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    // Agent role options
    const agentRoles = [
        { value: 1, label: 'Executive Engineer' },
        { value: 2, label: 'Contractor' }
    ];

    useEffect(() => {
        setTownsLoading(true);
        fetch('/api/complaints/getinfo')
            .then(res => res.json())
            .then(data => {
                setTowns((data.towns || []).map(town => ({
                  id: town.id,
                  name: town.name || town.town || town.title || "Unnamed Town"
                })));
                setTownsLoading(false);
            })
            .catch(() => setTownsLoading(false));
    }, []);

    useEffect(() => {
        fetch('/api/complaints/getalltypes')
            .then(res => res.json())
            .then(data => setComplaintTypes(data));
    }, []);

    const formik = useFormik({
        initialValues: {
            name: agent.name || '',
            designation: agent.designation || '',
            contact: agent.contact || '',
            address: agent.address || '',
            department: agent.department || '',
            email: agent.email || '',
            town_id: '',
            password: '',
            complaint_type_id: '',
            role: '',
            image: null,
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            updateAgent(values);
            try {
                const formData = new FormData();
                for (const key in values) {
                    if (key !== 'image') {
                        if (key === 'role' || key === 'complaint_type_id') {
                          formData.append(key, Number(values[key]));
                        } else {
                          formData.append(key, values[key]);
                        }
                    }
                }
                if (values.image) {
                    formData.append('image', values.image);
                }

                const response = await fetch('/api/agents', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    toast({
                        title: "Agent added successfully",
                        description: '',
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    toast({
                        title: "Failed to add agent",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while adding the agent",
                    description: '',
                    variant: 'destructive',
                });
            }
        },
    });

    const handleImageChange = (e) => {
        formik.setFieldValue('image', e.currentTarget.files[0]);
    };

    if (isSuccess) {
        window.location.href = '/dashboard/agents';
    }


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
                    <label htmlFor="designation" className="block text-gray-700 text-sm font-medium">Designation</label>
                    <input
                        id="designation"
                        name="designation"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.designation}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.email && formik.touched.designation && <div className="text-red-600 text-sm mt-2">{formik.errors.designation}</div>}
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
                    <label htmlFor="address" classpassword="block text-gray-700 text-sm font-medium">Address</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.address}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.password && formik.touched.address && <div className="text-red-600 text-sm mt-2">{formik.errors.address}</div>}
                </div>

                <div>
                    <label htmlFor="department" classpassword="block text-gray-700 text-sm font-medium">Department</label>
                    <input
                        id="department"
                        name="department"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.department}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.password && formik.touched.department && <div className="text-red-600 text-sm mt-2">{formik.errors.department}</div>}
                </div>

                <div>
                    <label htmlFor="email" classpassword="block text-gray-700 text-sm font-medium">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.password && formik.touched.email && <div className="text-red-600 text-sm mt-2">{formik.errors.email}</div>}
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
                        {agentRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    {formik.errors.role && formik.touched.role && <div className="text-red-600 text-sm mt-2">{formik.errors.role}</div>}
                </div>

                <div>
                    <label htmlFor="town_id" className="block text-gray-700 text-sm font-medium">Town</label>
                    {townsLoading ? (
                      <div className="text-gray-500">Loading towns...</div>
                    ) : (
                      <select
                        id="town_id"
                        name="town_id"
                        onChange={formik.handleChange}
                        value={formik.values.town_id}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a town...</option>
                        {towns.map((town) => (
                            <option key={town.id} value={town.id}>
                                {town.name}
                            </option>
                        ))}
                      </select>
                    )}
                    {formik.errors.town_id && formik.touched.town_id && <div className="text-red-600 text-sm mt-2">{formik.errors.town_id}</div>}
                </div>

                <div>
                    <label htmlFor="complaint_type_id" className="block text-gray-700 text-sm font-medium">Department</label>
                    <select
                        id="complaint_type_id"
                        name="complaint_type_id"
                        onChange={formik.handleChange}
                        value={formik.values.complaint_type_id}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select...</option>
                        {complaintTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.type_name || type.name}
                            </option>
                        ))}
                    </select>
                    {formik.errors.complaint_type_id && formik.touched.complaint_type_id && <div className="text-red-600 text-sm mt-2">{formik.errors.complaint_type_id}</div>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            onChange={formik.handleChange}
                            value={formik.values.password}
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
                        Add Agent
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AgentForm;
