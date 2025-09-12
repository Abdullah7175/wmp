"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { MessageCircleWarning, Activity, CheckCheck, Clock } from "lucide-react"
import { LineChartWithValues } from "@/components/lineChart"
import { PieChartWithValues } from "@/components/pieChart"
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DataTable } from "../agent/requests/data-table";
import { columns as requestColumns } from "../agent/requests/columns";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

const statusLabels = {
  1: { label: "Pending", icon: <Clock className="text-yellow-600" /> },
  2: { label: "In Process", icon: <Activity className="text-blue-600" /> },
  3: { label: "Completed", icon: <CheckCheck className="text-green-600" /> },
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57", "#ffc0cb"];

export default function AgentDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProcess: 0 });
    const [subtypeData, setSubtypeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requests, setRequests] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [analysisRows, setAnalysisRows] = useState([]);

    useEffect(() => {
        if (!session?.user?.id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all requests for this agent
                const res = await fetch(`/api/requests?creator_id=${session.user.id}&creator_type=agent&limit=1000`);
                const data = await res.json();
                const reqs = data.data || data;
                setRequests(reqs);
                // Calculate stats
                let total = reqs.length;
                let completed = 0, pending = 0, inProcess = 0;
                for (const req of reqs) {
                    const status = (req.status_name || "").toLowerCase();
                    if (status === "completed") completed++;
                    else if (status === "pending") pending++;
                    else if (status === "in process" || status === "in progress") inProcess++;
                }
                setStats({ total, completed, pending, inProcess });
                // Group by complaint_subtype
                const subtypeCounts = {};
                for (const req of reqs) {
                    const subtype = req.complaint_subtype || "Unknown";
                    subtypeCounts[subtype] = (subtypeCounts[subtype] || 0) + 1;
                }
                setChartData(Object.entries(subtypeCounts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] })));
                // For each request, fetch image and video counts
                const analysis = await Promise.all(reqs.map(async (req) => {
                    const [imgRes, vidRes] = await Promise.all([
                        fetch(`/api/images?workRequestId=${req.id}`),
                        fetch(`/api/videos?workRequestId=${req.id}`)
                    ]);
                    const images = await imgRes.json();
                    const videos = await vidRes.json();
                    return {
                        id: req.id,
                        date: req.request_date,
                        complaint_subtype: req.complaint_subtype || "Unknown",
                        imageCount: images.length || (images.data ? images.data.length : 0),
                        videoCount: videos.length || (videos.data ? videos.data.length : 0),
                    };
                }));
                setAnalysisRows(analysis);
            } catch (e) {
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session?.user?.id]);

    if (loading) {
        return <div className="flex items-center justify-center h-96 text-lg">Loading dashboard...</div>;
    }
    if (error) {
        return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row w-full gap-5">
                <Card className="w-full lg:w-1/4 bg-slate-50 border-2 shadow-md flex items-center p-6">
                    <MessageCircleWarning className="text-indigo-700 mr-4" />
                    <div>
                        <p className="text-md font-medium leading-none">Total Requests</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                </Card>
                <Card className="w-full lg:w-1/4 bg-slate-50 border-2 shadow-md flex items-center p-6">
                    <Clock className="text-yellow-600 mr-4" />
                    <div>
                        <p className="text-md font-medium leading-none">Pending</p>
                        <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                </Card>
                <Card className="w-full lg:w-1/4 bg-slate-50 border-2 shadow-md flex items-center p-6">
                    <Activity className="text-blue-600 mr-4" />
                    <div>
                        <p className="text-md font-medium leading-none">In Process</p>
                        <p className="text-2xl font-bold">{stats.inProcess}</p>
                    </div>
                </Card>
                <Card className="w-full lg:w-1/4 bg-slate-50 border-2 shadow-md flex items-center p-6">
                    <CheckCheck className="text-green-600 mr-4" />
                    <div>
                        <p className="text-md font-medium leading-none">Completed</p>
                        <p className="text-2xl font-bold">{stats.completed}</p>
                    </div>
                </Card>
            </div>

            <div className="flex flex-col lg:flex-row w-full gap-8 mt-10">
                <div className="w-full xl:w-1/2 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Requests by Works</h2>
                    <div className="w-full h-72">
                        <ChartContainer config={{}}>
                            {chartData.length <= 6 ? (
                                <PieChart>
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {chartData.map((entry, i) => (
                                            <Cell key={`cell-${i}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            ) : (
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8">
                                        {chartData.map((entry, i) => (
                                            <Cell key={`cell-bar-${i}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            )}
                        </ChartContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mt-10">
                <h2 className="text-lg font-semibold mb-4">Uploads Analysis per Request</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border">Request ID</th>
                                <th className="px-4 py-2 border">Date</th>
                                <th className="px-4 py-2 border">Works</th>
                                <th className="px-4 py-2 border"># Images</th>
                                <th className="px-4 py-2 border"># Videos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analysisRows.map(row => (
                                <tr key={row.id}>
                                    <td className="px-4 py-2 border">{row.id}</td>
                                    <td className="px-4 py-2 border">{row.date ? new Date(row.date).toLocaleDateString() : "-"}</td>
                                    <td className="px-4 py-2 border">{row.complaint_subtype}</td>
                                    <td className="px-4 py-2 border text-center">{row.imageCount}</td>
                                    <td className="px-4 py-2 border text-center">{row.videoCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}