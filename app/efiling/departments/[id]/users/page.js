"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Search, Users, Edit, Trash2, Mail, Shield, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

export default function DepartmentUsersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const [users, setUsers] = useState([]);
    const [departmentName, setDepartmentName] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (!session?.user?.id || !params?.id) return;
        fetchDepartmentUsers();
    }, [session?.user?.id, params?.id]);

    const fetchDepartmentUsers = async () => {
        setLoading(true);
        try {
            const [deptRes, usersRes] = await Promise.all([
                fetch(`/api/efiling/departments?id=${params.id}`),
                fetch(`/api/efiling/users?department_id=${params.id}&is_active=true`),
            ]);

            if (!deptRes.ok || !usersRes.ok) {
                throw new Error("Failed to load department users");
            }

            const deptData = await deptRes.json();
            const usersData = await usersRes.json();

            setDepartmentName(deptData?.name || "Department");
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error("Error fetching department users:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to load users for this department",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const query = searchTerm.toLowerCase();
        return (
            u.name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.role_name?.toLowerCase().includes(query) ||
            u.designation?.toLowerCase().includes(query)
        );
    });

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete "${userName || 'this user'}"?`)) return;

        try {
            const res = await fetch(`/api/efiling/users?id=${userId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Success",
                    description: data.message || "User deleted successfully",
                });
                // Remove deleted user from state immediately
                setUsers((prev) => prev.filter((u) => u.id !== userId));
            } else {
                toast({
                    title: "Cannot Delete User",
                    description: data.error || "Failed to delete user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred while deleting the user",
                variant: "destructive",
            });
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading department users...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {departmentName} — Users
                        </h1>
                        <p className="text-gray-600">
                            View and manage users assigned to this department
                        </p>
                    </div>
                </div>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search by name, role, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Active Users ({filteredUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No users found in this department</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                    <div>{user.name || "Unnamed User"}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>{user.role_name || "-"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{user.email || "-"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        user.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }
                                                >
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.push(`/efiling/departments/users/${user.id}/edit`)
                                                        }
                                                        className="inline-flex items-center gap-1"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        className="inline-flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {filteredUsers.length > 0 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredUsers.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(val) => {
                                    setItemsPerPage(val);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}