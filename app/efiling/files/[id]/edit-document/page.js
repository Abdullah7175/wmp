"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Send, Shield, Mic, MicOff, Building2, User, Calendar } from "lucide-react";
import TipTapEditor from "../../../components/TipTapEditor";
import DocumentSignatureSystem from "../../../components/DocumentSignatureSystem";
import MarkToModal from "../../../components/MarkToModal";
import ESignatureModal from "../../../components/ESignatureModal";
import AttachmentManager from "../../../components/AttachmentManager";

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

export default function DocumentEditor() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMarkToModal, setShowMarkToModal] = useState(false);
    const [showESignatureModal, setShowESignatureModal] = useState(false);
    const [editorType, setEditorType] = useState('structured');
    const [selectedTemplate, setSelectedTemplate] = useState(1);
    const [userRole, setUserRole] = useState('');
    const [canEditDocument, setCanEditDocument] = useState(false);
    
    const [documentContent, setDocumentContent] = useState({
        header: '',
        title: '',
        subject: '',
        date: new Date().toLocaleDateString(),
        matter: '',
        regards: '',
        footer: '',
        customHeader: '',
        customRegards: '',
        logo: ''
    });

    const [documentTemplates] = useState([
        { id: 1, name: 'Official Letter', type: 'letter' },
        { id: 2, name: 'Internal Memo', type: 'memo' },
        { id: 3, name: 'Project Proposal', type: 'proposal' },
        { id: 4, name: 'Work Order', type: 'workorder' },
        { id: 5, name: 'Custom Document', type: 'custom' }
    ]);

    useEffect(() => {
        if (params.id) {
            fetchFile();
        }
    }, [params.id]);

    // Check user permissions
    useEffect(() => {
        if (session?.user) {
            // Get user role from session or database
            const role = session.user.role || 'user';
            setUserRole(role);
            
            // Determine if user can edit document
            // Allow editing for admin users (role 1) or file creators
            // Note: file.created_by is efiling_users.id, session.user.id is users.id
            // We need to check if the current user is the file creator by mapping the IDs
            const canEdit = role === 1; // Admin can always edit
            
            // For non-admin users, we'll need to check if they're the file creator
            // This will be handled by the API when we fetch the user's efiling_users.id
            setCanEditDocument(canEdit);
        }
    }, [session, file]);

    const fetchFile = async () => {
        try {
            const response = await fetch(`/api/efiling/files/${params.id}`);
            if (response.ok) {
                const fileData = await response.json();
                setFile(fileData);
                
                // Load existing document content if available
                if (fileData.document_content) {
                    setDocumentContent(prev => ({
                        ...prev,
                        ...fileData.document_content
                    }));
                }
                
                // Check if current user is the file creator
                if (session?.user?.id) {
                    const userMappingRes = await fetch(`/api/efiling/users/profile?userId=${session.user.id}`);
                    if (userMappingRes.ok) {
                        const userMapping = await userMappingRes.json();
                        const efilingUserId = userMapping.efiling_user_id;
                        
                        // Update canEditDocument based on whether user is the file creator
                        const isFileCreator = fileData.created_by === efilingUserId;
                        const isAdmin = session.user.role === 1;
                        setCanEditDocument(isAdmin || isFileCreator);
                        
                        console.log('Edit access check:', {
                            userId: session.user.id,
                            efilingUserId: efilingUserId,
                            fileCreatedBy: fileData.created_by,
                            isAdmin: isAdmin,
                            isFileCreator: isFileCreator,
                            canEdit: isAdmin || isFileCreator
                        });
                    }
                }
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch file details",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching file:', error);
            toast({
                title: "Error",
                description: "Failed to fetch file details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/efiling/files/${params.id}/document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_id: params.id,
                    content: documentContent,
                    version: 1
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Document saved successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to save document",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error saving document:', error);
            toast({
                title: "Error",
                description: "Failed to save document",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleMarkTo = () => {
        setShowMarkToModal(true);
    };

    const selectTemplate = (templateId) => {
        setSelectedTemplate(templateId);
        
        // Clear custom fields when template changes
        setDocumentContent(prev => ({
            ...prev,
            customHeader: '',
            customRegards: '',
            logo: '' // Clear logo when template changes
        }));
        
        // Apply template-specific content
        switch (templateId) {
            case 1: // Official Letter
                setDocumentContent(prev => ({
                    ...prev,
                    header: 'Karachi Water and Sewerage Corporation',
                    title: 'Official Letter',
                    subject: '',
                    date: new Date().toLocaleDateString(),
                    matter: '',
                    regards: 'Yours faithfully,',
                    footer: 'KWSC - Official Communication'
                }));
                break;
            case 2: // Internal Memo
                setDocumentContent(prev => ({
                    ...prev,
                    header: 'KWSC Internal Memorandum',
                    title: 'Internal Memo',
                    subject: '',
                    date: new Date().toLocaleDateString(),
                    matter: '',
                    regards: 'Best regards,',
                    footer: 'KWSC Internal Communication'
                }));
                break;
            case 3: // Project Proposal
                setDocumentContent(prev => ({
                    ...prev,
                    header: 'KWSC Project Proposal',
                    title: 'Project Proposal',
                    subject: '',
                    date: new Date().toLocaleDateString(),
                    matter: '',
                    regards: 'Sincerely,',
                    footer: 'KWSC Project Management'
                }));
                break;
            case 4: // Work Order
                setDocumentContent(prev => ({
                    ...prev,
                    header: 'KWSC Work Order',
                    title: 'Work Order',
                    subject: '',
                    date: new Date().toLocaleDateString(),
                    matter: '',
                    regards: 'Authorized by,',
                    footer: 'KWSC Engineering Department'
                }));
                break;
            case 5: // Custom Document
                setDocumentContent(prev => ({
                    ...prev,
                    header: 'Custom Header',
                    title: '',
                    subject: '',
                    date: new Date().toLocaleDateString(),
                    matter: '',
                    regards: 'Custom Regards',
                    footer: '',
                    logo: '' // Clear logo for custom document
                }));
                break;
            default:
                break;
        }
        
        toast({
            title: "Template Applied",
            description: "Document template has been applied successfully",
        });
    };

    const applyFormatting = (command, value) => {
        // Get the currently focused element
        const activeElement = document.activeElement;
        if (!activeElement) {
            toast({
                title: "No Field Selected",
                description: "Please click on a document field (header, title, subject, etc.) to apply formatting.",
                variant: "destructive",
            });
            return;
        }

        // Check if the active element is one of our document fields
        const isDocumentField = activeElement.id && (
            activeElement.id === 'header' || 
            activeElement.id === 'title' || 
            activeElement.id === 'subject' || 
            activeElement.id === 'date' || 
            activeElement.id === 'footer' ||
            activeElement.id === 'customHeader' ||
            activeElement.id === 'customRegards' ||
            activeElement.id === 'logo' // Added logo to document fields
        );

        // If it's a document field, apply formatting
        if (isDocumentField) {
            const selection = window.getSelection();
            if (!selection.rangeCount) {
                toast({
                    title: "No Text Selected",
                    description: "Please select some text to apply formatting.",
                    variant: "destructive",
                });
                return;
            }

            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();

            if (selectedText) {
                let formattedText = selectedText;
                
                switch (command) {
                    case 'bold':
                        formattedText = `<strong>${selectedText}</strong>`;
                        break;
                    case 'italic':
                        formattedText = `<em>${selectedText}</em>`;
                        break;
                    case 'underline':
                        formattedText = `<u>${selectedText}</u>`;
                        break;
                    case 'strikethrough':
                        formattedText = `<s>${selectedText}</s>`;
                        break;
                    case 'font':
                        formattedText = `<span style="font-family: ${value}">${selectedText}</span>`;
                        break;
                    case 'size':
                        formattedText = `<span style="font-size: ${value}">${selectedText}</span>`;
                        break;
                    case 'color':
                        // For color, we'll use a simple color picker
                        const color = prompt('Enter color (e.g., red, #ff0000):', 'blue');
                        if (color) {
                            formattedText = `<span style="color: ${color}">${selectedText}</span>`;
                        } else {
                            return; // User cancelled
                        }
                        break;
                    case 'highlight':
                        // For highlight, we'll use a simple color picker
                        const highlightColor = prompt('Enter highlight color (e.g., yellow, #ffff00):', 'yellow');
                        if (highlightColor) {
                            formattedText = `<span style="background-color: ${highlightColor}">${selectedText}</span>`;
                        } else {
                            return; // User cancelled
                        }
                        break;
                    case 'align':
                        // For alignment, we need to wrap the entire field content
                        const fieldContent = activeElement.innerHTML;
                        const alignedContent = `<div style="text-align: ${value}">${fieldContent}</div>`;
                        activeElement.innerHTML = alignedContent;
                        return; // Exit early for alignment
                    case 'capitalize':
                        formattedText = selectedText.replace(/\b\w/g, l => l.toUpperCase());
                        break;
                    case 'uppercase':
                        formattedText = selectedText.toUpperCase();
                        break;
                    case 'lowercase':
                        formattedText = selectedText.toLowerCase();
                        break;
                    case 'bullet':
                        formattedText = `• ${selectedText}`;
                        break;
                    case 'number':
                        formattedText = `1. ${selectedText}`;
                        break;
                    case 'indent':
                        formattedText = `&nbsp;&nbsp;&nbsp;&nbsp;${selectedText}`;
                        break;
                    case 'outdent':
                        formattedText = selectedText.replace(/^&nbsp;&nbsp;&nbsp;&nbsp;/, '');
                        break;
                    case 'clear':
                        // Remove all HTML tags
                        formattedText = selectedText.replace(/<[^>]*>/g, '');
                        break;
                    case 'image':
                        // Handle image upload for main matter only
                        if (activeElement.id === 'matter') {
                            // This will be handled by TipTap editor
                            return;
                        } else {
                            // For other fields, show message
                            toast({
                                title: "Image Not Supported",
                                description: "Images can only be added to the main matter field.",
                                variant: "destructive",
                            });
                            return;
                        }
                    case 'table':
                        // Handle table insertion for main matter only
                        if (activeElement.id === 'matter') {
                            // This will be handled by TipTap editor
                            return;
                        } else {
                            toast({
                                title: "Table Not Supported",
                                description: "Tables can only be added to the main matter field.",
                                variant: "destructive",
                            });
                            return;
                        }
                    case 'link':
                        // Handle link insertion for main matter only
                        if (activeElement.id === 'matter') {
                            // This will be handled by TipTap editor
                            return;
                        } else {
                            toast({
                                title: "Link Not Supported",
                                description: "Links can only be added to the main matter field.",
                                variant: "destructive",
                            });
                            return;
                        }
                    case 'unlink':
                        // Handle link removal for main matter only
                        if (activeElement.id === 'matter') {
                            // This will be handled by TipTap editor
                            return;
                        } else {
                            toast({
                                title: "Link Removal Not Supported",
                                description: "Link removal can only be done in the main matter field.",
                                variant: "destructive",
                            });
                            return;
                        }
                    case 'undo':
                    case 'redo':
                        // Handle undo/redo for main matter only
                        if (activeElement.id === 'matter') {
                            // This will be handled by TipTap editor
                            return;
                        } else {
                            toast({
                                title: "Undo/Redo Not Supported",
                                description: "Undo/Redo can only be used in the main matter field.",
                                variant: "destructive",
                            });
                            return;
                        }
                    default:
                        return;
                }

                // Replace the selected text with formatted text
                range.deleteContents();
                const div = document.createElement('div');
                div.innerHTML = formattedText;
                range.insertNode(div.firstChild || div);

                // Update the document content state
                const fieldName = activeElement.id;
                const newValue = activeElement.innerHTML;
                
                setDocumentContent(prev => ({
                    ...prev,
                    [fieldName]: newValue
                }));

                // Clear selection
                selection.removeAllRanges();
            } else {
                // No text selected, show a message
                toast({
                    title: "No Text Selected",
                    description: "Please select some text to apply formatting.",
                    variant: "destructive",
                });
            }
        } else {
            // If it's not a document field, show a message
            toast({
                title: "No Field Selected",
                description: "Please click on a document field (header, title, subject, etc.) to apply formatting.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading document editor...</div>
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Add CSS styles for contentEditable placeholder */}
            <style jsx>{contentEditableStyles}</style>
            
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Document Editor</h1>
                            <p className="text-sm text-gray-600">File: {file.file_number}</p>
                            
                            {/* Editor Type Toggle */}
                            <div className="flex items-center space-x-2 mt-2">
                                <Button
                                    variant={editorType === 'structured' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setEditorType('structured')}
                                    className="text-xs"
                                >
                                    📋 Structured Editor
                                </Button>
                                <Button
                                    variant={editorType === 'blank' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setEditorType('blank')}
                                    className="text-xs"
                                >
                                    📄 Blank A4 Page
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </div>
                            )}
                        </Button>
                        
                        <Button
                            onClick={handleMarkTo}
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Mark To
                        </Button>
                        
                        <Button
                            onClick={() => {
                                // Open the signature modal from DocumentSignatureSystem
                                const signatureButton = document.querySelector('[data-signature-button]');
                                if (signatureButton) {
                                    signatureButton.click();
                                }
                            }}
                            variant="outline"
                            className="border-purple-600 text-purple-600 hover:bg-purple-50"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            E-Sign
                        </Button>
                    </div>
                </div>

                {/* Template Buttons */}
                <div className="border-t border-gray-200 p-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                        <Label className="text-sm font-medium">Templates:</Label>
                        <Button
                            variant={selectedTemplate === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => selectTemplate(1)}
                            title="Official Letter Template"
                        >
                            📋 Letter
                        </Button>
                        <Button
                            variant={selectedTemplate === 2 ? "default" : "outline"}
                            size="sm"
                            onClick={() => selectTemplate(2)}
                            title="Internal Memo Template"
                        >
                            📝 Memo
                        </Button>
                        <Button
                            variant={selectedTemplate === 3 ? "default" : "outline"}
                            size="sm"
                            onClick={() => selectTemplate(3)}
                            title="Project Proposal Template"
                        >
                            📋 Proposal
                        </Button>
                        <Button
                            variant={selectedTemplate === 4 ? "default" : "outline"}
                            size="sm"
                            onClick={() => selectTemplate(4)}
                            title="Work Order Template"
                        >
                            📋 Work Order
                        </Button>
                        <Button
                            variant={selectedTemplate === 5 ? "default" : "outline"}
                            size="sm"
                            onClick={() => selectTemplate(5)}
                            title="Custom Document Template"
                        >
                            📋 Custom
                        </Button>
                    </div>
                </div>

                {/* Formatting Toolbar */}
                {/*  */}
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Editor Area */}
                    <div className="lg:col-span-3">
                        {editorType === 'structured' ? (
                            // Structured Editor
                            <Card className="min-h-[800px]">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Document Content</span>
                                        <Select value={selectedTemplate.toString()} onValueChange={(value) => selectTemplate(parseInt(value))}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Select Template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentTemplates.map((template) => (
                                                    <SelectItem key={template.id} value={template.id.toString()}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        {/* Logo Section */}
                                        <div>
                                            <Label htmlFor="logo">Logo (Top Left Corner)</Label>
                                            <div className="flex items-center gap-4">
                                                <div
                                                    id="logo"
                                                    contentEditable={canEditDocument}
                                                    dangerouslySetInnerHTML={{ __html: documentContent.logo || '' }}
                                                    onBlur={(e) => setDocumentContent(prev => ({ ...prev, logo: e.target.innerHTML }))}
                                                    onInput={(e) => {
                                                        setDocumentContent(prev => ({ ...prev, logo: e.target.innerHTML }));
                                                    }}
                                                    className="w-32 h-20 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-center"
                                                    data-placeholder="Click to add logo"
                                                    style={{ minHeight: '80px' }}
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = (e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (event) => {
                                                                        const logoUrl = event.target.result;
                                                                        setDocumentContent(prev => ({ ...prev, logo: `<img src="${logoUrl}" alt="Logo" class="max-w-full max-h-full object-contain" />` }));
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            };
                                                            input.click();
                                                        }}
                                                        disabled={!canEditDocument}
                                                    >
                                                        Upload Logo
                                                    </Button>
                                                    {documentContent.logo && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setDocumentContent(prev => ({ ...prev, logo: '' }))}
                                                            disabled={!canEditDocument}
                                                        >
                                                            Remove Logo
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Upload a logo image to display in the top left corner of your document
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="header">Header</Label>
                                            <Select 
                                                value={documentContent.header} 
                                                onValueChange={(value) => setDocumentContent(prev => ({ ...prev, header: value }))}
                                                disabled={!canEditDocument}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select header" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Government of Pakistan">Government of Pakistan</SelectItem>
                                                    <SelectItem value="Provincial Government">Provincial Government</SelectItem>
                                                    <SelectItem value="Local Government">Local Government</SelectItem>
                                                    <SelectItem value="Department of Works">Department of Works</SelectItem>
                                                    <SelectItem value="Custom">Custom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {documentContent.header === 'Custom' && (
                                                <div
                                                    id="customHeader"
                                                    contentEditable={canEditDocument}
                                                    dangerouslySetInnerHTML={{ __html: documentContent.customHeader }}
                                                    onBlur={(e) => setDocumentContent(prev => ({ ...prev, customHeader: e.target.innerHTML }))}
                                                    onInput={(e) => {
                                                        setDocumentContent(prev => ({ ...prev, customHeader: e.target.innerHTML }));
                                                    }}
                                                    className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                                                    data-placeholder="Enter custom header"
                                                    style={{ minHeight: '40px' }}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="title">Title</Label>
                                            <div
                                                id="title"
                                                contentEditable={canEditDocument}
                                                dangerouslySetInnerHTML={{ __html: documentContent.title }}
                                                onBlur={(e) => setDocumentContent(prev => ({ ...prev, title: e.target.innerHTML }))}
                                                onInput={(e) => {
                                                    // Update state as user types
                                                    setDocumentContent(prev => ({ ...prev, title: e.target.innerHTML }));
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                data-placeholder="Enter document title"
                                                style={{ minHeight: '40px' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="subject">Subject</Label>
                                            <div
                                                id="subject"
                                                contentEditable={canEditDocument}
                                                dangerouslySetInnerHTML={{ __html: documentContent.subject }}
                                                onBlur={(e) => setDocumentContent(prev => ({ ...prev, subject: e.target.innerHTML }))}
                                                onInput={(e) => {
                                                    setDocumentContent(prev => ({ ...prev, subject: e.target.innerHTML }));
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                data-placeholder="Enter document subject"
                                                style={{ minHeight: '40px' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="date">Date</Label>
                                            <div
                                                id="date"
                                                contentEditable={canEditDocument}
                                                dangerouslySetInnerHTML={{ __html: documentContent.date }}
                                                onBlur={(e) => setDocumentContent(prev => ({ ...prev, date: e.target.innerHTML }))}
                                                onInput={(e) => {
                                                    setDocumentContent(prev => ({ ...prev, date: e.target.innerHTML }));
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                data-placeholder="Enter date"
                                                style={{ minHeight: '40px' }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="matter">Main Matter</Label>
                                            <TipTapEditor
                                                value={documentContent.matter}
                                                onChange={(value) => setDocumentContent(prev => ({ ...prev, matter: value }))}
                                                placeholder="Enter main content..."
                                                className="min-h-[200px]"
                                                readOnly={!canEditDocument}
                                            />
                                            {!canEditDocument && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Only the document creator or authorized administrators can edit this content.
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="regards">Regards</Label>
                                            <Select 
                                                value={documentContent.regards} 
                                                onValueChange={(value) => setDocumentContent(prev => ({ ...prev, regards: value }))}
                                                disabled={!canEditDocument}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select regards" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yours faithfully">Yours faithfully</SelectItem>
                                                    <SelectItem value="Yours sincerely">Yours sincerely</SelectItem>
                                                    <SelectItem value="Best regards">Best regards</SelectItem>
                                                    <SelectItem value="Custom">Custom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {documentContent.regards === 'Custom' && (
                                                <div
                                                    id="customRegards"
                                                    contentEditable={canEditDocument}
                                                    dangerouslySetInnerHTML={{ __html: documentContent.customRegards }}
                                                    onBlur={(e) => setDocumentContent(prev => ({ ...prev, customRegards: e.target.innerHTML }))}
                                                    onInput={(e) => {
                                                        setDocumentContent(prev => ({ ...prev, customRegards: e.target.innerHTML }));
                                                    }}
                                                    className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                                                    data-placeholder="Enter custom regards"
                                                    style={{ minHeight: '40px' }}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="footer">Footer</Label>
                                            <div
                                                id="footer"
                                                contentEditable={canEditDocument}
                                                dangerouslySetInnerHTML={{ __html: documentContent.footer }}
                                                onBlur={(e) => setDocumentContent(prev => ({ ...prev, footer: e.target.innerHTML }))}
                                                onInput={(e) => {
                                                    setDocumentContent(prev => ({ ...prev, footer: e.target.innerHTML }));
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded-md min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                data-placeholder="Enter footer text"
                                                style={{ minHeight: '40px' }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            // Blank A4 Page Editor
                            <Card className="min-h-[800px]">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Blank A4 Page Editor</span>
                                        <Select value={selectedTemplate.toString()} onValueChange={(value) => selectTemplate(parseInt(value))}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Select Template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentTemplates.map((template) => (
                                                    <SelectItem key={template.id} value={template.id.toString()}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* A4 Page Container */}
                                    <div className="bg-white border border-gray-300 shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
                                        {/* Header */}
                                        <div className="text-center mb-8">
                                            <div className="text-lg font-semibold text-gray-800 mb-2">
                                                {documentContent.header || 'Document Header'}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className="text-center mb-6">
                                            <div className="text-2xl font-bold text-gray-900 mb-2">
                                                {documentContent.title || 'Document Title'}
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div className="mb-6">
                                            <div className="text-lg font-medium text-gray-800 mb-2">
                                                Subject: {documentContent.subject || 'Document Subject'}
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="mb-6 text-right">
                                            <div className="text-sm text-gray-600">
                                                Date: {documentContent.date || new Date().toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="mb-8">
                                            <TipTapEditor
                                                value={documentContent.matter}
                                                onChange={(value) => setDocumentContent(prev => ({ ...prev, matter: value }))}
                                                placeholder="Start typing your document content here..."
                                                className="min-h-[400px]"
                                            />
                                        </div>

                                        {/* Regards */}
                                        <div className="mb-4">
                                            <div className="text-lg font-medium text-gray-800">
                                                {documentContent.regards || 'Yours faithfully,'}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="text-center mt-8">
                                            <div className="text-sm text-gray-600">
                                                {documentContent.footer || 'Document Footer'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* File Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">File Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Building2 className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Department: {file.department_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Assigned to: {file.assigned_to_name || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Created: {new Date(file.created_at).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Help */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Help & Tips</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-gray-600">
                                    <p>• Use the template buttons to apply predefined document structures</p>
                                    <p>• The TipTap editor provides professional formatting tools</p>
                                    <p>• Use &quot;Mark To&quot; to send for approval</p>
                                    <p>• Save your work regularly</p>
                                </CardContent>
                            </Card>

                            {/* Attachment Manager */}
                            <AttachmentManager
                                fileId={params.id}
                                canEdit={canEditDocument}
                            />

                            {/* Document Signature System */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Document Signature System</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DocumentSignatureSystem
                                        fileId={params.id}
                                        userRole={userRole}
                                        canEditDocument={canEditDocument}
                                        onSignatureAdded={(signature) => {
                                            // Handle signature added
                                            console.log('Signature added:', signature);
                                        }}
                                        onCommentAdded={(comment) => {
                                            // Handle comment added
                                            console.log('Comment added:', comment);
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showMarkToModal && (
                <MarkToModal
                    showMarkToModal={showMarkToModal}
                    fileId={params.id}
                    onClose={() => setShowMarkToModal(false)}
                />
            )}

            {showESignatureModal && (
                <ESignatureModal
                    fileId={params.id}
                    onClose={() => setShowESignatureModal(false)}
                />
            )}
        </div>
    );
}
