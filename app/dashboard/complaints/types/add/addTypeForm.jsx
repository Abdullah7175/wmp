"use client"

import React, { useEffect,useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTypeContext } from './TypeContext';
import { useToast } from "@/hooks/use-toast";

const validationSchema = Yup.object({
    type_name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    description: Yup.string()
        .min(3, 'Name must be at least 3 characters'),
});

const TypeForm = () => {
    const { type, updateType } = useTypeContext();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const formik = useFormik({
        initialValues: {
            type_name: '',
            description: '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            updateType(values);
            try {
                const response = await fetch('/api/complaints/types', {
                    method: 'POST',
                    headers: {
                        'Content-_name': 'application/json',
                    },
                    body: JSON.stringify(values),
                });

                if (response.ok) {
                    toast({
                        title: "Type added successfully",
                        description: '',
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    toast({
                        title: "Failed to add type",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while adding the type",
                    description: '',
                    variant: 'destructive',
                });
            }
        },
    });

    return (
        <div className="container">
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-14 bg-white shadow-sm rounded-lg space-y-6 border">

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <label htmlFor="type_name" className="block text-gray-700 text-sm font-medium">Department</label>
                        <input
                            id="type_name"
                            name="type_name"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.subject}
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
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TypeForm;
