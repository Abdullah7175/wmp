"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity, CheckCheck, Clock, Image as ImageIcon, Video } from "lucide-react";
import WorkRequestStatus from "@/components/WorkRequestStatus";
import Link from "next/link";

const statusColors = {
  1: "text-yellow-600",
  2: "text-blue-600",
  3: "text-green-600",
};
const statusIcons = {
  1: <Clock className="w-5 h-5" />,
  2: <Activity className="w-5 h-5" />,
  3: <CheckCheck className="w-5 h-5" />,
};
const statusLabels = {
  1: "Pending",
  2: "In Process",
  3: "Completed",
};

export default function AssignedRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to check if user is admin/manager
  const isAdminOrManager = session?.user?.userType === 'user' && (session?.user?.role === 1 || session?.user?.role === 2);
  // Helper to check if user is editor
  const isEditor = session?.user?.userType === 'socialmediaperson' && session?.user?.role === 'editor';

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    
    fetch(`/api/requests?assigned_smagent_id=${session.user.id}&limit=1000&include_approval_status=true`)
      .then(res => res.json())
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error("Invalid data");
        setRequests(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [session?.user?.id]);

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading assigned requests...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assigned Requests</h1>
        <p className="text-gray-600">
          All requests assigned to you for media upload
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No requests assigned</h3>
            <p>You don&apos;t have any requests assigned to you yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => {
            // Status mapping for display
            const statusMap = {
              1: 'Pending',
              2: 'Assigned',
              3: 'In Progress',
              4: 'Completed',
              5: 'Cancelled',
            };
            // Debug log
            console.log('Request debug:', req);
            // Use status_id for logic
            const statusId = Number(req.status_id);
            const isCompleted = statusId === 4;
            const displayStatus = statusMap[statusId] || req.status_name || 'Unknown';
            return (
              <Card key={req.id} className="p-6 flex flex-col gap-3 bg-white border-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">Request #{req.id}</div>
                    <div className="text-sm text-gray-500">{req.town_name}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${isCompleted ? 'bg-green-100 text-green-700' : statusId === 3 ? 'bg-blue-100 text-blue-700' : statusId === 2 ? 'bg-yellow-100 text-yellow-700' : statusId === 1 ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>{displayStatus}</span>
                    <WorkRequestStatus 
                      status={req.status_name} 
                      approvalStatus={req.approval_status}
                      className="text-xs"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-1">{req.address || "No address"}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Type:</span> {req.complaint_type || "-"}
                  </p>
                  {req.complaint_subtype && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Subtype:</span> {req.complaint_subtype}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {req.request_date ? new Date(req.request_date).toLocaleDateString() : "-"}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Link href={`/smagent/before-images/add?requestId=${req.id}`} className="flex-1">
                      <button className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                        disabled={isCompleted && !isAdminOrManager}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Before Content
                      </button>
                    </Link>
                    <Link href={`/smagent/images/add?requestId=${req.id}`} className="flex-1">
                      <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        disabled={isCompleted && !isAdminOrManager}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Add Image
                      </button>
                    </Link>
                    <Link href={`/smagent/videos/add?requestId=${req.id}`} className="flex-1">
                      <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        disabled={isCompleted && !isAdminOrManager}
                      >
                        <Video className="w-4 h-4" />
                        Add Video
                      </button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 