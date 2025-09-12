"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTypeContext } from './TypeContext';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';

const validationSchema = Yup.object({
    type_name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    description: Yup.string()
        .min(3, 'Name must be at least 3 characters'),
});

const TypeForm = () => {
    const params = useParams();
    const typeId = params.id;
    const { type, updateType } = useTypeContext();
    const { toast } = useToast();
    const [initialValues, setInitialValues] = useState({
        type_name: '',
        description: '',
    });
    const router = useRouter();

    useEffect(() => {
        const fetchType = async () => {
            if (typeId) {
                try {
                    const response = await fetch(`/api/complaints/types?id=${typeId}`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log(data);
                        setInitialValues({
                            type_name: data.type_name,
                            description: data.description,
                        });
                    } else {
                        toast({
                            title: "Failed to fetch type data",
                            description: '',
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching type data:', error);
                    toast({
                        title: "Error fetching type data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };

        fetchType();
    }, [typeId, toast]);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const response = typeId
                    ? await fetch(`/api/complaints/types`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ...values, id: typeId }),
                    })
                    : await fetch('/api/complaints/types', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(values),
                    });

                if (response.ok) {
                    toast({
                        title: typeId ? "Type updated successfully" : "Type added successfully",
                        description: '',
                        variant: 'success',
                    });
                    router.push('/dashboard/complaints/types');
                } else {
                    toast({
                        title: typeId ? "Failed to update type" : "Failed to add type",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while processing the type",
                    description: '',
                    variant: 'destructive'
                });
            }
        },
    });

    return (
        <div className='container'>
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-14 bg-white shadow-sm rounded-lg space-y-6 border">

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <label htmlFor="type_name" className="block text-gray-700 text-sm font-medium">Department</label>
                        <input
                            id="type_name"
                            name="type_name"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.type_name}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.type_name && formik.touched.type_name && <div className="text-red-600 text-sm mt-2">{formik.errors.type_name}</div>}
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
                        Add Type
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TypeForm;
