"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import SearchableSelect from "@/components/ui/searchable-select";
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
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    
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
        reference_number: "",
        to_header: "",
        organization_name: "KW&SC",
        letter_date: new Date().toISOString().slice(0, 10),
    });
    
    // Form validation errors
    const [errors, setErrors] = useState({});
    
    // Recipients — TO (required) and CC (optional)
    const [toRecipients, setToRecipients] = useState([]);
    const [ccRecipients, setCcRecipients] = useState([]);
    const [addressingMode, setAddressingMode] = useState("TO"); // TO | CC for modal
    const [pendingFiles, setPendingFiles] = useState([]);
    const [showRecipientModal, setShowRecipientModal] = useState(false);
    const [recipientType, setRecipientType] = useState("USER");
    const [recipientOptions, setRecipientOptions] = useState([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState("");

    // Fetch all initial data
    useEffect(() => {
        fetchAllData();
        fetchTemplatesForCreate();
    }, []);

    // Apply template from query string (e.g. ?template_id=12)
    useEffect(() => {
        const tid = searchParams.get("template_id");
        if (tid && availableTemplates.length > 0) {
            applyTemplateById(tid);
        }
    }, [searchParams, availableTemplates]);

    const fetchTemplatesForCreate = async () => {
        try {
            const res = await fetch("/api/efiling/daak/templates?for_create=true");
            if (res.ok) {
                const data = await res.json();
                setAvailableTemplates(data.templates || []);
            }
        } catch (e) {
            console.error("Error loading daak templates:", e);
        }
    };

    const applyTemplateById = async (tid) => {
        const t = availableTemplates.find((x) => String(x.id) === String(tid));
        if (!t) return;
        setSelectedTemplateId(String(t.id));
        setFormData((prev) => ({
            ...prev,
            subject: t.subject || prev.subject,
            content: t.content || prev.content,
            to_header: t.to_header || prev.to_header,
            organization_name: t.organization_name || prev.organization_name || "KW&SC",
            reference_number: t.reference_number || prev.reference_number,
            category_id: t.category_id ? String(t.category_id) : prev.category_id,
        }));
        try {
            await fetch(`/api/efiling/daak/templates/${t.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mark_used: true }),
            });
        } catch (_) { /* ignore */ }
        toast({
            title: "Template applied",
            description: `"${t.name}" loaded into the form`,
        });
    };

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
        
        if (toRecipients.length === 0) {
            newErrors.to_recipients = "At least one TO recipient is required";
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
        const targetList = addressingMode === "CC" ? ccRecipients : toRecipients;
        const setTarget = addressingMode === "CC" ? setCcRecipients : setToRecipients;

        if (recipientType === "EVERYONE") {
            const exists = targetList.some((r) => r.type === "EVERYONE");
            if (!exists) {
                setTarget([...targetList, { type: "EVERYONE", id: null, name: "Everyone", addressing: addressingMode }]);
                setShowRecipientModal(false);
                setSelectedRecipientId("");
            } else {
                toast({
                    title: "Already Added",
                    description: `Everyone is already in the ${addressingMode} list`,
                    variant: "default",
                });
            }
        } else if (selectedRecipientId) {
            const option = recipientOptions.find((opt) => opt.id.toString() === selectedRecipientId);
            if (option) {
                const exists = targetList.some(
                    (r) => r.type === recipientType && r.id === option.id
                );
                if (!exists) {
                    setTarget([
                        ...targetList,
                        {
                            type: recipientType,
                            id: option.id,
                            name: option.name || option.designation || option.title || "Unknown",
                            addressing: addressingMode,
                        },
                    ]);
                    setShowRecipientModal(false);
                    setSelectedRecipientId("");
                    if (errors.to_recipients && addressingMode === "TO") {
                        setErrors((prev) => {
                            const next = { ...prev };
                            delete next.to_recipients;
                            return next;
                        });
                    }
                } else {
                    toast({
                        title: "Already Added",
                        description: `This recipient is already in the ${addressingMode} list`,
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

    const removeToRecipient = (index) => {
        setToRecipients(toRecipients.filter((_, i) => i !== index));
    };

    const removeCcRecipient = (index) => {
        setCcRecipients(ccRecipients.filter((_, i) => i !== index));
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
                reference_number: formData.reference_number?.trim() || null,
                to_header: formData.to_header?.trim() || null,
                organization_name: formData.organization_name?.trim() || "KW&SC",
                letter_date: formData.letter_date || null,
                to_recipients: toRecipients,
                cc_recipients: ccRecipients,
            };

            const res = await fetch("/api/efiling/daak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                const daakId = data.daak.id;

                // Upload pending attachments (if any)
                for (const file of pendingFiles) {
                    const fd = new FormData();
                    fd.append("file", file);
                    await fetch(`/api/efiling/daak/${daakId}/attachments`, {
                        method: "POST",
                        body: fd,
                    });
                }

                if (send) {
                    // Apply e-sign from profile if available (non-blocking if missing)
                    try {
                        await fetch(`/api/efiling/daak/${daakId}/sign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
                    } catch (_) { /* optional */ }

                    const sendRes = await fetch(`/api/efiling/daak/${daakId}/send`, {
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
                        router.push(`/efiling/daak/${daakId}`);
                    }
                } else {
                    toast({
                        title: "Success",
                        description: `Daak "${data.daak.daak_number}" saved as draft successfully`,
                    });
                    router.push(`/efiling/daak/${daakId}`);
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

            {availableTemplates.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Use a Daak Template</CardTitle>
                        <CardDescription>Optional — fills TO, subject, content, and organization</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[220px] space-y-2">
                            <Label>Template</Label>
                            <Select
                                value={selectedTemplateId || undefined}
                                onValueChange={(v) => applyTemplateById(v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a template (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTemplates.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name} ({t.scope})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Daak Information</CardTitle>
                    <CardDescription>Fill in the details for your daak</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Letter header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="to_header">TO (letter line)</Label>
                            <Input
                                id="to_header"
                                value={formData.to_header}
                                onChange={(e) => handleInputChange("to_header", e.target.value)}
                                placeholder="e.g. PSO to MD/CEO"
                            />
                            <p className="text-xs text-gray-500">Shown above subject on the letter</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organization_name">Organization</Label>
                            <Input
                                id="organization_name"
                                value={formData.organization_name}
                                onChange={(e) => handleInputChange("organization_name", e.target.value)}
                                placeholder="KW&SC"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="letter_date">Date</Label>
                            <Input
                                id="letter_date"
                                type="date"
                                value={formData.letter_date}
                                onChange={(e) => handleInputChange("letter_date", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reference_number">Reference Number</Label>
                            <Input
                                id="reference_number"
                                value={formData.reference_number}
                                onChange={(e) => handleInputChange("reference_number", e.target.value)}
                                placeholder="Office / file reference (optional)"
                            />
                        </div>
                    </div>

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

            {/* TO Recipients */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>TO <span className="text-red-500">*</span></CardTitle>
                            <CardDescription>Primary addressees for this daak</CardDescription>
                        </div>
                        <Button onClick={() => { setAddressingMode("TO"); setShowRecipientModal(true); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add TO
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {errors.to_recipients && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {errors.to_recipients}
                            </p>
                        </div>
                    )}
                    {toRecipients.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            <p>No TO recipients yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {toRecipients.map((recipient, index) => (
                                <Badge
                                    key={`to-${index}`}
                                    variant="secondary"
                                    className="text-sm py-2 px-3 flex items-center gap-2"
                                >
                                    {getRecipientIcon(recipient.type)}
                                    <span>{recipient.name}</span>
                                    <button
                                        onClick={() => removeToRecipient(index)}
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

            {/* CC Recipients */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>CC</CardTitle>
                            <CardDescription>Carbon copy — informed parties (optional)</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => { setAddressingMode("CC"); setShowRecipientModal(true); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add CC
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {ccRecipients.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No CC recipients</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {ccRecipients.map((recipient, index) => (
                                <Badge
                                    key={`cc-${index}`}
                                    variant="outline"
                                    className="text-sm py-2 px-3 flex items-center gap-2"
                                >
                                    {getRecipientIcon(recipient.type)}
                                    <span>{recipient.name}</span>
                                    <button
                                        onClick={() => removeCcRecipient(index)}
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

            {/* Attachments */}
            <Card>
                <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                    <CardDescription>Optional files (e.g. incoming letter from another organization). Max 10MB each.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setPendingFiles((prev) => [...prev, ...files]);
                            e.target.value = "";
                        }}
                    />
                    {pendingFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {pendingFiles.map((file, index) => (
                                <Badge key={`${file.name}-${index}`} variant="secondary" className="py-1 px-3 flex items-center gap-2">
                                    {file.name}
                                    <button
                                        type="button"
                                        onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
                                        className="hover:text-red-500"
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
                        <DialogTitle>Add {addressingMode} Recipient</DialogTitle>
                        <DialogDescription>
                            Select who should appear in the {addressingMode} list
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Recipient Type</Label>
                            <Select
                                value={recipientType}
                                onValueChange={(v) => {
                                    setRecipientType(v);
                                    setSelectedRecipientId("");
                                }}
                            >
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
                                <SearchableSelect
                                    options={recipientOptions}
                                    value={selectedRecipientId}
                                    onValueChange={setSelectedRecipientId}
                                    placeholder={`Type to search ${recipientType.replace("_", " ").toLowerCase()}...`}
                                    emptyText="No matches found"
                                    getValue={(opt) => String(opt.id)}
                                    getLabel={(opt) =>
                                        opt.name || opt.designation || opt.title || `ID: ${opt.id}`
                                    }
                                    getSearchText={(opt) =>
                                        [opt.name, opt.designation, opt.title, opt.email]
                                            .filter(Boolean)
                                            .join(" ")
                                    }
                                />
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
