"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const MilestonesPage = () => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const response = await fetch('/api/milestones');
                if (response.ok) {
                    const result = await response.json();
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div>
                        <CardTitle className="text-2xl font-bold">Milestone Definitions</CardTitle>
                        <CardDescription className="mt-1">
                            Manage the sequence and categories of work milestones for the E-Filing system.
                        </CardDescription>
                    </div>
                    <Button 
                        onClick={() => router.push('/dashboard/milestones/add')}
                        className="bg-blue-950 hover:bg-blue-900 text-white flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Milestone
                    </Button>
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