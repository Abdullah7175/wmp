"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, Search, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEfilingUser } from "@/context/EfilingUserContext";
import { isExternalUser } from "@/lib/efilingRoleHelpers";
import TipTapEditor from "@/app/efilinguser/components/TipTapEditor";
import "@/app/efilinguser/components/TipTapEditor.css";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
const emptyForm = {
    name: "",
    subject: "",
    content: "",
    to_header: "",
    organization_name: "KW&SC",
    reference_number: "",
};

export default function MyDaakTemplatesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { roleCode, loading: profileLoading } = useEfilingUser();

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!profileLoading && isExternalUser(roleCode)) {
            toast({
                title: "Access Restricted",
                description: "External users cannot manage daak templates",
                variant: "destructive",
            });
            router.push("/efilinguser/daak");
        }
    }, [profileLoading, roleCode, router, toast]);

    useEffect(() => {
        if (!profileLoading && !isExternalUser(roleCode)) {
            fetchMine();
        }
    }, [profileLoading, roleCode]);

    const fetchMine = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/efiling/daak/templates?mine=true");
            const data = await res.json();
            if (res.ok) setTemplates(data.templates || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
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
        });
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ title: "Validation", description: "Name is required", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...formData,
                scope: "USER",
                name: formData.name.trim(),
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
            toast({ title: "Success", description: editing ? "Updated" : "Template saved" });
            setShowDialog(false);
            fetchMine();
        } catch (e) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (t) => {
        if (!confirm(`Delete "${t.name}"?`)) return;
        const res = await fetch(`/api/efiling/daak/templates/${t.id}`, { method: "DELETE" });
        if (res.ok) {
            toast({ title: "Deleted" });
            fetchMine();
        }
    };

    const useInCreate = async (t) => {
        try {
            await fetch(`/api/efiling/daak/templates/${t.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mark_used: true }),
            });
        } catch (_) { /* ignore */ }
        // Pass template id via query so create page can load it
        router.push(`/efilinguser/daak/new?template_id=${t.id}`);
    };

    const filtered = templates.filter((t) => {
        const q = searchTerm.toLowerCase();
        return !q || t.name?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q);
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Daak Templates</h1>
                    <p className="text-gray-600 mt-1">Save personal letter templates for reuse</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                    className="pl-9"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <p className="text-center py-8 text-gray-500">Loading...</p>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No personal daak templates yet</p>
                            <Button className="mt-4" onClick={openCreate}>Create your first template</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Used</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">
                                            {t.name}
                                            <Badge variant="outline" className="ml-2">Personal</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[220px] truncate">{t.subject || "—"}</TableCell>
                                        <TableCell>{t.usage_count || 0}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button size="sm" variant="outline" onClick={() => useInCreate(t)}>
                                                Use
                                            </Button>
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
                        <DialogTitle>{editing ? "Edit Template" : "New Personal Template"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Name *</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <Label>TO (letter line)</Label>
                            <Input value={formData.to_header} onChange={(e) => setFormData({ ...formData, to_header: e.target.value })} />
                        </div>
                        <div>
                            <Label>Organization</Label>
                            <Input value={formData.organization_name} onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })} />
                        </div>
                        <div>
                            <Label>Subject</Label>
                            <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
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
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{preview?.name}</DialogTitle>
                    </DialogHeader>
                    {preview && (
                        <div className="space-y-2 text-sm">
                            {preview.to_header && <p><strong>TO:</strong> {preview.to_header}</p>}
                            <p><strong>Subject:</strong> {preview.subject || "—"}</p>
                            <div
                                className="border rounded p-3 prose prose-sm max-w-none tiptap-editor"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(preview.content || "<em>No content</em>") }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
