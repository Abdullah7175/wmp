"use client"
import { columns } from "./columns"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { useEffect, useState, useRef } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function Page() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const limit = 20;
  const prevFiltersRef = useRef({ search, dateFrom, dateTo });

  // Reset page to 1 when filters change
  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.search !== search ||
      prevFiltersRef.current.dateFrom !== dateFrom ||
      prevFiltersRef.current.dateTo !== dateTo;
    
    if (filtersChanged && page !== 1) {
      setPage(1);
    }
    
    prevFiltersRef.current = { search, dateFrom, dateTo };
  }, [search, dateFrom, dateTo, page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fetchAgents = async () => {
        setLoading(true);
        setError(null);
        try {
          let url = `/api/agents?page=${page}&limit=${limit}`;
          if (search) url += `&filter=${encodeURIComponent(search)}`;
          if (dateFrom) url += `&date_from=${dateFrom}`;
          if (dateTo) url += `&date_to=${dateTo}`;
          
          const response = await fetch(url);
          if (response.ok) {
            const responseData = await response.json();
            const agentsData = Array.isArray(responseData) ? responseData : (responseData.data || []);
            const totalCount = responseData.total || agentsData.length;
            const normalizedAgents = agentsData.map((agent) => ({
              ...agent,
              division_name:
                agent.division_name ||
                agent.division ||
                agent.divisionName ||
                (agent.division && agent.division.name) ||
                "",
              town_name:
                agent.town_name ||
                agent.town ||
                agent.townName ||
                (agent.town && agent.town.name) ||
                "",
              complaint_type_name:
                agent.complaint_type_name ||
                agent.complaint_type ||
                agent.type_name ||
                agent.complaint_type_id ||
                "",
            }));
            setAgents(normalizedAgents);
            setTotal(totalCount);
          } else {
            const errorData = await response.json().catch(() => ({}));
            setError(errorData.error || 'Failed to fetch Engineers');
          }
        } catch (error) {
          console.error('Error fetching Engineer:', error);
          setError('Error fetching Engineers: ' + error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAgents();
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(total / limit);

  if (loading && agents.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Engineers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Engineers / Contractors</h1>
        <Link href={"/dashboard/agents/add"}>
          <Button variant="primary" className="border px-3">
            <Plus /> Add Engineer/Contractor
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Input
          placeholder="Search by ID, name, email, contact, role..."
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
          data={agents}
          pageSize={limit}
          totalItems={total}
          state={{
            pagination: {
              pageIndex: page - 1, // Convert to 0-based index
              pageSize: limit,
            },
          }}
          onPaginationChange={(updater) => {
            const newState = typeof updater === 'function' 
              ? updater({ pageIndex: page - 1, pageSize: limit })
              : updater;
            if (newState?.pageIndex !== undefined && newState.pageIndex !== page - 1) {
              setPage(newState.pageIndex + 1); // Convert back to 1-based index
            }
          }}
        />
      </div>
      
      {loading && agents.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mx-auto"></div>
          <span className="ml-2 text-sm text-gray-600">Updating...</span>
        </div>
      )}
      
      {error && (
        <div className="text-center py-4">
          <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4 max-w-md mx-auto">
            <p className="font-medium">Error loading Engineers</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
