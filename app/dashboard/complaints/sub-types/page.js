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

  // Add this pagination state to control the table from here
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 8,
  });

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
            const data = result.data || (Array.isArray(result) ? result : []);
            setSubtypes(data);
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

  // Reset page to 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [search, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading complaint subtypes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
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

      {/* Filters */}
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

      {/* The Table */}
      <div className="bg-white rounded-lg shadow">
        <EnhancedDataTable 
          columns={columns} 
          data={subtypes} // Give it the full list
          state={{ pagination }} // Pass the controlled state
          onPaginationChange={setPagination} // Update state when user clicks next/prev
          pageSize={5}
        />
      </div>
    </div>
  )
}