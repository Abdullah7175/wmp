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
    const [contractors, setContractors] = useState([]);
    const [agentInfo, setAgentInfo] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);
    const [additionalLocations, setAdditionalLocations] = useState([]);
    const [filteredExecutiveEngineers, setFilteredExecutiveEngineers] = useState([]);
    const [smAgents, setSmAgents] = useState([]);
    const [selectedSmAgents, setSelectedSmAgents] = useState([]);

    const isAgentUser = session?.user?.userType === 'agent';

    // Fetch filtered agents based on town and complaint type (only for Executive Engineers)
    const fetchFilteredAgents = async (townId, complaintTypeId) => {
        if (!townId || !complaintTypeId) {
            setFilteredExecutiveEngineers([]);
            return;
        }

        try {
            // Fetch Executive Engineers for specific town and complaint type
            const resExec = await fetch(`/api/agents?role=1&town_id=${townId}&complaint_type_id=${complaintTypeId}`);
            if (resExec.ok) {
                const data = await resExec.json();
                setFilteredExecutiveEngineers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching filtered agents:', error);
        }
    };

    const fetchDivisionExecutiveEngineers = async (divisionId, complaintTypeId) => {
        if (!divisionId || !complaintTypeId) {
            setFilteredExecutiveEngineers([]);
            return;
        }
        try {
            console.log('[RequestForm] Fetching division-based EEs', { divisionId, complaintTypeId });
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

    const handleDivisionChange = (selectedOption) => {
        console.log('[RequestForm] Division changed', selectedOption);
        const value = selectedOption ? String(selectedOption.value) : '';
        formik.setFieldValue('division_id', value);
        formik.setFieldValue('executive_engineer_id', '');

        if (value && formik.values.complaint_type_id) {
            fetchDivisionExecutiveEngineers(value, formik.values.complaint_type_id);
        } else {
            setFilteredExecutiveEngineers([]);
        }
    };

    const formik = useFormik({
        initialValues: initialValues || {
            town_id: '',
            subtown_id: '',
            subtown_ids: [],
            complaint_type_id: '',
            complaint_subtype_id: '',
            division_id: '',
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
            executive_engineer_id: '',
            contractor_id: '',
            assigned_sm_agents: [],
        },
        validate: (values) => {
            const errors = {};
            const schema = createValidationSchema(isDivisionBased);
            try {
                schema.validateSync(values, { abortEarly: false });
            } catch (err) {
                err.inner.forEach((error) => {
                    errors[error.path] = error.message;
                });
            }
            return errors;
        },
        validateOnChange: true,
        validateOnBlur: true,
        enableReinitialize: true,
        onSubmit: async (values) => {
            // Prepare submit values
            const submitValues = { ...values, additional_locations: additionalLocations };
            const normalizeInt = (val) => {
                if (val === undefined || val === null || val === '') return null;
                const parsed = Number(val);
                return Number.isNaN(parsed) ? null : parsed;
            };
            const creatorId = normalizeInt(session?.user?.id);
            const creatorType = session?.user?.userType || 'user';

            if (!creatorId) {
                toast({
                    title: "Unable to submit request",
                    description: "Session not ready. Please refresh the page and try again.",
                    variant: 'destructive',
                });
                return;
            }
            
            // If division-based, set town/subtown to null and ensure division_id is set
            if (isDivisionBased) {
                submitValues.town_id = null;
                submitValues.subtown_id = null;
                submitValues.subtown_ids = [];
                
                // If division_id is not set but department has division_id, use it
                if (!submitValues.division_id) {
                    const selectedType = complaintTypes.find(ct => ct.id === submitValues.complaint_type_id);
                    if (selectedType?.division_id) {
                    console.log('[RequestForm] Auto-assigning division from complaint type', selectedType.division_id);
                        submitValues.division_id = selectedType.division_id;
                    }
                }
            } else {
                // If town-based, set division_id to null
                submitValues.division_id = null;
            }
            submitValues.creator_id = creatorId;
            submitValues.creator_type = creatorType;
            submitValues.complaint_type_id = normalizeInt(submitValues.complaint_type_id);
            submitValues.complaint_subtype_id = normalizeInt(submitValues.complaint_subtype_id);
            submitValues.town_id = normalizeInt(submitValues.town_id);
            submitValues.subtown_id = normalizeInt(submitValues.subtown_id);
            submitValues.division_id = normalizeInt(submitValues.division_id);
            submitValues.executive_engineer_id = normalizeInt(submitValues.executive_engineer_id);
            submitValues.contractor_id = normalizeInt(submitValues.contractor_id);
            submitValues.subtown_ids = Array.isArray(submitValues.subtown_ids)
                ? submitValues.subtown_ids.map(normalizeInt).filter(v => v !== null)
                : [];
            submitValues.assigned_sm_agents = Array.isArray(submitValues.assigned_sm_agents)
                ? submitValues.assigned_sm_agents.map(agent => ({
                    ...agent,
                    sm_agent_id: normalizeInt(agent.sm_agent_id ?? agent.value ?? agent.id),
                })).filter(agent => agent.sm_agent_id !== null)
                : [];
        console.log('[RequestForm] Normalised submit values', submitValues);
            
            const debugPayload = {
                ...submitValues,
                additional_locations: additionalLocations,
            };
            console.log('[RequestForm] Prepared payload', JSON.stringify(debugPayload, null, 2));
            
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
                console.log('[RequestForm] POST /api/requests status', response.status);

                if (response.ok) {
                const responseData = await response.json().catch(() => ({}));
                    console.log('[RequestForm] Success payload', responseData);
                toast({
                        title: "Request submitted successfully",
                    description: responseData?.id
                        ? `Work request #${responseData.id} has been created.`
                        : 'Your work request has been received.',
                        variant: 'success',
                    });
                formik.resetForm();
                setAdditionalLocations([]);
                setSelectedComplaintType(null);
                setSelectedTown(null);
                setFilteredSubtowns([]);
                setFilteredExecutiveEngineers([]);
                setSelectedSmAgents([]);
                setIsDivisionBased(false);
                } else {
                    let errorMessage = 'Please try again later.';
                    try {
                        const err = await response.json();
                        console.warn('[RequestForm] Error response', err);
                        errorMessage = err?.error || err?.details || JSON.stringify(err);
                    } catch (parseErr) {
                        // ignore parse error
                        console.warn('[RequestForm] Failed to parse error response', parseErr);
                    }
                    toast({
                        title: "Failed to submit request",
                        description: errorMessage,
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('[RequestForm] Network/JS error submitting request:', error);
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
                const res = await fetch('/api/towns');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setTowns(data);
                    } else if (Array.isArray(data?.data)) {
                        setTowns(data.data);
                    } else {
                        setTowns([]);
                    }
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

        // Fetch divisions
        const fetchDivisions = async () => {
            try {
                const res = await fetch('/api/efiling/divisions?is_active=true');
                if (res.ok) {
                    const data = await res.json();
                    setDivisions(data.divisions || []);
                }
            } catch (error) {
                console.error('Error fetching divisions:', error);
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

        // Fetch social media agents
        const fetchSmAgents = async () => {
            try {
                const res = await fetch('/api/socialmediaperson');
                if (res.ok) {
                    const data = await res.json();
                    setSmAgents(data.data || data);
                }
            } catch (error) {
                console.error('Error fetching social media agents:', error);
            }
        };

        fetchTowns();
        fetchSubtowns();
        fetchComplaintTypes();
        fetchComplaintSubTypes();
        fetchAgents();
        fetchSmAgents();
        fetchDivisions();
    }, []);

    // Handle initial values for edit mode
    useEffect(() => {
        if (initialValues && isEditMode) {
            let divisionBasedForType = false;

            // Set selected complaint type first (to determine if division-based)
            if (initialValues.complaint_type_id) {
                const complaintType = complaintTypes.find(ct => ct.id === initialValues.complaint_type_id);
                if (complaintType) {
                    setSelectedComplaintType({ value: complaintType.id, label: complaintType.type_name });
                    // Filter subtypes for this complaint type
                    const filtered = complaintSubTypes.filter(subtype => subtype.complaint_type_id === complaintType.id);
                    setFilteredSubTypes(filtered);
                    
                    // Determine division-based behaviour and set initial division
                    divisionBasedForType = Boolean(complaintType.division_id);
                    setIsDivisionBased(divisionBasedForType);
                    if (divisionBasedForType) {
                        if (initialValues.division_id !== undefined && initialValues.division_id !== null) {
                            formik.setFieldValue('division_id', String(initialValues.division_id));
                        } else {
                            formik.setFieldValue('division_id', '');
                        }
                    } else {
                        formik.setFieldValue('division_id', '');
                    }
                } else {
                    setIsDivisionBased(false);
                    formik.setFieldValue('division_id', '');
                }
            } else {
                setIsDivisionBased(false);
                formik.setFieldValue('division_id', '');
            }

            // Set selected town (only for town-based)
            if (!divisionBasedForType && initialValues.town_id) {
                const town = towns.find(t => t.id === initialValues.town_id);
                if (town) {
                    setSelectedTown({ value: town.id, label: town.town });
                    // Filter subtowns for this town
                    const filtered = subtowns.filter(subtown => subtown.town_id === town.id);
                    setFilteredSubtowns(filtered);
                }
            }

            // Pre-populate agent information if request was created by an agent
            if (initialValues.creator_type === 'agent' && initialValues.creator_id) {
                // Fetch the creator agent's information
                fetch(`/api/agents?id=${initialValues.creator_id}`)
                    .then(res => res.json())
                    .then(agentData => {
                        if (agentData && agentData.role) {
                            if (agentData.role === 1) {
                                // Creator is an executive engineer, pre-populate executive_engineer_id
                                formik.setFieldValue('executive_engineer_id', agentData.id);
                            } else if (agentData.role === 2) {
                                // Creator is a contractor, pre-populate contractor_id
                                formik.setFieldValue('contractor_id', agentData.id);
                            }
                        }
                    })
                    .catch(error => console.error('Error fetching creator agent info:', error));
            }

            // Fetch filtered agents for the selected town and complaint type
            if (!divisionBasedForType && initialValues.town_id && initialValues.complaint_type_id) {
                fetchFilteredAgents(initialValues.town_id, initialValues.complaint_type_id);
            }
            if (divisionBasedForType && initialValues.division_id && initialValues.complaint_type_id) {
                fetchDivisionExecutiveEngineers(initialValues.division_id, initialValues.complaint_type_id);
            }

            // Handle assigned social media agents
            if (initialValues.assigned_sm_agents && initialValues.assigned_sm_agents.length > 0) {
                const smAgentSelections = initialValues.assigned_sm_agents.map(smAgent => ({
                    value: smAgent.sm_agent_id,
                    label: smAgent.name,
                    status: smAgent.status
                }));
                setSelectedSmAgents(smAgentSelections);
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

    const handleTownChange = (selectedOption) => {
        setSelectedTown(selectedOption);
        const filtered = subtowns.filter(subtown => subtown.town_id === selectedOption.value);
        setFilteredSubtowns(filtered);
        formik.setFieldValue('town_id', selectedOption ? selectedOption.value : '');
        formik.setFieldValue('subtown_id', '');
        
        // Clear executive engineer selection when town changes (contractors are not filtered)
        formik.setFieldValue('executive_engineer_id', '');
        
        // Fetch filtered agents when town changes
        if (selectedOption && formik.values.complaint_type_id) {
            fetchFilteredAgents(selectedOption.value, formik.values.complaint_type_id);
        } else {
            // Clear filtered executive engineers if not both town and complaint type are selected
            setFilteredExecutiveEngineers([]);
        }
    };

    const handleComplaintTypeChange = (selectedOption) => {
        console.log('[RequestForm] Department changed', selectedOption);
        setSelectedComplaintType(selectedOption);
        const filtered = complaintSubTypes.filter(subtype => subtype.complaint_type_id === selectedOption.value);
        setFilteredSubTypes(filtered);
        formik.setFieldValue('complaint_type_id', selectedOption ? selectedOption.value : '');
        formik.setFieldValue('complaint_subtype_id', '');
        
        // Check if selected department is division-based
        let divisionBased = false;
        if (selectedOption) {
            const selectedType = complaintTypes.find(ct => ct.id === selectedOption.value);
            divisionBased = Boolean(selectedType?.division_id);
            setIsDivisionBased(divisionBased);

            // Reset geography-specific selections
            formik.setFieldValue('executive_engineer_id', '');

            if (divisionBased) {
                // Division based workflow – clear town/subtown fields & require manual division selection
                formik.setFieldValue('town_id', '');
                formik.setFieldValue('subtown_id', '');
                formik.setFieldValue('subtown_ids', []);
                setSelectedTown(null);
                setFilteredSubtowns([]);

                if (isAgentUser && agentInfo?.division_id) {
                    const divisionId = String(agentInfo.division_id);
                    formik.setFieldValue('division_id', divisionId);
                    fetchDivisionExecutiveEngineers(divisionId, selectedOption.value);
                } else {
                    formik.setFieldValue('division_id', '');
                    setFilteredExecutiveEngineers([]);
                }
            } else {
                // Town based workflow – clear division field
                formik.setFieldValue('division_id', '');
                setFilteredExecutiveEngineers([]);
            }
        } else {
            setIsDivisionBased(false);
            formik.setFieldValue('division_id', '');
            formik.setFieldValue('town_id', '');
            formik.setFieldValue('subtown_id', '');
            formik.setFieldValue('subtown_ids', []);
            setFilteredExecutiveEngineers([]);
            setSelectedTown(null);
            setFilteredSubtowns([]);
            formik.setFieldValue('executive_engineer_id', '');
        }

        // Fetch filtered agents when complaint type changes (town-based flow only)
        if (selectedOption && !divisionBased && formik.values.town_id) {
            fetchFilteredAgents(formik.values.town_id, selectedOption.value);
        }
    };

    const addAdditionalLocation = () => {
        setAdditionalLocations([...additionalLocations, { latitude: '', longitude: '', description: '' }]);
    };

    const handleSmAgentChange = (selectedOptions) => {
        setSelectedSmAgents(selectedOptions || []);
        // Update formik values
        const smAgentsData = (selectedOptions || []).map(sm => ({
            sm_agent_id: sm.value,
            status: sm.status || 1
        }));
        formik.setFieldValue('assigned_sm_agents', smAgentsData);
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

    // Options for select components
    const townOptions = towns.map(town => ({ value: town.id, label: town.town }));
    const subtownOptions = filteredSubtowns.map(subtown => ({ value: subtown.id, label: subtown.subtown }));
    const complaintTypeOptions = complaintTypes.map(type => ({ value: type.id, label: type.type_name }));
    const complaintSubTypeOptions = filteredSubTypes.map(type => ({ value: type.id, label: type.subtype_name }));
    const useFilteredExecutiveList = (isDivisionBased && formik.values.division_id) || (!isDivisionBased && formik.values.town_id);
    const availableExecutiveEngineers = useFilteredExecutiveList ? filteredExecutiveEngineers : executiveEngineers;

    // Re-validate when isDivisionBased changes
    useEffect(() => {
        if (isDivisionBased) {
            formik.setFieldValue('town_id', '', false);
            formik.setFieldValue('subtown_id', '', false);
            formik.setFieldTouched('town_id', false, false);
            formik.setFieldError('town_id', undefined);
        }
        formik.validateForm();
    }, [isDivisionBased]);

    useEffect(() => {
        console.log('[RequestForm] isDivisionBased flag changed', {
            isDivisionBased,
            division_id: formik.values?.division_id,
            town_id: formik.values?.town_id,
        });
    }, [isDivisionBased]);

    useEffect(() => {
        console.log('[RequestForm] Form values update', formik.values);
    }, [formik.values]);

    useEffect(() => {
        const errorKeys = Object.keys(formik.errors || {});
        if (errorKeys.length > 0) {
            console.warn('[RequestForm] Validation errors', formik.errors);
        }
    }, [formik.errors]);

    // Restriction logic for agent role 1
    const isAgentRole1 = session?.user?.userType === 'agent' && Number(agentInfo?.role) === 1;
    const divisionLocked = isAgentUser && Boolean(agentInfo?.division_id);
    const fixedTown = towns.find(t => t.id === agentInfo?.town_id);
    const fixedComplaintType = complaintTypes.find(ct => ct.id === agentInfo?.complaint_type_id);

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
                    {/* Department - Moved to top */}
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

                    {/* Conditionally show Town/Subtown OR Division based on department type */}
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
                                        isDisabled={!formik.values.complaint_type_id}
                                    />
                                    {formik.errors.town_id && formik.touched.town_id && (
                                        <p className="mt-1 text-sm text-red-600">{formik.errors.town_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Sub Town */}
                            <div>
                                <label htmlFor="subtown_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Sub Town
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
                                    isDisabled={(isAgentRole1 && !agentInfo?.town_id) || !formik.values.town_id}
                                />
                            </div>
                        </>
                    ) : (
                        /* Division - shown when department is division-based */
                        <div>
                            <label htmlFor="division_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Division *
                            </label>
                            {divisionLocked ? (
                                <>
                                    <input
                                        type="text"
                                        value={divisions.find(div => String(div.id) === String(formik.values.division_id))?.name || 'Loading...'}
                                        disabled
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Division is fixed based on the agent assignment.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Select
                                        id="division_id"
                                        name="division_id"
                                        options={divisions.map(div => ({ value: String(div.id), label: div.name }))}
                                        onChange={handleDivisionChange}
                                        value={
                                            formik.values.division_id
                                                ? {
                                                    value: String(formik.values.division_id),
                                                    label: divisions.find(div => String(div.id) === String(formik.values.division_id))?.name || 'Select division',
                                                }
                                                : null
                                        }
                                        className="basic-select"
                                        classNamePrefix="select"
                                        isDisabled={!formik.values.complaint_type_id}
                                        placeholder="Select division..."
                                    />
                                    {formik.errors.division_id && formik.touched.division_id && (
                                        <p className="mt-1 text-sm text-red-600">{formik.errors.division_id}</p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Complaint Sub Type */}
                    <div>
                        <label htmlFor="complaint_subtype_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Work
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

                {/* Additional Subtowns (Multi-select) - Only show for town-based */}
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
                            {availableExecutiveEngineers.map(ee => (
                                <option key={ee.id} value={ee.id}>{ee.name} - {ee.designation || 'Executive Engineer'}</option>
                            ))}
                        </select>
                    </div>
                )}
                {session?.user?.userType === 'agent' && Number(session.user.role) === 1 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contractor
                        </label>
                        <Select
                            options={contractors.map(c => ({ value: c.id, label: c.company_name || c.name || 'Contractor' }))}
                            value={contractors.find(c => c.id === formik.values.contractor_id) ? 
                                { value: formik.values.contractor_id, label: contractors.find(c => c.id === formik.values.contractor_id)?.company_name || contractors.find(c => c.id === formik.values.contractor_id)?.name || 'Contractor' } : 
                                null
                            }
                            onChange={selectedOption => formik.setFieldValue('contractor_id', selectedOption ? selectedOption.value : '')}
                            className="basic-select"
                            classNamePrefix="select"
                            placeholder="Select Contractor Company..."
                            isSearchable={true}
                            isClearable={true}
                        />
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
                            {availableExecutiveEngineers.map(ee => (
                            <option key={ee.id} value={ee.id}>{ee.name} - {ee.designation || 'Executive Engineer'}</option>
                            ))}
                        </select>
                        </div>

                        <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contractor
                        </label>
                        <Select
                            options={contractors.map(c => ({ value: c.id, label: c.company_name || c.name || 'Contractor' }))}
                            value={contractors.find(c => c.id === formik.values.contractor_id) ? 
                                { value: formik.values.contractor_id, label: contractors.find(c => c.id === formik.values.contractor_id)?.company_name || contractors.find(c => c.id === formik.values.contractor_id)?.name || 'Contractor' } : 
                                null
                            }
                            onChange={selectedOption => formik.setFieldValue('contractor_id', selectedOption ? selectedOption.value : '')}
                            className="basic-select"
                            classNamePrefix="select"
                            placeholder="Select Contractor Company..."
                            isSearchable={true}
                            isClearable={true}
                        />
                        </div>
                    </>
                    )}

                {/* Social Media Agent Assignment - Only for admins and managers */}
                {session?.user?.userType === 'user' && [1, 2].includes(Number(session.user.role)) && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Media Cell Agents
                        </label>
                        <Select
                            isMulti
                            options={smAgents.map(sm => ({ value: sm.id, label: sm.name }))}
                            value={selectedSmAgents}
                            onChange={handleSmAgentChange}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select social media agents"
                        />
                    </div>
                )}

                {/* <div className="md:col-span-2">
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
                        <option value="repairing">Repairing/Replacement</option>
                        <option value="new installation">New Installation</option>
                        <option value="new installation">Leakages</option>
                        <option value="new installation">Sunk Down</option>
                        <option value="new installation">Rewinding</option>
                        <option value="new installation">Provide n Fixing</option>
                        <option value="new installation">Desilting</option>
                        <option value="other">Emergency</option>
                    </select>
                    {formik.errors.nature_of_work && formik.touched.nature_of_work && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.nature_of_work}</p>
                    )}
                </div> */}

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