"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, FileText, Loader2 } from "lucide-react";

export default function EditFileType() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        department_id: '',
        requires_approval: false,
        auto_assign: false,
        workflow_template_id: '',
        is_active: true
    });

    useEffect(() => {
        if (params.id) {
            loadFileType();
            loadDependencies();
        }
    }, [params.id]);

    const loadDependencies = async () => {
        try {
            await loadDepartments();
        } catch (error) {
            console.error('Error loading dependencies:', error);
        }
    };

    const loadFileType = async () => {
        try {
            const response = await fetch(`/api/efiling/file-types?id=${params.id}`);
            if (response.ok) {
                const data = await response.json();
                const fileType = data.fileType || data;
                
                console.log('Loaded file type data:', fileType);
                
                setFormData({
                    name: fileType.name || '',
                    code: fileType.code || '',
                    description: fileType.description || '',
                    department_id: fileType.department_id || null,
                    requires_approval: fileType.requires_approval || false,
                    auto_assign: fileType.auto_assign || false,
                    workflow_template_id: fileType.workflow_template_id || '',
                    is_active: fileType.is_active !== undefined ? fileType.is_active : true
                });
            } else {
                throw new Error('Failed to load file type');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load file type data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setInitialLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const response = await fetch('/api/efiling/departments?is_active=true');
            if (response.ok) {
                const data = await response.json();
                console.log('Loaded departments:', data);
                setDepartments(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to load departments:', response.status);
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

    const handleCheckboxChange = (field, checked) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
        }));
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
                description: "File type code must be at least 2 characters long.",
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
            const requestBody = {
                ...formData,
                id: params.id
            };
            console.log('Submitting form data:', requestBody);
            
            const response = await fetch(`/api/efiling/file-types`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "File type updated successfully!",
                });
                router.push('/efiling/file-types');
            } else {
                throw new Error(result.error || 'Failed to update file type');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update file type.",
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
                        <span>Loading file type data...</span>
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
                <h1 className="text-2xl font-bold">Edit File Type</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Edit File Type
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">File Type Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter file type name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="code">File Type Code *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                    placeholder="Enter file type code (e.g., WB, IT, HR)"
                                    required
                                />
                            </div>
                        </div>

                        {/* Department and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="department_id">Department</Label>
                                <Select 
                                    value={formData.department_id ? formData.department_id.toString() : "none"} 
                                    onValueChange={(value) => handleInputChange('department_id', value === "none" ? null : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department (optional)">
                                            {formData.department_id ? departments.find(d => d.id == formData.department_id)?.name : "No Department"}
                                        </SelectValue>
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
                                placeholder="Enter file type description"
                                rows={3}
                            />
                        </div>

                        {/* Configuration Options */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Configuration Options</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="requires_approval"
                                        checked={formData.requires_approval}
                                        onCheckedChange={(checked) => handleCheckboxChange('requires_approval', checked)}
                                    />
                                    <Label htmlFor="requires_approval">Requires approval before processing</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="auto_assign"
                                        checked={formData.auto_assign}
                                        onCheckedChange={(checked) => handleCheckboxChange('auto_assign', checked)}
                                    />
                                    <Label htmlFor="auto_assign">Auto-assign to department users</Label>
                                </div>
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
                                        Update File Type
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
