"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    X,
    Plus,
    Save,
    Send,
    ArrowLeft,
    FileText,
    Paperclip,
    Users,
    LayoutTemplate,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEfilingUser } from "@/context/EfilingUserContext";
import TipTapEditor from "@/app/efilinguser/components/TipTapEditor";
import { isExternalUser } from "@/lib/efilingRoleHelpers";
import SearchableSelect from "@/components/ui/searchable-select";

export default function CreateDaakPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { efilingUserId, roleCode, loading: profileLoading } = useEfilingUser();

    // Redirect external users (ADLFA/CON) - they cannot create daak
    useEffect(() => {
        if (!profileLoading && isExternalUser(roleCode)) {
            toast({
                title: "Access Restricted",
                description: "External users cannot create daak. Redirecting...",
                variant: "destructive",
            });
            router.push('/efilinguser/daak');
        }
    }, [profileLoading, roleCode, router, toast]);
    const [loading, setLoading] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [roleGroups, setRoleGroups] = useState([]);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);

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

    const [toRecipients, setToRecipients] = useState([]);
    const [ccRecipients, setCcRecipients] = useState([]);
    const [addressingMode, setAddressingMode] = useState("TO");
    const [pendingFiles, setPendingFiles] = useState([]);
    const [showRecipientModal, setShowRecipientModal] = useState(false);
    const [recipientType, setRecipientType] = useState("USER");
    const [recipientOptions, setRecipientOptions] = useState([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState("");

    useEffect(() => {
        fetchCategories();
        fetchDepartments();
        fetchRoles();
        fetchRoleGroups();
        fetchTeams();
        fetchUsers();
        fetchTemplatesForCreate();
    }, []);

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
            console.error(e);
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

    useEffect(() => {
        if (recipientType === "USER") {
            setRecipientOptions(users.map(u => ({ id: u.id, name: u.designation || u.employee_id || `User ${u.id}`, designation: u.designation })));
        } else if (recipientType === "ROLE") {
            setRecipientOptions(roles.map(r => ({ id: r.id, name: r.name, title: r.name })));
        } else if (recipientType === "ROLE_GROUP") {
            setRecipientOptions(roleGroups.map(rg => ({ id: rg.id, name: rg.name, title: rg.name })));
        } else if (recipientType === "TEAM") {
            setRecipientOptions(teams);
        } else if (recipientType === "DEPARTMENT") {
            setRecipientOptions(departments.map(d => ({ id: d.id, name: d.name, title: d.name })));
        } else if (recipientType === "EVERYONE") {
            setRecipientOptions([]);
        }
    }, [recipientType, users, roles, roleGroups, teams, departments]);

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
                // API returns array directly, not wrapped in object
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
                // API returns { success: true, roles: [...] }
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
                // API returns { success: true, roleGroups: [...] }
                setRoleGroups(data.roleGroups || []);
            }
        } catch (error) {
            console.error("Error fetching role groups:", error);
        }
    };

    const fetchTeams = async () => {
        try {
            // Teams API returns team_members for a manager, but we need all managers/teams
            // Let's fetch all efiling_users who are managers (have team members)
            const res = await fetch("/api/efiling/users?is_active=true");
            if (res.ok) {
                const data = await res.json();
                // Get all users who could be managers (we'll use all active users as potential teams)
                const users = Array.isArray(data) ? data : [];
                // For now, treat each user as a potential team manager
                // In a real scenario, you'd query efiling_user_teams to get actual teams
                setTeams(users.map(u => ({ id: u.id, name: u.designation || u.employee_id || `User ${u.id}`, title: u.designation })));
            }
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/efiling/users?is_active=true");
            if (res.ok) {
                const data = await res.json();
                // API returns array directly, not wrapped in object
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const addRecipient = () => {
        const targetList = addressingMode === "CC" ? ccRecipients : toRecipients;
        const setTarget = addressingMode === "CC" ? setCcRecipients : setToRecipients;

        if (recipientType === "EVERYONE") {
            const exists = targetList.some((r) => r.type === "EVERYONE");
            if (!exists) {
                setTarget([...targetList, { type: "EVERYONE", id: null, name: "Everyone", addressing: addressingMode }]);
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
                }
            }
        }
        setSelectedRecipientId("");
        setShowRecipientModal(false);
    };

    const removeToRecipient = (index) => {
        setToRecipients(toRecipients.filter((_, i) => i !== index));
    };

    const removeCcRecipient = (index) => {
        setCcRecipients(ccRecipients.filter((_, i) => i !== index));
    };

    const handleSubmit = async (send = false) => {
        if (!formData.subject || !formData.content) {
            toast({
                title: "Error",
                description: "Subject and content are required",
                variant: "destructive",
            });
            return;
        }

        if (toRecipients.length === 0) {
            toast({
                title: "Error",
                description: "Please add at least one TO recipient",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                category_id: formData.category_id || null,
                department_id: formData.department_id || null,
                role_id: formData.role_id || null,
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

            if (res.ok) {
                const data = await res.json();
                const daakId = data.daak.id;

                for (const file of pendingFiles) {
                    const fd = new FormData();
                    fd.append("file", file);
                    await fetch(`/api/efiling/daak/${daakId}/attachments`, {
                        method: "POST",
                        body: fd,
                    });
                }

                if (send) {
                    try {
                        await fetch(`/api/efiling/daak/${daakId}/sign`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: "{}",
                        });
                    } catch (_) { /* optional */ }

                    const sendRes = await fetch(`/api/efiling/daak/${daakId}/send`, {
                        method: "POST",
                    });
                    if (sendRes.ok) {
                        toast({
                            title: "Success",
                            description: "Daak created and sent successfully",
                        });
                        router.push("/efilinguser/daak");
                    } else {
                        toast({
                            title: "Warning",
                            description: "Daak created but failed to send",
                            variant: "destructive",
                        });
                        router.push(`/efilinguser/daak/${daakId}`);
                    }
                } else {
                    toast({
                        title: "Success",
                        description: "Daak created successfully",
                    });
                    router.push(`/efilinguser/daak/${daakId}`);
                }
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to create daak",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error creating daak:", error);
            toast({
                title: "Error",
                description: "Failed to create daak",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto p-4 md:p-6 max-w-6xl space-y-6 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-2 -ml-2 text-slate-600"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Back
                        </Button>
                        <div className="inline-flex items-center gap-2 text-slate-500 text-sm mb-1">
                            <FileText className="w-4 h-4" />
                            Official correspondence
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            Create Daak
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Compose a letter, add recipients, then save or send
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>

                {availableTemplates.length > 0 && (
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <LayoutTemplate className="w-4 h-4 text-slate-500" />
                                <div>
                                    <CardTitle className="text-lg">Template</CardTitle>
                                    <CardDescription>
                                        Optionally start from a saved daak template
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Label className="text-sm font-medium text-slate-700">
                                Select template
                            </Label>
                            <Select
                                value={selectedTemplateId || undefined}
                                onValueChange={(v) => applyTemplateById(v)}
                            >
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue placeholder="Choose a template…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTemplates.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name} ({t.scope})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Letter details</CardTitle>
                        <CardDescription>
                            Header fields that appear on the official letter
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-slate-700">
                                    TO (letter line)
                                </Label>
                                <Input
                                    value={formData.to_header}
                                    onChange={(e) =>
                                        setFormData({ ...formData, to_header: e.target.value })
                                    }
                                    placeholder="e.g. PSO to MD/CEO"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-slate-700">
                                    Organization
                                </Label>
                                <Input
                                    value={formData.organization_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            organization_name: e.target.value,
                                        })
                                    }
                                    placeholder="KW&SC"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-slate-700">Date</Label>
                                <Input
                                    type="date"
                                    value={formData.letter_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, letter_date: e.target.value })
                                    }
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-slate-700">
                                    Reference number
                                </Label>
                                <Input
                                    value={formData.reference_number}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            reference_number: e.target.value,
                                        })
                                    }
                                    placeholder="Office / file reference"
                                    className="mt-1.5"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-sm font-medium text-slate-700">
                                    Subject <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    value={formData.subject}
                                    onChange={(e) =>
                                        setFormData({ ...formData, subject: e.target.value })
                                    }
                                    placeholder="Enter daak subject"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-slate-700">
                                    Category
                                </Label>
                                <Select
                                    value={formData.category_id || undefined}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            category_id: value === "none" ? "" : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Select category" />
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
                            <div>
                                <Label className="text-sm font-medium text-slate-700">
                                    Priority
                                </Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, priority: value })
                                    }
                                >
                                    <SelectTrigger className="mt-1.5">
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
                            <div>
                                <Label className="text-sm font-medium text-slate-700">
                                    Expires at
                                </Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.expires_at}
                                    onChange={(e) =>
                                        setFormData({ ...formData, expires_at: e.target.value })
                                    }
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="urgent"
                                    checked={formData.is_urgent}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, is_urgent: checked })
                                    }
                                />
                                <Label htmlFor="urgent" className="cursor-pointer">
                                    Mark as urgent
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="public"
                                    checked={formData.is_public}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, is_public: checked })
                                    }
                                />
                                <Label htmlFor="public" className="cursor-pointer">
                                    Make public (visible to all)
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                            Letter content <span className="text-rose-500">*</span>
                        </CardTitle>
                        <CardDescription>
                            Write in A4 document format — this becomes the body of the letter
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="bg-slate-100/80 p-4 md:p-8 rounded-xl border border-slate-200 overflow-auto"
                            style={{ maxHeight: "85vh" }}
                        >
                            <div
                                className="bg-white border border-slate-200 shadow-md mx-auto w-full md:w-[210mm] rounded-sm"
                                style={{
                                    minHeight: "297mm",
                                    padding: "20mm",
                                }}
                            >
                                <TipTapEditor
                                    value={formData.content}
                                    onChange={(value) =>
                                        setFormData({ ...formData, content: value })
                                    }
                                    placeholder="Start typing your daak content here..."
                                    className="min-h-[400px]"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 text-center">
                            A4 document format (210mm × 297mm)
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-500" />
                                        TO <span className="text-rose-500">*</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Primary addressees of this daak
                                    </CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setAddressingMode("TO");
                                        setShowRecipientModal(true);
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Add TO
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {toRecipients.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
                                    No TO recipients yet — add at least one before sending
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {toRecipients.map((recipient, index) => (
                                        <Badge
                                            key={`to-${index}`}
                                            variant="secondary"
                                            className="text-sm py-1.5 px-3 bg-slate-900 text-white hover:bg-slate-800"
                                        >
                                            {recipient.name}
                                            <button
                                                onClick={() => removeToRecipient(index)}
                                                className="ml-2 hover:text-rose-300"
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

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg">CC</CardTitle>
                                    <CardDescription>
                                        Optional copy recipients for information
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setAddressingMode("CC");
                                        setShowRecipientModal(true);
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Add CC
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {ccRecipients.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
                                    No CC recipients (optional)
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {ccRecipients.map((recipient, index) => (
                                        <Badge
                                            key={`cc-${index}`}
                                            variant="outline"
                                            className="text-sm py-1.5 px-3 border-slate-300"
                                        >
                                            {recipient.name}
                                            <button
                                                onClick={() => removeCcRecipient(index)}
                                                className="ml-2 hover:text-rose-500"
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
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-slate-500" />
                            Attachments
                        </CardTitle>
                        <CardDescription>
                            PDF, Word, or images — uploaded when you save or send
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition">
                            <Paperclip className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">
                                Click to attach files
                            </span>
                            <span className="text-xs text-slate-500">
                                .pdf, .doc, .docx, .jpg, .jpeg, .png
                            </span>
                            <Input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="sr-only"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    setPendingFiles((prev) => [...prev, ...files]);
                                    e.target.value = "";
                                }}
                            />
                        </label>
                        {pendingFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {pendingFiles.map((file, index) => (
                                    <Badge
                                        key={`${file.name}-${index}`}
                                        variant="secondary"
                                        className="py-1.5 px-3"
                                    >
                                        {file.name}
                                        <button
                                            type="button"
                                            className="ml-2 hover:text-rose-500"
                                            onClick={() =>
                                                setPendingFiles((prev) =>
                                                    prev.filter((_, i) => i !== index)
                                                )
                                            }
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={showRecipientModal} onOpenChange={setShowRecipientModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add {addressingMode} recipient</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <Label className="text-sm font-medium text-slate-700">
                                    Recipient type
                                </Label>
                                <Select
                                    value={recipientType}
                                    onValueChange={(v) => {
                                        setRecipientType(v);
                                        setSelectedRecipientId("");
                                    }}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="ROLE">Role</SelectItem>
                                        <SelectItem value="ROLE_GROUP">Role Group</SelectItem>
                                        <SelectItem value="TEAM">Team</SelectItem>
                                        <SelectItem value="DEPARTMENT">Department</SelectItem>
                                        <SelectItem value="EVERYONE">Everyone</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {recipientType !== "EVERYONE" && (
                                <div>
                                    <Label className="text-sm font-medium text-slate-700">
                                        Select {recipientType.replace("_", " ")}
                                    </Label>
                                    <div className="mt-1.5">
                                        <SearchableSelect
                                            options={recipientOptions}
                                            value={selectedRecipientId}
                                            onValueChange={setSelectedRecipientId}
                                            placeholder={`Type to search ${recipientType.replace("_", " ").toLowerCase()}...`}
                                            emptyText="No matches found"
                                            getValue={(opt) => String(opt.id)}
                                            getLabel={(opt) =>
                                                opt.name ||
                                                opt.designation ||
                                                opt.title ||
                                                `ID: ${opt.id}`
                                            }
                                            getSearchText={(opt) =>
                                                [opt.name, opt.designation, opt.title, opt.email]
                                                    .filter(Boolean)
                                                    .join(" ")
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowRecipientModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={addRecipient}>Add</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="py-4 px-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">
                            {formData.subject
                                ? formData.subject
                                : "Untitled daak"}
                            {toRecipients.length > 0 && (
                                <span>
                                    {" "}
                                    · {toRecipients.length} TO
                                    {ccRecipients.length > 0
                                        ? ` · ${ccRecipients.length} CC`
                                        : ""}
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleSubmit(false)}
                                disabled={loading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save draft
                            </Button>
                            <Button onClick={() => handleSubmit(true)} disabled={loading}>
                                <Send className="w-4 h-4 mr-2" />
                                Create & send
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

