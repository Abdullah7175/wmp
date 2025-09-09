'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';

export default function CreateWorkflowTemplate() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [fileTypes, setFileTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [roleGroups, setRoleGroups] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fileTypeId: '',
        stages: []
    });

    useEffect(() => {
        if (session?.user) {
            loadFileTypes();
            loadDepartments();
            loadRoles();
            loadRoleGroups();
        }
    }, [session]);

    const loadFileTypes = async () => {
        try {
            const response = await fetch('/api/efiling/file-types?is_active=true');
            if (response.ok) {
                const data = await response.json();
                console.log('File types loaded:', data);
                setFileTypes(data.fileTypes || []);
            } else {
                console.error('Failed to load file types:', response.status);
                const errorData = await response.json();
                console.error('File types error data:', errorData);
            }
        } catch (error) {
            console.error('Error loading file types:', error);
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

    const loadRoleGroups = async () => {
        try {
            const response = await fetch('/api/efiling/role-groups?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setRoleGroups(data.roleGroups || []);
            }
        } catch (error) {
            console.error('Error loading role groups:', error);
        }
    };

    const addStage = () => {
        const newStage = {
            id: Date.now(), // Temporary ID for frontend
            name: '',
            code: '',
            departmentId: null,
            roleGroupId: null,
            slaHours: 24,
            requirements: {},
            canAttachFiles: true,
            canComment: true,
            canEscalate: false
        };
        setFormData(prev => ({
            ...prev,
            stages: [...prev.stages, newStage]
        }));
    };

    const removeStage = (index) => {
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.filter((_, i) => i !== index)
        }));
    };

    const updateStage = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.map((stage, i) => 
                i === index ? { ...stage, [field]: value } : stage
            )
        }));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.fileTypeId || formData.stages.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields and add at least one stage",
                variant: "destructive"
            });
            return;
        }
        
        console.log('Form validation passed. Submitting with data:', formData);

        // Validate stages
        for (let i = 0; i < formData.stages.length; i++) {
            const stage = formData.stages[i];
            if (!stage.name || !stage.code) {
                toast({
                    title: "Validation Error",
                    description: `Stage ${i + 1} must have a name and code`,
                    variant: "destructive"
                });
                return;
            }
        }

        try {
            setLoading(true);
            
            const response = await fetch('/api/efiling/workflow-templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    file_type_id: formData.fileTypeId,
                    stages: formData.stages.map(stage => ({
                        ...stage,
                        departmentId: stage.departmentId === 'none' ? null : stage.departmentId,
                        roleGroupId: stage.roleGroupId === 'none' ? null : stage.roleGroupId
                    })),
                    createdBy: session.user.id,
                    ipAddress: '127.0.0.1', // In production, get from request
                    userAgent: navigator.userAgent
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: "Success",
                    description: "Workflow template created successfully",
                });
                router.push('/efiling/workflow-templates');
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to create workflow template",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error creating workflow template:', error);
            toast({
                title: "Error",
                description: "Failed to create workflow template",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return <div>Please sign in to access this page.</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create Workflow Template</h1>
                    <p className="text-muted-foreground">
                        Design a new workflow template with stages and requirements
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">


                <Card>
                    <CardHeader>
                        <CardTitle>Template Information</CardTitle>
                        <CardDescription>
                            Basic information about the workflow template
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Template Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter workflow template name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="fileTypeId">File Type *</Label>
                                <Select 
                                    value={formData.fileTypeId ? formData.fileTypeId.toString() : "none"} 
                                    onValueChange={(value) => handleInputChange('fileTypeId', value === "none" ? null : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select file type">
                                            {formData.fileTypeId ? fileTypes.find(ft => ft.id == formData.fileTypeId)?.name : "Select file type"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No File Type</SelectItem>
                                        {fileTypes.map((fileType) => (
                                            <SelectItem key={fileType.id} value={fileType.id.toString()}>
                                                {fileType.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe the purpose and flow of this workflow..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Workflow Stages
                            <Button
                                type="button"
                                onClick={addStage}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Stage
                            </Button>
                        </CardTitle>
                        <CardDescription>
                            Define the stages, responsibilities, and requirements for each step
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {formData.stages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No stages added yet. Click &quot;Add Stage&quot; to begin.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.stages.map((stage, index) => (
                                    <div key={stage.id} className="border rounded-lg p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <h3 className="text-lg font-medium">Stage {index + 1}</h3>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => removeStage(index)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Stage Name *</Label>
                                                <Input
                                                    value={stage.name}
                                                    onChange={(e) => updateStage(index, 'name', e.target.value)}
                                                    placeholder="e.g., Initial Review"
                                                />
                                            </div>

                                            <div>
                                                <Label>Stage Code *</Label>
                                                <Input
                                                    value={stage.code}
                                                    onChange={(e) => updateStage(index, 'code', e.target.value)}
                                                    placeholder="e.g., INIT_REVIEW"
                                                />
                                            </div>

                                            <div>
                                                <Label>Department</Label>
                                                <Select 
                                                    value={stage.departmentId || "none"} 
                                                    onValueChange={(value) => updateStage(index, 'departmentId', value === "none" ? null : value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select department">
                                                            {stage.departmentId ? departments.find(d => d.id == stage.departmentId)?.name : "No specific department"}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No specific department</SelectItem>
                                                        {departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Role Group</Label>
                                                <Select 
                                                    value={stage.roleGroupId || "none"} 
                                                    onValueChange={(value) => updateStage(index, 'roleGroupId', value === "none" ? null : parseInt(value))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role group">
                                                            {stage.roleGroupId ? roleGroups.find(g => g.id == stage.roleGroupId)?.name : "No role group"}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No role group</SelectItem>
                                                        {roleGroups.map((g) => (
                                                            <SelectItem key={g.id} value={g.id.toString()}>
                                                                {g.name} ({g.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>SLA Hours</Label>
                                                <Input
                                                    type="number"
                                                    value={stage.slaHours}
                                                    onChange={(e) => updateStage(index, 'slaHours', parseInt(e.target.value) || 24)}
                                                    min="1"
                                                    max="720"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Stage Capabilities</Label>
                                            <div className="flex gap-6">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`attach-${index}`}
                                                        checked={stage.canAttachFiles}
                                                        onCheckedChange={(checked) => updateStage(index, 'canAttachFiles', checked)}
                                                    />
                                                    <Label htmlFor={`attach-${index}`}>Can attach files</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`comment-${index}`}
                                                        checked={stage.canComment}
                                                        onCheckedChange={(checked) => updateStage(index, 'canComment', checked)}
                                                    />
                                                    <Label htmlFor={`comment-${index}`}>Can add comments</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`escalate-${index}`}
                                                        checked={stage.canEscalate}
                                                        onCheckedChange={(checked) => updateStage(index, 'canEscalate', checked)}
                                                    />
                                                    <Label htmlFor={`escalate-${index}`}>Can escalate</Label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
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
                        disabled={loading || !formData.name || !formData.fileTypeId || formData.stages.length === 0}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Create Template
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
