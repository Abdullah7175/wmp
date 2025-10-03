"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";

export default function Page() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/complaints?page=${page}&limit=${limit}`);
        if (response.ok) {
          const { data, total } = await response.json();
          setComplaints(data);
          setTotal(total);
        } else {
          setError('Failed to fetch complaints');
        }
      } catch (error) {
        setError('Error fetching complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={complaints}>
        <h1 className="text-3xl font-semibold">Complaints</h1>
      </DataTable>
      <div className="flex justify-center mt-6 gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
        <span className="px-2">Page {page} of {totalPages || 1}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}
