"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const MilestonesPage = () => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                // Adjust this endpoint based on your actual API route
                const response = await fetch('/api/milestones');
                if (response.ok) {
                    const result = await response.json();
                    // Use result.data because your API returns { data: [...] }
                    setMilestones(result.data || []); 
                }
            } catch (error) {
                console.error('Error fetching milestones:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMilestones();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="bg-white shadow-sm border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Milestone Definitions</CardTitle>
                    <CardDescription>
                        Manage the sequence and categories of work milestones for the E-Filing system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-24 flex items-center justify-center">Loading milestones...</div>
                    ) : (
                        <DataTable columns={columns} data={milestones} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MilestonesPage;