"use client";
// print file
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Download, Eye, Clock, User, Building2, FileText, AlertCircle, MessageSquare, Forward, Printer, FileDown, X, Maximize2, Shield, Paperclip, Upload, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DocumentSignatureSystem from "../../components/DocumentSignatureSystem";
import MarkToModal from "../../components/MarkToModal";
import { useEfilingUser } from "@/context/EfilingUserContext";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { loadPdfJs, fetchPdfArrayBuffer } from "@/lib/setupPdfJs";

export default function FileDetail() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { efilingUserId } = useEfilingUser();
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
    const [userRole, setUserRole] = useState('');
    const [hasUserSigned, setHasUserSigned] = useState(false);

    const [showMarkModal, setShowMarkModal] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showEditFileInfo, setShowEditFileInfo] = useState(false);
    const [workRequests, setWorkRequests] = useState([]);
    const [selectedWorkRequestId, setSelectedWorkRequestId] = useState(null);

    const [budgetHeadNo, setBudgetHeadNo] = useState("");
    const [proposedCost, setProposedCost] = useState("");
    const [contractorPremium, setContractorPremium] = useState("");
    const [sanctionedAmount, setSanctionedAmount] = useState("");
    const [revisedAmount, setRevisedAmount] = useState("");

    const [savingFileInfo, setSavingFileInfo] = useState(false);
    const [isHigherAuthority, setIsHigherAuthority] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [canAddAttachment, setCanAddAttachment] = useState(false);
    const [canAddPage, setCanAddPage] = useState(false);
    const [canMarkTo, setCanMarkTo] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [canAddSignature, setCanAddSignature] = useState(false);
    const [isCcOnly, setIsCcOnly] = useState(false);
    const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [attachmentName, setAttachmentName] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [timeLeft, setTimeLeft] = useState("");
    const [isAllAttachmentsModalOpen, setIsAllAttachmentsModalOpen] = useState(false); // <--- ADD THIS LINE

    // Page-by-page images rendered from PDF attachments, keyed by attachment id:
    // { [attachmentId]: { status: 'loading' | 'ready' | 'error', pages: string[] } }
    // Used so PDF attachments print/export exactly like image attachments do -
    // one real page per PDF page - instead of the browser's embedded PDF
    // viewer, which cannot paginate across print pages.
    const [pdfPreviews, setPdfPreviews] = useState({});

    // Note sheet modal states
    const [editingPage, setEditingPage] = useState(null);
    const [editPageTitle, setEditPageTitle] = useState("");
    const [editPageContent, setEditPageContent] = useState("");
    const [isSavingPage, setIsSavingPage] = useState(false);
    // Comment editing/deleting states
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [updatingComment, setUpdatingComment] = useState(false);

    const fetchUserRole = async () => {
        try {
            if (efilingUserId) {
                const res = await fetch(`/api/efiling/users/${efilingUserId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUserRole(data.role_name || data.role_code || '');
                }
            }
        } catch (e) {
            console.error('Error fetching user role:', e);
        }
    };

    useEffect(() => {
        if (!session?.user?.id || !params.id) return;
        const loadData = async () => {
            await fetchFile();
            await fetchExtras();
            await fetchTimeline();
            await fetchComments();
            await fetchUserRole();
            await fetchPermissions();
        };
        loadData();
    }, [session?.user?.id, params.id, efilingUserId]);

    useEffect(() => {
        if (file?.work_request_id) {
            fetchBeforeContent();
        }
    }, [file?.work_request_id]);

    // Resolves the correct downloadable URL for an attachment's file. Mirrors
    // the same normalization logic already used in the print/preview markup.
    const resolveAttachmentFileUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('/api/uploads/')) return fileUrl;
        if (fileUrl.startsWith('/uploads/')) return fileUrl.replace('/uploads/', '/api/uploads/');
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            try {
                const url = new URL(fileUrl);
                return url.pathname.startsWith('/uploads/')
                    ? url.pathname.replace('/uploads/', '/api/uploads/')
                    : url.pathname;
            } catch {
                return fileUrl;
            }
        }
        return `/api/uploads${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
    };

    const isPdfAttachment = (a) =>
        a?.file_type === 'application/pdf' || a?.file_name?.toLowerCase().endsWith('.pdf');

    const renderPdfAttachmentPreview = (attachment, index) => {
        const pdfPreview = pdfPreviews[index];
        const pdfUrl = resolveAttachmentFileUrl(attachment?.file_url);

        if (pdfPreview?.pages?.length > 0) {
            return (
                <div className="w-full bg-gray-50 p-2 space-y-4">
                    {pdfPreview.pages.map((pageImage, pageIdx) => (
                        <div key={pageIdx} className="flex flex-col items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={pageImage}
                                alt={`${attachment.attachment_name || attachment.file_name} - page ${pageIdx + 1}`}
                                className="max-w-full h-auto object-contain shadow-sm border bg-white"
                            />
                            {pdfPreview.pages.length > 1 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Page {pageIdx + 1} of {pdfPreview.pages.length}
                                </p>
                            )}
                        </div>
                    ))}
                    {pdfPreview.status === 'loading' && (
                        <p className="text-xs text-center text-gray-500 py-2">Loading more pages...</p>
                    )}
                </div>
            );
        }

        if (pdfPreview?.status === 'error') {
            return (
                <div className="p-8 text-center text-red-600 bg-gray-50">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="mb-3">Unable to preview this PDF in the browser.</p>
                    {pdfUrl ? (
                        <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')}>
                            <Eye className="w-4 h-4 mr-2" />
                            Open in New Tab
                        </Button>
                    ) : null}
                </div>
            );
        }

        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2 animate-pulse" />
                <p>Loading PDF preview...</p>
            </div>
        );
    };

    // Render every PDF attachment into one image per page. This is what makes
    // PDFs show up in the print/PDF view exactly like images do - full size,
    // one page at a time - instead of the tiny, non-paginating embedded PDF
    // viewer the browser normally renders for <object>/<iframe>.
    //
    // Cached/keyed by the attachment's index in the `attachments` array
    // (not attachment.id) since some attachments come back without a
    // stable id, which previously caused different PDFs to collide on the
    // same cache entry and overwrite each other's status.
    useEffect(() => {
        const pdfAttachmentEntries = attachments
            .map((a, idx) => ({ attachment: a, idx }))
            .filter(({ attachment, idx }) => isPdfAttachment(attachment) && !pdfPreviews[idx]);

        if (pdfAttachmentEntries.length === 0) return;

        let cancelled = false;

        const renderAttachments = async () => {
            let pdfjsLib;
            try {
                pdfjsLib = await loadPdfJs();
            } catch (error) {
                console.error('Failed to load PDF renderer:', error);
                if (!cancelled) {
                    setPdfPreviews((prev) => {
                        const next = { ...prev };
                        pdfAttachmentEntries.forEach(({ idx }) => {
                            next[idx] = { status: 'error', pages: [] };
                        });
                        return next;
                    });
                }
                return;
            }

            for (const { attachment, idx } of pdfAttachmentEntries) {
                if (cancelled) return;

                setPdfPreviews((prev) => ({
                    ...prev,
                    [idx]: { status: 'loading', pages: [] }
                }));

                try {
                    const fileUrl = resolveAttachmentFileUrl(attachment.file_url);
                    if (!fileUrl) {
                        throw new Error('Attachment is missing a file URL');
                    }

                    const pdfData = await fetchPdfArrayBuffer(fileUrl);

                    // Safety timeout so a hung/stuck render (e.g. a worker
                    // that never resolves) can never leave Print/Export
                    // permanently disabled.
                    const pdfDoc = await Promise.race([
                        pdfjsLib.getDocument({ data: pdfData }).promise,
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('PDF render timed out')), 90000)
                        )
                    ]);
                    const pageImages = [];

                    for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
                        if (cancelled) return;

                        const page = await pdfDoc.getPage(pageNumber);
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const context = canvas.getContext('2d');
                        await page.render({ canvasContext: context, viewport }).promise;
                        pageImages.push(canvas.toDataURL('image/jpeg', 0.9));
                        canvas.width = 0;
                        canvas.height = 0;

                        // Show each page as soon as it is rendered (helps multi-page PDFs)
                        setPdfPreviews((prev) => ({
                            ...prev,
                            [idx]: {
                                status: pageNumber < pdfDoc.numPages ? 'loading' : 'ready',
                                pages: [...pageImages],
                            },
                        }));
                    }
                } catch (error) {
                    console.error(`Failed to render PDF preview for "${attachment.attachment_name || attachment.file_name}":`, error);
                    if (!cancelled) {
                        setPdfPreviews((prev) => ({
                            ...prev,
                            [idx]: { status: 'error', pages: [] }
                        }));
                    }
                }
            }
        };

        renderAttachments();

        return () => {
            cancelled = true;
        };
    }, [attachments]);

    useEffect(() => {
        if (!file?.sla_deadline || file?.sla_status === 'PAUSED') {
            setTimeLeft(file?.sla_status === 'PAUSED' ? "Paused" : "N/A");
            return;
        }

        const timer = setInterval(() => {
            const deadline = new Date(file.sla_deadline).getTime();
            const now = new Date().getTime();
            const distance = deadline - now;

            if (distance < 0) {
                // Logic for Breached (Negative time)
                const absDistance = Math.abs(distance);
                const h = Math.floor(absDistance / (1000 * 60 * 60));
                const m = Math.floor((absDistance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((absDistance % (1000 * 60)) / 1000);
                setTimeLeft(`-${h}h ${m}m ${s}s`);
            } else {
                // Logic for Remaining time
                const h = Math.floor(distance / (1000 * 60 * 60));
                const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [file?.sla_deadline, file?.sla_status]);

    const fetchWorkRequests = async () => {
        try {
            const res = await fetch('/api/requests?limit=1000&scope=efiling');
            if (res.ok) {
                const data = await res.json();
                setWorkRequests(Array.isArray(data?.data) ? data.data : []);
            }
        } catch (error) {
            console.error('Error fetching work requests:', error);
        }
    };

    const handleOpenEditFileInfo = () => {
        setSelectedWorkRequestId(file?.work_request_id?.toString() || 'none');
        setBudgetHeadNo(file.budget_head_no || "");
        setProposedCost(file.proposed_estimated_cost || "");
        setContractorPremium(file.contractor_premium || "");
        setSanctionedAmount(file.sanctioned_amount || "");
        setRevisedAmount(file.revised_estimate_amount || "");
        fetchWorkRequests();
        setShowEditFileInfo(true);
    };

    const handleSaveFileInfo = async () => {
        if (!file) return;

        setSavingFileInfo(true);
        try {
            const workRequestId = selectedWorkRequestId === 'none' ? null : parseInt(selectedWorkRequestId);

            const res = await fetch(`/api/efiling/files/${file.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    work_request_id: workRequestId,
                    budget_head_no: budgetHeadNo,
                    proposed_estimated_cost: proposedCost === "" ? 0 : parseFloat(proposedCost),
                    contractor_premium: contractorPremium === "" ? 0 : parseFloat(contractorPremium),
                    sanctioned_amount: sanctionedAmount === "" ? 0 : parseFloat(sanctionedAmount),
                    revised_estimate_amount: revisedAmount === "" ? 0 : parseFloat(revisedAmount)
                })
            });

            if (res.ok) {
                const updatedFile = await res.json();
                setFile(updatedFile);
                setShowEditFileInfo(false);
                toast({
                    title: "Success",
                    description: "File information updated successfully"
                });

                // Refresh before content if work request ID changed
                if (updatedFile.work_request_id) {
                    fetchBeforeContent();
                }
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to update file information",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error updating file information:', error);
            toast({
                title: "Error",
                description: "Failed to update file information",
                variant: "destructive"
            });
        } finally {
            setSavingFileInfo(false);
        }
    };

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

    const fetchPermissions = async () => {
        try {
            const permRes = await fetch(`/api/efiling/files/${params.id}/permissions`);
            if (permRes.ok) {
                const permData = await permRes.json();
                const permissions = permData.permissions;
                console.log('Permissions data:', permissions);
                console.log('isHigherAuthority:', permissions?.isHigherAuthority);
                console.log('isCreator:', permissions?.isCreator);
                setIsHigherAuthority(permissions?.isHigherAuthority || false);
                setIsCreator(permissions?.isCreator || false);
                setCanAddAttachment(permissions?.canAddAttachment || false);
                setCanAddPage(permissions?.canAddPage || false);
                setCanMarkTo(permissions?.canMarkTo || false);
                setCanEdit(permissions?.canEdit || false);
                setCanAddSignature(permissions?.canAddSignature || false);
                setIsCcOnly(permissions?.isCcOnly || false);
            }
        } catch (e) {
            console.error('Error loading permissions:', e);
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
                // Reverse pages so last page shows on top
                if (doc.pages && Array.isArray(doc.pages) && doc.pages.length > 0) {
                    const reversedPages = [...doc.pages].reverse();
                    setPages(reversedPages);
                } else {
                    setPages([]);
                }

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
                // Check if current user has already signed
                // Note: user_id in signatures table refers to users.id (not efiling_user_id)
                if (session?.user?.id) {
                    const userSigned = sigs.some(s => s.user_id === session.user.id && s.is_active !== false);
                    setHasUserSigned(userSigned);
                }
            }
        } catch (e) {
            console.error('Error loading extras', e);
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        const maxSize = 15 * 1024 * 1024; // 5MB

        const validFiles = [];
        const errors = [];

        files.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: File type not allowed. Only PDF, DOC, DOCX, JPG, JPEG, PNG are allowed.`);
            } else if (file.size > maxSize) {
                errors.push(`${file.name}: File size exceeds 5MB limit.`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            toast({
                title: "Invalid Files",
                description: errors.join('\n'),
                variant: "destructive",
            });
        }

        setSelectedFiles(validFiles);
    };

    const handleAttachmentUpload = async () => {
        if (!attachmentName.trim()) {
            toast({
                title: "Error",
                description: "Please enter a name for the attachment",
                variant: "destructive",
            });
            return;
        }

        if (selectedFiles.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one file to upload",
                variant: "destructive",
            });
            return;
        }

        if (!efilingUserId) {
            toast({
                title: "Cannot upload",
                description: "Your e-filing profile is not available. Please refresh and try again.",
                variant: "destructive",
            });
            return;
        }

        setUploadingAttachment(true);
        try {
            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileId', params.id);
                formData.append('attachmentName', attachmentName);

                const response = await fetch('/api/efiling/files/upload-attachment', {
                    method: 'POST',
                    headers: {
                        'x-user-id': efilingUserId || session?.user?.id || 'system'
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                return response.json();
            });

            await Promise.all(uploadPromises);

            toast({
                title: "Success",
                description: `${selectedFiles.length} file(s) uploaded successfully`,
            });

            // Reset form
            setAttachmentName("");
            setSelectedFiles([]);
            setShowAttachmentUpload(false);

            // Reload attachments
            fetchExtras();

        } catch (error) {
            console.error('Error uploading files:', error);
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload files",
                variant: "destructive",
            });
        } finally {
            setUploadingAttachment(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId, e) => {
        // Stop modal from opening when clicking the delete button
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this attachment?")) {
            return;
        }

        try {
            const response = await fetch(`/api/efiling/files/delete-attachment/${attachmentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: "Success",
                    description: "Attachment deleted successfully",
                });
                // Refresh attachments list
                fetchExtras();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete attachment",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting attachment:', error);
            toast({
                title: "Error",
                description: "An unexpected error occurred while deleting",
                variant: "destructive",
            });
        }
    };


    const handleOpenEditPage = (pageId) => {
        router.push(`/efilinguser/files/${params.id}/add-page?pageId=${pageId}&mode=edit`);
    };



    const handleDeletePage = async (pageId) => {
        if (!confirm("Are you sure you want to delete this note sheet?")) return;
        try {
            const res = await fetch(`/api/efiling/files/${params.id}/pages?page_id=${pageId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast({ title: "Success", description: "Note sheet deleted successfully" });
                await fetchExtras();
            } else {
                const err = await res.json();
                toast({ title: "Error", description: err.error || "Failed to delete note sheet", variant: "destructive" });
            }
        } catch (e) {
            console.error('Error deleting note sheet:', e);
            toast({ title: "Error", description: "Unexpected error deleting note sheet", variant: "destructive" });
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
// Helper function to check if the user can edit/delete a comment
const canModifyComment = (comment) => {
    if (!session?.user) return false;
    if (isCcOnly) return false;

    console.log("Comment User ID:", comment.user_id, typeof comment.user_id);
    console.log("Session User ID:", session.user.id, typeof session.user.id);
    console.log("Session Role:", session?.user?.role, "Fetched Role:", userRole);

    const isCommentCreator = String(comment.user_id) === String(session.user.id);
    const privilegedRoles = ['superadmin', 'CEO', 'Chief IT Officer'];
    const isAuthorizedRole = privilegedRoles.includes(session.user.role) || privilegedRoles.includes(userRole);

    return isCommentCreator || isAuthorizedRole;
};

// Handle initiating comment edit mode
const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
};

// Handle saving edited comment (PUT)
const handleSaveEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
        setUpdatingComment(true);
        const res = await fetch(`/api/efiling/files/${params.id}/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: editCommentText.trim(),
                user_id: session?.user?.id
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to update comment');
        }

        setEditingCommentId(null);
        setEditCommentText("");
        await fetchComments();
        toast({ title: 'Success', description: 'Comment updated successfully' });
    } catch (e) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
        setUpdatingComment(false);
    }
};

// Handle deleting comment (DELETE)
const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
        const res = await fetch(`/api/efiling/files/${params.id}/comments/${commentId}?userId=${session?.user?.id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to delete comment');
        }

        await fetchComments();
        toast({ title: 'Success', description: 'Comment deleted successfully' });
    } catch (e) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
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
        console.log("🔍 Selected Attachment Data:", attachment);
        console.log("🔍 File URL:", attachment?.file_url);
        console.log("🔍 File Type:", attachment?.file_type);
        setSelectedAttachment(attachment);
        setIsModalOpen(true);
    };

    const closeAttachmentModal = () => {
        setSelectedAttachment(null);
        setIsModalOpen(false);
    };

    const renderPage = (page) => {
        let content = page.content || {};
        if (typeof page.content === 'string') {
            try {
                content = JSON.parse(page.content);
            } catch {
                content = {};
            }
        }

        const header = content.header;
        const title = content.title;
        const subject = content.subject;
        const matter = content.matter;
        const footer = content.footer;

        const hasRealContent =
            [header, title, subject, matter, footer]
                .some(v => typeof v === 'string' && v.trim().length > 0);

        if (!hasRealContent) {
            return null;
        }

        return (
            <div
                key={page.id || page.pageNumber}
                className="bg-white shadow border mx-auto page-content relative group mb-6"
                style={{ width: '794px', padding: '20px' }}
            >
                {/* Note Sheet Action Controls (Edit & Delete) */}
                {canAddPage && !isCcOnly && page.id && page.id !== 'main' && (
                    <div className="absolute top-3 right-3 flex space-x-2 no-print opacity-90 hover:opacity-100 z-10">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => router.push(`/efilinguser/files/${params.id}/edit-page?pageId=${page.id}`)}
                        >
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit Notesheet
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 bg-white text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeletePage(page.id)}
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                    </div>
                )}

                {/* KWSC Header */}
                <div className="border-b border-gray-300 pb-3 mb-4">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="KWSC Logo" className="h-8 w-auto" />
                        <div>
                            <h1 className="text-lg font-bold text-blue-900">
                                Karachi Water & Sewerage Corporation
                            </h1>
                        </div>
                    </div>
                </div>

                {header && (
                    <div
                        className="mb-3 text-center text-xs text-gray-600"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(header) }}
                    />
                )}

                {title && (
                    <h2
                        className="text-lg font-bold text-center mb-3"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
                    />
                )}

                {subject && (
                    <div className="mb-3">
                        <div className="font-semibold text-sm">Subject:</div>
                        <div
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(subject) }}
                        />
                    </div>
                )}

                {matter && (
                    <>
                        <div
                            className="prose document-matter text-sm"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(matter) }}
                        />
                        <style jsx global>{`
                            /* Tailwind's "prose" gives <p> top/bottom margins, and adjacent
                               margins between empty <p></p> tags collapse into a single gap
                               instead of stacking - so multiple blank lines from the editor
                               shrink into one. Overriding with line-height (which never
                               collapses) makes every <p>, empty or not, occupy exactly one
                               line, matching the editor's behavior 1:1. */
                            .document-matter p {
                                margin-top: 0 !important;
                                margin-bottom: 0 !important;
                                min-height: 1.6em;
                                line-height: 1.6em;
                            }
                        `}</style>
                    </>
                )}

                {footer && (
                    <div
                        className="mt-4 text-xs text-gray-600"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(footer) }}
                    />
                )}
            </div>
        );
    };


    const openMarkModal = () => {
        setShowMarkModal(true);
    };

    const handleMarkToSuccess = async () => {
        // Refresh file and timeline after successful marking
        await Promise.all([fetchFile(), fetchTimeline()]);
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
                /* Force the first page to have no top margin or break */
                    .print-title-page:first-of-type {
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                        page-break-before: avoid !important;
                    }
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    .no-print {
                        display: none !important;
                        height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Title page is ALWAYS first page */
                    .print-title-page {
                        page-break-after: always !important;
                    }

                    /* NOTHING should break before first content page */
                    .print-content-start {
                        page-break-before: avoid !important;
                    }
                    
                    .page-content {
                        page-break-inside: avoid;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 15mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        min-height: auto !important;
                        background: white !important;
                        display: block !important;
                        visibility: visible !important;
                    }
                   

                    .page-content:last-of-type {
                        page-break-after: avoid !important;
                    }
                    
                    .page-content:last-child {
                        page-break-after: avoid !important;
                    }
                    
                    /* Hide empty pages */
                    .page-content:empty {
                        display: none !important;
                        height: 0 !important;
                        min-height: 0 !important;
                        page-break-after: avoid !important;
                    }
                    
                    /* Hide pages with no meaningful content */
                    .page-content:has(.prose:empty) {
                        display: none !important;
                        height: 0 !important;
                        min-height: 0 !important;
                        page-break-after: avoid !important;
                    }
                    
                    /* Prevent empty print sections from creating pages */
                    .print-section:empty {
                        display: none !important;
                        height: 0 !important;
                        min-height: 0 !important;
                        page-break-after: avoid !important;
                    }
                    

                    /* Force a break before the comments section */
                    .comments-section {
                        break-before: page;
                        margin-top: 2rem;
                    }

                    /* Prevent sections from being split in half awkwardly */
                    .attachment-item, .comment-item {
                        page-break-inside: avoid;
                        break-inside: avoid;
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
                    
                    /* Prevent blank pages from empty containers */
                    .container:empty,
                    .space-y-6:empty {
                        display: none !important;
                        height: 0 !important;
                        page-break-after: avoid !important;
                    }
                    
                    /* Prevent last element from creating blank page */
                    body > *:last-child {
                        page-break-after: avoid !important;
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
                        padding: 5mm;
                        margin-bottom: 5mm;
                        page-break-inside: avoid;
                        page-break-after: auto !important;
                    }
                    
                    /* Prevent blank pages at the end */
                    body::after {
                        display: none !important;
                    }
                    
                    /* Hide any trailing empty elements */
                    *:last-child:empty {
                        display: none !important;
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
                    
                    /* Force Attachments and other print sections to START on a NEW PAGE */
                    .print-section,
                    .attachments-section {
                        break-before: page !important;
                        page-break-before: always !important;
                        margin-top: 0 !important;
                        padding-top: 15mm !important;
                        display: block !important;
                        clear: both !important;
                    }

                    /* Ensure individual attachment items don't break in half mid-image */
                    .print-attachment-item,
                    .attachment-item {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                        margin-bottom: 5mm !important;
                    }
                    
                    /* Only add page break before if section has content and is not the last element */
                    .print-section:not(:empty):not(:last-of-type) {
                        page-break-before: always;
                    }
                    
                    /* Last print section should not force a page break */
                    .print-section:not(:empty):last-of-type {
                        page-break-after: avoid !important;
                    }
                    
                    /* Hide empty print sections */
                    .print-section:empty {
                        display: none !important;
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

                    .print-section h3 {
                        font-size: 10pt;
                        font-weight: bold;
                        margin-bottom: 2mm;
                        border-bottom: 1px solid #333;
                        padding-bottom: 1mm;
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

                    /* Color mapping for typed signatures in print */
                    .print-signature-item .signature-text {
                        font-weight: bold !important;
                        display: block !important;
                        text-align: center !important;
                    }

                    .print-signature-item .signature-text[data-color="black"] {
                        color: #000000 !important;
                    }

                    .print-signature-item .signature-text[data-color="blue"] {
                        color: #2563eb !important; /* Tailwind blue-600 */
                    }

                    .print-signature-item .signature-text[data-color="red"] {
                        color: #dc2626 !important; /* Tailwind red-600 */
                    }

                    .print-signature-item .signature-text[data-color="green"] {
                        color: #16a34a !important; /* Tailwind green-600 */
                    }

                    /* Force the browser to render colors */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .print-attachment-item {
                        margin-bottom: 5mm;
                        padding: 3mm;
                        border: 1px solid #666;
                        page-break-inside: avoid;
                        page-break-after: always; /* Ensures each attachment occupies a full page */
                        background: #ffffff !important;
                    }

                    /* Full-width image attachments */
                    .print-attachment-item img {
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        max-height: 220mm !important;
                        object-fit: contain;
                        margin-bottom: 1mm;
                        display: block;
                    }

                    /* Full page view for attached PDF documents */
                    .print-attachment-item iframe {
                        width: 100% !important;
                        height: 270mm !important; /* Standard A4 printable height */
                        border: none !important;
                        display: block !important;
                    }

                    /* Each PDF page is rendered as its own image so it prints
                       at full, readable size - one PDF page per print page,
                       exactly like image attachments already do. */
                    .print-pdf-page {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin-bottom: 3mm;
                    }

                    .print-pdf-page img {
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        max-height: 250mm !important;
                        object-fit: contain;
                        display: block;
                        margin: 0 auto;
                    }

                    /* Break to a new page between PDF pages (not after the
                       last one - the parent .print-attachment-item already
                       breaks after the whole attachment finishes). */
                    .print-pdf-page-break {
                        page-break-after: always !important;
                        break-after: page !important;
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



            <div className="container mx-auto px-4 py-6 print:p-0 h-[calc(100vh-80px)] flex flex-col">
                <div className="flex items-center justify-between mb-6 no-print flex-shrink-0">
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
                        {canEdit && isCreator && !isCcOnly && (
                            <Button onClick={() => router.push(`/efilinguser/files/${file.id}/edit-document`)} className="bg-blue-600 hover:bg-blue-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Document
                            </Button>
                        )}
                        {canAddPage && isHigherAuthority && !isCcOnly && (
                            <Button onClick={() => router.push(`/efilinguser/files/${file.id}/add-page`)} className="bg-blue-600 hover:bg-blue-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Add Notesheet
                            </Button>
                        )}
                        <Button onClick={handlePrint} variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        <Button onClick={handleExportPDF} variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300">
                            <FileDown className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                        {/* <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button> */}
                    </div>
                </div>

                {isCcOnly && (
                    <div className="mb-4 p-4 bg-violet-50 border border-violet-200 rounded-lg no-print flex-shrink-0">
                        <div className="flex items-start gap-2">
                            <Eye className="w-5 h-5 text-violet-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-violet-900">View only (CC)</div>
                                <p className="text-sm text-violet-700">
                                    You were carbon-copied on this file. You can view the full file, history, and status,
                                    but you cannot mark, edit, sign, comment, or change it.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
                        <Card className="no-print">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        File Information
                                    </CardTitle>
                                    {canEdit && !isCcOnly && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleOpenEditFileInfo}
                                            className="flex items-center"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
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
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">File Type</label>
                                        <p>{file.file_type_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <FileText className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="space-y-1 w-full">
                                        <p className="text-sm font-semibold text-gray-900 border-b pb-1 mb-2">
                                            Budget Head & Costing
                                        </p>

                                        <div>
                                            <p className="text-xs  text-black font-bold uppercase tracking-wider">Budget Head No</p>
                                            <p className="text-sm text-gray-900">{file.budget_head_no || 'Not specified'}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs  text-black font-bold uppercase tracking-wider">Proposed Estimated Cost</p>
                                            <p className="text-sm text-gray-900">
                                                {(file.proposed_estimated_cost && parseFloat(file.proposed_estimated_cost) !== 0)
                                                    ? `Rs. ${parseFloat(file.proposed_estimated_cost).toLocaleString()}`
                                                    : 'Not specified'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs  text-black font-bold uppercase tracking-wider">Contractor Premium</p>
                                            <p className="text-sm text-gray-900">
                                                {(file.contractor_premium && parseFloat(file.contractor_premium) !== 0)
                                                    ? `Rs. ${parseFloat(file.contractor_premium).toLocaleString()}`
                                                    : 'Not specified'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs  text-black font-bold uppercase tracking-wider">Sanctioned/Approved Amount</p>
                                            <p className="text-sm text-gray-900 font-medium">
                                                {(file.sanctioned_amount && parseFloat(file.sanctioned_amount) !== 0)
                                                    ? `Rs. ${parseFloat(file.sanctioned_amount).toLocaleString()}`
                                                    : 'Not specified yet for approval'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-black font-bold uppercase tracking-wider">Revised Estimate Amount</p>
                                            <p className="text-sm text-gray-900">
                                                {(file.revised_estimate_amount && parseFloat(file.revised_estimate_amount) !== 0)
                                                    ? `Rs. ${parseFloat(file.revised_estimate_amount).toLocaleString()}`
                                                    : 'None'}
                                            </p>
                                        </div>
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
                                                <p className={`text-sm font-medium ${file.sla_status === 'BREACHED' ? 'text-red-600' :
                                                    file.sla_status === 'PAUSED' ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                    {timeLeft}
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
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Video Archiving ID</label>
                                    {file.work_request_id ? (
                                        <>
                                            <p className="text-lg font-semibold text-blue-600">#{file.work_request_id}</p>
                                            <p className="text-sm text-gray-500">Linked to work request for video archiving</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No video request linked</p>
                                    )}
                                </div>
                                {file.remarks && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Remarks</label>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{file.remarks}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {/* ===================== TITLE PAGE ===================== */}
                        <div className="print-only print-title-page page-content">
                            {/* KWSC Header */}
                            <div className="border-b border-gray-300">
                                <div className="flex items-center space-x-3">
                                    <img src="/logo.png" alt="KWSC Logo" className="h-8 w-auto" />
                                    <div>
                                        <h1 className="text-lg font-bold text-blue-900">
                                            Karachi Water & Sewerage Corporation
                                        </h1>
                                    </div>
                                </div>
                            </div>
                            <h3
                                style={{
                                    fontSize: '16pt',
                                    textAlign: 'justify',
                                    marginBottom: '6mm'
                                }}>
                                SUBJECT:</h3>
                            <h2
                                style={{
                                    fontSize: '14pt',
                                    textAlign: 'justify',
                                    marginBottom: '10mm'
                                }}
                            >
                                {file?.subject}
                            </h2>

                            <div className="print-file-info">
                                <div className="info-row"><strong>File Number:&nbsp;</strong> {file?.file_number}</div>
                                <div className="info-row"><strong>Department:&nbsp;</strong> {file?.department_name}</div>
                                <div className="info-row"><strong>Category:&nbsp;</strong> {file?.category_name}</div>
                                <div className="info-row"><strong>Status:&nbsp;</strong> {file?.status_name}</div>
                                <div className="info-row"><strong>Created:&nbsp;</strong> {formatDate(file?.created_at)}</div>
                                <div className="info-row"><strong>Created By:&nbsp;</strong> {file?.created_by_name_with_designation}</div>
                            </div>
                        </div>


                        {/* print content  */}
                        <div className="space-y-6 print-content-start">
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
                                    {signatures.map((s, idx) => {
                                        // Helper function to get the correct image URL for print
                                        const getSignatureImageUrl = (content) => {
                                            if (!content) return null;

                                            // 1. If it's already a Data URI (base64), use it as is
                                            if (content.startsWith('data:image/')) return content;

                                            // 2. If it's a full URL (like http://localhost:3000/uploads/...)
                                            // This is the part that was likely causing your error
                                            if (content.startsWith('http://') || content.startsWith('https://')) {
                                                // If it points to /uploads/, we need to inject /api/ before /uploads/
                                                if (content.includes('/uploads/')) {
                                                    return content.replace('/uploads/', '/api/uploads/');
                                                }
                                                return content;
                                            }

                                            // 3. If it starts with /api/, it's already correct
                                            if (content.startsWith('/api/')) return content;

                                            // 4. If it starts with /uploads/, change to /api/uploads/
                                            if (content.startsWith('/uploads/')) return content.replace('/uploads/', '/api/uploads/');

                                            // 5. Default fallback for relative paths
                                            return `/api/uploads${content.startsWith('/') ? '' : '/'}${content}`;
                                        };

                                        const imageUrl = s.content && s.type?.toLowerCase().includes('image')
                                            ? getSignatureImageUrl(s.content)
                                            : null;

                                        return (
                                            <div key={s.id || idx} className="print-signature-item">
                                                {imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={imageUrl} alt="signature" />
                                                ) : s.content ? (
                                                    <div
                                                        className="signature-text"
                                                        data-color={s.signature_color || 'black'} // This attribute matches the CSS selectors
                                                        style={{
                                                            padding: '3mm',
                                                            border: '1px solid #ddd',
                                                            backgroundColor: '#f9f9f9',
                                                            // Only hardcode the things that DON'T change by color
                                                            fontFamily: s.signature_font || 'monospace',
                                                            fontSize: '12pt', // Increased size for better print readability
                                                            marginBottom: '2mm',
                                                            color: s.signature_color === 'blue' ? '#2563eb' : s.signature_color === 'red' ? '#dc2626' : s.signature_color === 'green' ? '#16a34a' : '#000000'
                                                        }}
                                                    >
                                                        {s.content}
                                                    </div>
                                                ) : null}
                                                <div className="print-signature-details">
                                                    <div><strong>{s.user_name}</strong> <span style={{ color: '#666', fontWeight: 'normal' }}>({s.user_role})</span></div>
                                                    <div>{formatDate(s.timestamp)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Print-only Attachments Section */}
                        {attachments.length > 0 && (
                            <div className="print-only print-section attachments-section">
                                <h6 style={{ color: '#000', fontSize: '10pt', textAlign: 'center', borderBottom: '0.5px solid #333', marginBottom: '5px' }}>Attachments ({attachments.length})</h6>
                                {attachments.map((a, idx) => {
                                    const isPdf = a.file_type === 'application/pdf' || a.file_name?.toLowerCase().endsWith('.pdf');
                                    const isImage = a.file_url && (a.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(a.file_name || ''));
                                    const pdfPreview = isPdf ? pdfPreviews[idx] : null;

                                    return (
                                        <div key={a.id || idx} className="print-attachment-item">
                                            <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '2mm' }}>
                                                {a.attachment_name || a.file_name}
                                            </div>
                                            {a.attachment_name && (
                                                <div style={{ color: '#666', fontSize: '9pt', marginBottom: '2mm' }}>{a.file_name}</div>
                                            )}

                                            {isImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={a.file_url} alt={a.attachment_name || a.file_name} />
                                            ) : isPdf ? (
                                                pdfPreview?.pages?.length > 0 ? (
                                                    // Render each PDF page as its own full-size image, one per
                                                    // print page - same treatment as image attachments get.
                                                    pdfPreview.pages.map((pageImage, pageIdx) => (
                                                        <div
                                                            key={pageIdx}
                                                            className={
                                                                pageIdx < pdfPreview.pages.length - 1
                                                                    ? 'print-pdf-page print-pdf-page-break'
                                                                    : 'print-pdf-page'
                                                            }
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={pageImage}
                                                                alt={`${a.attachment_name || a.file_name} - page ${pageIdx + 1}`}
                                                            />
                                                            {pdfPreview.pages.length > 1 && (
                                                                <div style={{ color: '#666', fontSize: '8pt', textAlign: 'center', marginTop: '1mm' }}>
                                                                    Page {pageIdx + 1} of {pdfPreview.pages.length}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : pdfPreview?.status === 'error' ? (
                                                    <div style={{ padding: '10mm', backgroundColor: '#f0f0f0', textAlign: 'center', border: '1px solid #ccc', marginBottom: '3mm' }}>
                                                        <div style={{ fontSize: '11pt', color: '#666' }}>Unable to preview this PDF ({a.file_type || 'Document'})</div>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '10mm', backgroundColor: '#f0f0f0', textAlign: 'center', border: '1px solid #ccc', marginBottom: '3mm' }}>
                                                        <div style={{ fontSize: '11pt', color: '#666' }}>Preparing preview...</div>
                                                    </div>
                                                )
                                            ) : (
                                                <div style={{ padding: '10mm', backgroundColor: '#f0f0f0', textAlign: 'center', border: '1px solid #ccc', marginBottom: '3mm' }}>
                                                    <div style={{ fontSize: '11pt', color: '#666' }}>{a.file_type || 'Document'}</div>
                                                </div>
                                            )}

                                            <div style={{ color: '#666', fontSize: '9pt', marginTop: '2mm' }}>
                                                Size: {Math.round((a.file_size || 0) / 1024)} KB | Uploaded: {formatDate(a.uploaded_at)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Print-only Comments Section */}
                        {comments.length > 0 && (
                            <div className="print-only print-section comments-section">
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

                    <div className="space-y-6 no-print overflow-y-auto pr-2">
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
                                    <p className="flex items-center text-sm"><User className="w-4 h-4 mr-2 text-gray-500" />{file.created_by_name_with_designation || file.created_by_name || 'Unknown'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {canMarkTo && !isCcOnly && (
                                    <Button variant="outline" className="w-full justify-start" onClick={openMarkModal}>
                                        <Forward className="w-4 h-4 mr-2" />
                                        Mark / Forward File
                                    </Button>
                                )}
                                {canAddPage && !isCcOnly && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.push(`/efilinguser/files/${params.id}/add-page`)}
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Add Note Sheet
                                    </Button>
                                )}
                                {isCcOnly && (
                                    <p className="text-sm text-gray-500 px-1">
                                        No actions available — you have view-only (CC) access.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* E-Signature Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Document Signatures
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentSignatureSystem
                                    fileId={params.id}
                                    userRole={userRole}
                                    canEditDocument={canAddSignature && !isCcOnly}
                                    hasUserSigned={hasUserSigned}
                                    onSignatureAdded={(signature) => {
                                        console.log('Signature added:', signature);
                                        setHasUserSigned(true);
                                        // Refresh signatures + permissions so Mark To appears after e-sign
                                        fetchExtras();
                                        fetchPermissions();
                                        toast({
                                            title: "Signature Added",
                                            description: "Your signature has been successfully added to the document.",
                                        });
                                    }}
                                    onCommentAdded={(comment) => {
                                        console.log('Comment added:', comment);
                                        // Refresh comments list
                                        fetchComments();
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {beforeContent.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Before Content ({beforeContent.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {beforeContent.map((item) => {
                                            // Convert /uploads/ to /api/uploads/ for secure access
                                            const getImageUrl = (url) => {
                                                if (!url) return '';
                                                // Convert /uploads/ to /api/uploads/ for authenticated access
                                                if (url.startsWith('/uploads/')) {
                                                    return url.replace('/uploads/', '/api/uploads/');
                                                }
                                                // If it's already /api/uploads/, return as is
                                                if (url.startsWith('/api/')) return url;
                                                // If it's an absolute URL, extract the path and convert
                                                try {
                                                    const urlObj = new URL(url);
                                                    const pathname = urlObj.pathname;
                                                    if (pathname.startsWith('/uploads/')) {
                                                        return pathname.replace('/uploads/', '/api/uploads/');
                                                    }
                                                    return pathname;
                                                } catch {
                                                    return url;
                                                }
                                            };
                                            const imageUrl = getImageUrl(item.link);

                                            return (
                                                <div key={item.id} className="border rounded-lg p-3">
                                                    <div className="relative">
                                                        {item.content_type === 'video' ? (
                                                            <video
                                                                src={imageUrl}
                                                                className="w-full h-32 object-cover rounded"
                                                                controls
                                                            />
                                                        ) : (
                                                            <img
                                                                src={imageUrl}
                                                                alt={item.description || 'Before content'}
                                                                className="w-full h-32 object-cover rounded"
                                                                onError={(e) => {
                                                                    // Fallback: try the original URL if relative fails
                                                                    if (e.target.src !== item.link) {
                                                                        e.target.src = item.link;
                                                                    }
                                                                }}
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
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Attachments</CardTitle>
                                    {/* Stack buttons vertically aligned to the right */}
                                    <div className="flex flex-col items-end gap-2">
                                        {canAddAttachment && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowAttachmentUpload(true)}
                                                className="flex items-center gap-2 w-full justify-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Attachment
                                            </Button>
                                        )}
                                        {attachments.length > 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsAllAttachmentsModalOpen(true)}
                                                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 w-full justify-center"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View All Attachments
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {attachments.length === 0 ? (
                                    <p className="text-sm text-gray-500">No attachments in this file.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {attachments.map(a => (
                                            <div
                                                key={a.id}
                                                className="relative border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                                                onClick={() => openAttachmentModal(a)}
                                            >
                                                {/* Red Delete Cross Button */}
                                                {canAddAttachment && !isCcOnly && (
                                                    <button
                                                        type="button"
                                                        title="Delete Attachment"
                                                        onClick={(e) => handleDeleteAttachment(a.id, e)}
                                                        className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition-all duration-150 hover:scale-105"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {a.file_url && a.file_type?.startsWith('image/') ? (
                                                    <div className="relative">
                                                        <Image
                                                            src={a.file_url}
                                                            alt={a.attachment_name || a.file_name}
                                                            width={200}
                                                            height={150}
                                                            className="w-full h-32 object-cover rounded mb-2"
                                                            unoptimized
                                                        />
                                                        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Maximize2 className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded mb-2 text-gray-500">
                                                        <FileText className="w-8 h-8" />
                                                    </div>
                                                )}
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm truncate pr-6" title={a.attachment_name || a.file_name}>
                                                        {a.attachment_name || a.file_name}
                                                    </div>
                                                    {a.attachment_name ? (
                                                        <div className="text-xs text-gray-400 truncate" title={a.file_name}>{a.file_name}</div>
                                                    ) : null}
                                                    <div className="text-xs text-gray-500">
                                                        {Math.round((a.file_size || 0) / 1024)} KB • {formatDate(a.uploaded_at)}
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
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Comments ({comments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {comments.length > 0 ? (
                                        comments.map((c) => (
                                            <div key={c.id} className="border-l-4 border-blue-500 pl-3 py-1 relative group">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {c.user_name}
                                                        {c.edited && <span className="text-xs text-gray-400 italic ml-2">(edited)</span>}
                                                    </div>
                                                    
                                                    {/* Edit & Delete Actions */}
                                                    {canModifyComment(c) && editingCommentId !== c.id && (
                                                        <div className="flex items-center space-x-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartEditComment(c)}
                                                                className="p-1 text-gray-500 hover:text-blue-600 rounded"
                                                                title="Edit comment"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteComment(c.id)}
                                                                className="p-1 text-gray-500 hover:text-red-600 rounded"
                                                                title="Delete comment"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-500">{formatDate(c.timestamp)}</div>

                                                {/* Inline Comment Editing Input */}
                                                {editingCommentId === c.id ? (
                                                    <div className="mt-2 space-y-2">
                                                        <textarea
                                                            value={editCommentText}
                                                            onChange={(e) => setEditCommentText(e.target.value)}
                                                            rows={2}
                                                            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingCommentId(null)}
                                                                disabled={updatingComment}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSaveEditComment(c.id)}
                                                                disabled={updatingComment || !editCommentText.trim()}
                                                            >
                                                                {updatingComment ? 'Saving...' : 'Save'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-700 mt-1">{c.text}</div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No comments yet</p>
                                    )}
                                </div>

                                {/* New Comment Textarea */}
                                {!isCcOnly && (
                                    <div className="mt-4">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows={3}
                                            placeholder="Add a comment..."
                                            className="w-full border rounded-md p-2 text-sm"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Button
                                                size="sm"
                                                onClick={postComment}
                                                disabled={postingComment || !newComment.trim()}
                                            >
                                                {postingComment ? 'Posting...' : 'Add Comment'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
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
                                                    {ev.meta && (ev.meta.remarks) && (
                                                        <div className="text-xs text-gray-600 mt-1">
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
                    <MarkToModal
                        showMarkToModal={showMarkModal}
                        fileId={params.id}
                        fileNumber={file?.file_number}
                        subject={file?.subject}
                        onClose={() => setShowMarkModal(false)}
                        onSuccess={handleMarkToSuccess}
                    />
                )}

                {/* Attachment Preview Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>{selectedAttachment?.attachment_name || selectedAttachment?.file_name}</span>
                                <Button variant="ghost" size="sm" onClick={closeAttachmentModal}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </DialogTitle>
                        </DialogHeader>
                        {selectedAttachment && (
                            <div className="space-y-4">
                                {(() => {
                                    // 1. Helper function to fix upload URL path
                                    const getImageUrl = (url) => {
                                        if (!url) return '';
                                        if (url.startsWith('/uploads/')) return url.replace('/uploads/', '/api/uploads/');
                                        return url;
                                    };

                                    // 2. Check either MIME type OR file extension (.png, .jpg, etc.)
                                    const isImage =
                                        selectedAttachment.file_type?.startsWith('image/') ||
                                        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(selectedAttachment.file_name || '');

                                    const imageUrl = getImageUrl(selectedAttachment.file_url);

                                    if (selectedAttachment.file_url && isImage) {
                                        return (
                                            <div className="text-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={imageUrl}
                                                    alt={selectedAttachment.file_name}
                                                    className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg"
                                                    onError={(e) => {
                                                        // Fallback to original URL if /api/ path fails
                                                        if (e.target.src !== selectedAttachment.file_url) {
                                                            e.target.src = selectedAttachment.file_url;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        );
                                    }

                                    return null;
                                })()}

                                {/* PDF Check */}
                                {selectedAttachment.file_type === 'application/pdf' || selectedAttachment.file_name?.toLowerCase().endsWith('.pdf') ? (
                                    <div className="space-y-4">
                                        <div className="border rounded-lg overflow-hidden bg-gray-50">
                                            {(() => {
                                                const getPdfUrl = (fileUrl) => {
                                                    if (!fileUrl) {
                                                        console.error('PDF file_url is missing');
                                                        return null;
                                                    }
                                                    if (fileUrl.startsWith('/api/uploads/')) {
                                                        return fileUrl;
                                                    }
                                                    if (fileUrl.startsWith('/uploads/')) {
                                                        const converted = fileUrl.replace('/uploads/', '/api/uploads/');
                                                        console.log('PDF URL converted:', fileUrl, '->', converted);
                                                        return converted;
                                                    }
                                                    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
                                                        try {
                                                            const url = new URL(fileUrl);
                                                            const path = url.pathname;
                                                            if (path.startsWith('/uploads/')) {
                                                                return path.replace('/uploads/', '/api/uploads/');
                                                            }
                                                            if (path.startsWith('/api/uploads/')) {
                                                                return path;
                                                            }
                                                            return `/api/uploads${path}`;
                                                        } catch (e) {
                                                            console.error('Error parsing PDF URL:', e);
                                                            return fileUrl;
                                                        }
                                                    }
                                                    const converted = `/api/uploads${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
                                                    console.log('PDF URL converted (relative):', fileUrl, '->', converted);
                                                    return converted;
                                                };

                                                const pdfUrl = getPdfUrl(selectedAttachment.file_url);

                                                if (!pdfUrl) {
                                                    return (
                                                        <div className="p-8 text-center text-gray-500">
                                                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                                            <p>PDF URL is missing or invalid</p>
                                                            <p className="text-xs mt-2">File: {selectedAttachment.attachment_name || selectedAttachment.file_name}</p>
                                                        </div>
                                                    );
                                                }

                                                const selectedIndex = attachments.findIndex(
                                                    (item) =>
                                                        (selectedAttachment?.id && item.id === selectedAttachment.id) ||
                                                        item.file_url === selectedAttachment?.file_url
                                                );
                                                return renderPdfAttachmentPreview(selectedAttachment, selectedIndex);
                                            })()}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            {(() => {
                                                const getPdfUrl = (fileUrl) => {
                                                    if (!fileUrl) return null;
                                                    if (fileUrl.startsWith('/api/uploads/')) return fileUrl;
                                                    if (fileUrl.startsWith('/uploads/')) return fileUrl.replace('/uploads/', '/api/uploads/');
                                                    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
                                                        try {
                                                            const url = new URL(fileUrl);
                                                            const path = url.pathname;
                                                            if (path.startsWith('/uploads/')) return path.replace('/uploads/', '/api/uploads/');
                                                            if (path.startsWith('/api/uploads/')) return path;
                                                            return `/api/uploads${path}`;
                                                        } catch (e) {
                                                            return fileUrl;
                                                        }
                                                    }
                                                    return `/api/uploads${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
                                                };
                                                const pdfUrl = getPdfUrl(selectedAttachment.file_url);
                                                return (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                window.open(pdfUrl, '_blank');
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Open in New Tab
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                const link = document.createElement('a');
                                                                link.href = pdfUrl;
                                                                link.download = selectedAttachment.file_name;
                                                                link.target = '_blank';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download File
                                                        </Button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ) : selectedAttachment.file_type === 'application/msword' ||
                                    selectedAttachment.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                                    selectedAttachment.file_name?.toLowerCase().endsWith('.doc') ||
                                    selectedAttachment.file_name?.toLowerCase().endsWith('.docx') ? (
                                    <div className="space-y-4">
                                        <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
                                            <p className="text-sm text-gray-600 mb-4">
                                                Word documents cannot be previewed directly in the browser. Please download to view.
                                            </p>
                                            <div className="flex justify-center items-center min-h-[200px] bg-gray-100 rounded">
                                                <FileText className="w-24 h-24 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = selectedAttachment.file_url;
                                                    link.download = selectedAttachment.file_name;
                                                    link.target = '_blank';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download File
                                            </Button>
                                        </div>
                                    </div>
                                ) : !selectedAttachment.file_type?.startsWith('image/') && !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(selectedAttachment.file_name || '') ? (
                                    <div className="text-center py-8">
                                        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600 mb-2">{selectedAttachment.attachment_name || selectedAttachment.file_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {Math.round((selectedAttachment.file_size || 0) / 1024)} KB • {formatDate(selectedAttachment.uploaded_at)}
                                        </p>
                                        <Button
                                            className="mt-4"
                                            onClick={() => window.open(selectedAttachment.file_url, '_blank')}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download File
                                        </Button>
                                    </div>
                                ) : null}

                                {/* Metadata Details Section */}
                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {selectedAttachment.attachment_name ? (
                                            <div>
                                                <span className="font-medium">Attachment Name:</span>
                                                <p className="text-gray-600">{selectedAttachment.attachment_name}</p>
                                            </div>
                                        ) : null}
                                        <div>
                                            <span className="font-medium">File Name:</span>
                                            <p className="text-gray-600">{selectedAttachment.file_name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">File Size:</span>
                                            <p className="text-gray-600">{Math.round((selectedAttachment.file_size || 0) / 1024)} KB</p>
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

                {/* View All Attachments Modal - Book/Vertical Reading Mode */}
                <Dialog open={isAllAttachmentsModalOpen} onOpenChange={setIsAllAttachmentsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
                        {/* Sticky Header */}
                        <DialogHeader className="p-4 border-b flex-shrink-0 bg-white z-10 flex flex-row items-center justify-between">
                            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Paperclip className="w-5 h-5 text-blue-600" />
                                All Attachments Document View ({attachments.length})
                            </DialogTitle>
                            <Button variant="ghost" size="sm" onClick={() => setIsAllAttachmentsModalOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </DialogHeader>

                        {/* Vertical Book-style Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 space-y-8">
                            {attachments.length === 0 ? (
                                <p className="text-center text-sm text-gray-500 py-8">No attachments found.</p>
                            ) : (
                                attachments.map((a, index) => {
                                    // Utility functions for URL mapping
                                    const getMediaUrl = (url) => {
                                        if (!url) return '';
                                        if (url.startsWith('/uploads/')) return url.replace('/uploads/', '/api/uploads/');
                                        return url;
                                    };

                                    const isImage =
                                        a.file_type?.startsWith('image/') ||
                                        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(a.file_name || '');

                                    const isPdf =
                                        a.file_type === 'application/pdf' ||
                                        a.file_name?.toLowerCase().endsWith('.pdf');

                                    const isWord =
                                        a.file_type === 'application/msword' ||
                                        a.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                                        a.file_name?.toLowerCase().endsWith('.doc') ||
                                        a.file_name?.toLowerCase().endsWith('.docx');

                                    const mediaUrl = getMediaUrl(a.file_url);

                                    return (
                                        <div
                                            key={a.id || index}
                                            className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
                                        >
                                            {/* Option bar to switch back to deep inspect/metadata modal if needed */}
                                            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center text-xs text-gray-500">
                                                <span>Attachment #{index + 1}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs text-blue-600 hover:text-blue-800 p-0"
                                                    onClick={() => {
                                                        setIsAllAttachmentsModalOpen(false);
                                                        openAttachmentModal(a);
                                                    }}
                                                >
                                                    Click to view details
                                                </Button>
                                            </div>

                                            {/* Line-wise Full View */}
                                            <div className="w-full">
                                                {isImage && (
                                                    <div className="flex justify-center bg-gray-50 p-2">
                                                        <img
                                                            src={mediaUrl}
                                                            alt={a.attachment_name || a.file_name}
                                                            className="max-w-full h-auto object-contain mx-auto"
                                                            onError={(e) => {
                                                                if (e.target.src !== a.file_url) {
                                                                    e.target.src = a.file_url;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {isPdf && renderPdfAttachmentPreview(a, index)}

                                                {isWord && (
                                                    <div className="p-8 text-center bg-gray-50 border-t border-b">
                                                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-600 mb-3">Word Document (Cannot be rendered inline)</p>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const link = document.createElement('a');
                                                                link.href = a.file_url;
                                                                link.download = a.file_name;
                                                                link.target = '_blank';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download Document
                                                        </Button>
                                                    </div>
                                                )}

                                                {!isImage && !isPdf && !isWord && (
                                                    <div className="p-8 text-center bg-gray-50">
                                                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-600 mb-3">Unsupported inline format</p>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => window.open(a.file_url, '_blank')}
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Open / Download
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Attachment Upload Dialog */}
                <Dialog open={showAttachmentUpload} onOpenChange={setShowAttachmentUpload}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                Upload Attachments
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="attachmentName">Attachment Name</Label>
                                <Input
                                    id="attachmentName"
                                    value={attachmentName}
                                    onChange={(e) => setAttachmentName(e.target.value)}
                                    placeholder="Enter a name for these attachments"
                                    className="mt-1"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    This name will be used to identify the group of files
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="files">Select Files</Label>
                                <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={handleFileSelect}
                                    className="mt-1"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 15MB each)
                                </p>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div>
                                    <Label>Selected Files ({selectedFiles.length})</Label>
                                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                                <Paperclip className="w-4 h-4" />
                                                <span className="truncate">{file.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowAttachmentUpload(false);
                                        setAttachmentName("");
                                        setSelectedFiles([]);
                                    }}
                                    disabled={uploadingAttachment}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAttachmentUpload}
                                    disabled={uploadingAttachment || !attachmentName.trim() || selectedFiles.length === 0}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {uploadingAttachment ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit File Information Dialog */}
                <Dialog open={showEditFileInfo} onOpenChange={setShowEditFileInfo}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit File Information</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="work_request_id">Video Archiving Request ID</Label>
                                <Select
                                    value={selectedWorkRequestId || 'none'}
                                    onValueChange={setSelectedWorkRequestId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Video Request ID (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Video Request</SelectItem>
                                        {workRequests.map((req) => (
                                            <SelectItem key={req.id} value={req.id.toString()}>
                                                #{req.id} - {req.address || 'No address'} ({req.complaint_type || 'No type'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-500 mt-1">
                                    Link this file to a specific video archiving request for reference
                                </p>
                            </div>


                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-4">Costing & Budget Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Budget Head No</Label>
                                        <Input
                                            value={budgetHeadNo}
                                            onChange={(e) => setBudgetHeadNo(e.target.value)}
                                            placeholder="e.g. B-01-01"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Proposed Estimated Cost</Label>
                                        <Input
                                            type="number"
                                            value={proposedCost}
                                            onChange={(e) => setProposedCost(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Contractor Premium </Label>
                                        <Input
                                            type="number"
                                            value={contractorPremium}
                                            onChange={(e) => setContractorPremium(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sanctioned Amount</Label>
                                        <Input
                                            type="number"
                                            value={sanctionedAmount}
                                            onChange={(e) => setSanctionedAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Revised Estimate Amount</Label>
                                        <Input
                                            type="number"
                                            value={revisedAmount}
                                            onChange={(e) => setRevisedAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEditFileInfo(false)}
                                    disabled={savingFileInfo}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveFileInfo}
                                    disabled={savingFileInfo}
                                >
                                    {savingFileInfo ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

        </>
    );
}