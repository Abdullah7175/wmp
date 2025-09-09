"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Building2, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MarkToModal({ showMarkToModal, onClose, fileId, fileNumber, subject }) {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (showMarkToModal) {
            fetchUsers();
            fetchDepartments();
            if (departmentFilter === 'all') setDepartmentFilter('6');
        }
    }, [showMarkToModal]);

    const fetchUsers = async () => {
        try {
            const dept = departmentFilter === 'all' ? '' : `&department_id=${departmentFilter}`;
            const response = await fetch(`/api/efiling/users?is_active=true&role_prefix=SE_${dept}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/efiling/departments?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.department_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = departmentFilter === 'all' || user.department_id == departmentFilter;
        
        return matchesSearch && matchesDepartment;
    });

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one user to mark the file to",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/efiling/files/${fileId}/mark-to`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_ids: selectedUsers,
                    remarks: `File marked to ${selectedUsers.length} user(s)`
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `File marked to ${selectedUsers.length} user(s) successfully`,
                });
                onClose();
                setSelectedUsers([]);
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to mark file",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error marking file:', error);
            toast({
                title: "Error",
                description: "Failed to mark file",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!showMarkToModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">Mark File To Users</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {fileNumber} - {subject}
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left side - User selection */}
                        <div>
                            <div className="mb-4">
                                <Label className="text-sm font-medium">Select Users</Label>
                                <div className="mt-2 relative">
                                    <Input
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="border rounded-lg max-h-64 overflow-y-auto">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                                            selectedUsers.includes(user.id) ? 'bg-blue-50 border-blue-200' : ''
                                        }`}
                                        onClick={() => handleUserSelect(user.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {user.employee_id} - {user.designation}
                                                </div>
                                                <div className="text-xs text-gray-600 flex items-center mt-1">
                                                    <Building2 className="w-3 h-3 mr-1" />
                                                    {user.department_name}
                                                </div>
                                            </div>
                                            {selectedUsers.includes(user.id) && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Selected
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side - Selected users */}
                        <div>
                            <Label className="text-sm font-medium">Selected Users ({selectedUsers.length})</Label>
                            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                                {selectedUsers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No users selected</p>
                                    </div>
                                ) : (
                                    selectedUsers.map((userId) => {
                                        const user = users.find(u => u.id === userId);
                                        return user ? (
                                            <Card key={userId} className="p-3">
                                                <CardContent className="p-0">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-sm">
                                                                {user.employee_id} - {user.designation}
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                {user.department_name}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleUserSelect(userId)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : null;
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={loading || selectedUsers.length === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                'Marking...'
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Mark To {selectedUsers.length} User(s)
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
