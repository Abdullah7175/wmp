"use client"
import { columns } from "./columns"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { useEffect, useState } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function Page() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        let url = '/api/videos';
        const params = [];
        if (debouncedSearch) params.push(`filter=${encodeURIComponent(debouncedSearch)}`);
        if (dateFrom) params.push(`date_from=${dateFrom}`);
        if (dateTo) params.push(`date_to=${dateTo}`);
        if (params.length) url += '?' + params.join('&');
        const response = await fetch(url, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          const videosData = Array.isArray(data) ? data : (data.data || []);
          setVideos(videosData);
          setError(null);
        } else {
          setError('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Error fetching videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [debouncedSearch, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading videos...</p>
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
        <h1 className="text-2xl font-bold">Videos</h1>
        <Link href={"/dashboard/videos/add"}>
          <Button variant="primary" className="border px-3">
            <Plus /> Add Video
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Input
          placeholder="Search by ID, address, description..."
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
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Searching...
          </div>
        ) : (
          <EnhancedDataTable 
            key={`${debouncedSearch}-${dateFrom}-${dateTo}`}
            columns={columns} 
            data={videos}
            pageSize={10}
          />
        )}
      </div>
    </div>
  )
}