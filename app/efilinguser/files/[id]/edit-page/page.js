"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import TipTapEditor from "../../../components/TipTapEditor";

export default function EditPageEditor() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const targetPageId = searchParams.get("pageId");

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageTitle, setPageTitle] = useState("");
    const [pageContent, setPageContent] = useState({
        title: "",
        subject: "",
        date: new Date().toLocaleDateString(),
        matter: "",
        footer: "",
    });

    const parsePageContent = (rawContent) => {
        if (!rawContent) return { title: '', subject: '', date: new Date().toLocaleDateString(), matter: '', footer: '' };
        if (typeof rawContent === 'object') return rawContent;
        try {
            const parsed = JSON.parse(rawContent);
            if (typeof parsed === 'object' && parsed !== null) return parsed;
        } catch (e) {
            return { title: '', subject: '', date: new Date().toLocaleDateString(), matter: rawContent, footer: '' };
        }
        return { title: '', subject: '', date: new Date().toLocaleDateString(), matter: '', footer: '' };
    };

    useEffect(() => {
        if (params.id && targetPageId) {
            fetchFileAndTargetPage();
        }
    }, [params.id, targetPageId]);

const fetchFileAndTargetPage = async () => {
    try {
        setLoading(true);
        
        // 1. Fetch File Meta
        const fileRes = await fetch(`/api/efiling/files/${params.id}`);
        if (fileRes.ok) {
            const fileData = await fileRes.json();
            setFile(fileData);
        }

        // 2. Fetch Pages & Match
        const pagesRes = await fetch(`/api/efiling/files/${params.id}/pages`);
        if (pagesRes.ok) {
            const data = await pagesRes.json();
            
            // Extract the pages array safely from response
            const existingPages = Array.isArray(data) ? data : (data.pages || []);
            
            console.log("Extracted Pages Array:", existingPages);
            console.log("Target Page ID from URL:", targetPageId);

            // Find matching page by id or page_id
            const matched = existingPages.find(
                p => String(p.id) === String(targetPageId) || String(p.page_id) === String(targetPageId)
            );

            if (matched) {
                console.log("Matched Page Object:", matched);
                setPageTitle(matched.page_title || matched.title || "");

                // Parse page_content JSON string
                let parsed = matched.page_content;
                if (typeof parsed === "string") {
                    try {
                        parsed = JSON.parse(parsed);
                    } catch (e) {
                        parsed = { matter: matched.page_content };
                    }
                }

                setPageContent({
                    title: parsed?.title || "",
                    subject: parsed?.subject || matched.subject || "",
                    date: parsed?.date || new Date().toLocaleDateString(),
                    matter: parsed?.matter || (typeof matched.page_content === "string" ? matched.page_content : ""),
                    footer: parsed?.footer || ""
                });
            } else {
                toast({ 
                    title: "Error", 
                    description: `Page ID ${targetPageId} not found in this file`, 
                    variant: "destructive" 
                });
            }
        }
    } catch (error) {
        console.error('Error fetching page details:', error);
    } finally {
        setLoading(false);
    }
};
    const handleSave = async () => {
        if (!file || !targetPageId) return;

        setSaving(true);
        try {
            // Change the fetch URL: remove /${targetPageId} from the end
            const response = await fetch(`/api/efiling/files/${params.id}/pages`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page_id: targetPageId, // targetPageId is sent here in the body
                    page_title: pageTitle,
                    page_content: pageContent,
                }),
            });

            if (!response.ok) throw new Error('Failed to update page');

            toast({ title: "Success", description: "Notesheet page updated successfully" });
            router.push(`/efilinguser/files/${params.id}`);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to save changes",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div>Loading page details...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Toolbar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => router.push(`/efilinguser/files/${params.id}`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Edit Notesheet Page</h1>
                        <p className="text-sm text-gray-600">File: {file?.file_number} - {file?.subject}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Update Page'}
                </Button>
            </div>

            {/* Form */}
            <div className="container mx-auto px-4 py-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Document Content</span>
                            <Input
                                value={pageTitle}
                                onChange={(e) => setPageTitle(e.target.value)}
                                className="w-64"
                                placeholder="Page Title"
                            />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={pageContent.title || ''}
                                onChange={(e) => setPageContent({ ...pageContent, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Subject</Label>
                            <Input
                                value={pageContent.subject || ''}
                                onChange={(e) => setPageContent({ ...pageContent, subject: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input
                                value={pageContent.date || ''}
                                onChange={(e) => setPageContent({ ...pageContent, date: e.target.value })}
                            />
                        </div>
                        <div style={{ height: '500px' }} className="flex flex-col">
                            <Label>Main Matter</Label>
                            <div className="flex-1 border border-gray-300 rounded-md overflow-hidden mt-1">
                                <TipTapEditor
                                    value={pageContent.matter || ''}
                                    onChange={(value) => setPageContent({ ...pageContent, matter: value })}
                                    className="h-full"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Footer</Label>
                            <Input
                                value={pageContent.footer || ''}
                                onChange={(e) => setPageContent({ ...pageContent, footer: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}