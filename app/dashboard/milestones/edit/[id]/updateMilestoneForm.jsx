"use client"

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";

const validationSchema = Yup.object({
    nature_of_work: Yup.string().required('Nature of work is required'),
    milestone_name: Yup.string()
        .required('Milestone name is required')
        .min(3, 'Name must be at least 3 characters'),
    order_sequence: Yup.number()
        .required('Order sequence is required')
        .positive()
        .integer(),
});

const UpdateMilestoneForm = ({ id }) => {
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [initialData, setInitialData] = useState({
        nature_of_work: '',
        milestone_name: '',
        order_sequence: '',
    });

    // Fetch existing milestone data
    useEffect(() => {
        const fetchMilestone = async () => {
            // Only fetch if id exists and isn't the string "undefined"
            if (!id || id === 'undefined') return; 

            try {
                const response = await fetch(`/api/milestones?id=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    // Since your API returns the object directly: result.rows[0]
                    setInitialData({
                        nature_of_work: data.nature_of_work || '',
                        milestone_name: data.milestone_name || '',
                        order_sequence: data.order_sequence || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching milestone:', error);
            }
        };
        fetchMilestone();
    }, [id]);

    const formik = useFormik({
        initialValues: initialData,
        validationSchema,
        enableReinitialize: true, // Crucial for pre-filling the form
        onSubmit: async (values) => {
            try {
                const response = await fetch('/api/milestones', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, ...values }),
                });

                if (response.ok) {
                    toast({
                        title: "Milestone updated successfully",
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    const errorData = await response.json();
                    toast({
                        title: "Update failed",
                        description: errorData.error || '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error updating form:', error);
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
                <div>
                    <label className="block text-gray-700 text-sm font-medium">Nature of Work</label>
                    <select
                        name="nature_of_work"
                        onChange={formik.handleChange}
                        value={formik.values.nature_of_work}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">Select Category</option>
                        <option value="Leakages">Leakages</option>
                        <option value="Sunk Down">Sunk Down</option>
                        <option value="Contamination">Contamination</option>
                        <option value="New Connection">New Connection</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-medium">Milestone Name</label>
                    <input
                        name="milestone_name"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.milestone_name}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-medium">Order Sequence</label>
                    <input
                        name="order_sequence"
                        type="number"
                        onChange={formik.handleChange}
                        value={formik.values.order_sequence}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div className='flex justify-end gap-3'>
                    <button
                        type="button"
                        onClick={() => window.location.href = '/dashboard/milestones'}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-900 text-white font-semibold rounded-md hover:bg-blue-800"
                    >
                        Update Milestone
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateMilestoneForm;