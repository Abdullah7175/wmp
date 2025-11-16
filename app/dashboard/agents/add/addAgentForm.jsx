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
    company_name: Yup.string()
        .when('role', {
            is: 2, // Contractor
            then: (schema) => schema.required('Company name is required for contractors'),
            otherwise: (schema) => schema.nullable(true)
        }),
    location_type: Yup.string()
        .oneOf(['town', 'division'])
        .when('role', {
            is: 2, // Contractor
            then: (schema) => schema.nullable(true),
            otherwise: (schema) => schema.required('Assignment scope is required')
        }),
    town_id: Yup.number()
        .nullable()
        .when(['location_type', 'role'], {
            is: (location_type, role) => location_type === 'town' && role !== 2,
            then: (schema) => schema.typeError('Town is required').required('Town is required'),
            otherwise: (schema) => schema.nullable(true)
        }),
    division_id: Yup.number()
        .nullable()
        .when(['location_type', 'role'], {
            is: (location_type, role) => location_type === 'division' && role !== 2,
            then: (schema) => schema.typeError('Division is required').required('Division is required'),
            otherwise: (schema) => schema.nullable(true)
        }),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    complaint_type_id: Yup.number()
        .when('role', {
            is: 2, // Contractor
            then: (schema) => schema.nullable(true),
            otherwise: (schema) => schema.required('Department is required')
        }),
    role: Yup.number().required('Role is required'),
    image: Yup.mixed(), // optional
});

const AgentForm = () => {
    const { agent, updateAgent } = useAgentContext();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [towns, setTowns] = useState([]);
    const [townsLoading, setTownsLoading] = useState(true);
    const [divisions, setDivisions] = useState([]);
    const [divisionsLoading, setDivisionsLoading] = useState(true);
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
        setDivisionsLoading(true);
        fetch('/api/efiling/divisions?is_active=true')
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data?.divisions) ? data.divisions : [];
                setDivisions(list.map(division => ({
                    id: division.id,
                    name: division.name || division.code || 'Unnamed Division',
                })));
                setDivisionsLoading(false);
            })
            .catch(() => setDivisionsLoading(false));
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
            company_name: agent.company_name || '',
            town_id: '',
            division_id: '',
            location_type: 'town',
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
                formData.append('name', values.name);
                formData.append('designation', values.designation || '');
                formData.append('contact', values.contact || '');
                formData.append('address', values.address || '');
                formData.append('department', values.department || '');
                formData.append('email', values.email);
                formData.append('password', values.password);
                formData.append('role', Number(values.role));
                
                // Company name for contractors
                if (values.company_name) {
                    formData.append('company_name', values.company_name);
                }
                
                // Location fields (optional for contractors)
                if (values.location_type === 'town' && values.town_id) {
                    formData.append('town_id', Number(values.town_id));
                }
                if (values.location_type === 'division' && values.division_id) {
                    formData.append('division_id', Number(values.division_id));
                }
                
                // Department (optional for contractors)
                if (values.complaint_type_id) {
                    formData.append('complaint_type_id', Number(values.complaint_type_id));
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
                        title: "Engineer added successfully",
                        description: '',
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    toast({
                        title: "Failed to add Engineer",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while adding the Engineer",
                    description: '',
                    variant: 'destructive',
                });
            }
        },
    });

    const handleImageChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            // Validate file size (5MB max for profile images)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Invalid File",
                    description: "File size exceeds limit. Maximum allowed: 5MB",
                    variant: "destructive",
                });
                e.target.value = ''; // Clear the input
                return;
            }
            formik.setFieldValue('image', file);
        }
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
                        onChange={(e) => {
                            formik.handleChange(e);
                            // Reset location and department fields when switching to contractor
                            if (e.target.value === '2') {
                                formik.setFieldValue('location_type', '');
                                formik.setFieldValue('town_id', '');
                                formik.setFieldValue('division_id', '');
                                formik.setFieldValue('complaint_type_id', '');
                            }
                        }}
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

                {/* Company Name - Only for Contractors */}
                {formik.values.role === '2' && (
                    <div>
                        <label htmlFor="company_name" className="block text-gray-700 text-sm font-medium">Company Name *</label>
                        <input
                            id="company_name"
                            name="company_name"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.company_name}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter company name"
                        />
                        {formik.errors.company_name && formik.touched.company_name && <div className="text-red-600 text-sm mt-2">{formik.errors.company_name}</div>}
                    </div>
                )}

                {/* Location fields - Hidden for Contractors */}
                {formik.values.role !== '2' && (
                    <>
                        <div>
                            <span className="block text-gray-700 text-sm font-medium">Assignment Scope</span>
                            <div className="mt-2 flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="radio"
                                        name="location_type"
                                        value="town"
                                        checked={formik.values.location_type === 'town'}
                                        onChange={(e) => {
                                            formik.setFieldValue('location_type', 'town');
                                            formik.setFieldValue('division_id', '');
                                        }}
                                    />
                                    Town based
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="radio"
                                        name="location_type"
                                        value="division"
                                        checked={formik.values.location_type === 'division'}
                                        onChange={() => {
                                            formik.setFieldValue('location_type', 'division');
                                            formik.setFieldValue('town_id', '');
                                        }}
                                    />
                                    Division based
                                </label>
                            </div>
                        </div>

                        {formik.values.location_type === 'town' ? (
                            <div>
                                <label htmlFor="town_id" className="block text-gray-700 text-sm font-medium">Town</label>
                                {townsLoading ? (
                                    <div className="text-gray-500">Loading towns...</div>
                                ) : (
                                    <select
                                        id="town_id"
                                        name="town_id"
                                        onChange={formik.handleChange}
                                        value={formik.values.town_id !== '' ? String(formik.values.town_id) : ''}
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
                        ) : formik.values.location_type === 'division' ? (
                            <div>
                                <label htmlFor="division_id" className="block text-gray-700 text-sm font-medium">Division</label>
                                {divisionsLoading ? (
                                    <div className="text-gray-500">Loading divisions...</div>
                                ) : (
                                    <select
                                        id="division_id"
                                        name="division_id"
                                        onChange={formik.handleChange}
                                        value={formik.values.division_id !== '' ? String(formik.values.division_id) : ''}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select a division...</option>
                                        {divisions.map((division) => (
                                            <option key={division.id} value={division.id}>
                                                {division.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {formik.errors.division_id && formik.touched.division_id && <div className="text-red-600 text-sm mt-2">{formik.errors.division_id}</div>}
                            </div>
                        ) : null}

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
                    </>
                )}

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
                        Add Engineer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AgentForm;
