"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, X } from "lucide-react";
import TipTapEditor from "../../../components/TipTapEditor";

// Add CSS for contentEditable placeholder
const contentEditableStyles = `
    [contenteditable]:empty:before {
        content: attr(data-placeholder);
        color: #9ca3af;
        pointer-events: none;
    }
    [contenteditable]:focus:empty:before {
        content: attr(data-placeholder);
        color: #9ca3af;
        pointer-events: none;
    }
`;

export default function AddPageEditor() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userEfilingId, setUserEfilingId] = useState(null);
    const [isHigherAuthority, setIsHigherAuthority] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    
    // Helper function to convert HTML to plain text
    const htmlToText = (html) => {
        if (!html) return '';
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    const [pages, setPages] = useState([
        {
            id: 1,
            pageNumber: 1,
            title: 'Page 1',
            content: {
                title: '',
                subject: '',
                date: new Date().toLocaleDateString(),
                matter: '',
                regards: '',
                footer: '',
                customRegards: ''
            },
            type: 'ATTACHMENT'
        }
    ]);
    const [currentPageId, setCurrentPageId] = useState(1);

    useEffect(() => {
        if (params.id) {
            fetchFile();
        }
    }, [params.id]);

    useEffect(() => {
        if (session?.user?.id && isHigherAuthority) {
            fetchTemplates();
        }
    }, [session?.user?.id, isHigherAuthority]);

    const fetchFile = async () => {
        try {
            const response = await fetch(`/api/efiling/files/${params.id}`);
            if (response.ok) {
                const fileData = await response.json();
                setFile(fileData);
                
                // Check if user is higher authority
                if (session?.user?.id) {
                    const userMappingRes = await fetch(`/api/efiling/users/profile?userId=${session.user.id}`);
                    if (userMappingRes.ok) {
                        const userMapping = await userMappingRes.json();
                        const efilingUserId = userMapping.efiling_user_id;
                        setUserEfilingId(efilingUserId);
                        
                        // Fetch permissions to check if higher authority
                        const permRes = await fetch(`/api/efiling/files/${params.id}/permissions`);
                        if (permRes.ok) {
                            const permData = await permRes.json();
                            const isHigherAuth = permData.permissions?.isHigherAuthority || false;
                            setIsHigherAuthority(isHigherAuth);
                            
                            if (!isHigherAuth) {
                                // Redirect if not higher authority
                                toast({
                                    title: "Access Denied",
                                    description: "This editor is only available for higher authority users (SE/CE/CEO/COO).",
                                    variant: "destructive",
                                });
                                router.push(`/efilinguser/files/${params.id}`);
                                return;
                            }
                        }
                    }
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching file:', error);
            setLoading(false);
        }
    };

    const getCurrentPage = () => {
        return pages.find(p => p.id === currentPageId) || pages[0];
    };

    const updateCurrentPageContent = (content) => {
        setPages(prev => prev.map(p => 
            p.id === currentPageId ? { ...p, content: { ...p.content, ...content } } : p
        ));
    };

    const updatePageTitle = (pageId, newTitle) => {
        setPages(prev => prev.map(p => 
            p.id === pageId ? { ...p, title: newTitle } : p
        ));
    };

    const fetchTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const res = await fetch('/api/efiling/templates');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates || []);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    // Helper function to convert plain text to HTML with proper paragraph formatting
    const convertTextToHTML = (text) => {
        if (!text) return '';
        
        // Split by double newlines (paragraph breaks) or single newlines
        // First, normalize line breaks
        const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Split by double newlines for paragraphs
        const paragraphs = normalized.split(/\n\n+/);
        
        // Convert each paragraph to HTML
        const htmlParagraphs = paragraphs.map(para => {
            // Trim whitespace
            const trimmed = para.trim();
            if (!trimmed) return '';
            
            // Replace single newlines within paragraph with <br> tags
            const withBreaks = trimmed.replace(/\n/g, '<br>');
            
            // Wrap in paragraph tag
            return `<p>${withBreaks}</p>`;
        }).filter(p => p); // Remove empty paragraphs
        
        return htmlParagraphs.join('');
    };

    const handleTemplateSelect = async (templateId) => {
        if (!templateId || templateId === '__none') {
            setSelectedTemplateId('');
            return;
        }

        try {
            const res = await fetch(`/api/efiling/templates/${templateId}`);
            if (res.ok) {
                const data = await res.json();
                const template = data.template;

                // Track template usage
                await fetch(`/api/efiling/templates/${templateId}/use`, { method: 'POST' });

                // Convert main_content to HTML if it's plain text
                const mainContentHTML = template.main_content
                    ? convertTextToHTML(template.main_content)
                    : '';

                // Apply template to current page
                const currentPage = pages.find(p => p.id === currentPageId);
                if (currentPage) {
                    const updatedPages = pages.map(page => {
                        if (page.id === currentPageId) {
                            return {
                                ...page,
                                content: {
                                    ...page.content,
                                    title: template.title || page.content.title,
                                    subject: template.subject || page.content.subject,
                                    matter: mainContentHTML || page.content.matter
                                }
                            };
                        }
                        return page;
                    });

                    setPages(updatedPages);
                    setSelectedTemplateId(templateId);

                    toast({
                        title: "Template Applied",
                        description: `Template "${template.name}" has been applied to the current page.`,
                    });
                }
            }
        } catch (error) {
            console.error('Error applying template:', error);
            toast({
                title: "Error",
                description: "Failed to apply template",
                variant: "destructive",
            });
        }
    };

    const addNewPage = () => {
        const newPageId = Math.max(...pages.map(p => p.id), 0) + 1;
        const newPageNumber = Math.max(...pages.map(p => p.pageNumber), 0) + 1;
        
        const newPage = {
            id: newPageId,
            pageNumber: newPageNumber,
            title: `Page ${newPageNumber}`,
            content: {
                title: '',
                subject: '',
                date: new Date().toLocaleDateString(),
                matter: '',
                regards: '',
                footer: '',
                customRegards: ''
            },
            type: 'ATTACHMENT'
        };
        
        setPages(prev => [...prev, newPage]);
        setCurrentPageId(newPageId);
        
        toast({
            title: "New Page Added",
            description: `Page ${newPageNumber} has been added`,
        });
    };

    const deletePage = (pageId) => {
        if (pages.length <= 1) {
            toast({
                title: "Cannot Delete",
                description: "At least one page must remain",
                variant: "destructive",
            });
            return;
        }
        
        const pageIndex = pages.findIndex(p => p.id === pageId);
        const deletedPage = pages.find(p => p.id === pageId);
        
        setPages(prev => prev.filter(p => p.id !== pageId));
        
        // Set current page to adjacent page
        if (pageIndex > 0) {
            setCurrentPageId(pages[pageIndex - 1].id);
        } else {
            setCurrentPageId(pages[1].id);
        }
        
        toast({
            title: "Page Deleted",
            description: `${deletedPage.title} has been removed`,
        });
    };

    const handleSave = async () => {
        if (!file) return;

        setSaving(true);
        try {
            // Save pages to the file using the pages API
            for (const page of pages) {
                const response = await fetch(`/api/efiling/files/${params.id}/pages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        page_title: page.title,
                        page_content: page.content,
                        page_type: page.type || 'ATTACHMENT'
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to save page');
                }
            }

            toast({
                title: "Success",
                description: `${pages.length} page(s) added to file successfully`,
            });

            // Redirect back to file detail page
            router.push(`/efilinguser/files/${params.id}`);
        } catch (error) {
            console.error('Error saving pages:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to save pages. Please try again.",
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
                    <div className="text-lg">Loading editor...</div>
                </div>
            </div>
        );
    }

    if (!file) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-red-600">File not found</div>
            </div>
        );
    }

    if (!isHigherAuthority) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <style jsx>{contentEditableStyles}</style>
            
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/efilinguser/files/${params.id}`)}
                            className="flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Add Notesheet Pages</h1>
                            <p className="text-sm text-gray-600">File: {file.file_number} - {file.subject}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Pages'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 h-[calc(100vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                    {/* Main Editor Area */}
                    <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
                        <Card className="flex flex-col h-full overflow-hidden">
                            <CardHeader className="flex-shrink-0">
                                <CardTitle className="flex items-center justify-between">
                                    <span>Document Content - {getCurrentPage().title}</span>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            value={getCurrentPage().title}
                                            onChange={(e) => updatePageTitle(currentPageId, e.target.value)}
                                            className="w-48"
                                        />
                                        {templates.length > 0 && (
                                            <Select
                                                value={selectedTemplateId || "__none"}
                                                onValueChange={handleTemplateSelect}
                                                disabled={loadingTemplates}
                                            >
                                                <SelectTrigger className="w-48">
                                                    <SelectValue placeholder={loadingTemplates ? "Loading..." : "Select Template"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__none">No Template</SelectItem>
                                                    {templates.map(template => (
                                                        <SelectItem key={template.id} value={String(template.id)}>
                                                            {template.name} {template.template_type && `(${template.template_type})`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-1 overflow-y-auto">
                                <div className="space-y-4">
                                    {/* Fixed KWSC Header */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-center justify-center space-x-4">
                                            <img 
                                                src="/logo.png" 
                                                alt="KWSC Logo" 
                                                className="h-16 w-auto"
                                            />
                                            <div className="text-center">
                                                <h1 className="text-2xl font-bold text-blue-900">
                                                    Karachi Water & Sewerage Corporation
                                                </h1>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Government of Sindh
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <input
                                            id="title"
                                            type="text"
                                            value={htmlToText(getCurrentPage().content.title)}
                                            onChange={(e) => updateCurrentPageContent({ title: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter document title"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="subject">Subject</Label>
                                        <input
                                            id="subject"
                                            type="text"
                                            value={htmlToText(getCurrentPage().content.subject)}
                                            onChange={(e) => updateCurrentPageContent({ subject: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter document subject"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="date">Date</Label>
                                        <input
                                            id="date"
                                            type="text"
                                            value={htmlToText(getCurrentPage().content.date)}
                                            onChange={(e) => updateCurrentPageContent({ date: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter date"
                                        />
                                    </div>
                                    <div className="relative flex flex-col" style={{ height: '600px' }}>
                                        <Label htmlFor="matter">Main Matter</Label>
                                        <div className="flex-1 border border-gray-300 rounded-md overflow-hidden">
                                            <TipTapEditor
                                                value={(getCurrentPage().content.matter) || ''}
                                                onChange={(value) => updateCurrentPageContent({ matter: value })}
                                                placeholder="Enter main content..."
                                                className="h-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="footer">Footer</Label>
                                        <input
                                            id="footer"
                                            type="text"
                                            value={htmlToText(getCurrentPage().content.footer)}
                                            onChange={(e) => updateCurrentPageContent({ footer: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter footer text"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 flex flex-col h-full overflow-hidden">
                        <Card className="flex flex-col h-full">
                            <CardHeader>
                                <CardTitle>Pages</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                <div className="space-y-2 mb-4">
                                    {pages.map((page) => (
                                        <div key={page.id} className="flex items-center space-x-1">
                                            <Button
                                                variant={currentPageId === page.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPageId(page.id)}
                                                className="flex-1 justify-start"
                                            >
                                                <span>{page.title}</span>
                                            </Button>
                                            {pages.length > 1 && (
                                                <button
                                                    onClick={() => deletePage(page.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100"
                                                    title="Delete page"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addNewPage}
                                    className="w-full text-green-600 border-green-600 hover:bg-green-50"
                                >
                                    + Add Page
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
