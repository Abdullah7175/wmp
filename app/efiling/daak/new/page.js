"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Send, ArrowLeft, Loader2, AlertCircle, User, Building, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TipTapEditor from "@/app/efiling/components/TipTapEditor";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function CreateDaakPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    // Data states
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [roleGroups, setRoleGroups] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Form data
    const [formData, setFormData] = useState({
        subject: "",
        content: "",
        category_id: "",
        priority: "NORMAL",
        department_id: "",
        role_id: "",
        is_urgent: false,
        is_public: false,
        expires_at: "",
    });
    
    // Form validation errors
    const [errors, setErrors] = useState({});
    
    // Recipients
    const [recipients, setRecipients] = useState([]);
    const [showRecipientModal, setShowRecipientModal] = useState(false);
    const [recipientType, setRecipientType] = useState("USER");
    const [recipientOptions, setRecipientOptions] = useState([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState("");

    // Fetch all initial data
    useEffect(() => {
        fetchAllData();
    }, []);

    // Update recipient options when type or data changes
    useEffect(() => {
        updateRecipientOptions();
    }, [recipientType, users, roles, roleGroups, departments]);

    const fetchAllData = async () => {
        setFetching(true);
        try {
            await Promise.all([
                fetchCategories(),
                fetchDepartments(),
                fetchRoles(),
                fetchRoleGroups(),
                fetchUsers(),
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({
                title: "Error",
                description: "Failed to load form data. Please refresh the page.",
                variant: "destructive",
            });
        } finally {
            setFetching(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/efiling/daak/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch("/api/efiling/departments");
            if (res.ok) {
                const data = await res.json();
                setDepartments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/efiling/roles");
            if (res.ok) {
                const data = await res.json();
                setRoles(data.roles || []);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchRoleGroups = async () => {
        try {
            const res = await fetch("/api/efiling/role-groups");
            if (res.ok) {
                const data = await res.json();
                setRoleGroups(data.roleGroups || []);
            }
        } catch (error) {
            console.error("Error fetching role groups:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/efiling/users?is_active=true");
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const updateRecipientOptions = () => {
        if (recipientType === "USER") {
            setRecipientOptions(
                users.map(u => ({
                    id: u.id,
                    name: u.name || u.designation || u.employee_id || `User ${u.id}`,
                    designation: u.designation,
                    email: u.email
                }))
            );
        } else if (recipientType === "ROLE") {
            setRecipientOptions(
                roles.map(r => ({
                    id: r.id,
                    name: r.name,
                    title: r.name
                }))
            );
        } else if (recipientType === "ROLE_GROUP") {
            setRecipientOptions(
                roleGroups.map(rg => ({
                    id: rg.id,
                    name: rg.name,
                    title: rg.name
                }))
            );
        } else if (recipientType === "DEPARTMENT") {
            setRecipientOptions(
                departments.map(d => ({
                    id: d.id,
                    name: d.name,
                    title: d.name
                }))
            );
        } else if (recipientType === "EVERYONE") {
            setRecipientOptions([]);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.subject || formData.subject.trim().length === 0) {
            newErrors.subject = "Subject is required";
        } else if (formData.subject.trim().length < 5) {
            newErrors.subject = "Subject must be at least 5 characters";
        }
        
        if (!formData.content || formData.content.trim().length === 0) {
            newErrors.content = "Content is required";
        }
        
        if (recipients.length === 0) {
            newErrors.recipients = "At least one recipient is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const addRecipient = () => {
        if (recipientType === "EVERYONE") {
            const exists = recipients.some((r) => r.type === "EVERYONE");
            if (!exists) {
                setRecipients([...recipients, { type: "EVERYONE", id: null, name: "Everyone" }]);
                setShowRecipientModal(false);
                setSelectedRecipientId("");
            } else {
                toast({
                    title: "Already Added",
                    description: "Everyone is already in the recipient list",
                    variant: "default",
                });
            }
        } else if (selectedRecipientId) {
            const option = recipientOptions.find((opt) => opt.id.toString() === selectedRecipientId);
            if (option) {
                const exists = recipients.some(
                    (r) => r.type === recipientType && r.id === option.id
                );
                if (!exists) {
                    setRecipients([
                        ...recipients,
                        {
                            type: recipientType,
                            id: option.id,
                            name: option.name || option.designation || option.title || "Unknown",
                        },
                    ]);
                    setShowRecipientModal(false);
                    setSelectedRecipientId("");
                    // Clear recipients error
                    if (errors.recipients) {
                        setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.recipients;
                            return newErrors;
                        });
                    }
                } else {
                    toast({
                        title: "Already Added",
                        description: "This recipient is already in the list",
                        variant: "default",
                    });
                }
            }
        } else {
            toast({
                title: "Selection Required",
                description: "Please select a recipient",
                variant: "destructive",
            });
        }
    };

    const removeRecipient = (index) => {
        setRecipients(recipients.filter((_, i) => i !== index));
    };

    const getRecipientIcon = (type) => {
        switch (type) {
            case "USER":
                return <User className="w-3 h-3" />;
            case "DEPARTMENT":
                return <Building className="w-3 h-3" />;
            case "ROLE":
            case "ROLE_GROUP":
                return <Shield className="w-3 h-3" />;
            case "TEAM":
                return <Users className="w-3 h-3" />;
            default:
                return <Users className="w-3 h-3" />;
        }
    };

    const handleSubmit = async (send = false) => {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                subject: formData.subject.trim(),
                content: formData.content,
                category_id: formData.category_id || null,
                priority: formData.priority,
                department_id: formData.department_id || null,
                role_id: formData.role_id || null,
                is_urgent: formData.is_urgent,
                is_public: formData.is_public,
                expires_at: formData.expires_at || null,
                recipients: recipients,
            };

            const res = await fetch("/api/efiling/daak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                if (send) {
                    const sendRes = await fetch(`/api/efiling/daak/${data.daak.id}/send`, {
                        method: "POST",
                    });
                    if (sendRes.ok) {
                        toast({
                            title: "Success",
                            description: `Daak "${data.daak.daak_number}" created and sent successfully`,
                        });
                        router.push("/efiling/daak");
                    } else {
                        const sendError = await sendRes.json();
                        toast({
                            title: "Partially Successful",
                            description: `Daak "${data.daak.daak_number}" created but failed to send: ${sendError.error || "Unknown error"}`,
                            variant: "default",
                        });
                        router.push(`/efiling/daak/${data.daak.id}`);
                    }
                } else {
                    toast({
                        title: "Success",
                        description: `Daak "${data.daak.daak_number}" saved as draft successfully`,
                    });
                    router.push(`/efiling/daak/${data.daak.id}`);
                }
            } else {
                throw new Error(data.error || "Failed to create daak");
            }
        } catch (error) {
            console.error("Error creating daak:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create daak. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading form data...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Create Daak</h1>
                    <p className="text-gray-600 mt-1">Create a new daak/letter for distribution</p>
                </div>
                <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
            </div>

            {/* Main Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Daak Information</CardTitle>
                    <CardDescription>Fill in the details for your daak</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Subject and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">
                                Subject <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                placeholder="Enter daak subject"
                                className={errors.subject ? "border-red-500" : ""}
                            />
                            {errors.subject && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.subject}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category_id || undefined}
                                onValueChange={(value) =>
                                    handleInputChange("category_id", value === "none" ? "" : value)
                                }
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Priority and Expires At */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => handleInputChange("priority", value)}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expires_at">Expires At</Label>
                            <Input
                                id="expires_at"
                                type="datetime-local"
                                value={formData.expires_at}
                                onChange={(e) => handleInputChange("expires_at", e.target.value)}
                            />
                            <p className="text-xs text-gray-500">Optional: Set expiration date and time</p>
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-2">
                        <Label>
                            Content <span className="text-red-500">*</span>
                        </Label>
                        <div className="bg-gray-100 p-4 md:p-8 rounded-lg border border-gray-200 overflow-auto" style={{ maxHeight: '85vh' }}>
                            <div
                                className="bg-white border-2 border-gray-300 shadow-xl mx-auto w-full md:w-[210mm]"
                                style={{
                                    minHeight: '297mm',
                                    padding: '20mm'
                                }}
                            >
                                <TipTapEditor
                                    value={formData.content}
                                    onChange={(value) => handleInputChange("content", value)}
                                    placeholder="Start typing your daak content here..."
                                    className="min-h-[400px]"
                                />
                            </div>
                        </div>
                        {errors.content && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.content}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 text-center italic">
                            A4 Document Format (210mm × 297mm)
                        </p>
                    </div>

                    {/* Options */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="urgent"
                                checked={formData.is_urgent}
                                onCheckedChange={(checked) =>
                                    handleInputChange("is_urgent", checked)
                                }
                            />
                            <Label htmlFor="urgent" className="cursor-pointer">
                                Mark as Urgent
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="public"
                                checked={formData.is_public}
                                onCheckedChange={(checked) =>
                                    handleInputChange("is_public", checked)
                                }
                            />
                            <Label htmlFor="public" className="cursor-pointer">
                                Make Public (visible to all users)
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recipients Card */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Recipients</CardTitle>
                            <CardDescription>Add recipients who should receive this daak</CardDescription>
                        </div>
                        <Button onClick={() => setShowRecipientModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Recipient
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {errors.recipients && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {errors.recipients}
                            </p>
                        </div>
                    )}
                    {recipients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No recipients added</p>
                            <p className="text-sm">Click "Add Recipient" to add recipients</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {recipients.map((recipient, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-sm py-2 px-3 flex items-center gap-2"
                                >
                                    {getRecipientIcon(recipient.type)}
                                    <span>{recipient.name}</span>
                                    <button
                                        onClick={() => removeRecipient(index)}
                                        className="ml-1 hover:text-red-500 transition-colors"
                                        type="button"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recipient Modal */}
            <Dialog open={showRecipientModal} onOpenChange={setShowRecipientModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Recipient</DialogTitle>
                        <DialogDescription>
                            Select the type and recipient for this daak
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Recipient Type</Label>
                            <Select value={recipientType} onValueChange={setRecipientType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ROLE">Role</SelectItem>
                                    <SelectItem value="ROLE_GROUP">Role Group</SelectItem>
                                    <SelectItem value="DEPARTMENT">Department</SelectItem>
                                    <SelectItem value="EVERYONE">Everyone</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {recipientType !== "EVERYONE" && (
                            <div className="space-y-2">
                                <Label>
                                    Select {recipientType.replace("_", " ")}
                                </Label>
                                <Select
                                    value={selectedRecipientId}
                                    onValueChange={setSelectedRecipientId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select ${recipientType.replace("_", " ")}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipientOptions.length > 0 ? (
                                            recipientOptions.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={opt.id.toString()}
                                                >
                                                    {opt.name || opt.designation || opt.title || `ID: ${opt.id}`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-options" disabled>
                                                No options available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRecipientModal(false);
                                setSelectedRecipientId("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={addRecipient}>
                            Add Recipient
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Draft
                </Button>
                <Button onClick={() => handleSubmit(true)} disabled={loading}>
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4 mr-2" />
                    )}
                    Create & Send
                </Button>
            </div>
        </div>
    );
}
