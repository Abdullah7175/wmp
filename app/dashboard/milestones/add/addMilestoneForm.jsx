"use client"

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";

const validationSchema = Yup.object({
    nature_of_work: Yup.string()
        .required('Nature of work is required'),
    milestone_name: Yup.string()
        .required('Milestone name is required')
        .min(3, 'Name must be at least 3 characters'),
    order_sequence: Yup.number()
        .required('Order sequence is required')
        .positive('Must be a positive number')
        .integer('Must be an integer'),
});

const AddMilestoneForm = () => {
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            nature_of_work: '',
            milestone_name: '',
            order_sequence: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await fetch('/api/milestones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });

                if (response.ok) {
                    toast({
                        title: "Milestone added successfully",
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    const errorData = await response.json();
                    toast({
                        title: "Failed to add milestone",
                        description: errorData.error || '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred",
                    variant: 'destructive',
                });
            }
        },
    });

    if (isSuccess) {
        window.location.href = '/dashboard/milestones';
    }

    return (
        <div className='container w-full'>
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                
                {/* Nature of Work (Dropdown) */}
                <div>
                    <label htmlFor="nature_of_work" className="block text-gray-700 text-sm font-medium">Nature of Work</label>
                    <select
                        id="nature_of_work"
                        name="nature_of_work"
                        onChange={formik.handleChange}
                        value={formik.values.nature_of_work}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Nature of Work</option>
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
                        <div className="text-red-600 text-sm mt-2">{formik.errors.nature_of_work}</div>
                    )}
                </div>

                {/* Milestone Name */}
                <div>
                    <label htmlFor="milestone_name" className="block text-gray-700 text-sm font-medium">Milestone Name</label>
                    <input
                        id="milestone_name"
                        name="milestone_name"
                        type="text"
                        placeholder="e.g. Survey Completed"
                        onChange={formik.handleChange}
                        value={formik.values.milestone_name}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                    {formik.errors.milestone_name && formik.touched.milestone_name && (
                        <div className="text-red-600 text-sm mt-2">{formik.errors.milestone_name}</div>
                    )}
                </div>

                {/* Order Sequence */}
                <div>
                    <label htmlFor="order_sequence" className="block text-gray-700 text-sm font-medium">Order Sequence</label>
                    <input
                        id="order_sequence"
                        name="order_sequence"
                        type="number"
                        placeholder="1"
                        onChange={formik.handleChange}
                        value={formik.values.order_sequence}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                    {formik.errors.order_sequence && formik.touched.order_sequence && (
                        <div className="text-red-600 text-sm mt-2">{formik.errors.order_sequence}</div>
                    )}
                </div>

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-900 text-white font-semibold rounded-md hover:bg-blue-800 transition-colors"
                    >
                        Save Milestone
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMilestoneForm;