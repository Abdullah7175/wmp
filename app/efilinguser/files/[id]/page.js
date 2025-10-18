"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Download, Eye, Clock, User, Building2, FileText, AlertCircle, MessageSquare, Forward, Printer, FileDown, X, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function FileDetail() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [signatures, setSignatures] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);
    const [beforeContent, setBeforeContent] = useState([]);

    const [showMarkModal, setShowMarkModal] = useState(false);
    const [markUsers, setMarkUsers] = useState([]);
    const [markToUserId, setMarkToUserId] = useState("");
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [markRemarks, setMarkRemarks] = useState("");
    const [markSubmitting, setMarkSubmitting] = useState(false);

    useEffect(() => {
        if (!session?.user?.id || !params.id) return;
        const loadData = async () => {
            await fetchFile();
            await fetchExtras();
            await fetchTimeline();
            await fetchComments();
        };
        loadData();
    }, [session?.user?.id, params.id]);

    useEffect(() => {
        if (file?.work_request_id) {
            fetchBeforeContent();
        }
    }, [file?.work_request_id]);

    const fetchFile = async () => {
        setLoading(true);
        try {
            const fileRes = await fetch(`/api/efiling/files/${params.id}`);
            if (!fileRes.ok) {
                throw new Error(`File not found: ${fileRes.status}`);
            }
            const fileData = await fileRes.json();
            setFile(fileData);
        } catch (error) {
            console.error('Error fetching file:', error);
            toast({ title: "Error", description: "Failed to load file details", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchExtras = async () => {
        try {
            const [docRes, attRes, sigRes] = await Promise.all([
                fetch(`/api/efiling/files/${params.id}/document`),
                fetch(`/api/efiling/files/${params.id}/attachments`),
                fetch(`/api/efiling/files/${params.id}/signatures`)
            ]);
            if (docRes.ok) {
                const doc = await docRes.json();
                console.log('Document data:', doc);
                setPages(doc.pages || []);
                
                // If no pages but document_content exists, create a single page
                if ((!doc.pages || doc.pages.length === 0) && doc.document_content) {
                    console.log('Creating fallback page from document_content');
                    setPages([{
                        id: 'main',
                        pageNumber: 1,
                        title: 'Main Document',
                        content: doc.document_content,
                        type: 'MAIN'
                    }]);
                }
            }
            if (attRes.ok) {
                const atts = await attRes.json();
                console.log('Fetched attachments:', atts);
                setAttachments(Array.isArray(atts) ? atts : []);
            }
            if (sigRes.ok) {
                const sigs = await sigRes.json();
                console.log('Fetched signatures:', sigs);
                setSignatures(Array.isArray(sigs) ? sigs : []);
            }
        } catch (e) {
            console.error('Error loading extras', e);
        }
    };

    const fetchTimeline = async () => {
        try {
            const res = await fetch(`/api/efiling/files/${params.id}/timeline`);
            if (res.ok) {
                const data = await res.json();
                setTimeline(Array.isArray(data.events) ? data.events : []);
            }
        } catch (e) {
            console.error('Timeline load error', e);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/efiling/files/${params.id}/comments`);
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched comments:', data);
                setComments(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Comments load error', e);
        }
    };

    const fetchBeforeContent = async () => {
        try {
            const res = await fetch(`/api/before-content?workRequestId=${file.work_request_id}`);
            if (res.ok) {
                const data = await res.json();
                setBeforeContent(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Before content load error', e);
        }
    };

    const postComment = async () => {
        if (!newComment.trim()) return;
        try {
            setPostingComment(true);
            const res = await fetch(`/api/efiling/files/${params.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: session?.user?.id,
                    user_name: session?.user?.name || 'User',
                    user_role: String(session?.user?.role ?? ''),
                    text: newComment.trim()
                })
            });
            if (!res.ok) throw new Error('Failed to add comment');
            setNewComment("");
            await fetchComments();
            toast({ title: 'Comment added' });
        } catch (e) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setPostingComment(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'low': return 'bg-gray-100 text-gray-800';
            case 'normal': return 'bg-blue-100 text-blue-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConfidentialityColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'normal': return 'bg-green-100 text-green-800';
            case 'confidential': return 'bg-yellow-100 text-yellow-800';
            case 'secret': return 'bg-orange-100 text-orange-800';
            case 'top_secret': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePrint = () => {
        console.log('Print button clicked');
        console.log('Current pages state:', pages);
        console.log('Current file state:', file);
        console.log('File document_content:', file?.document_content);
        console.log('Signatures:', signatures);
        console.log('Attachments:', attachments);
        console.log('Comments:', comments);
        window.print();
    };

    const handleExportPDF = async () => {
        try {
            toast({ title: "Generating PDF...", description: "Please wait while we prepare your document." });
            
            // Use browser's print to PDF functionality
            // Set a flag to indicate PDF export mode
            const originalTitle = document.title;
            document.title = `EFile_${file?.file_number || 'document'}_${new Date().toISOString().split('T')[0]}`;
            
            // Trigger print dialog with PDF as default
            window.print();
            
            // Restore original title after a short delay
            setTimeout(() => {
                document.title = originalTitle;
            }, 1000);
            
            toast({ 
                title: "PDF Export", 
                description: "Please select 'Save as PDF' in the print dialog to export." 
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast({ 
                title: "Export Failed", 
                description: "Failed to export PDF. Please try again.", 
                variant: "destructive" 
            });
        }
    };

    const openAttachmentModal = (attachment) => {
        setSelectedAttachment(attachment);
        setIsModalOpen(true);
    };

    const closeAttachmentModal = () => {
        setSelectedAttachment(null);
        setIsModalOpen(false);
    };

    const renderPage = (page) => {
        // Parse page.content if it's a string
        let content = page.content || {};
        if (typeof page.content === 'string') {
            try {
                content = JSON.parse(page.content);
                console.log('Parsed page content:', content);
            } catch (e) {
                console.error('Error parsing page content:', e);
                content = {};
            }
        }
        
        // Parse file.document_content if it's a string
        let parsedDocumentContent = file?.document_content;
        if (typeof file?.document_content === 'string') {
            try {
                parsedDocumentContent = JSON.parse(file.document_content);
                console.log('Parsed document_content:', parsedDocumentContent);
            } catch (e) {
                console.error('Error parsing document_content:', e);
                parsedDocumentContent = {};
            }
        }
        
        const header = content.header || parsedDocumentContent?.header;
        const title = content.title || parsedDocumentContent?.title;
        const subject = content.subject || parsedDocumentContent?.subject;
        const matter = content.matter || parsedDocumentContent?.matter;
        const footer = content.footer || parsedDocumentContent?.footer;
        
        console.log('Rendering page:', page);
        console.log('Page content:', content);
        console.log('Parsed document_content:', parsedDocumentContent);
        console.log('Header:', header);
        console.log('Title:', title);
        console.log('Subject:', subject);
        console.log('Matter:', matter);
        console.log('Footer:', footer);

        // Check if page has meaningful content
        const hasContent = header || title || subject || matter || footer;
        if (!hasContent) {
            console.log('Skipping empty page:', page);
            return null;
        }
        
        // Additional check for empty strings
        const hasRealContent = (header && header.trim()) || 
                              (title && title.trim()) || 
                              (subject && subject.trim()) || 
                              (matter && matter.trim()) || 
                              (footer && footer.trim());
        if (!hasRealContent) {
            console.log('Skipping page with empty content:', page);
            return null;
        }

        return (
            <div key={page.id || page.pageNumber} className="bg-white shadow border mx-auto page-content" style={{ width: '794px', minHeight: '1123px', padding: '20px' }}>
                {/* Compact KWSC Header */}
                <div className="border-b border-gray-300 pb-3 mb-4">
                    <div className="flex items-center space-x-3">
                        <img 
                            src="/logo.png" 
                            alt="KWSC Logo" 
                            className="h-8 w-auto"
                        />
                        <div>
                            <h1 className="text-lg font-bold text-blue-900">
                                Karachi Water & Sewerage Corporation
                            </h1>
                            <p className="text-xs text-blue-700">
                                Government of Sindh
                            </p>
                        </div>
                    </div>
                </div>
                
                {header && (<div className="mb-3 text-center text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: header }} />)}
                {title && (<h2 className="text-lg font-bold text-center mb-3" dangerouslySetInnerHTML={{ __html: title }} />)}
                {subject && (
                    <div className="mb-3">
                        <div className="font-semibold text-sm">Subject:</div>
                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: subject }} />
                    </div>
                )}
                {matter && (<div className="prose text-sm" dangerouslySetInnerHTML={{ __html: matter }} />)}
                {footer && (<div className="mt-4 text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: footer }} />)}
            </div>
        );
    };

    const openMarkModal = async () => {
        try {
            setShowMarkModal(true);
            // Load users for selection; in future, filter by workflow rules
            const res = await fetch(`/api/efiling/users`);
            if (res.ok) {
                const data = await res.json();
                setMarkUsers(Array.isArray(data) ? data : []);
            } else { setMarkUsers([]); }
        } catch { setMarkUsers([]); }
    };

    const submitMark = async () => {
        if (!markToUserId) { toast({ title: 'Select user', description: 'Please select a user to forward', variant: 'destructive' }); return; }
        try {
            setMarkSubmitting(true);
            const res = await fetch(`/api/efiling/files/${params.id}/mark-to`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_ids: [parseInt(markToUserId)], remarks: markRemarks || '' })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to mark');
            }
            toast({ title: 'Marked/Forwarded', description: 'File forwarded successfully' });
            setShowMarkModal(false);
            setMarkToUserId("");
            setMarkRemarks("");
            await Promise.all([fetchFile(), fetchTimeline()]);
        } catch (e) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setMarkSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg">Loading file details...</div>
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
        <>
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .print-only {
                        display: block !important;
                    }
                    
                    .page-content {
                        page-break-inside: avoid;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 15mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        min-height: 250mm !important;
                        background: white !important;
                        display: block !important;
                        visibility: visible !important;
                    }
                    
                    .page-content:not(:last-child) {
                        page-break-after: always;
                    }
                    
                    .page-content:last-child {
                        page-break-after: auto;
                    }
                    
                    /* Hide empty pages */
                    .page-content:empty {
                        display: none !important;
                    }
                    
                    /* Hide pages with no meaningful content */
                    .page-content:has(.prose:empty) {
                        display: none !important;
                    }
                    
                    /* Print header on each page */
                    @page {
                        @top-center {
                            content: "Karachi Water & Sewerage Corporation - E-Filing System";
                            font-size: 10pt;
                            color: #666;
                        }
                        @bottom-right {
                            content: "Page " counter(page) " of " counter(pages);
                            font-size: 9pt;
                            color: #666;
                        }
                        @bottom-left {
                            content: "File: ${file?.file_number || 'N/A'}";
                            font-size: 9pt;
                            color: #666;
                        }
                    }
                    
                    /* Ensure content doesn't overflow */
                    * {
                        overflow: visible !important;
                    }
                    
                    /* Hide navigation and sidebar on print */
                    nav, aside, .no-print {
                        display: none !important;
                    }
                    
                    /* Make main content full width */
                    .container {
                        max-width: 100% !important;
                        padding: 0 !important;
                    }
                    
                    .lg\\:col-span-2 {
                        grid-column: span 1 !important;
                    }
                    
                    /* Hide only UI elements, show all content */
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Ensure document pages are visible */
                    .page-content {
                        display: block !important;
                    }
                    
                    /* Show all content cards */
                    .space-y-6 > div {
                        display: block !important;
                    }
                    
                    /* Ensure document content is visible and properly styled */
                    .prose {
                        color: #000 !important;
                        font-size: 12pt !important;
                        line-height: 1.5 !important;
                    }
                    
                    /* Make sure images and logos are visible */
                    img {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                    
                    /* Style document headers */
                    h1, h2, h3, h4, h5, h6 {
                        color: #000 !important;
                        font-weight: bold !important;
                    }
                    
                    /* Compact KWSC header styling */
                    .border-b {
                        border-bottom: 1px solid #ccc !important;
                        padding-bottom: 8px !important;
                        margin-bottom: 15px !important;
                    }
                    
                    /* Logo sizing for print */
                    .h-8 {
                        height: 32px !important;
                        width: auto !important;
                    }
                    
                    /* Header text sizing */
                    .text-lg {
                        font-size: 14pt !important;
                    }
                    
                    .text-xs {
                        font-size: 10pt !important;
                    }
                    
                    .text-sm {
                        font-size: 11pt !important;
                    }
                    
                    /* Ensure KWSC header is visible in print */
                    .bg-blue-50 {
                        background: white !important;
                        border: 1px solid #ccc !important;
                    }
                    
                    .text-blue-900, .text-blue-700 {
                        color: #000 !important;
                    }
                    
                    /* Ensure all text is visible */
                    .text-gray-600, .text-gray-700 {
                        color: #000 !important;
                    }
                    
                    /* Force visibility of all content */
                    .page-content * {
                        visibility: visible !important;
                        opacity: 1 !important;
                    }
                    
                    /* File info for first page */
                    .print-file-info {
                        border: 1px solid #ddd;
                        padding: 15mm;
                        margin-bottom: 10mm;
                        page-break-inside: avoid;
                    }
                    
                    .print-file-info h2 {
                        font-size: 14pt;
                        font-weight: bold;
                        margin-bottom: 5mm;
                        border-bottom: 2px solid #333;
                        padding-bottom: 3mm;
                    }
                    
                    .print-file-info .info-row {
                        display: flex;
                        margin-bottom: 3mm;
                    }
                    
                    .print-file-info .info-label {
                        font-weight: bold;
                        width: 40%;
                        color: #333;
                    }
                    
                    .print-file-info .info-value {
                        width: 60%;
                        color: #000;
                    }
                    
                    /* Print sections for signatures, attachments, comments */
                    .print-section {
                        page-break-before: always;
                        page-break-inside: auto;
                        margin-top: 0;
                        padding: 15mm;
                        border: 2px solid #333;
                        background: white !important;
                        display: block !important;
                        visibility: visible !important;
                    }
                    
                    .print-section h3 {
                        font-size: 14pt;
                        font-weight: bold;
                        margin-bottom: 8mm;
                        border-bottom: 2px solid #333;
                        padding-bottom: 5mm;
                        color: #000 !important;
                        text-align: center;
                    }
                    
                    /* Grid layout for signatures and comments */
                    .print-signatures-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 8mm !important;
                        margin-bottom: 5mm !important;
                    }

                    .print-comments-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 8mm !important;
                        margin-bottom: 5mm !important;
                    }

                    .print-signature-item {
                        padding: 3mm !important;
                        border: 1px solid #ddd !important;
                        background: white !important;
                        display: block !important;
                        visibility: visible !important;
                        break-inside: avoid !important;
                        margin-bottom: 0 !important;
                        text-align: center !important;
                    }

                    .print-signature-item img {
                        max-width: 100% !important;
                        height: auto !important;
                        max-height: 25mm !important;
                        display: block !important;
                        margin: 0 auto 2mm auto !important;
                        border: 1px solid #333 !important;
                    }

                    .print-signature-details {
                        font-size: 8pt !important;
                        text-align: center !important;
                        color: #000 !important;
                        margin-top: 2mm !important;
                    }

                    .print-attachment-item {
                        margin-bottom: 3mm;
                        padding: 3mm;
                        border: 1px solid #666;
                        page-break-inside: avoid;
                        background: #f9f9f9 !important;
                    }

                    .print-comment-item {
                        padding: 3mm !important;
                        border: 1px solid #ddd !important;
                        background: white !important;
                        display: block !important;
                        visibility: visible !important;
                        break-inside: avoid !important;
                        margin-bottom: 0 !important;
                    }

                    .print-comment-header {
                        font-size: 8pt !important;
                        font-weight: bold !important;
                        color: #000 !important;
                        margin-bottom: 1mm !important;
                    }

                    .print-comment-content {
                        font-size: 7pt !important;
                        color: #000 !important;
                        line-height: 1.2 !important;
                    }
                    
                    .print-attachment-item img {
                        max-height: 70mm;
                        width: auto;
                        margin-bottom: 3mm;
                        display: block;
                    }
                    
                    /* Force print sections to be visible */
                    .print-section * {
                        visibility: visible !important;
                        opacity: 1 !important;
                        color: #000 !important;
                    }
                }
                
                .print-only {
                    display: none;
                }
            `}</style>
            
            {/* Print-only file information header */}
            <div className="print-only print-file-info">
                <h2>E-Filing Document</h2>
                <div className="info-row">
                    <div className="info-label">File Number:</div>
                    <div className="info-value">{file?.file_number}</div>
                </div>
                <div className="info-row">
                    <div className="info-label">Subject:</div>
                    <div className="info-value">{file?.subject}</div>
                </div>
                <div className="info-row">
                    <div className="info-label">Department:</div>
                    <div className="info-value">{file?.department_name}</div>
                </div>
                <div className="info-row">
                    <div className="info-label">Category:</div>
                    <div className="info-value">{file?.category_name}</div>
                </div>
                <div className="info-row">
                    <div className="info-label">Priority:</div>
                    <div className="info-value">{file?.priority}</div>
                </div>
                <div className="info-row">
                    <div className="info-label">Status:</div>
                    <div className="info-value">{file?.status_name}</div>
                </div>
                <div className="info-row">
                    <div className="info-label">Created Date:</div>
                    <div className="info-value">{formatDate(file?.created_at)}</div>
                </div>
                <div className="info-row">
                    <div className="info-label">Created By:</div>
                    <div className="info-value">{file?.created_by_name}</div>
                </div>
            </div>
        
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6 no-print">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">File Details</h1>
                        <p className="text-gray-600">View comprehensive file information</p>
                    </div>
                </div>
                <div className="flex space-x-2 no-print">
                    <Button onClick={() => router.push(`/efilinguser/files/${file.id}/edit-document`)} className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit File
                    </Button>
                    <Button onClick={handlePrint} variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="no-print">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                File Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">File Number</label>
                                    <p className="text-lg font-semibold">{file.file_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <div className="mt-1">
                                        <Badge className={getStatusColor(file.status_name)}>{file.status_name}</Badge>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Subject</label>
                                <p className="text-lg">{file.subject}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Department</label>
                                    <p className="flex items-center"><Building2 className="w-4 h-4 mr-2 text-gray-500" />{file.department_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Category</label>
                                    <p>{file.category_name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Priority</label>
                                    <div className="mt-1"><Badge className={getPriorityColor(file.priority)}>{file.priority}</Badge></div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Confidentiality Level</label>
                                    <div className="mt-1"><Badge className={getConfidentialityColor(file.confidentiality_level)}>{file.confidentiality_level}</Badge></div>
                                </div>
                            </div>
                            
                            {/* SLA Status Section */}
                            {file.sla_deadline && (
                                <div className="border-t pt-4">
                                    <label className="text-sm font-medium text-gray-600 mb-3 block">SLA Status (TAT)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500">Status</label>
                                            <div className="mt-1">
                                                {file.sla_status === 'BREACHED' && (
                                                    <Badge variant="destructive" className="flex items-center">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Breached
                                                    </Badge>
                                                )}
                                                {file.sla_status === 'ACTIVE' && (
                                                    <Badge variant="default" className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Active
                                                    </Badge>
                                                )}
                                                {file.sla_status === 'PAUSED' && (
                                                    <Badge variant="secondary" className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Paused
                                                    </Badge>
                                                )}
                                                {file.sla_status === 'COMPLETED' && (
                                                    <Badge variant="outline" className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Completed
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500">Time Remaining</label>
                                            <p className={`text-sm font-medium ${
                                                file.sla_status === 'BREACHED' ? 'text-red-600' : 
                                                file.sla_status === 'PAUSED' ? 'text-yellow-600' : 
                                                'text-green-600'
                                            }`}>
                                                {file.sla_status === 'PAUSED' ? 'Paused' : 
                                                 file.hours_remaining !== null ? 
                                                    `${file.hours_remaining > 0 ? '+' : ''}${file.hours_remaining}h` : 
                                                    'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        <div>Deadline: {formatDate(file.sla_deadline)}</div>
                                        {file.current_stage_name && (
                                            <div>Current Stage: {file.current_stage_name}</div>
                                        )}
                                        {file.sla_paused && (
                                            <div className="text-yellow-600">⚠️ SLA paused (pending CEO review)</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {file.work_request_id && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Video Archiving ID</label>
                                    <p className="text-lg font-semibold text-blue-600">#{file.work_request_id}</p>
                                    <p className="text-sm text-gray-500">Linked to work request for video archiving</p>
                                </div>
                            )}
                            {file.remarks && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Remarks</label>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{file.remarks}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {(() => {
                            console.log('Pages state:', pages);
                            console.log('File state:', file);
                            console.log('Pages length:', pages?.length);
                            console.log('File document_content:', file?.document_content);
                            
                            if (pages && pages.length > 0) {
                                console.log('Rendering pages:', pages);
                                return pages.map(renderPage).filter(page => page !== null);
                            } else if (file?.document_content) {
                                console.log('Rendering fallback from file document_content');
                                // Parse document_content if it's a string
                                let parsedContent = file.document_content;
                                if (typeof file.document_content === 'string') {
                                    try {
                                        parsedContent = JSON.parse(file.document_content);
                                        console.log('Parsed fallback content:', parsedContent);
                                    } catch (e) {
                                        console.error('Error parsing fallback content:', e);
                                        parsedContent = {};
                                    }
                                }
                                return renderPage({ id: 'main', pageNumber: 1, content: parsedContent });
                            } else {
                                console.log('No content available');
                                return (
                                <Card>
                                    <CardContent>
                                        <p className="text-sm text-gray-500">No document content available.</p>
                                            <p className="text-xs text-gray-400 mt-2">Debug: pages={pages?.length || 0}, file={file ? 'loaded' : 'not loaded'}</p>
                                    </CardContent>
                                </Card>
                                );
                            }
                        })()}
                    </div>

                    {/* Print-only E-Signatures Section */}
                    {signatures.length > 0 && (
                        <div className="print-only print-section">
                            <h3>E-Signatures ({signatures.length})</h3>
                            <div className="print-signatures-grid">
                                {signatures.map((s, idx) => (
                                    <div key={s.id || idx} className="print-signature-item">
                                        {s.content && s.type?.toLowerCase().includes('image') ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={s.content} alt="signature" />
                                        ) : (
                                            <div style={{ padding: '3mm', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontFamily: 'monospace', fontSize: '8pt', marginBottom: '2mm' }}>
                                                {s.content}
                                            </div>
                                        )}
                                        <div className="print-signature-details">
                                            <div><strong>{s.user_name}</strong> <span style={{ color: '#666', fontWeight: 'normal' }}>({s.user_role})</span></div>
                                            <div>{formatDate(s.timestamp)}</div>
                    </div>
                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Print-only Attachments Section */}
                    {attachments.length > 0 && (
                        <div className="print-only print-section">
                            <h3>Attachments ({attachments.length})</h3>
                            {attachments.map((a, idx) => (
                                <div key={a.id || idx} className="print-attachment-item">
                                    {a.file_url && a.file_type?.startsWith('image/') ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={a.file_url} alt={a.file_name} />
                                    ) : (
                                        <div style={{ padding: '10mm', backgroundColor: '#f0f0f0', textAlign: 'center', border: '1px solid #ccc', marginBottom: '3mm' }}>
                                            <div style={{ fontSize: '11pt', color: '#666' }}>{a.file_type || 'Document'}</div>
                                        </div>
                                    )}
                                    <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '2mm' }}>{a.file_name}</div>
                                    <div style={{ color: '#666', fontSize: '9pt' }}>
                                        Size: {Math.round((a.file_size || 0) / 1024)} KB | Uploaded: {formatDate(a.uploaded_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Print-only Comments Section */}
                    {comments.length > 0 && (
                        <div className="print-only print-section">
                            <h3>Comments ({comments.length})</h3>
                            <div className="print-comments-grid">
                                {comments.map((c, idx) => (
                                    <div key={c.id || idx} className="print-comment-item">
                                        <div className="print-comment-header">{c.user_name}</div>
                                        <div style={{ color: '#666', fontSize: '7pt', marginBottom: '2mm' }}>{formatDate(c.timestamp)}</div>
                                        <div className="print-comment-content">{c.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 no-print">
                    <Card>
                        <CardHeader>
                            <CardTitle>File Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Created Date</label>
                                <p className="flex items-center text-sm"><Clock className="w-4 h-4 mr-2 text-gray-500" />{formatDate(file.created_at)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Last Modified</label>
                                <p className="flex items-center text-sm"><Clock className="w-4 h-4 mr-2 text-gray-500" />{formatDate(file.updated_at)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Created By</label>
                                <p className="flex items-center text-sm"><User className="w-4 h-4 mr-2 text-gray-500" />{file.created_by_name || 'Unknown'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" onClick={() => router.push(`/efilinguser/files/${file.id}/view-document`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Open Document Viewer (E‑Sign, Manage)
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={openMarkModal}>
                                <Forward className="w-4 h-4 mr-2" />
                                Mark / Forward File
                            </Button>
                        </CardContent>
                    </Card>

                    {signatures.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>E-Signatures</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-3">
                                    {signatures.map(s => (
                                        <div key={s.id} className="border rounded p-2 text-sm">
                                            {s.content && s.type?.toLowerCase().includes('image') ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={s.content} alt="signature" className="w-full h-28 object-contain border rounded mb-2" />
                                            ) : (
                                                <div className="px-3 py-2 border rounded bg-gray-50 font-mono text-xs mb-2">{s.content}</div>
                                            )}
                                            <div className="font-medium">{s.user_name} <span className="text-gray-500">({s.user_role})</span></div>
                                            <div className="text-gray-500 text-xs">{formatDate(s.timestamp)}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {beforeContent.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Before Content ({beforeContent.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {beforeContent.map((item) => (
                                        <div key={item.id} className="border rounded-lg p-3">
                                            <div className="relative">
                                                {item.content_type === 'video' ? (
                                                    <video
                                                        src={item.link}
                                                        className="w-full h-32 object-cover rounded"
                                                        controls
                                                    />
                                                ) : (
                                                    <img
                                                        src={item.link}
                                                        alt={item.description || 'Before content'}
                                                        className="w-full h-32 object-cover rounded"
                                                    />
                                                )}
                                                <div className="absolute top-2 left-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {item.content_type === 'video' ? 'Video' : 'Image'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {item.description && (
                                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Attachments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {attachments.length === 0 ? (
                                <p className="text-sm text-gray-500">No attachments in this file.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {attachments.map(a => (
                                        <div key={a.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => openAttachmentModal(a)}>
                                            {a.file_url && a.file_type?.startsWith('image/') ? (
                                                <div className="relative">
                                                    <Image 
                                                        src={a.file_url} 
                                                        alt={a.file_name} 
                                                        width={200} 
                                                        height={150} 
                                                        className="w-full h-32 object-cover rounded mb-2" 
                                                    />
                                                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Maximize2 className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded mb-2 text-gray-500">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <div className="font-medium text-sm truncate" title={a.file_name}>{a.file_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {Math.round((a.file_size || 0)/1024)} KB • {formatDate(a.uploaded_at)}
                                                </div>
                                                <div className="text-xs text-blue-600 group-hover:text-blue-800">
                                                    Click to view
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Comments ({comments.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {comments.length > 0 ? (
                                    comments.map((c) => (
                                        <div key={c.id} className="border-l-4 border-blue-500 pl-3">
                                            <div className="text-sm font-medium text-gray-900">{c.user_name}</div>
                                            <div className="text-xs text-gray-500">{formatDate(c.timestamp)}</div>
                                            <div className="text-sm text-gray-700 mt-1">{c.text}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No comments yet</p>
                                )}
                            </div>
                            <div className="mt-4">
                                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} placeholder="Add a comment..." className="w-full border rounded-md p-2 text-sm" />
                                <div className="flex justify-end mt-2">
                                    <Button size="sm" onClick={postComment} disabled={postingComment || !newComment.trim()}>{postingComment ? 'Posting...' : 'Add Comment'}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {timeline.length === 0 ? (
                                <p className="text-sm text-gray-500">No timeline events available.</p>
                            ) : (
                                <div className="space-y-3">
                                    {timeline.map((ev, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className={`w-2 h-2 mt-2 rounded-full ${ev.type === 'CREATED' ? 'bg-green-500' : ev.type === 'ASSIGNED' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{ev.title}</div>
                                                <div className="text-xs text-gray-500">{formatDate(ev.timestamp)}</div>
                                                {ev.meta && (ev.meta.from || ev.meta.to || ev.meta.remarks || ev.meta.role) && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        {ev.meta.from && <div>From: {ev.meta.from}</div>}
                                                        {ev.meta.to && <div>To: {ev.meta.to}</div>}
                                                        {ev.meta.role && <div>Role: {ev.meta.role}</div>}
                                                        {ev.meta.remarks && <div>Remarks: {ev.meta.remarks}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showMarkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>Mark / Forward File</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Select User</label>
                                <select className="w-full border rounded p-2 mt-1" value={markToUserId} onChange={(e) => setMarkToUserId(e.target.value)}>
                                    <option value="">-- Select --</option>
                                    {markUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.designation || u.role_name || 'User'})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Remarks (optional)</label>
                                <textarea className="w-full border rounded p-2 mt-1" rows={3} value={markRemarks} onChange={(e) => setMarkRemarks(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowMarkModal(false)}>Cancel</Button>
                                <Button onClick={submitMark} disabled={markSubmitting || !markToUserId}>{markSubmitting ? 'Forwarding...' : 'Forward'}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Attachment Preview Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>{selectedAttachment?.file_name}</span>
                            <Button variant="ghost" size="sm" onClick={closeAttachmentModal}>
                                <X className="w-4 h-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedAttachment && (
                        <div className="space-y-4">
                            {selectedAttachment.file_url && selectedAttachment.file_type?.startsWith('image/') ? (
                                <div className="text-center">
                                    <Image 
                                        src={selectedAttachment.file_url} 
                                        alt={selectedAttachment.file_name} 
                                        width={800} 
                                        height={600} 
                                        className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg" 
                                    />
        </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 mb-2">{selectedAttachment.file_name}</p>
                                    <p className="text-sm text-gray-500">
                                        {Math.round((selectedAttachment.file_size || 0)/1024)} KB • {formatDate(selectedAttachment.uploaded_at)}
                                    </p>
                                    <Button 
                                        className="mt-4" 
                                        onClick={() => window.open(selectedAttachment.file_url, '_blank')}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download File
                                    </Button>
                                </div>
                            )}
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">File Name:</span>
                                        <p className="text-gray-600">{selectedAttachment.file_name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">File Size:</span>
                                        <p className="text-gray-600">{Math.round((selectedAttachment.file_size || 0)/1024)} KB</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">File Type:</span>
                                        <p className="text-gray-600">{selectedAttachment.file_type || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Uploaded:</span>
                                        <p className="text-gray-600">{formatDate(selectedAttachment.uploaded_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
        </>
    );
} 