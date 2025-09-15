"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity, Video, Download, Upload } from "lucide-react";
import WorkRequestStatus from "@/components/WorkRequestStatus";
import Link from "next/link";

// Role mapping function
const getRoleDisplay = (roleId) => {
  const roleMap = {
    1: "CAMERA MAN",
    2: "ASSISTANT", 
    3: "PHOTOGRAPHER",
    4: "VIDEO EDITOR",
    5: "MANAGER",
    // Add more mappings as needed
  };
  return roleMap[roleId] || "UNKNOWN ROLE";
};

// Check if user has special role (video editor or manager)
const isSpecialRole = (roleId) => {
  return roleId === 4 || roleId === 5; // video_editor or manager
};

const statusIcons = {
  1: "⏳",
  2: "🔄", 
  3: "✅",
};

const statusColors = {
  1: "text-yellow-600",
  2: "text-blue-600",
  3: "text-green-600",
};

const statusLabels = {
  1: "Pending",
  2: "In Process", 
  3: "Completed",
};

// Add status mapping for display and logic
const statusMap = {
  1: 'Pending',
  2: 'Assigned',
  3: 'In Progress',
  4: 'Completed',
  5: 'Cancelled',
};

export default function SmAgentDashboard() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [finalVideos, setFinalVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = session?.user?.role;
  const userHasSpecialRole = isSpecialRole(userRole);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch assigned requests
        const requestsRes = await fetch(`/api/requests?assigned_smagent_id=${session.user.id}&limit=1000&include_approval_status=true`);
        const requestsData = await requestsRes.json();
        if (requestsData.data) {
          setRequests(requestsData.data);
        }

        // Fetch final videos if user is video editor or manager
        if (userHasSpecialRole) {
          const videosRes = await fetch(`/api/final-videos?creator_id=${session.user.id}&creator_type=socialmedia`);
          const videosData = await videosRes.json();
          if (Array.isArray(videosData)) {
            setFinalVideos(videosData);
          }
        }
        
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id, userHasSpecialRole]);

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading dashboard...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Media Cell Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {session?.user?.name} ({getRoleDisplay(userRole)})
        </p>
      </div>

      {userHasSpecialRole ? (
        // Video Editor / Manager Dashboard
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-blue-50 border-2 shadow-md">
              <div className="flex items-center">
                <Video className="text-blue-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Final Videos Created</p>
                  <p className="text-2xl font-bold text-blue-600">{finalVideos.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-green-50 border-2 shadow-md">
              <div className="flex items-center">
                <Download className="text-green-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Available for Download</p>
                  <p className="text-2xl font-bold text-green-600">{requests.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Final Videos</h2>
              {finalVideos.length === 0 ? (
                <p className="text-gray-500">No final videos created yet.</p>
              ) : (
                <div className="space-y-3">
                  {finalVideos.slice(0, 5).map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{video.description}</p>
                        <p className="text-sm text-gray-600">Request #{video.work_request_id}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(video.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link href="/smagent/final-videos" className="text-blue-600 hover:underline">
                  View all final videos →
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/smagent/final-videos/add">
                  <Card className="p-4 hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <Upload className="text-blue-600 mr-3" />
                      <span className="font-medium">Upload Final Video</span>
                    </div>
                  </Card>
                </Link>
                <Link href="/smagent/videos/download">
                  <Card className="p-4 hover:bg-green-50 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <Download className="text-green-600 mr-3" />
                      <span className="font-medium">Download Source Videos</span>
                    </div>
                  </Card>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        // Regular Social Media Agent Dashboard (Camera Man, Assistant, Photographer)
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-blue-50 border-2 shadow-md">
              <div className="flex items-center">
                <Activity className="text-blue-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Requests</p>
                  <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assigned Requests</h2>
            {requests.length === 0 ? (
              <div className="text-gray-500">No requests assigned to you yet.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {requests.slice(0, 6).map((req) => {
                  // Use status_id for logic
                  const statusId = Number(req.status_id);
                  const isCompleted = statusId === 4;
                  const displayStatus = statusMap[statusId] || req.status_name || 'Unknown';
                  // Only allow add image/video if not completed or user is admin/manager
                  // (Assume isAdminOrManager logic is similar to assigned-requests)
                  const isAdminOrManager = session?.user?.userType === 'user' && (session?.user?.role === 1 || session?.user?.role === 2);
                  return (
                    <Card key={req.id} className="p-6 flex flex-col gap-2 bg-slate-50 border-2 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isCompleted ? 'bg-green-100 text-green-700' : statusId === 3 ? 'bg-blue-100 text-blue-700' : statusId === 2 ? 'bg-yellow-100 text-yellow-700' : statusId === 1 ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>{displayStatus}</span>
                        <WorkRequestStatus 
                          status={req.status_name} 
                          approvalStatus={req.approval_status}
                          className="text-xs"
                        />
                      </div>
                      <div className="font-medium text-lg">{req.address || "No address"}</div>
                      <div className="text-sm text-gray-600">Type: {req.complaint_type || "-"}</div>
                      <div className="text-sm text-gray-600">
                        Date: {req.request_date ? new Date(req.request_date).toLocaleDateString() : "-"}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Link href={`/smagent/images/add?requestId=${req.id}`}>
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            disabled={isCompleted && !isAdminOrManager}
                          >
                            Add Image
                          </button>
                        </Link>
                        <Link href={`/smagent/videos/add?requestId=${req.id}`}>
                          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            disabled={isCompleted && !isAdminOrManager}
                          >
                            Add Video
                          </button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            {requests.length > 6 && (
              <div className="mt-4">
                <Link href="/smagent/assigned-requests" className="text-blue-600 hover:underline">
                  View all assigned requests →
                </Link>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
} 