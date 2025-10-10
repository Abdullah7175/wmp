"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Download, Eye, Clock, User, Building2, FileText, AlertCircle, MessageSquare, Forward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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
    const [markRemarks, setMarkRemarks] = useState("");
    const [markSubmitting, setMarkSubmitting] = useState(false);

    useEffect(() => {
        if (!session?.user?.id || !params.id) return;
        fetchFile();
        fetchExtras();
        fetchTimeline();
        fetchComments();
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
                setPages(doc.pages || []);
            }
            if (attRes.ok) {
                const atts = await attRes.json();
                setAttachments(Array.isArray(atts) ? atts : []);
            }
            if (sigRes.ok) {
                const sigs = await sigRes.json();
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

    const renderPage = (page) => {
        const content = page.content || {};
        const header = content.header || file?.document_content?.header;
        const title = content.title || file?.document_content?.title;
        const subject = content.subject || file?.document_content?.subject;
        const matter = content.matter || file?.document_content?.matter;
        const footer = content.footer || file?.document_content?.footer;

        return (
            <div key={page.id || page.pageNumber} className="bg-white shadow border mx-auto" style={{ width: '794px', minHeight: '1123px', padding: '40px' }}>
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
                
                {header && (<div className="mb-4 text-center text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: header }} />)}
                {title && (<h2 className="text-xl font-bold text-center mb-2" dangerouslySetInnerHTML={{ __html: title }} />)}
                {subject && (
                    <div className="mb-4">
                        <div className="font-semibold">Subject:</div>
                        <div dangerouslySetInnerHTML={{ __html: subject }} />
                    </div>
                )}
                {matter && (<div className="prose" dangerouslySetInnerHTML={{ __html: matter }} />)}
                {footer && (<div className="mt-6 text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: footer }} />)}
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
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
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
                <div className="flex space-x-2">
                    <Button onClick={() => router.push(`/efilinguser/files/${file.id}/edit-document`)} className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit File
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
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
                        {pages && pages.length > 0 ? (
                            pages.map(renderPage)
                        ) : (
                            file?.document_content ? (
                                renderPage({ id: 'main', pageNumber: 1, content: file.document_content })
                            ) : (
                                <Card>
                                    <CardContent>
                                        <p className="text-sm text-gray-500">No document content available.</p>
                                    </CardContent>
                                </Card>
                            )
                        )}
                    </div>
                </div>

                <div className="space-y-6">
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
                                <div className="grid grid-cols-1 gap-3">
                                    {attachments.map(a => (
                                        <div key={a.id} className="border rounded p-2 flex items-center gap-3 text-sm">
                                            {a.file_url && a.file_type?.startsWith('image/') ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={a.file_url} alt={a.file_name} className="w-20 h-16 object-cover rounded" />
                                            ) : (
                                                <div className="w-20 h-16 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500">{a.file_type || 'file'}</div>
                                            )}
                                            <div className="flex-1">
                                                <div className="truncate" title={a.file_name}>{a.file_name}</div>
                                                <div className="text-xs text-gray-500">{Math.round((a.file_size || 0)/1024)} KB • {formatDate(a.uploaded_at)}</div>
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
        </div>
    );
} 