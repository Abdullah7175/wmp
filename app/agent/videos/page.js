"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/videos?creator_id=${session.user.id}&creator_type=agent`, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setVideos(data.data || data || []);
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
  }, [session?.user?.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={videos}>
        <h1 className="text-3xl font-semibold">Engineer Videos</h1>
      </DataTable>
    </div>
  )
}