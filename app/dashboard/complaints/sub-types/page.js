"use client"
import { columns } from "./columns"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Page() {
  const [subtypes, setSubtypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fetchSubtypes = async () => {
        setLoading(true);
        try {
          let url = `/api/complaints/subtypes`;
          const params = [];
          if (search) params.push(`filter=${encodeURIComponent(search)}`);
          if (dateFrom) params.push(`date_from=${dateFrom}`);
          if (dateTo) params.push(`date_to=${dateTo}`);
          if (params.length) url += '?' + params.join('&');
          
          const response = await fetch(url);
          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              setSubtypes(result.data);
            } else {
              setSubtypes(result);
            }
          } else {
            setError('Failed to fetch complaint subtypes');
          }
        } catch (error) {
          setError('Error fetching complaint subtypes');
        } finally {
          setLoading(false);
        }
      };
      fetchSubtypes();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading complaint subtypes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Works</h1>
        <Link href="/dashboard/complaints/sub-types/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subtype
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Input
          placeholder="Search by subtype name, complaint type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setSearch("");
            setDateFrom("");
            setDateTo("");
          }}
          className="h-10"
        >
          Reset Filters
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <EnhancedDataTable 
          columns={columns} 
          data={subtypes}
          pageSize={5}
        />
      </div>
    </div>
  )
}
