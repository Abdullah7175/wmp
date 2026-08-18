"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Shield, Loader2, ChevronDown, ChevronRight, FileText, Folder, Building } from "lucide-react";

export default function EditEfilingRole() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    // File Metadata State
    const [fileTreeData, setFileTreeData] = useState({ departments: [], categories: [], fileTypes: [] });
    const [selectedFileTypeIds, setSelectedFileTypeIds] = useState([]);
    const [expandedDepts, setExpandedDepts] = useState({});
    const [expandedCats, setExpandedCats] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        department_id: '',
        permissions: {
            can_create_files: false,
            can_edit_files: false,
            can_view_files: true,
            can_delete_files: false,
            can_approve_files: false,
            can_reject_files: false,
            can_transfer_files: false,
            can_attach_documents: false,
            can_sign_files: false,
            can_assign_files: false,
            can_close_files: false
        },
        is_active: true
    });

    // Load role data and dependencies
    useEffect(() => {
        if (params.id) {
            loadRoleData();
            loadDependencies();
        }
    }, [params.id]);

    const loadDependencies = async () => {
        try {
            await Promise.all([
                loadDepartments(),
                loadFileTreeData()
            ]);
        } catch (error) {
            console.error('Error loading dependencies:', error);
        }
    };

    const loadFileTreeData = async () => {
        try {
            const response = await fetch('/api/efiling/file-types/tree');
            if (response.ok) {
                const data = await response.json();
                setFileTreeData(data);
            }
        } catch (error) {
            console.error('Error loading file metadata tree:', error);
        }
    };

    const loadRoleData = async () => {
        try {
            const response = await fetch(`/api/efiling/roles?id=${params.id}`);
            if (response.ok) {
                const roleData = await response.json();
                
                // Transform the data to match our form structure
                setFormData({
                    name: roleData.name || '',
                    code: roleData.code || '',
                    description: roleData.description || '',
                    department_id: roleData.department_id || '',
                    permissions: roleData.permissions ? 
                        (typeof roleData.permissions === 'string' ? 
                            JSON.parse(roleData.permissions) : roleData.permissions) : 
                        {
                            can_create_files: false,
                            can_edit_files: false,
                            can_view_files: true,
                            can_delete_files: false,
                            can_approve_files: false,
                            can_reject_files: false,
                            can_transfer_files: false,
                            can_attach_documents: false,
                            can_sign_files: false,
                            can_assign_files: false,
                            can_close_files: false
                        },
                    is_active: roleData.is_active !== undefined ? roleData.is_active : true
                });

                // Fetch pre-selected allowed file types based on the role code
                if (roleData.code) {
                    await loadRoleAllowedFileTypes(roleData.code);
                }
            } else {
                throw new Error('Failed to load role data');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load role data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setInitialLoading(false);
        }
    };

    const loadRoleAllowedFileTypes = async (roleCode) => {
        try {
            const response = await fetch('/api/efiling/file-types/tree');
            if (response.ok) {
                const data = await response.json();
                const codeUpper = roleCode.toUpperCase();
                
                // Filter file types where can_create_roles includes this role's code
                const allowedTypes = (data.fileTypes || []).filter(ft => {
                    if (!ft.can_create_roles) return false;
                    const rolesArray = typeof ft.can_create_roles === 'string' 
                        ? JSON.parse(ft.can_create_roles) 
                        : ft.can_create_roles;
                    return Array.isArray(rolesArray) && rolesArray.includes(codeUpper);
                });

                setSelectedFileTypeIds(allowedTypes.map(ft => ft.id));
            }
        } catch (error) {
            console.error('Error fetching role allowed file types:', error);
        }
    };

    const loadDepartments = async () => {
        try {
            const response = await fetch('/api/efiling/departments?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setDepartments(data || []);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePermissionChange = (permission, value) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: value
            }
        }));
    };

    // --- File Types Selection Logic ---
    const toggleDeptExpand = (deptId) => {
        setExpandedDepts(prev => ({ ...prev, [deptId]: !prev[deptId] }));
    };

    const toggleCatExpand = (catId) => {
        setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    const handleFileTypeToggle = (typeId) => {
        setSelectedFileTypeIds(prev => 
            prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
        );
    };

    const handleCategoryToggle = (catId, fileTypesInCat) => {
        const catTypeIds = fileTypesInCat.map(ft => ft.id);
        const allSelected = catTypeIds.every(id => selectedFileTypeIds.includes(id));

        if (allSelected) {
            setSelectedFileTypeIds(prev => prev.filter(id => !catTypeIds.includes(id)));
        } else {
            setSelectedFileTypeIds(prev => Array.from(new Set([...prev, ...catTypeIds])));
        }
    };

    const handleDepartmentToggle = (deptId, fileTypesInDept) => {
        const deptTypeIds = fileTypesInDept.map(ft => ft.id);
        const allSelected = deptTypeIds.every(id => selectedFileTypeIds.includes(id));

        if (allSelected) {
            setSelectedFileTypeIds(prev => prev.filter(id => !deptTypeIds.includes(id)));
        } else {
            setSelectedFileTypeIds(prev => Array.from(new Set([...prev, ...deptTypeIds])));
        }
    };

    const validateForm = () => {
        if (!formData.name || !formData.code) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return false;
        }

        if (formData.code.length < 2) {
            toast({
                title: "Validation Error",
                description: "Role code must be at least 2 characters long.",
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
            const payload = {
                ...formData,
                id: params.id,
                allowed_file_type_ids: selectedFileTypeIds
            };

            const response = await fetch(`/api/efiling/roles`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "E-filing role updated successfully!",
                });
                router.push('/efiling/departments/roles');
            } else {
                throw new Error(result.error || 'Failed to update role');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update e-filing role.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading role data...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Edit E-Filing Role</h1>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Edit E-Filing Role
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Role Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter role name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="code">Role Code *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                    placeholder="Enter role code (e.g., ADMIN, USER)"
                                    required
                                />
                            </div>
                        </div>

                        {/* Department and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="department_id">Department</Label>
                                <Select value={formData.department_id ? formData.department_id.toString() : "none"} onValueChange={(value) => handleInputChange('department_id', value === "none" ? null : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Department</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="text-xs text-gray-500 mt-1">
                                    {formData.department_id ? departments.find(d => d.id == formData.department_id)?.name : "No Department"}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="is_active">Status</Label>
                                <Select value={formData.is_active.toString()} onValueChange={(value) => handleInputChange('is_active', value === 'true')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status">
                                            {formData.is_active ? "Active" : "Inactive"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Enter role description"
                                rows={3}
                            />
                        </div>

                        {/* Permissions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Role Permissions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_create_files"
                                        checked={formData.permissions.can_create_files}
                                        onChange={(e) => handlePermissionChange('can_create_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_create_files">Can Create Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_edit_files"
                                        checked={formData.permissions.can_edit_files}
                                        onChange={(e) => handlePermissionChange('can_edit_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_edit_files">Can Edit Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_view_files"
                                        checked={formData.permissions.can_view_files}
                                        onChange={(e) => handlePermissionChange('can_view_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_view_files">Can View Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_delete_files"
                                        checked={formData.permissions.can_delete_files}
                                        onChange={(e) => handlePermissionChange('can_delete_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_delete_files">Can Delete Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_approve_files"
                                        checked={formData.permissions.can_approve_files}
                                        onChange={(e) => handlePermissionChange('can_approve_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_approve_files">Can Approve Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_reject_files"
                                        checked={formData.permissions.can_reject_files}
                                        onChange={(e) => handlePermissionChange('can_reject_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_reject_files">Can Reject Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_transfer_files"
                                        checked={formData.permissions.can_transfer_files}
                                        onChange={(e) => handlePermissionChange('can_transfer_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_transfer_files">Can Transfer Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_attach_documents"
                                        checked={formData.permissions.can_attach_documents}
                                        onChange={(e) => handlePermissionChange('can_attach_documents', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_attach_documents">Can Attach Documents</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_sign_files"
                                        checked={formData.permissions.can_sign_files}
                                        onChange={(e) => handlePermissionChange('can_sign_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_sign_files">Can Sign Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_assign_files"
                                        checked={formData.permissions.can_assign_files}
                                        onChange={(e) => handlePermissionChange('can_assign_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_assign_files">Can Assign Files</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="can_close_files"
                                        checked={formData.permissions.can_close_files}
                                        onChange={(e) => handlePermissionChange('can_close_files', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="can_close_files">Can Close Files</Label>
                                </div>
                            </div>
                        </div>

                        {/* Allowed File Types Section */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Allowed File Types
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Select which file types this role is authorized to create across departments.
                                    </p>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full">
                                    {selectedFileTypeIds.length} Selected
                                </span>
                            </div>

                            <div className="border rounded-lg divide-y bg-slate-50/50 max-h-[450px] overflow-y-auto">
                                {fileTreeData.departments.map(dept => {
                                    const deptCategories = fileTreeData.categories.filter(c => c.department_id === dept.id);
                                    const deptFileTypes = fileTreeData.fileTypes.filter(ft => ft.department_id === dept.id);
                                    
                                    if (deptFileTypes.length === 0) return null;

                                    const isDeptExpanded = !!expandedDepts[dept.id];
                                    const allDeptSelected = deptFileTypes.every(ft => selectedFileTypeIds.includes(ft.id));
                                    const someDeptSelected = deptFileTypes.some(ft => selectedFileTypeIds.includes(ft.id));

                                    return (
                                        <div key={dept.id} className="bg-white">
                                            {/* Department Header */}
                                            <div className="flex items-center justify-between p-3 hover:bg-slate-50">
                                                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleDeptExpand(dept.id)}>
                                                    {isDeptExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                                    <Building className="w-4 h-4 text-indigo-600" />
                                                    <span className="font-semibold text-slate-800">{dept.name}</span>
                                                    <span className="text-xs text-gray-400">({deptFileTypes.length} types)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={allDeptSelected}
                                                        ref={el => { if (el) el.indeterminate = !allDeptSelected && someDeptSelected; }}
                                                        onChange={() => handleDepartmentToggle(dept.id, deptFileTypes)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                    />
                                                </div>
                                            </div>

                                            {/* Categories & File Types inside Department */}
                                            {isDeptExpanded && (
                                                <div className="pl-6 pr-3 pb-3 space-y-2 border-t bg-slate-50/30">
                                                    {/* Uncategorized File Types */}
                                                    {deptFileTypes.filter(ft => !ft.category_id).map(ft => (
                                                        <div key={ft.id} className="flex items-center justify-between py-1.5 px-3 rounded hover:bg-slate-100/80">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-slate-400" />
                                                                <span className="text-sm font-medium text-slate-700">{ft.name}</span>
                                                                <span className="text-xs text-slate-400">({ft.code})</span>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFileTypeIds.includes(ft.id)}
                                                                onChange={() => handleFileTypeToggle(ft.id)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                            />
                                                        </div>
                                                    ))}

                                                    {/* Categorized File Types */}
                                                    {deptCategories.map(cat => {
                                                        const catFileTypes = deptFileTypes.filter(ft => ft.category_id === cat.id);
                                                        if (catFileTypes.length === 0) return null;

                                                        const isCatExpanded = !!expandedCats[cat.id];
                                                        const allCatSelected = catFileTypes.every(ft => selectedFileTypeIds.includes(ft.id));
                                                        const someCatSelected = catFileTypes.some(ft => selectedFileTypeIds.includes(ft.id));

                                                        return (
                                                            <div key={cat.id} className="border rounded bg-white mt-2">
                                                                <div className="flex items-center justify-between p-2.5 bg-slate-100/50 hover:bg-slate-100">
                                                                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleCatExpand(cat.id)}>
                                                                        {isCatExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
                                                                        <Folder className="w-4 h-4 text-amber-500" />
                                                                        <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={allCatSelected}
                                                                        ref={el => { if (el) el.indeterminate = !allCatSelected && someCatSelected; }}
                                                                        onChange={() => handleCategoryToggle(cat.id, catFileTypes)}
                                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                                    />
                                                                </div>

                                                                {isCatExpanded && (
                                                                    <div className="p-2 space-y-1 bg-white border-t">
                                                                        {catFileTypes.map(ft => (
                                                                            <div key={ft.id} className="flex items-center justify-between py-1 px-3 rounded hover:bg-slate-50">
                                                                                <div className="flex items-center gap-2">
                                                                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                                                    <span className="text-sm text-slate-600">{ft.name}</span>
                                                                                    <span className="text-xs text-slate-400">({ft.code})</span>
                                                                                </div>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedFileTypeIds.includes(ft.id)}
                                                                                    onChange={() => handleFileTypeToggle(ft.id)}
                                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit Button */}
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
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Update Role
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}