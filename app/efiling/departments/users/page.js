"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, User, Building, Shield, Users, UserCheck, UserX } from "lucide-react";

export default function DepartmentUsers() {
    const router = useRouter();
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/efiling/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/efiling/users?id=${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "User deleted successfully",
                });
                fetchData();
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to delete user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: "Error",
                description: "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <UserCheck className="w-3 h-3 mr-1" />
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                <UserX className="w-3 h-3 mr-1" />
                Inactive
            </Badge>
        );
    };

    const getConsultantBadge = (isConsultant) => {
        return isConsultant ? (
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                <Shield className="w-3 h-3 mr-1" />
                Consultant
            </Badge>
        ) : (
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                <Building className="w-3 h-3 mr-1" />
                KWSC Employee
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">E-Filing Users</h1>
                    <p className="text-gray-600">Manage e-filing system users and consultants</p>
                </div>
                <Button
                    onClick={() => router.push('/efiling/departments/users/create')}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Users ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">User</th>
                                        <th className="text-left py-3 px-4 font-medium">Type</th>
                                        <th className="text-left py-3 px-4 font-medium">Employee ID</th>
                                        <th className="text-left py-3 px-4 font-medium">Designation</th>
                                        <th className="text-left py-3 px-4 font-medium">Department</th>
                                        <th className="text-left py-3 px-4 font-medium">Role</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {getConsultantBadge(user.is_consultant)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.is_consultant ? (
                                                    <span className="text-gray-400 italic">N/A</span>
                                                ) : (
                                                    user.employee_id || <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.is_consultant ? (
                                                    <span className="text-gray-400 italic">N/A</span>
                                                ) : (
                                                    user.designation || <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.is_consultant ? (
                                                    <span className="text-gray-400 italic">N/A</span>
                                                ) : (
                                                    user.department_name || <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">
                                                    {user.role_name || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {getStatusBadge(user.is_active)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/efiling/departments/users/${user.id}/edit`)}
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 