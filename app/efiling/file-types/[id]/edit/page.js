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
import { ArrowLeft, Save, FileText, Loader2, Plus, Trash2 } from "lucide-react";

export default function EditFileType() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [slaMatrixEntries, setSlaMatrixEntries] = useState([]);
    const [selectedCreators, setSelectedCreators] = useState([]);
    
    // Store array of selected SLA matrix IDs to maintain sequential routing
    const [selectedSlaIds, setSelectedSlaIds] = useState([]);

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

    useEffect(() => {
        if (formData.department_id) {
            loadSlaMatrixEntries(formData.department_id);
        } else {
            setSlaMatrixEntries([]);
        }
    }, [formData.department_id]);

    const loadDependencies = async () => {
        try {
            await Promise.all([loadDepartments(), loadRoles()]);
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

                // Populate creator roles
                const cr = Array.isArray(fileType.can_create_roles) 
                    ? fileType.can_create_roles 
                    : (()=>{ try { return JSON.parse(fileType.can_create_roles || '[]'); } catch { return []; }})();
                setSelectedCreators(cr);
                
                // Populate existing SLA sequence array
                if (Array.isArray(fileType.sla_mappings) && fileType.sla_mappings.length > 0) {
                    setSelectedSlaIds(fileType.sla_mappings.map(s => s.sla_matrix_id.toString()));
                } else if (fileType.sla_matrix_id) {
                    setSelectedSlaIds([fileType.sla_matrix_id.toString()]);
                } else {
                    setSelectedSlaIds([]);
                }

                if (fileType.department_id) {
                    loadSlaMatrixEntries(fileType.department_id);
                }
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
                setDepartments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    };

    const loadRoles = async () => {
        try {
            const response = await fetch('/api/efiling/roles?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setRoles(data.roles || []);
            }
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    };

    const loadSlaMatrixEntries = async (departmentId = null) => {
        try {
            let url = '/api/efiling/sla?active_only=true';
            if (departmentId) {
                url += `&department_id=${departmentId}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setSlaMatrixEntries(data.data || []);
            }
        } catch (error) {
            console.error('Error loading SLA matrix entries:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (field === 'department_id') {
            loadSlaMatrixEntries(value || null);
            if (value !== formData.department_id) {
                setSelectedSlaIds([]);
            }
        }
    };

    const handleAddSlaStep = () => {
        setSelectedSlaIds(prev => [...prev, ""]);
    };

    const handleUpdateSlaStep = (index, value) => {
        setSelectedSlaIds(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const handleRemoveSlaStep = (index) => {
        setSelectedSlaIds(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.code) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Filter and sanitize integers safely
            const validSlaIds = selectedSlaIds
                .filter(id => id !== "" && id !== "none" && id !== null && id !== undefined)
                .map(id => parseInt(id, 10))
                .filter(num => !isNaN(num));
            
            const requestBody = {
                ...formData,
                id: params.id,
                can_create_roles: selectedCreators,
                sla_matrix_id: validSlaIds.length > 0 ? validSlaIds : null
            };
            
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
                <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Edit File Type</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Edit File Type
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    placeholder="Enter file type code"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="department_id">Department</Label>
                                <Select 
                                    value={formData.department_id ? formData.department_id.toString() : "none"} 
                                    onValueChange={(value) => handleInputChange('department_id', value === "none" ? null : parseInt(value, 10))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department">
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

                        {/* Sequential SLA Matrix Configuration */}
                        <div className="space-y-3 border p-4 rounded-md bg-muted/20">
                            <div className="flex items-center justify-between">
                                <Label className="font-bold text-base">Sequential Workflow SLAs</Label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleAddSlaStep}
                                    disabled={!formData.department_id}
                                    className="flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add SLA Step
                                </Button>
                            </div>
                            
                            {!formData.department_id ? (
                                <p className="text-sm text-muted-foreground">Select a department first to configure SLA steps.</p>
                            ) : selectedSlaIds.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No SLA steps attached. Click "Add SLA Step" to configure sequence.</p>
                            ) : (
                                selectedSlaIds.map((slaId, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-xs font-semibold px-2 py-1 bg-muted rounded border min-w-[65px]">
                                            Step {index + 1}
                                        </span>
                                        <Select 
                                            value={slaId ? slaId.toString() : "none"} 
                                            onValueChange={(val) => handleUpdateSlaStep(index, val === "none" ? "" : val)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select SLA rule" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-- Select SLA Rule --</SelectItem>
                                                {slaMatrixEntries.map((entry) => (
                                                    <SelectItem key={entry.id} value={entry.id.toString()}>
                                                        {entry.from_role_code} → {entry.to_role_code} ({entry.sla_hours}h)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleRemoveSlaStep(index)}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

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

                        <div>
                            <Label>Who can create (select roles)</Label>
                            <div className="max-h-64 overflow-y-auto border rounded p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {roles.map((r) => (
                                    <label key={r.id} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={selectedCreators.includes(r.code)}
                                            onChange={() => setSelectedCreators(prev => prev.includes(r.code) ? prev.filter(c => c !== r.code) : [...prev, r.code])}
                                        />
                                        <span>{r.name} ({r.code})</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex items-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Update File Type
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}