"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, KeyRound, RotateCcw, Search } from "lucide-react";

export default function OtpManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const isAdmin = Number(session?.user?.role) === 1;

    const fetchOtpRecords = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/efiling/admin/otp-management");
            const data = await res.json();
            if (res.ok && data.success) {
                setRecords(data.data || []);
            } else {
                toast({
                    title: "Error fetching records",
                    description: data.error || "Failed to load OTP logs.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Network error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchOtpRecords();
        }
    }, [isAdmin]);

    const groupedData = useMemo(() => {
        const groups = {};

        records.forEach((record) => {
            const key = record.user_id;
            if (!groups[key]) {
                groups[key] = {
                    userId: record.user_id,
                    userName: record.user_name || "Unknown User",
                    userEmail: record.user_email || "N/A",
                    methodCounts: {},
                    attempts: [],
                };
            }

            const methodKey = (record.method || "Unknown").toLowerCase();
            groups[key].methodCounts[methodKey] = (groups[key].methodCounts[methodKey] || 0) + 1;
            groups[key].attempts.push(record);
        });

        return Object.values(groups);
    }, [records]);

    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groupedData;
        const q = searchQuery.toLowerCase();
        return groupedData.filter(
            (g) =>
                g.userName.toLowerCase().includes(q) ||
                g.userId.toString().includes(q) ||
                g.userEmail.toLowerCase().includes(q) ||
                Object.keys(g.methodCounts).some((m) => m.includes(q))
        );
    }, [groupedData, searchQuery]);

    const handleResetAttempts = async (userId) => {
        setActionLoading(userId);
        try {
            const res = await fetch(
                `/api/efiling/admin/otp-management?userId=${encodeURIComponent(userId)}`,
                { method: "DELETE" }
            );
            const data = await res.json();

            if (res.ok && data.success) {
                toast({
                    title: "OTP Reset Successful",
                    description: data.message,
                });
                await fetchOtpRecords();
            } else {
                toast({
                    title: "Reset Failed",
                    description: data.error || "Could not clear OTP attempts.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Failed to execute request.",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <ShieldAlert className="w-5 h-5" />
                            Access denied
                        </CardTitle>
                        <CardDescription>
                            This page is only available to e-filing administrators (role 1).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => router.push("/efiling")}>
                            Back to dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <KeyRound className="w-6 h-6 text-blue-600" />
                        OTP Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Monitor total active user OTP attempts across all methods and reset blocked limits.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchOtpRecords} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <CardTitle>Active User Attempts</CardTitle>
                        <div className="relative w-72">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <Input
                                placeholder="Search by name, ID, or method..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No active OTP records found.</p>
                    ) : (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="bg-gray-50 border-b text-gray-700 font-medium">
                                    <tr>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Method Breakdown</th>
                                        <th className="p-3">Total Attempts</th>
                                        <th className="p-3">Latest Attempt Details</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredGroups.map((group) => {
                                        const latestAttempt = group.attempts[0];
                                        const totalAttempts = group.attempts.length;

                                        return (
                                            <tr key={group.userId} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900">{group.userName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        User ID: {group.userId} | {group.userEmail}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {Object.entries(group.methodCounts).map(([method, count]) => {
                                                            const isWhatsapp = method === "whatsapp";
                                                            return (
                                                                <Badge
                                                                    key={method}
                                                                    className={isWhatsapp ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                                                                >
                                                                    {count} {method.charAt(0).toUpperCase() + method.slice(1)}
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`font-semibold ${totalAttempts >= 3 ? "text-red-600 font-bold" : "text-gray-700"}`}>
                                                        {totalAttempts} / 3 Attempts
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs space-y-1">
                                                    <div>
                                                        Code: <span className="font-mono text-gray-800 font-bold">{latestAttempt?.otp_code}</span> ({latestAttempt?.method})
                                                    </div>
                                                    <div>Created: {new Date(latestAttempt?.created_at).toLocaleString()}</div>
                                                    <div>Verified: {latestAttempt?.verified ? "True" : "False"}</div>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        disabled={actionLoading === group.userId}
                                                        onClick={() => handleResetAttempts(group.userId)}
                                                    >
                                                        {actionLoading === group.userId ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                                                Reset All Attempts
                                                            </>
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}