"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Card } from "@/components/ui/card";
import { Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function TownsPage() {
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTowns = async () => {
      try {
        const response = await fetch('/api/towns?limit=1000');
        const data = await response.json();
        
        if (data.data) {
          setTowns(data.data);
        } else if (Array.isArray(data)) {
          setTowns(data);
        } else {
          setTowns([]);
        }
        
        setLoading(false);
      } catch (e) {
        setError("Failed to load towns");
        setLoading(false);
      }
    };

    fetchTowns();
  }, []);

  const handleDelete = async (townId) => {
    if (!confirm('Are you sure you want to delete this town?')) return;
    
    try {
      const response = await fetch('/api/towns', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: townId }),
      });

      if (response.ok) {
        setTowns(prev => prev.filter(town => town.id !== townId));
        toast({
          title: "Town deleted successfully",
          description: "The town has been removed from the system.",
          variant: "success"
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to delete town",
          description: errorData.error || "An error occurred while deleting the town.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting town:', error);
      toast({
        title: "Error",
        description: "Failed to delete town",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading towns...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Towns Management</h1>
            <p className="text-gray-600">
              Manage towns and their associated districts
            </p>
          </div>
          <Link href="/dashboard/towns/add">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Town
            </button>
          </Link>
        </div>
      </div>

      <Card className="p-6">
        <DataTable 
          columns={columns} 
          data={towns}
          onDelete={handleDelete}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Towns ({towns.length})</span>
          </div>
        </DataTable>
      </Card>
    </div>
  );
} 