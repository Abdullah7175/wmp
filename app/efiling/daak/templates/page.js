"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SearchableSelect from "@/components/ui/searchable-select";
import TipTapEditor from "@/app/efiling/components/TipTapEditor";
import "@/app/efiling/components/TipTapEditor.css";

const emptyForm = {
    name: "",
    subject: "",
    content: "",
    to_header: "",
    organization_name: "KW&SC",
    reference_number: "",
    category_id: "",
    scope: "GLOBAL",
    department_id: "",
    owner_efiling_user_id: "",
};

export default function AdminDaakTemplatesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const isAdmin = session?.user && [1, 2].includes(parseInt(session.user.role));

    const [templates, setTemplates] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [scopeFilter, setScopeFilter] = useState("all");
    const [showDialog, setShowDialog] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (session?.user?.id && !isAdmin) {
            toast({ title: "Access Restricted", description: "Admins only", variant: "destructive" });
            router.push("/efiling/daak");
        }
    }, [session, isAdmin, router, toast]);

    useEffect(() => {
        if (session?.user?.id && isAdmin) {
            fetchTemplates();
            fetchDepartments();
            fetchUsers();
            fetchCategories();
        }
    }, [session?.user?.id, isAdmin, scopeFilter]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (scopeFilter !== "all") params.set("scope", scopeFilter);
            const res = await fetch(`/api/efiling/daak/templates?${params}`);
            const data = await res.json();
            if (res.ok) setTemplates(data.templates || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        const res = await fetch("/api/efiling/departments");
        if (res.ok) {
            const data = await res.json();
            setDepartments(Array.isArray(data) ? data : []);
        }
    };

    const fetchUsers = async () => {
        const res = await fetch("/api/efiling/users?is_active=true");
        if (res.ok) {
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        }
    };

    const fetchCategories = async () => {
        const res = await fetch("/api/efiling/daak/categories");
        if (res.ok) {
            const data = await res.json();
            setCategories(data.categories || []);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setFormData(emptyForm);
        setShowDialog(true);
    };

    const openEdit = (t) => {
        setEditing(t);
        setFormData({
            name: t.name || "",
            subject: t.subject || "",
            content: t.content || "",
            to_header: t.to_header || "",
            organization_name: t.organization_name || "KW&SC",
            reference_number: t.reference_number || "",
            category_id: t.category_id ? String(t.category_id) : "",
            scope: t.scope || "GLOBAL",
            department_id: t.department_id ? String(t.department_id) : "",
            owner_efiling_user_id: t.owner_efiling_user_id ? String(t.owner_efiling_user_id) : "",
        });
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ title: "Validation", description: "Name is required", variant: "destructive" });
            return;
        }
        if (formData.scope === "DEPARTMENT" && !formData.department_id) {
            toast({ title: "Validation", description: "Select a department", variant: "destructive" });
            return;
        }
        if (formData.scope === "USER" && !formData.owner_efiling_user_id) {
            toast({ title: "Validation", description: "Select a user", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                subject: formData.subject,
                content: formData.content,
                to_header: formData.to_header,
                organization_name: formData.organization_name,
                reference_number: formData.reference_number || null,
                category_id: formData.category_id || null,
                scope: formData.scope,
                department_id: formData.scope === "DEPARTMENT" ? formData.department_id : null,
                owner_efiling_user_id: formData.scope === "USER" ? formData.owner_efiling_user_id : null,
            };

            const res = await fetch(
                editing ? `/api/efiling/daak/templates/${editing.id}` : "/api/efiling/daak/templates",
                {
                    method: editing ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");

            toast({ title: "Success", description: editing ? "Template updated" : "Template created" });
            setShowDialog(false);
            fetchTemplates();
        } catch (e) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (t) => {
        if (!confirm(`Delete template "${t.name}"?`)) return;
        const res = await fetch(`/api/efiling/daak/templates/${t.id}`, { method: "DELETE" });
        if (res.ok) {
            toast({ title: "Deleted", description: "Template removed" });
            fetchTemplates();
        } else {
            const data = await res.json();
            toast({ title: "Error", description: data.error || "Delete failed", variant: "destructive" });
        }
    };

    const filtered = templates.filter((t) => {
        const q = searchTerm.toLowerCase();
        return (
            !q ||
            t.name?.toLowerCase().includes(q) ||
            t.subject?.toLowerCase().includes(q) ||
            t.to_header?.toLowerCase().includes(q)
        );
    });

    const scopeBadge = (scope) => {
        const map = { GLOBAL: "default", DEPARTMENT: "secondary", USER: "outline" };
        return <Badge variant={map[scope] || "outline"}>{scope}</Badge>;
    };

    if (!isAdmin) return null;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Daak Templates</h1>
                    <p className="text-gray-600 mt-1">
                        Create global, department, or user-specific letter templates
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                            className="pl-9"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={scopeFilter} onValueChange={setScopeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Scope" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All scopes</SelectItem>
                            <SelectItem value="GLOBAL">Global</SelectItem>
                            <SelectItem value="DEPARTMENT">Department</SelectItem>
                            <SelectItem value="USER">User</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <p className="text-center py-8 text-gray-500">Loading...</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No templates yet</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Scope</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Used</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell>{scopeBadge(t.scope)}</TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {t.scope === "GLOBAL" && "Everyone"}
                                            {t.scope === "DEPARTMENT" && (t.department_name || `Dept #${t.department_id}`)}
                                            {t.scope === "USER" && (t.owner_name || `User #${t.owner_efiling_user_id}`)}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{t.subject || "—"}</TableCell>
                                        <TableCell>{t.usage_count || 0}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button size="sm" variant="ghost" onClick={() => { setPreview(t); setShowPreview(true); }}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(t)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Daak Template" : "New Daak Template"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Name *</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <Label>Scope *</Label>
                            <Select value={formData.scope} onValueChange={(v) => setFormData({ ...formData, scope: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GLOBAL">Global (all users)</SelectItem>
                                    <SelectItem value="DEPARTMENT">Department specific</SelectItem>
                                    <SelectItem value="USER">User specific</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.scope === "DEPARTMENT" && (
                            <div>
                                <Label>Department *</Label>
                                <SearchableSelect
                                    options={departments}
                                    value={formData.department_id}
                                    onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                                    placeholder="Type to search department..."
                                    emptyText="No department matches your search"
                                    getValue={(d) => String(d.id)}
                                    getLabel={(d) => d.name || `Department ${d.id}`}
                                />
                            </div>
                        )}
                        {formData.scope === "USER" && (
                            <div>
                                <Label>User *</Label>
                                <SearchableSelect
                                    options={users}
                                    value={formData.owner_efiling_user_id}
                                    onValueChange={(v) => setFormData({ ...formData, owner_efiling_user_id: v })}
                                    placeholder="Type to search user by name or designation..."
                                    emptyText="No user matches your search"
                                    getValue={(u) => String(u.id)}
                                    getLabel={(u) =>
                                        u.name
                                            ? `${u.name}${u.designation ? ` — ${u.designation}` : ""}`
                                            : u.designation || `User ${u.id}`
                                    }
                                    getSearchText={(u) =>
                                        [u.name, u.designation, u.email, u.employee_id]
                                            .filter(Boolean)
                                            .join(" ")
                                    }
                                />
                            </div>
                        )}
                        <div>
                            <Label>TO (letter line)</Label>
                            <Input
                                value={formData.to_header}
                                onChange={(e) => setFormData({ ...formData, to_header: e.target.value })}
                                placeholder="e.g. PSO to MD/CEO"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Organization</Label>
                                <Input
                                    value={formData.organization_name}
                                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Reference (optional default)</Label>
                                <Input
                                    value={formData.reference_number}
                                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Subject</Label>
                            <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                        </div>
                        <div>
                            <Label>Category</Label>
                            <Select
                                value={formData.category_id || "none"}
                                onValueChange={(v) => setFormData({ ...formData, category_id: v === "none" ? "" : v })}
                            >
                                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Content</Label>
                            <p className="text-xs text-slate-500 mb-2">
                                Paste from Word or Docs — headings, bold, and other formatting are kept
                            </p>
                            {showDialog && (
                                <TipTapEditor
                                    key={editing?.id ? `edit-${editing.id}` : "new-template"}
                                    value={formData.content}
                                    onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                                    placeholder="Paste or type letter body…"
                                    className="min-h-[280px]"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{preview?.name}</DialogTitle>
                    </DialogHeader>
                    {preview && (
                        <div className="space-y-2 text-sm">
                            <p><strong>Scope:</strong> {preview.scope}</p>
                            {preview.to_header && <p><strong>TO:</strong> {preview.to_header}</p>}
                            <p><strong>Org:</strong> {preview.organization_name || "KW&SC"}</p>
                            <p><strong>Subject:</strong> {preview.subject || "—"}</p>
                            <div
                                className="border rounded p-3 mt-2 prose prose-sm max-w-none tiptap-editor"
                                dangerouslySetInnerHTML={{ __html: preview.content || "<p><em>No content</em></p>" }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
