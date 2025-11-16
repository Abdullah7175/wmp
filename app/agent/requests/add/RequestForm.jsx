"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const Select = dynamic(() => import('react-select'), { ssr: false });

// Dynamic validation schema - will be created based on department type
const createValidationSchema = (isDivisionBased) => Yup.object({
    complaint_type_id: Yup.string().required('Department is required'),
    town_id: isDivisionBased ? Yup.string().nullable() : Yup.string().required('Town is required'),
    subtown_id: Yup.string().nullable(),
    subtown_ids: Yup.array().of(Yup.number()),
    division_id: isDivisionBased ? Yup.string().required('Division is required') : Yup.string().nullable(),
    complaint_subtype_id: Yup.string().nullable(),
    contact_number: Yup.string()
        .required('Contact number is required')
        .matches(/^[0-9]{10,15}$/, 'Must be a valid phone number'),
    address: Yup.string().required('Address is required'),
    description: Yup.string().required('Description is required'),
    latitude: Yup.number().nullable(),
    longitude: Yup.number().nullable(),
    budget_code: Yup.string(),
    file_type: Yup.string().oneOf(['SPI', 'R&M', 'ADP', '']).nullable(),
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
    const [divisions, setDivisions] = useState([]);
    const [isDivisionBased, setIsDivisionBased] = useState(false);
    const [locationAccess, setLocationAccess] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [executiveEngineers, setExecutiveEngineers] = useState([]);
    const [filteredExecutiveEngineers, setFilteredExecutiveEngineers] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [agentInfo, setAgentInfo] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);
    const [additionalLocations, setAdditionalLocations] = useState([]);
    
    // Use ref to track isDivisionBased for validation function
    const isDivisionBasedRef = React.useRef(isDivisionBased);
    React.useEffect(() => {
        isDivisionBasedRef.current = isDivisionBased;
    }, [isDivisionBased]);

    const fetchFilteredAgents = async (townId, complaintTypeId) => {
        if (!townId || !complaintTypeId) {
            setFilteredExecutiveEngineers([]);
            return;
        }
        try {
            const res = await fetch(`/api/agents?role=1&town_id=${townId}&complaint_type_id=${complaintTypeId}`);
            if (res.ok) {
                const data = await res.json();
                setFilteredExecutiveEngineers(data.data || []);
            } else {
                setFilteredExecutiveEngineers([]);
            }
        } catch (error) {
            console.error('Error fetching filtered agents:', error);
            setFilteredExecutiveEngineers([]);
        }
    };

    const fetchDivisionExecutiveEngineers = async (divisionId, complaintTypeId) => {
        if (!divisionId || !complaintTypeId) {
            setFilteredExecutiveEngineers([]);
            return;
        }
        try {
            const res = await fetch(`/api/agents?role=1&division_id=${divisionId}&complaint_type_id=${complaintTypeId}`);
            if (res.ok) {
                const data = await res.json();
                setFilteredExecutiveEngineers(data.data || []);
            } else {
                setFilteredExecutiveEngineers([]);
            }
        } catch (error) {
            console.error('Error fetching division-based agents:', error);
            setFilteredExecutiveEngineers([]);
        }
    };

    const formik = useFormik({
        initialValues: initialValues || {
            town_id: '',
            subtown_id: '',
            subtown_ids: [],
            division_id: '',
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
        // No static validationSchema - rely entirely on dynamic validate function
        validate: (values) => {
            const errors = {};
            // Use ref to get the latest isDivisionBased value
            const schema = createValidationSchema(isDivisionBasedRef.current);
            
            // Validate using the current schema
            try {
                schema.validateSync(values, { abortEarly: false });
            } catch (err) {
                if (err.inner) {
                    err.inner.forEach((error) => {
                        if (error.path) {
                            errors[error.path] = error.message;
                        }
                    });
                }
            }
            
            return errors;
        },
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: true,
        onSubmit: async (values) => {
            console.log('[AgentRequestForm] Form submission started', {
                isDivisionBased,
                values: { ...values },
                errors: formik.errors
            });
            
            // Prepare submit values
            let submitValues = { ...values };
            
            // If division-based, set town/subtown to null and ensure division_id is set
            if (isDivisionBased) {
                submitValues.town_id = null;
                submitValues.subtown_id = null;
                submitValues.subtown_ids = [];
                
                // Ensure division_id is set (from form or agent info)
                if (!submitValues.division_id) {
                    const selectedType = complaintTypes.find(ct => ct.id === submitValues.complaint_type_id);
                    if (selectedType?.division_id) {
                        submitValues.division_id = Number(selectedType.division_id);
                    } else if (agentInfo?.division_id) {
                        submitValues.division_id = Number(agentInfo.division_id);
                    }
                } else {
                    submitValues.division_id = Number(submitValues.division_id);
                }
            } else {
                // If town-based, set division_id to null
                submitValues.division_id = null;
                // Ensure town_id is a number
                if (submitValues.town_id) {
                    submitValues.town_id = Number(submitValues.town_id);
                }
            }
            
            // Auto-fill contractor_id or executive_engineer_id based on agent role
            if (session?.user?.userType === 'agent') {
                if (Number(agentInfo?.role) === 2) {
                    // Contractor: set contractor_id to own id
                    submitValues.contractor_id = session.user.id;
                } else if (Number(agentInfo?.role) === 1) {
                    // Executive Engineer: set executive_engineer_id to own id
                    submitValues.executive_engineer_id = session.user.id;
                }
            }
            // Add additional locations to submit values
            submitValues.additional_locations = additionalLocations;
            
            console.log('[AgentRequestForm] Prepared payload:', submitValues);
            
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

                    console.log('[AgentRequestForm] POST /api/requests status:', response.status);

                    if (response.ok) {
                        const responseData = await response.json();
                        console.log('[AgentRequestForm] Success payload:', responseData);
                        toast({
                            title: "Request submitted successfully",
                            description: `Request ID: ${responseData.id || 'N/A'}`,
                            variant: 'success',
                        });
                        formik.resetForm();
                        setAdditionalLocations([]);
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('[AgentRequestForm] Error response:', errorData);
                        toast({
                            title: "Failed to submit request",
                            description: errorData.error || errorData.message || 'Please try again later.',
                            variant: 'destructive',
                        });
                    }
                } catch (error) {
                    console.error('[AgentRequestForm] Error submitting form:', error);
                    toast({
                        title: "An error occurred",
                        description: error.message || 'Please try again later.',
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

        // Fetch divisions
        const fetchDivisions = async () => {
            try {
                const res = await fetch('/api/efiling/divisions?is_active=true');
                if (res.ok) {
                    const data = await res.json();
                    setDivisions(data.success && data.divisions ? data.divisions : []);
                }
            } catch (error) {
                console.error('Error fetching divisions:', error);
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
        fetchDivisions();
        fetchAgents();
    }, []);

    // Handle initial values for edit mode
    useEffect(() => {
        if (initialValues && isEditMode) {
            // Set selected complaint type first (to determine if division-based)
            if (initialValues.complaint_type_id) {
                const complaintType = complaintTypes.find(ct => ct.id === initialValues.complaint_type_id);
                if (complaintType) {
                    setSelectedComplaintType({ value: complaintType.id, label: complaintType.type_name });
                    // Filter subtypes for this complaint type
                    const filtered = complaintSubTypes.filter(subtype => subtype.complaint_type_id === complaintType.id);
                    setFilteredSubTypes(filtered);
                    
                    // Check if division-based and set division if present
                    if (complaintType.division_id) {
                        setIsDivisionBased(true);
                        if (initialValues.division_id) {
                            formik.setFieldValue('division_id', initialValues.division_id);
                        } else if (complaintType.division_id) {
                            formik.setFieldValue('division_id', complaintType.division_id);
                        }
                    } else {
                        setIsDivisionBased(false);
                    }
                }
            }

            // Set selected town (only for town-based)
            if (initialValues.town_id && !isDivisionBased) {
                const town = towns.find(t => t.id === initialValues.town_id);
                if (town) {
                    setSelectedTown({ value: town.id, label: town.town });
                    // Filter subtowns for this town
                    const filtered = subtowns.filter(subtown => subtown.town_id === town.id);
                    setFilteredSubtowns(filtered);
                }
            }
        }
    }, [initialValues, isEditMode, towns, subtowns, complaintTypes, complaintSubTypes, divisions]);

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
            console.log('[AgentRequestForm] Setting up agent role 1 restrictions', {
                agentInfo,
                hasDivisionId: Boolean(agentInfo.division_id),
                hasTownId: Boolean(agentInfo.town_id)
            });
            
            // Check if agent is division-based
            if (agentInfo.division_id) {
                setIsDivisionBased(true);
                const divisionId = String(agentInfo.division_id);
                formik.setFieldValue('division_id', divisionId);
                formik.setFieldValue('town_id', '');
                formik.setFieldTouched('town_id', false);
                if (agentInfo.complaint_type_id) {
                    fetchDivisionExecutiveEngineers(divisionId, agentInfo.complaint_type_id);
                }
            } else {
                setIsDivisionBased(false);
                formik.setFieldValue('town_id', agentInfo.town_id || '');
                formik.setFieldValue('division_id', '');
                formik.setFieldTouched('division_id', false);
            }
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

    const handleDivisionChange = (selectedOption) => {
        console.log('[AgentRequestForm] Division changed:', { 
            selectedOption, 
            divisionId: selectedOption ? selectedOption.value : null 
        });
        const divisionId = selectedOption ? String(selectedOption.value) : '';
        formik.setFieldValue('division_id', divisionId);
        
        // Fetch executive engineers for this division if complaint type is selected
        if (divisionId && formik.values.complaint_type_id) {
            fetchDivisionExecutiveEngineers(divisionId, formik.values.complaint_type_id);
        } else {
            setFilteredExecutiveEngineers([]);
        }
    };

    const handleComplaintTypeChange = (selectedOption) => {
        setSelectedComplaintType(selectedOption);
        const filtered = complaintSubTypes.filter(subtype => subtype.complaint_type_id === selectedOption.value);
        setFilteredSubTypes(filtered);
        formik.setFieldValue('complaint_type_id', selectedOption ? selectedOption.value : '');
        formik.setFieldValue('complaint_subtype_id', '');
        
        // Check if selected department is division-based
        let divisionBased = false;
        if (selectedOption) {
            const selectedType = complaintTypes.find(ct => ct.id === selectedOption.value);
            divisionBased = Boolean(selectedType?.division_id || agentInfo?.division_id);
            setIsDivisionBased(divisionBased);

            if (divisionBased) {
                // Clear town/subtown and lock to agent's division (if available)
                formik.setFieldValue('town_id', '');
                formik.setFieldValue('subtown_id', '');
                formik.setFieldValue('subtown_ids', []);
                formik.setFieldTouched('town_id', false); // Clear touched state
                formik.setFieldTouched('subtown_id', false);
                setSelectedTown(null);
                setFilteredSubtowns([]);

                const rawDivisionId = agentInfo?.division_id ?? selectedType?.division_id ?? '';
                const divisionId = rawDivisionId ? String(rawDivisionId) : '';
                formik.setFieldValue('division_id', divisionId);

                if (divisionId) {
                    fetchDivisionExecutiveEngineers(divisionId, selectedOption.value);
                } else {
                    setFilteredExecutiveEngineers([]);
                }
            } else {
                formik.setFieldValue('division_id', '');
                formik.setFieldTouched('division_id', false); // Clear touched state
                setFilteredExecutiveEngineers([]);
                if (formik.values.town_id) {
                    fetchFilteredAgents(formik.values.town_id, selectedOption.value);
                }
            }
        } else {
            setIsDivisionBased(false);
            formik.setFieldValue('division_id', '');
            formik.setFieldTouched('division_id', false);
            setFilteredExecutiveEngineers([]);
        }
        
        // Re-validate after mode change
        setTimeout(() => {
            formik.validateForm();
        }, 100);
    };

    const addAdditionalLocation = () => {
        setAdditionalLocations([...additionalLocations, { latitude: '', longitude: '', description: '' }]);
    };

    const removeAdditionalLocation = (index) => {
        setAdditionalLocations(additionalLocations.filter((_, i) => i !== index));
    };

    const updateAdditionalLocation = (index, field, value) => {
        const updated = [...additionalLocations];
        updated[index][field] = value;
        setAdditionalLocations(updated);
    };

    const getCurrentLocationForAdditional = (index) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    updateAdditionalLocation(index, 'latitude', position.coords.latitude);
                    updateAdditionalLocation(index, 'longitude', position.coords.longitude);
                    toast({
                        title: "Location captured successfully",
                        variant: 'success',
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast({
                        title: "Location access denied",
                        description: 'Please enter coordinates manually or try again.',
                        variant: 'destructive',
                    });
                }
            );
        } else {
            toast({
                title: "Geolocation not supported",
                description: 'Please enter coordinates manually.',
                variant: 'destructive',
            });
        }
    };

    // Re-validate when isDivisionBased changes
    useEffect(() => {
        console.log('[AgentRequestForm] isDivisionBased flag changed', {
            isDivisionBased,
            division_id: formik.values.division_id,
            town_id: formik.values.town_id
        });
        
        // Only clear values/errors when switching modes, not on initial setup
        // Check if we're actually switching (not just initializing)
        if (isDivisionBased && formik.values.town_id) {
            // Switching from town-based to division-based: clear town/subtown
            formik.setFieldValue('town_id', '', false);
            formik.setFieldValue('subtown_id', '', false);
            formik.setFieldValue('subtown_ids', [], false);
            formik.setFieldTouched('town_id', false, false);
            formik.setFieldTouched('subtown_id', false, false);
            formik.setFieldError('town_id', undefined);
            formik.setFieldError('subtown_id', undefined);
        } else if (!isDivisionBased && formik.values.division_id) {
            // Switching from division-based to town-based: clear division
            formik.setFieldValue('division_id', '', false);
            formik.setFieldTouched('division_id', false, false);
            formik.setFieldError('division_id', undefined);
        }
        
        // Always clear errors for fields that are no longer required
        if (isDivisionBased) {
            formik.setFieldError('town_id', undefined);
            formik.setFieldError('subtown_id', undefined);
        } else {
            formik.setFieldError('division_id', undefined);
        }
        
        // Update formik validation schema by creating a new validation function
        formik.setFieldValue('_validationKey', isDivisionBased ? 'division' : 'town');
        formik.validateForm();
    }, [isDivisionBased]);

    // Auto-select division when divisions are loaded and a division-based department is selected
    useEffect(() => {
        if (!isDivisionBased || !formik.values.complaint_type_id) {
            return;
        }

        const selectedType = complaintTypes.find(ct => ct.id === formik.values.complaint_type_id);
        const divisionId =
            formik.values.division_id ||
            (agentInfo?.division_id ? String(agentInfo.division_id) : '') ||
            (selectedType?.division_id ? String(selectedType.division_id) : '');

        if (divisionId && formik.values.division_id !== divisionId) {
            formik.setFieldValue('division_id', divisionId);
        }

        if (divisionId) {
            fetchDivisionExecutiveEngineers(divisionId, formik.values.complaint_type_id);
        }
    }, [isDivisionBased, complaintTypes, divisions, agentInfo?.division_id, formik.values.complaint_type_id]);

    // Additional logging for debugging
    useEffect(() => {
        console.log('[AgentRequestForm] Form values update', formik.values);
    }, [formik.values]);

    useEffect(() => {
        const errorKeys = Object.keys(formik.errors || {});
        if (errorKeys.length > 0) {
            console.warn('[AgentRequestForm] Validation errors', formik.errors);
        }
    }, [formik.errors]);

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
                    {/* Department (Complaint Type) - moved to first position */}
                    {isAgentRole1 ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
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
                                Department *
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

                    {/* Conditional: Town/Subtown OR Division based on department */}
                    {!isDivisionBased ? (
                        <>
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
                        </>
                    ) : (
                        /* Division - shown when department is division-based */
                        <div>
                            <label htmlFor="division_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Division *
                            </label>
                            {(() => {
                                const shouldLockDivision = isAgentRole1 && Boolean(agentInfo?.division_id);
                                const divisionOption = divisions.find(div => String(div.id) === String(formik.values.division_id));

                                if (shouldLockDivision) {
                                    return (
                                        <>
                                            <input
                                                type="text"
                                                value={divisionOption?.name || 'Loading...'}
                                                disabled
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                            />
                                            <input type="hidden" name="division_id" value={formik.values.division_id || ''} />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Division is fixed based on your assignment.
                                            </p>
                                        </>
                                    );
                                }

                                return (
                                    <>
                                        <Select
                                            id="division_id"
                                            name="division_id"
                                            options={divisions.map(div => ({ value: String(div.id), label: div.name }))}
                                            onChange={handleDivisionChange}
                                            value={divisionOption ? 
                                                { value: String(divisionOption.id), label: divisionOption.name } : 
                                                null}
                                            className="basic-select"
                                            classNamePrefix="select"
                                            isDisabled={!formik.values.complaint_type_id}
                                        />
                                        {formik.errors.division_id && formik.touched.division_id && (
                                            <p className="mt-1 text-sm text-red-600">{formik.errors.division_id}</p>
                                        )}
                                    </>
                                );
                            })()}
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
                            On-Site POC Number
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
                        {/* <div>
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
                        </div> */}
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
                                <option value="R&M">Repair & Maintenance (R&M)</option>
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

                {/* Additional Locations Section */}
                <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Additional Locations</h3>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addAdditionalLocation}
                            className="flex items-center gap-2"
                        >
                            <span>+ Add Location</span>
                        </Button>
                    </div>
                    
                    {additionalLocations.map((location, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-700">Location {index + 1}</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeAdditionalLocation(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={location.latitude}
                                        onChange={(e) => updateAdditionalLocation(index, 'latitude', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter latitude"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={location.longitude}
                                        onChange={(e) => updateAdditionalLocation(index, 'longitude', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter longitude"
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description/Comment
                                </label>
                                <textarea
                                    value={location.description}
                                    onChange={(e) => updateAdditionalLocation(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={2}
                                    placeholder="Describe this location..."
                                />
                            </div>
                            
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => getCurrentLocationForAdditional(index)}
                                    className="flex items-center gap-2"
                                >
                                    <span>Get Current Location</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Subtowns - only show for town-based requests */}
                {!isDivisionBased && (
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
                )}

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
                            <option value="">Select Contractor Company...</option>
                            {contractors.map(c => (
                                <option key={c.id} value={c.id}>{c.company_name || c.name || 'Contractor'}</option>
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
                        <option value="Repairing And Maintenance(R&M)">Repairing And Maintenance(R&M)</option>
                        <option value="Development Work">Development Work</option>
                        <option value="New installation">New Installation</option>
                        <option value="Leakages">Leakages</option>
                        <option value="Sunk Down">Sunk Down</option>
                        <option value="Rewinding">Rewinding</option>
                        <option value="Provide n Fixing">Provide n Fixing</option>
                        <option value="Desilting">Desilting</option>
                        <option value="other">Emergency</option>

                        
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