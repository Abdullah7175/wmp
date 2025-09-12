"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const Select = dynamic(() => import('react-select'), { ssr: false });

const validationSchema = Yup.object({
    town_id: Yup.string().required('Town is required'),
    subtown_id: Yup.string().nullable(),
    subtown_ids: Yup.array().of(Yup.number()),
    complaint_type_id: Yup.string().required('Department is required'),
    complaint_subtype_id: Yup.string().nullable(),
    contact_number: Yup.string()
        .required('Contact number is required')
        .matches(/^[0-9]{10,15}$/, 'Must be a valid phone number'),
    address: Yup.string().required('Address is required'),
    description: Yup.string().required('Description is required'),
    latitude: Yup.number().nullable(),
    longitude: Yup.number().nullable(),
    budget_code: Yup.string(),
    file_type: Yup.string().oneOf(['SPI', 'ADP', '']).nullable(),
    nature_of_work: Yup.string().required('Nature of Work is required'),
});

export const RequestForm = ({ isPublic = false, initialValues, onSubmit, isEditMode = false }) => {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [towns, setTowns] = useState([]);
    const [subtowns, setSubtowns] = useState([]);
    const [filteredSubtowns, setFilteredSubtowns] = useState([]);
    const [selectedTown, setSelectedTown] = useState(null);
    const [complaintTypes, setComplaintTypes] = useState([]);
    const [complaintSubTypes, setComplaintSubTypes] = useState([]);
    const [filteredSubTypes, setFilteredSubTypes] = useState([]);
    const [selectedComplaintType, setSelectedComplaintType] = useState(null);
    const [locationAccess, setLocationAccess] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [executiveEngineers, setExecutiveEngineers] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [agentInfo, setAgentInfo] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);

    const formik = useFormik({
        initialValues: initialValues || {
            town_id: '',
            subtown_id: '',
            subtown_ids: [],
            complaint_type_id: '',
            complaint_subtype_id: '',
            contact_number: '',
            address: '',
            description: '',
            latitude: null,
            longitude: null,
            budget_code: '',
            file_type: '',
            creator_id: session?.user?.id || null,
            creator_type: session?.user?.userType || 'user',
            nature_of_work: '',
        },
        validationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: true,
        onSubmit: async (values) => {
            // Auto-fill contractor_id or executive_engineer_id based on agent role
            let submitValues = { ...values };
            if (session?.user?.userType === 'agent') {
                if (Number(agentInfo?.role) === 2) {
                    // Contractor: set contractor_id to own id
                    submitValues.contractor_id = session.user.id;
                } else if (Number(agentInfo?.role) === 1) {
                    // Executive Engineer: set executive_engineer_id to own id
                    submitValues.executive_engineer_id = session.user.id;
                }
            }
            if (onSubmit) {
                await onSubmit(submitValues);
            } else {
                try {
                    const response = await fetch('/api/requests', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(submitValues),
                    });

                    if (response.ok) {
                        toast({
                            title: "Request submitted successfully",
                            description: 'Your work request has been received.',
                            variant: 'success',
                        });
                        formik.resetForm();
                    } else {
                        toast({
                            title: "Failed to submit request",
                            description: 'Please try again later.',
                            variant: 'destructive',
                        });
                    }
                } catch (error) {
                    console.error('Error submitting form:', error);
                    toast({
                        title: "An error occurred",
                        description: 'Please try again later.',
                        variant: 'destructive',
                    });
                }
            }
        },
    });

    const getCurrentLocation = () => {
        setLocationLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    formik.setFieldValue('latitude', position.coords.latitude);
                    formik.setFieldValue('longitude', position.coords.longitude);
                    setLocationAccess(true);
                    setLocationLoading(false);
                    toast({
                        title: "Location captured successfully",
                        variant: 'success',
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationLoading(false);
                    toast({
                        title: "Location access denied",
                        description: 'Please enter coordinates manually or try again.',
                        variant: 'destructive',
                    });
                }
            );
        } else {
            setLocationLoading(false);
            toast({
                title: "Geolocation not supported",
                description: 'Please enter coordinates manually.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        // Fetch towns
        const fetchTowns = async () => {
            try {
                const res = await fetch('/api/complaints/getinfo');
                if (res.ok) {
                    const data = await res.json();
                    setTowns(data.towns);
                }
            } catch (error) {
                console.error('Error fetching towns:', error);
            }
        };

        // Fetch subtowns
        const fetchSubtowns = async () => {
            try {
                const res = await fetch('/api/towns/subtowns');
                if (res.ok) {
                    const data = await res.json();
                    setSubtowns(data);
                }
            } catch (error) {
                console.error('Error fetching subtowns:', error);
            }
        };

        // Fetch complaint types
        const fetchComplaintTypes = async () => {
            try {
                const res = await fetch('/api/complaints/getalltypes');
                if (res.ok) {
                    const data = await res.json();
                    setComplaintTypes(data);
                }
            } catch (error) {
                console.error('Error fetching complaint types:', error);
            }
        };

        // Fetch complaint subtypes
        const fetchComplaintSubTypes = async () => {
            try {
                const res = await fetch('/api/complaints/subtypes');
                if (res.ok) {
                    const data = await res.json();
                    setComplaintSubTypes(data);
                }
            } catch (error) {
                console.error('Error fetching Nature of work:', error);
            }
        };

        // Fetch executive engineers and contractors for agent role
        const fetchAgents = async () => {
            try {
                // Executive Engineers (role=1)
                const resExec = await fetch('/api/agents?role=1');
                if (resExec.ok) {
                    const data = await resExec.json();
                    setExecutiveEngineers(data.data || []);
                }
                // Contractors (role=2)
                const resCont = await fetch('/api/agents?role=2');
                if (resCont.ok) {
                    const data = await resCont.json();
                    setContractors(data.data || []);
                }
            } catch (error) {
                // ignore
            }
        };

        fetchTowns();
        fetchSubtowns();
        fetchComplaintTypes();
        fetchComplaintSubTypes();
        fetchAgents();
    }, []);

    // Handle initial values for edit mode
    useEffect(() => {
        if (initialValues && isEditMode) {
            // Set selected town
            if (initialValues.town_id) {
                const town = towns.find(t => t.id === initialValues.town_id);
                if (town) {
                    setSelectedTown({ value: town.id, label: town.town });
                    // Filter subtowns for this town
                    const filtered = subtowns.filter(subtown => subtown.town_id === town.id);
                    setFilteredSubtowns(filtered);
                }
            }

            // Set selected complaint type
            if (initialValues.complaint_type_id) {
                const complaintType = complaintTypes.find(ct => ct.id === initialValues.complaint_type_id);
                if (complaintType) {
                    setSelectedComplaintType({ value: complaintType.id, label: complaintType.type_name });
                    // Filter subtypes for this complaint type
                    const filtered = complaintSubTypes.filter(subtype => subtype.complaint_type_id === complaintType.id);
                    setFilteredSubTypes(filtered);
                }
            }
        }
    }, [initialValues, isEditMode, towns, subtowns, complaintTypes, complaintSubTypes]);

    // Fetch agent info if user is agent
    useEffect(() => {
        const fetchAgentInfo = async () => {
            if (session?.user?.userType === 'agent') {
                setLoadingAgent(true);
                try {
                    const res = await fetch(`/api/agents?id=${session.user.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setAgentInfo(data);
                    }
                } catch (error) {
                    // ignore
                } finally {
                    setLoadingAgent(false);
                }
            }
        };
        fetchAgentInfo();
    }, [session?.user?.id, session?.user?.userType]);

    // Restriction logic for agent role 1
    const isAgentRole1 = session?.user?.userType === 'agent' && Number(agentInfo?.role) === 1;
    const fixedTown = towns.find(t => t.id === agentInfo?.town_id);
    const fixedComplaintType = complaintTypes.find(ct => ct.id === agentInfo?.complaint_type_id);

    useEffect(() => {
        if (isAgentRole1 && agentInfo) {
            formik.setFieldValue('town_id', agentInfo.town_id || '');
            formik.setFieldValue('complaint_type_id', agentInfo.complaint_type_id || '');
        }
        // eslint-disable-next-line
    }, [isAgentRole1, agentInfo]);

    const handleTownChange = (selectedOption) => {
        setSelectedTown(selectedOption);
        const filtered = subtowns.filter(subtown => subtown.town_id === selectedOption.value);
        setFilteredSubtowns(filtered);
        formik.setFieldValue('town_id', selectedOption ? selectedOption.value : '');
        formik.setFieldValue('subtown_id', '');
    };

    const handleComplaintTypeChange = (selectedOption) => {
        setSelectedComplaintType(selectedOption);
        const filtered = complaintSubTypes.filter(subtype => subtype.complaint_type_id === selectedOption.value);
        setFilteredSubTypes(filtered);
        formik.setFieldValue('complaint_type_id', selectedOption ? selectedOption.value : '');
        formik.setFieldValue('complaint_subtype_id', '');
    };

    // Options for select components
    const townOptions = towns.map(town => ({ value: town.id, label: town.town }));
    const subtownOptions = filteredSubtowns.map(subtown => ({ value: subtown.id, label: subtown.subtown }));
    const complaintTypeOptions = complaintTypes.map(type => ({ value: type.id, label: type.type_name }));
    const complaintSubTypeOptions = filteredSubTypes.map(type => ({ value: type.id, label: type.subtype_name }));

    if (loadingAgent && isAgentRole1) {
        return <div>Loading agent info...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={formik.handleSubmit} className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {isEditMode ? 'Edit Work Request' : isPublic ? 'Submit Work Request' : 'Create New Work Request'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Town */}
                    {isAgentRole1 ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Town *</label>
                            <input
                                type="text"
                                value={fixedTown?.town || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                            <input type="hidden" name="town_id" value={agentInfo?.town_id || ''} />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="town_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Town *
                            </label>
                            <Select
                                id="town_id"
                                name="town_id"
                                options={townOptions}
                                onChange={handleTownChange}
                                value={townOptions.find(option => option.value === formik.values.town_id) || null}
                                className="basic-select"
                                classNamePrefix="select"
                            />
                            {formik.errors.town_id && formik.touched.town_id && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.town_id}</p>
                            )}
                        </div>
                    )}

                    {/* Sub Town */}
                    <div>
                        <label htmlFor="subtown_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Sub Town (Optional)
                        </label>
                        <Select
                            id="subtown_id"
                            name="subtown_id"
                            options={isAgentRole1
                                ? subtowns.filter(st => st.town_id === agentInfo?.town_id).map(st => ({ value: st.id, label: st.subtown }))
                                : subtownOptions
                            }
                            onChange={selectedOption => formik.setFieldValue('subtown_id', selectedOption ? selectedOption.value : '')}
                            value={(
                                isAgentRole1
                                    ? subtowns.filter(st => st.town_id === agentInfo?.town_id).map(st => ({ value: st.id, label: st.subtown }))
                                    : subtownOptions
                            ).find(option => option.value === formik.values.subtown_id) || null}
                            className="basic-select"
                            classNamePrefix="select"
                            isDisabled={isAgentRole1 && !agentInfo?.town_id}
                        />
                    </div>

                    {/* Complaint Type */}
                    {isAgentRole1 ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Type *</label>
                            <input
                                type="text"
                                value={fixedComplaintType?.type_name || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                            <input type="hidden" name="complaint_type_id" value={agentInfo?.complaint_type_id || ''} />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="complaint_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Complaint Type *
                            </label>
                            <Select
                                id="complaint_type_id"
                                name="complaint_type_id"
                                options={complaintTypeOptions}
                                onChange={handleComplaintTypeChange}
                                value={complaintTypeOptions.find(option => option.value === formik.values.complaint_type_id) || null}
                                className="basic-select"
                                classNamePrefix="select"
                            />
                            {formik.errors.complaint_type_id && formik.touched.complaint_type_id && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.complaint_type_id}</p>
                            )}
                        </div>
                    )}

                    {/* Complaint Sub Type */}
                    <div>
                        <label htmlFor="complaint_subtype_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Complaint Sub Type (Optional)
                        </label>
                        <Select
                            id="complaint_subtype_id"
                            name="complaint_subtype_id"
                            options={isAgentRole1
                                ? complaintSubTypes.filter(st => st.complaint_type_id === agentInfo?.complaint_type_id).map(st => ({ value: st.id, label: st.subtype_name }))
                                : complaintSubTypeOptions
                            }
                            onChange={selectedOption => formik.setFieldValue('complaint_subtype_id', selectedOption ? selectedOption.value : '')}
                            value={(
                                isAgentRole1
                                    ? complaintSubTypes.filter(st => st.complaint_type_id === agentInfo?.complaint_type_id).map(st => ({ value: st.id, label: st.subtype_name }))
                                    : complaintSubTypeOptions
                            ).find(option => option.value === formik.values.complaint_subtype_id) || null}
                            className="basic-select"
                            classNamePrefix="select"
                            isDisabled={isAgentRole1 && !agentInfo?.complaint_type_id}
                        />
                    </div>

                    {/* Contact Number */}
                    <div>
                        <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number *
                        </label>
                        <input
                            id="contact_number"
                            name="contact_number"
                            type="tel"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.contact_number}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.contact_number && formik.touched.contact_number && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.contact_number}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.address}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.address && formik.touched.address && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description of Work *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.description && formik.touched.description && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                        )}
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="budget_code" className="block text-sm font-medium text-gray-700 mb-1">Budget Code</label>
                            <input
                                id="budget_code"
                                name="budget_code"
                                type="text"
                                onChange={formik.handleChange}
                                value={formik.values.budget_code}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            {formik.errors.budget_code && formik.touched.budget_code && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.budget_code}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="file_type" className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                            <select
                                id="file_type"
                                name="file_type"
                                onChange={formik.handleChange}
                                value={formik.values.file_type}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="">Select file type...</option>
                                <option value="SPI">Single Page Info (SPI)</option>
                                <option value="ADP">Annual Development (ADP)</option>
                            </select>
                            {formik.errors.file_type && formik.touched.file_type && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.file_type}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-2">Location Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude
                            </label>
                            <input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.latitude || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter latitude"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude
                            </label>
                            <input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.longitude || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter longitude"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-2"
                        >
                            {locationLoading ? (
                                <span>Getting Location...</span>
                            ) : (
                                <>
                                    <span>Get Current Location</span>
                                </>
                            )}
                        </Button>
                        {locationAccess && (
                            <p className="mt-2 text-sm text-green-600">Location access granted</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="subtown_ids" className="block text-sm font-medium text-gray-700 mb-1">Additional Subtowns (Multi-select)</label>
                    <Select
                        isMulti
                        id="subtown_ids"
                        name="subtown_ids"
                        options={isAgentRole1
                            ? subtowns.filter(st => st.town_id === agentInfo?.town_id).map(st => ({ value: st.id, label: st.subtown }))
                            : subtownOptions
                        }
                        value={(
                            isAgentRole1
                                ? subtowns.filter(st => st.town_id === agentInfo?.town_id).map(st => ({ value: st.id, label: st.subtown }))
                                : subtownOptions
                        ).filter(opt => (formik.values.subtown_ids || []).includes(opt.value))}
                        onChange={selectedOptions => formik.setFieldValue('subtown_ids', selectedOptions ? selectedOptions.map(opt => opt.value) : [])}
                        className="basic-select"
                        classNamePrefix="select"
                        isDisabled={isAgentRole1 && !agentInfo?.town_id}
                    />
                </div>

                {/* Executive Engineer/Contractor field for agents */}
                {session?.user?.userType === 'agent' && Number(session.user.role) === 2 && (
                    <div>
                        <label htmlFor="executive_engineer_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Executive Engineer
                        </label>
                        <select
                            id="executive_engineer_id"
                            name="executive_engineer_id"
                            value={formik.values.executive_engineer_id || ''}
                            onChange={e => formik.setFieldValue('executive_engineer_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select Executive Engineer...</option>
                            {executiveEngineers.map(ee => (
                                <option key={ee.id} value={ee.id}>{ee.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                {session?.user?.userType === 'agent' && Number(session.user.role) === 1 && (
                    <div>
                        <label htmlFor="contractor_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Contractor
                        </label>
                        <select
                            id="contractor_id"
                            name="contractor_id"
                            value={formik.values.contractor_id || ''}
                            onChange={e => formik.setFieldValue('contractor_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select Contractor...</option>
                            {contractors.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                {session?.user?.userType === 'user' && [1, 2].includes(Number(session.user.role)) && (
                    <>
                        <div>
                        <label htmlFor="executive_engineer_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Executive Engineer
                        </label>
                        <select
                            id="executive_engineer_id"
                            name="executive_engineer_id"
                            value={formik.values.executive_engineer_id || ''}
                            onChange={e => formik.setFieldValue('executive_engineer_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select Executive Engineer...</option>
                            {executiveEngineers.map(ee => (
                            <option key={ee.id} value={ee.id}>{ee.name}</option>
                            ))}
                        </select>
                        </div>

                        <div className="mt-4">
                        <label htmlFor="contractor_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Contractor
                        </label>
                        <select
                            id="contractor_id"
                            name="contractor_id"
                            value={formik.values.contractor_id || ''}
                            onChange={e => formik.setFieldValue('contractor_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select Contractor...</option>
                            {contractors.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        </div>
                    </>
                    )}


                <div className="md:col-span-2">
                    <label htmlFor="nature_of_work" className="block text-sm font-medium text-gray-700 mb-1">
                        Nature of Work *
                    </label>
                    <select
                        id="nature_of_work"
                        name="nature_of_work"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.nature_of_work}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">Select Nature of Work...</option>
                        <option value="repairing">Repairing</option>
                        <option value="new installation">New Installation</option>
                    </select>
                    {formik.errors.nature_of_work && formik.touched.nature_of_work && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.nature_of_work}</p>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Submit Request
                    </button>
                </div>
            </form>
        </div>
    );
};