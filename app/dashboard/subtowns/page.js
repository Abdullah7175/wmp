"use client";

import { useState, useEffect, Suspense } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Card } from "@/components/ui/card";
import { Plus, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

function SubTownsPage() {
  const [subtowns, setSubtowns] = useState([]);
  const [filteredSubtowns, setFilteredSubtowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTown, setSelectedTown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const townId = searchParams.get('town_id');

  useEffect(() => {
    const fetchSubTowns = async () => {
      try {
        let url = '/api/subtowns?limit=1000';
        if (townId) {
          url = `/api/subtowns?town_id=${townId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        const results = data.data || (Array.isArray(data) ? data : []);
        setSubtowns(results);
        setFilteredSubtowns(results);
        
        setLoading(false);
      } catch (e) {
        setError("Failed to load subtowns");
        setLoading(false);
      }
    };

    const fetchTownInfo = async () => {
      if (townId) {
        try {
          const response = await fetch(`/api/towns?id=${townId}`);
          if (response.ok) {
            const townData = await response.json();
            setSelectedTown(townData);
          }
        } catch (error) {
          console.error('Error fetching town info:', error);
        }
      }
    };

    fetchSubTowns();
    fetchTownInfo();
  }, [townId]);

  // Reset to page 1 when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredSubtowns.length]);

  const handleDelete = async (subtownId) => {
    if (!confirm('Are you sure you want to delete this subtown?')) return;
    
    try {
      const response = await fetch('/api/subtowns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subtownId }),
      });

      if (response.ok) {
        setSubtowns(prev => prev.filter(subtown => subtown.id !== subtownId));
        setFilteredSubtowns(prev => prev.filter(subtown => subtown.id !== subtownId));
        toast({
          title: "Subtown deleted successfully",
          variant: "success"
        });
      }
    } catch (error) {
      console.error('Error deleting subtown:', error);
    }
  };

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSubtowns.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredSubtowns.length / rowsPerPage) || 1;

  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading subtowns...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/towns" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Towns
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {selectedTown ? `Subtowns for ${selectedTown.town}` : 'All Subtowns'}
            </h1>
            <p className="text-gray-600">
              {selectedTown 
                ? `Manage subtowns for ${selectedTown.town}`
                : 'Manage all subtowns across all towns'
              }
            </p>
          </div>
          <Link href={selectedTown ? `/dashboard/subtowns/add?town_id=${selectedTown.id}` : "/dashboard/subtowns/add"}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Subtown
            </button>
          </Link>
        </div>
      </div>

      <Card className="p-6">
        <DataTable 
          columns={columns} 
          data={currentRows}
          onDelete={handleDelete}
          onFilteredDataChange={setFilteredSubtowns}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-medium">
              Subtowns ({filteredSubtowns.length})
              {selectedTown && ` for ${selectedTown.town}`}
            </span>
          </div>
        </DataTable>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 border-t pt-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{currentRows.length}</span> of{" "}
            <span className="font-medium">{filteredSubtowns.length}</span> entries
            {filteredSubtowns.length !== subtowns.length && (
              <span className="text-xs text-gray-400 ml-1">(filtered from {subtowns.length})</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            
            <span className="text-sm font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>

            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Last
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubTownsPage />
    </Suspense>
  );
}

export default PageWrapper;