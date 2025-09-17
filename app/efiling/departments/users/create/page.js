"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User, Building, Shield, IdCard, Briefcase } from "lucide-react";

export default function CreateEfilingUser() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isConsultant, setIsConsultant] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact_number: '',
        employee_id: '',
        designation: '',
        department_id: '',
        efiling_role_id: '',
        supervisor_id: '',
        approval_level: 1,
        approval_amount_limit: 0,
        can_sign: true,
        can_create_files: true,
        can_approve_files: false,
        can_reject_files: false,
        can_transfer_files: true,
        max_concurrent_files: 10,
        preferred_signature_method: 'SMS_OTP',
        signature_settings: {},
        notification_preferences: {},
        google_email: ''
    });

    const getApprovalLevelName = (level) => {
        switch (level) {
            case 1: return 'Junior';
            case 2: return 'Senior';
            case 3: return 'Manager';
            case 4: return 'Director';
            case 5: return 'CEO';
            default: return 'Junior';
        }
    };

    const loadInitialData = async () => {
        setDataLoading(true);
        try {
            await Promise.all([loadDepartments(), loadRoles()]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast({
                title: "Connection Error",
                description: "Failed to connect to the server. Please check your internet connection.",
                variant: "destructive",
            });
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadDepartments = async () => {
        try {
            const response = await fetch('/api/efiling/departments');
            if (response.ok) {
                const data = await response.json();
                console.log('Departments API response:', data);
                setDepartments(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to load departments:', response.status);
                setDepartments([]);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
            setDepartments([]);
        }
    };

    const loadRoles = async () => {
        try {
            const response = await fetch('/api/efiling/roles');
            if (response.ok) {
                const data = await response.json();
                console.log('Roles API response:', data);
                // Ensure roles is always an array
                setRoles(Array.isArray(data) ? data : (data.roles || []));
            } else {
                console.error('Failed to load roles:', response.status);
                setRoles([]);
                toast({
                    title: "Error",
                    description: "Failed to load roles.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error loading roles:', error);
            setRoles([]);
            toast({
                title: "Error",
                description: "Failed to load roles.",
                variant: "destructive",
            });
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.efiling_role_id) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Validation Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return false;
        }

        // For KWSC employees, employee_id and department_id are required
        if (!isConsultant && (!formData.employee_id || !formData.department_id)) {
            toast({
                title: "Validation Error",
                description: "Employee ID and Department are required for KWSC employees.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const submitData = {
                ...formData,
                is_consultant: isConsultant,
                // For consultants, set these fields to null
                employee_id: isConsultant ? null : formData.employee_id,
                designation: isConsultant ? null : formData.designation,
                department_id: isConsultant ? null : formData.department_id
            };

            const response = await fetch('/api/efiling/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: result.message,
                });
                router.push('/efiling/departments/users');
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to create user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: "Error",
                description: "Failed to create user. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while fetching initial data
    if (dataLoading) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading form data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Create E-Filing User</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        User Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Consultant Checkbox */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isConsultant"
                                checked={isConsultant}
                                onCheckedChange={setIsConsultant}
                            />
                            <Label htmlFor="isConsultant" className="text-sm font-medium">
                                This user is a consultant (third party)
                            </Label>
                        </div>
                        
                        {isConsultant && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> Consultants are third-party users who don&apos;t require employee ID, designation, or department assignment.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="contact_number">Contact Number</Label>
                                    <Input
                                        id="contact_number"
                                        value={formData.contact_number}
                                        onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                        placeholder="Enter contact number"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="google_email">Google Email (Optional)</Label>
                                    <Input
                                        id="google_email"
                                        type="email"
                                        value={formData.google_email}
                                        onChange={(e) => handleInputChange('google_email', e.target.value)}
                                        placeholder="Enter Google account email for authentication"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Used for Google OAuth authentication during e-signature process
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        placeholder="Confirm password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* KWSC Employee Specific Fields - Hidden for Consultants */}
                            {!isConsultant && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="employee_id">Employee ID *</Label>
                                        <Input
                                            id="employee_id"
                                            value={formData.employee_id}
                                            onChange={(e) => handleInputChange('employee_id', e.target.value)}
                                            placeholder="Enter employee ID"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="designation">Designation</Label>
                                        <Input
                                            id="designation"
                                            value={formData.designation}
                                            onChange={(e) => handleInputChange('designation', e.target.value)}
                                            placeholder="Enter designation"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="department_id">Department *</Label>
                                        <Select
                                            value={formData.department_id?.toString() || ''}
                                            onValueChange={(value) => handleInputChange('department_id', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={Array.isArray(departments) && departments.length > 0 ? "Select department" : "Loading departments..."} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.isArray(departments) && departments.length > 0 ? (
                                                    departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            {dept.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="loading" disabled>
                                                        {Array.isArray(departments) && departments.length === 0 ? "No departments available" : "Loading..."}
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Role and Permissions - Required for all users */}
                            <div className="space-y-4">
                                                                <div>
                                    <Label htmlFor="efiling_role_id">E-Filing Role *</Label>
                                    <Select
                                        value={formData.efiling_role_id?.toString() || ''}
                                        onValueChange={(value) => handleInputChange('efiling_role_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={Array.isArray(roles) && roles.length > 0 ? "Select role" : "Loading roles..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(roles) && roles.length > 0 ? (
                                                roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled>
                                                    {Array.isArray(roles) && roles.length === 0 ? "No roles available" : "Loading..."}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="approval_level">Approval Level</Label>
                                    <Select
                                        value={formData.approval_level?.toString() || '1'}
                                        onValueChange={(value) => handleInputChange('approval_level', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <SelectItem key={level} value={level.toString()}>
                                                    {level} - {getApprovalLevelName(level)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="max_concurrent_files">Max Concurrent Files</Label>
                                    <Input
                                        id="max_concurrent_files"
                                        type="number"
                                        value={formData.max_concurrent_files}
                                        onChange={(e) => handleInputChange('max_concurrent_files', parseInt(e.target.value))}
                                        min="1"
                                        max="50"
                                    />
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Permissions</Label>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="can_sign"
                                            checked={formData.can_sign}
                                            onCheckedChange={(checked) => handleInputChange('can_sign', checked)}
                                        />
                                        <Label htmlFor="can_sign" className="text-sm">Can Sign Documents</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="can_create_files"
                                            checked={formData.can_create_files}
                                            onCheckedChange={(checked) => handleInputChange('can_create_files', checked)}
                                        />
                                        <Label htmlFor="can_create_files" className="text-sm">Can Create Files</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="can_approve_files"
                                            checked={formData.can_approve_files}
                                            onCheckedChange={(checked) => handleInputChange('can_approve_files', checked)}
                                        />
                                        <Label htmlFor="can_approve_files" className="text-sm">Can Approve Files</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="can_reject_files"
                                            checked={formData.can_reject_files}
                                            onCheckedChange={(checked) => handleInputChange('can_reject_files', checked)}
                                        />
                                        <Label htmlFor="can_reject_files" className="text-sm">Can Reject Files</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="can_transfer_files"
                                            checked={formData.can_transfer_files}
                                            onCheckedChange={(checked) => handleInputChange('can_transfer_files', checked)}
                                        />
                                        <Label htmlFor="can_transfer_files" className="text-sm">Can Transfer Files</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !Array.isArray(roles) || roles.length === 0 || !Array.isArray(departments) || departments.length === 0}
                                className="flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Creating...' : 'Create User'}
                            </Button>
                        </div>
                        
                        {/* Show message when form is disabled */}
                        {(!Array.isArray(roles) || roles.length === 0 || !Array.isArray(departments) || departments.length === 0) && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-700">
                                    <strong>Note:</strong> Form is disabled because required data (roles or departments) is not available.
                                </p>
                                <div className="mt-2 space-y-2">
                                    {(!Array.isArray(roles) || roles.length === 0) && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">•</span>
                                            <span className="text-xs">No roles available. Please create roles first.</span>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => router.push('/efiling/departments/roles/create')}
                                            >
                                                Create Role
                                            </Button>
                                        </div>
                                    )}
                                    {(!Array.isArray(departments) || departments.length === 0) && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">•</span>
                                            <span className="text-xs">No departments available. Please create departments first.</span>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => router.push('/efiling/departments/add')}
                                            >
                                                Create Department
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={loadInitialData}
                                        >
                                            Retry Loading Data
                                        </Button>
                                    </div>
                                    {/* Debug information */}
                                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                        <p><strong>Debug Info:</strong></p>
                                        <p>Roles: {Array.isArray(roles) ? `${roles.length} items` : typeof roles}</p>
                                        <p>Departments: {Array.isArray(departments) ? `${departments.length} items` : typeof departments}</p>
                                        <p>Data Loading: {dataLoading ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
