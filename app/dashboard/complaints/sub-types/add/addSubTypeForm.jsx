"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";
import Select from 'react-select';
import { useSubtypeContext } from './SubTypeContext';

const validationSchema = Yup.object({
    subtype_name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    complaint_type_id: Yup.string(),

    description: Yup.string()
        .min(3, 'Name must be at least 3 characters'),

});

const SubtypeForm = () => {
    const { subtype, updateSubtype } = useSubtypeContext();
    const [types, setTypes] = useState(0)
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [complaintType, setComplaintType] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const formik = useFormik({
        initialValues: {
            subtype_name: '',
            complaint_type_id: '',
            description: '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            updateSubtype(values);
            try {
                const response = await fetch('/api/complaints/subtypes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });

                if (response.ok) {
                    toast({
                        title: "Work added successfully",
                        description: '',
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    toast({
                        title: "Failed to add Work",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while adding the Work",
                    description: '',
                    variant: 'destructive',
                });
            }
        },
    });


    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch('/api/complaints/subtypes', { method: 'GET' });
                if (response.ok) {
                    const data = await response.json();
                    setTypes(data);
                } else {
                    setError('Failed to fetch Works');
                }
            } catch (error) {
                setError('Error fetching Works');
            } finally {
                setLoading(false);
            }
        };
        fetchTypes();
    }, []);

    useEffect(() => {
        const fetchComplaintTypes = async () => {
            try {
                const res = await fetch('/api/complaints/getalltypes', { method: 'GET' });
                if (!res.ok) {
                    throw new Error('Failed to fetch Department');
                }
                const data = await res.json();
                setComplaintType(data)
            } catch (error) {
                setError(error.message);
            } 
        };

        fetchComplaintTypes();
    }, []);

    const complaintTypeOptions = complaintType.map(type => ({
        value: type.id,
        label: type.type_name
    }));


    return (
        <div className="container">
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-14 bg-white shadow-sm rounded-lg space-y-6 border">

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="complaintTypeName" className="block text-gray-700 text-sm font-medium">Work</label>
                        <input
                            id="subtype_name"
                            name="subtype_name"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.subtype_name}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.subtype_name && formik.touched.subtype_name && <div className="text-red-600 text-sm mt-2">{formik.errors.subtype_name}</div>}
                    </div>

                    <div>
                        <label htmlFor="complaint_type_id" className="block text-gray-700 text-sm font-medium">Department</label>
                        <Select
                            id="complaint_type_id"
                            name="complaint_type_id"
                            options={complaintTypeOptions}
                            onChange={selectedOption => formik.setFieldValue('complaint_type_id', selectedOption ? selectedOption.value : '')}
                            value={
                                complaintTypeOptions.find(option => option.value === formik.values.complaint_type_id) || null
                            }
                            className="mt-1 w-full"
                            classNamePrefix="react-select"
                        />
                    </div>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2"> {/* Ensure full width on all grid sizes */}
                        <label htmlFor="townId" className="block text-gray-700 text-sm font-medium">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            onChange={e => formik.setFieldValue('description', e.target.value)}
                            value={formik.values.description}
                            className="mt-1 w-full h-32 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter Description"
                        />
                        {formik.errors.description && formik.touched.description && <div className="text-red-600 text-sm mt-2">{formik.errors.description}</div>}
                    </div>
                </div>

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubtypeForm;
