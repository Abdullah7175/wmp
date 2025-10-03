"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useComplaintContext } from './ComplaintContext';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Select = dynamic(() => import('react-select'), {
    ssr: false,
});


const validationSchema = Yup.object({
    subject: Yup.string()
        .required('Subject is required')
        .min(3, 'Subject must be at least 3 characters'),

    district_id: Yup.string()
        .required('District is required'),

    town_id: Yup.string()
        .required('Town is required'),

    site_location: Yup.string()
        .required('Site location is required'),

    size_of_pipe: Yup.string()
        .required('Size of pipe is required')
        .min(1, 'Size of pipe must be at least 1 character'),

    length_of_pipe: Yup.number()
        .required('Length of pipe is required')
        .positive('Length of pipe must be a positive number'),

    allied_items: Yup.string()
        .required('Allied items are required'),

    associated_work: Yup.string()
        .required('Associated work is required'),

    survey_date: Yup.date()
        .required('Survey date is required')
        .nullable(),

    completion_date: Yup.date()
        .required('Completion date is required')
        .nullable()
        .min(Yup.ref('survey_date'), 'Completion date must be after the survey date'),

    geo_tag: Yup.string()
        .required('Geo tag is required')
        .min(1, 'Geo tag must be at least 1 character'),

    assistant_id: Yup.string()
        .required('Assistant ID is required'),

    status: Yup.string()
        .required('Status is required'),

    shoot_date: Yup.date()
        .required('Shoot date is required')
        .nullable(),

    expenditure_charge: Yup.string()
        .required('expenditure charge type is required'),
    complaint_type_id: Yup.string()
        .required('Complaint type is required'),

    complaint_subtype_id: Yup.string()
        .required('Complaint subtype is required'),

    before_image: Yup.string(),
    after_image: Yup.string(),

    link: Yup.string()
        .url('Invalid URL format'),
});

const ComplaintForm = () => {
    const params = useParams();
    const complaintId = params.id;
    const { type, updateType } = useComplaintContext();
    const [complaintType, setComplaintType] = useState([]);
    const [complaintSubType, setComplaintSubType] = useState([]);
    const [filteredSubTypes, setFilteredSubTypes] = useState([]);
    const [selectedComplaintType, setSelectedComplaintType] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [towns, setTowns] = useState([]);
    const [filteredTowns, setFilteredTowns] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [status, setStatus] = useState([]);
    const [assistant, setAssistant] = useState([]);
    const { toast } = useToast();
    const [initialValues, setInitialValues] = useState({
        subject: '',
        district_id: '',
        town_id: '',
        district_title: '',
        site_location: '',
        size_of_pipe: '',
        length_of_pipe: '',
        allied_items: '',
        associated_work: '',
        survey_date: '',
        completion_date: '',
        geo_tag: '',
        assistant_id: '',
        status: '',
        shoot_date: '',
        complaint_type_id: '',
        complaint_subtype_id: '',
        expenditure_charge: '',
        before_image: '',
        after_image: '',
        link: '',
    });
    const router = useRouter();

    useEffect(() => {
        const fetchComplaint = async () => {
            if (complaintId) {
                try {
                    const response = await fetch(`/api/complaints/getcomplaint?id=${complaintId}`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log(data);

                        setInitialValues({
                            subject: data.subject,
                            district_id: data.district_id,
                            district_title: data.district_title,
                            town_id: data.town_id,
                            site_location: data.site_location,
                            size_of_pipe: data.size_of_pipe,
                            length_of_pipe: data.length_of_pipe,
                            allied_items: data.allied_items,
                            associated_work: data.associated_work,
                            survey_date: data.survey_date,
                            completion_date: data.completion_date,
                            geo_tag: data.geo_tag,
                            assistant_id: data.assistant_id,
                            status: data.status,
                            shoot_date: data.shoot_date,
                            complaint_type_id: data.complaint_type_id,
                            complaint_subtype_id: data.complaint_subtype_id,
                            expenditure_charge: data.expenditure_charge,
                            before_image: data.before_image,
                            after_image: data.after_image,
                            link: data.link,
                        });
                    } else {
                        toast({
                            title: "Failed to fetch complaint data",
                            description: '',
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching complaint data:', error);
                    toast({
                        title: "Error fetching complaint data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };

        fetchComplaint();
    }, [complaintId, toast]);

    useEffect(() => {
        const fetchDistrict = async () => {
            try {
                const res = await fetch('/api/complaints/getinfo');
                if (!res.ok) {
                    throw new Error('Failed to fetch districts');
                }
                const data = await res.json();
                setDistricts(data.districts);
                setTowns(data.towns);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchDistrict();

        const fetchComplaintTypes = async () => {
            try {
                const res = await fetch('/api/complaints/getalltypes', { method: 'GET' });
                if (!res.ok) {
                    throw new Error('Failed to fetch complaint types');
                }
                const data = await res.json();
                setComplaintType(data);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchComplaintTypes();

        const fetchComplaintSubTypes = async () => {
            try {
                const res = await fetch('/api/complaints/subtypes', { method: 'GET' });
                if (!res.ok) {
                    throw new Error('Failed to fetch complaint subtypes');
                }
                const data = await res.json();
                setComplaintSubType(data);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchComplaintSubTypes();

        const fetchAssistant = async () => {
            try {
                const res = await fetch('/api/users', { method: 'GET' });
                if (!res.ok) {
                    throw new Error('Failed to fetch assistant');
                }
                const data = await res.json();
                setAssistant(data);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchAssistant();

        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/complaints/getinfo');
                if (!res.ok) {
                    throw new Error('Failed to fetch status');
                }
                const data = await res.json();
                setStatus(data.status);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchStatus();
    }, []);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const response = complaintId
                    ? await fetch(`/api/complaints/getcomplaint`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ...values, id: complaintId }),
                    })
                    : await fetch('/api/complaints/getcomplaint', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(values),
                    });

                if (response.ok) {
                    toast({
                        title: complaintId ? "Complaint updated successfully" : "Complaint added successfully",
                        description: '',
                        variant: 'success',
                    });
                    router.push('/dashboard/complaints');
                } else {
                    toast({
                        title: complaintId ? "Failed to update complaint" : "Failed to add complaint",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while processing the complaint",
                    description: '',
                    variant: 'destructive'
                });
            }
        },
    });
    const complaintTypeOptions = complaintType.map(type => ({
        value: type.id,
        label: type.type_name
    }));

    const DistrictOptions = districts.map((district) => ({
        value: district.id,
        label: district.title,
    }));


    const AssistantOptions = assistant.map(agent => ({
        value: agent.id,
        label: agent.name,
    }));

    const StatusOptions = status.map(item => ({
        value: item.id,
        label: item.name,
    }));


    const handleDistrictChange = (selectedOption) => {
        setSelectedDistrict(selectedOption);
        const filteredTowns = towns.filter(town => town.district_id === selectedOption.value);
        setFilteredTowns(filteredTowns);
        formik.setFieldValue('district_id', selectedOption ? selectedOption.value : '');
        formik.setFieldValue('town_id', '');
    };

    const TownOptions = filteredTowns.map(town => ({
        value: town.id,
        label: town.town,
    }));

    const handleComplaintTypeChange = (selectedOption) => {
        setSelectedComplaintType(selectedOption);

        const filtered = complaintSubType.filter(subtype => subtype.complaint_type_id === selectedOption.value);

        setFilteredSubTypes(filtered);

        formik.setFieldValue('complaint_type_id', selectedOption ? selectedOption.value : '');

        formik.setFieldValue('complaint_subtype_id', '');
    };

    const complaintSubTypeOptions = filteredSubTypes.map(type => ({
        value: type.id,
        label: type.subtype_name
    }));


    return (
        <div className='container'>
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-14 bg-white shadow-md rounded-lg space-y-6 border">
                <input id="expenditure_charge" name="expenditure_charge" value={0} className='hidden' readOnly />
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="subject" className="block text-gray-700 text-sm font-medium">Subject</label>
                        <input
                            id="subject"
                            name="subject"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.subject}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.subject && formik.touched.subject && <div className="text-red-600 text-sm mt-2">{formik.errors.subject}</div>}
                    </div>

                    <div>
                        <label htmlFor="district_id" className="block text-gray-700 text-sm font-medium">District</label>
                        <Select
                            id="district_id"
                            name="district_id"
                            options={DistrictOptions}
                            onChange={handleDistrictChange}
                            value={DistrictOptions.find(option => option.value === formik.values.district_id) || null}
                            className="mt-1 w-full"
                            classNamePrefix="react-select"
                        />


                        {formik.errors.district_id && formik.touched.district_id && <div className="text-red-600 text-sm mt-2">{formik.errors.district_id}</div>}
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="town_id" className="block text-gray-700 text-sm font-medium">Town</label>
                        <Select
                            id="town_id"
                            name="town_id"
                            options={TownOptions}
                            onChange={(selectedOption) => {
                                formik.setFieldValue('town_id', selectedOption ? selectedOption.value : '');
                            }}
                            value={TownOptions.find(option => option.value === formik.values.town_id) || null}
                            className="mt-1 w-full"
                            classNamePrefix="react-select"
                            isDisabled={!selectedDistrict}
                        />

                        {formik.errors.town_id && formik.touched.town_id && <div className="text-red-600 text-sm mt-2">{formik.errors.town_id}</div>}
                    </div>


                    <div>
                        <label htmlFor="site_location" className="block text-gray-700 text-sm font-medium">Site Location</label>
                        <input
                            id="site_location"
                            name="site_location"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.site_location}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.site_location && formik.touched.site_location && <div className="text-red-600 text-sm mt-2">{formik.errors.site_location}</div>}
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="size_of_pipe" className="block text-gray-700 text-sm font-medium">Size of Pipe</label>
                        <input
                            id="size_of_pipe"
                            name="size_of_pipe"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.size_of_pipe}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.size_of_pipe && formik.touched.size_of_pipe && <div className="text-red-600 text-sm mt-2">{formik.errors.size_of_pipe}</div>}
                    </div>

                    <div>
                        <label htmlFor="length_of_pipe" className="block text-gray-700 text-sm font-medium">Length of Pipe</label>
                        <input
                            id="length_of_pipe"
                            name="length_of_pipe"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.length_of_pipe}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.length_of_pipe && formik.touched.length_of_pipe && <div className="text-red-600 text-sm mt-2">{formik.errors.length_of_pipe}</div>}
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="allied_items" className="block text-gray-700 text-sm font-medium">Allied Items</label>
                        <input
                            id="allied_items"
                            name="allied_items"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.allied_items}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.allied_items && formik.touched.allied_items && <div className="text-red-600 text-sm mt-2">{formik.errors.allied_items}</div>}
                    </div>

                    <div>
                        <label htmlFor="associated_work" className="block text-gray-700 text-sm font-medium">Associated Work</label>
                        <input
                            id="associated_work"
                            name="associated_work"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.associated_work}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.associated_work && formik.touched.associated_work && <div className="text-red-600 text-sm mt-2">{formik.errors.associated_work}</div>}
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="survey_date" className="block text-gray-700 text-sm font-medium">Survey Date</label>
                        <input
                            id="survey_date"
                            name="survey_date"
                            type="date"
                            onChange={formik.handleChange}
                            value={formik.values.survey_date.split('T')[0]}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.survey_date && formik.touched.survey_date && <div className="text-red-600 text-sm mt-2">{formik.errors.survey_date}</div>}
                    </div>

                    <div>
                        <label htmlFor="completion_date" className="block text-gray-700 text-sm font-medium">Completion Date</label>
                        <input
                            id="completion_date"
                            name="completion_date"
                            type="date"
                            onChange={formik.handleChange}
                            value={formik.values.completion_date.split('T')[0]}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.completion_date && formik.touched.completion_date && <div className="text-red-600 text-sm mt-2">{formik.errors.completion_date}</div>}
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="geo_tag" className="block text-gray-700 text-sm font-medium">Geo Tag</label>
                        <input
                            id="geo_tag"
                            name="geo_tag"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.geo_tag}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.geo_tag && formik.touched.geo_tag && <div className="text-red-600 text-sm mt-2">{formik.errors.geo_tag}</div>}
                    </div>

                    <div>
                        <label htmlFor="assistant_id" className="block text-gray-700 text-sm font-medium">Assistant</label>
                        <Select
                            id="assistant_id"
                            name="assistant_id"
                            options={AssistantOptions}
                            onChange={(selectedOption) => {
                                formik.setFieldValue('assistant_id', selectedOption ? selectedOption.value : '')
                            }
                            }
                            value={
                                AssistantOptions.find((option) => option.value === formik.values.assistant_id) || null
                            }
                            className="mt-1 w-full"
                            classNamePrefix="react-select"
                        />
                        {formik.errors.assistant_id && formik.touched.assistant_id && <div className="text-red-600 text-sm mt-2">{formik.errors.assistant_id}</div>}
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="status" className="block text-gray-700 text-sm font-medium">Status</label>
                        <Select
                            id="status"
                            name="status"
                            options={StatusOptions}
                            onChange={(selectedOption) =>
                                formik.setFieldValue('status', selectedOption ? selectedOption.value : '')
                            }
                            value={
                                StatusOptions.find((option) => option.value === formik.values.status) || null
                            }
                            className="mt-1 w-full"
                            classNamePrefix="react-select"
                        />
                        {formik.errors.status && formik.touched.status && <div className="text-red-600 text-sm mt-2">{formik.errors.status}</div>}
                    </div>


                    <div>
                        <label htmlFor="shoot_date" className="block text-gray-700 text-sm font-medium">Shoot Date</label>
                        <input
                            id="shoot_date"
                            name="shoot_date"
                            type="date"
                            onChange={formik.handleChange}
                            value={formik.values.shoot_date.split('T')[0]}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.shoot_date && formik.touched.shoot_date && <div className="text-red-600 text-sm mt-2">{formik.errors.shoot_date}</div>}
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="complaint_type_id" className="block text-gray-700 text-sm font-medium">Complaint Type</label>
                        <Select
                            id="complaint_type_id"
                            name="complaint_type_id"
                            options={complaintTypeOptions}
                            onChange={handleComplaintTypeChange}
                            value={
                                complaintTypeOptions.find((option) => option.value === formik.values.district_title) || selectedComplaintType
                            }
                            className="mt-1 w-full"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label htmlFor="complaint_subtype_id" className="block text-gray-700 text-sm font-medium">Complaint Sub-Type</label>
                        <Select
                            id="complaint_subtype_id"
                            name="complaint_subtype_id"
                            options={complaintSubTypeOptions}
                            onChange={selectedOption => {
                                formik.setFieldValue('complaint_subtype_id', selectedOption ? selectedOption.value : '')

                            }}
                            value={
                                complaintSubTypeOptions.find(subtype => subtype.value === formik.values.complaint_subtype_id) || null
                            }

                            className="mt-1 w-full"
                            classNamePrefix="react-select"
                            isDisabled={!selectedComplaintType}
                        />
                        {formik.errors.complaint_subtype_id && formik.touched.complaint_subtype_id && (
                            <div className="text-red-600 text-sm mt-2">{formik.errors.complaint_subtype_id}</div>
                        )}
                    </div>
                </div>


                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Before Image */}
                    <div>
                        <label htmlFor="before_image" className="block text-gray-700 text-sm font-medium">Before Image</label>
                        <div className="mt-1">
                            {/* Display image preview if there's a URL or image is selected */}
                            {formik.values.before_image?.url ? (
                                <div className="flex justify-center items-center">
                                    <Image
                                        src={formik.values.before_image.url}
                                        alt="Before Image Preview"
                                        className="w-32 h-32 object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        className="text-sm text-red-500 ml-2"
                                        onClick={() => formik.setFieldValue("before_image", null)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                // File input if no image is selected
                                <div className="flex items-center">
                                    <input
                                        id="before_image"
                                        name="before_image"
                                        type="file"
                                        onChange={(e) => {
                                            formik.setFieldValue("before_image", e.target.files[0]);
                                        }}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="before_image"
                                        className="cursor-pointer inline-block bg-gray-100 text-gray-500 border-3 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Choose a file
                                    </label>
                                    {formik.values.before_image && formik.values.before_image.name && (
                                        <div className="mt-2 text-gray-700 text-sm">
                                            <span className="font-medium">Selected File:</span> {formik.values.before_image.name}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {formik.errors.before_image && formik.touched.before_image && (
                            <div className="text-red-600 text-sm mt-2">{formik.errors.before_image}</div>
                        )}
                    </div>

                    {/* After Image */}
                    <div>
                        <label htmlFor="after_image" className="block text-gray-700 text-sm font-medium">After Image</label>
                        <div className="mt-1">
                            {/* Display image preview if there's a URL or image is selected */}
                            {formik.values.after_image?.url ? (
                                <div className="flex justify-center items-center">
                                    <Image
                                        src={formik.values.after_image.url}
                                        alt="After Image Preview"
                                        className="w-32 h-32 object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        className="text-sm text-red-500 ml-2"
                                        onClick={() => formik.setFieldValue("after_image", null)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                // File input if no image is selected
                                <div className="flex items-center">
                                    <input
                                        id="after_image"
                                        name="after_image"
                                        type="file"
                                        onChange={(e) => {
                                            formik.setFieldValue("after_image", e.target.files[0]);
                                        }}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="after_image"
                                        className="cursor-pointer inline-block bg-gray-100 text-gray-500 border-3 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Choose a file
                                    </label>
                                    {formik.values.after_image && formik.values.after_image.name && (
                                        <div className="mt-2 text-gray-700 text-sm">
                                            <span className="font-medium">Selected File:</span> {formik.values.after_image.name}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {formik.errors.after_image && formik.touched.after_image && (
                            <div className="text-red-600 text-sm mt-2">{formik.errors.after_image}</div>
                        )}
                    </div>
                </div>


                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Update Complaint
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ComplaintForm;
