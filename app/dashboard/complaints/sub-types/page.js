"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";

export default function Page() {
  const [subtypes, setSubtypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const limit = 20;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fetchSubtypes = async () => {
        setLoading(true);
        try {
          let url = `/api/complaints/subtypes?page=${page}&limit=${limit}`;
          if (filter) url += `&filter=${encodeURIComponent(filter)}`;
          const response = await fetch(url);
          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              setSubtypes(result.data);
              setTotal(result.total);
            } else {
              setSubtypes(result);
              setTotal(result.length || 0);
            }
          } else {
            setError('Failed to fetch Works');
          }
        } catch (error) {
          setError('Error fetching Works');
        } finally {
          setLoading(false);
        }
      };
      fetchSubtypes();
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, filter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={subtypes}>
        <h1 className="text-3xl font-semibold">Works</h1>
        {/* <input
          placeholder="Filter subtypes..."
          value={filter}
          onChange={e => { setPage(1); setFilter(e.target.value); }}
          className="max-w-sm bg-gray-100 shadow-sm border px-2 py-1 rounded ml-4"
        /> */}
      </DataTable>
      <div className="flex justify-center mt-6 gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
        <span className="px-2">Page {page} of {totalPages || 1}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="text-center text-red-600 py-4">{error}</div>}
    </div>
  )
}
