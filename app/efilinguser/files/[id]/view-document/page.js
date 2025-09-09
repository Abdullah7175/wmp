"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Eye, FileText, User, Calendar, Building2, Shield, MessageSquare, Paperclip } from "lucide-react";
import AttachmentManager from "../../../components/AttachmentManager";
import DocumentSignatureSystem from "../../../components/DocumentSignatureSystem";

export default function DocumentViewer() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [signatures, setSignatures] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);
    const [currentPageId, setCurrentPageId] = useState(1);

	const sanitizeHtml = (html) => {
		if (!html || typeof html !== "string") return "";
		let out = html;
		out = out.replace(/<\s*(script|style|iframe)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
		out = out
			.replace(/on[a-zA-Z]+\s*=\s*"[^"]*"/g, "")
			.replace(/on[a-zA-Z]+\s*=\s*'[^']*'/g, "")
			.replace(/on[a-zA-Z]+\s*=\s*[^\s>]+/g, "")
			.replace(/javascript\s*:/gi, "")
			.replace(/vbscript\s*:/gi, "");
		out = out.replace(/<\s*(object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
		return out;
	};

    useEffect(() => {
		if (params.id) fetchFileData();
    }, [params.id]);

	async function fetchFileData() {
        try {
            setLoading(true);
			const fileRes = await fetch(`/api/efiling/files/${params.id}`);
			if (fileRes.ok) {
				const fileData = await fileRes.json();
                setFile(fileData);
				if (Array.isArray(fileData.pages) && fileData.pages.length) {
                    setPages(fileData.pages);
                    setCurrentPageId(fileData.pages[0]?.id || 1);
                } else {
					setPages([{ id: 1, pageNumber: 1, title: "Main Document", content: fileData.document_content || {}, type: "MAIN" }]);
				}
			}
			const attRes = await fetch(`/api/efiling/files/${params.id}/attachments`);
			if (attRes.ok) setAttachments((await attRes.json()).attachments || []);
			const sigRes = await fetch(`/api/efiling/files/${params.id}/signatures`);
			if (sigRes.ok) setSignatures((await sigRes.json()).signatures || []);
			const comRes = await fetch(`/api/efiling/files/${params.id}/comments`);
			if (comRes.ok) setComments((await comRes.json()) || []);
		} catch (e) {
			console.error(e);
			toast({ title: "Error", description: "Failed to fetch document data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
	}

	const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];
	const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
	const statusColor = (s) => ({ draft: "bg-gray-100 text-gray-800", pending: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800", completed: "bg-blue-100 text-blue-800" }[(s || "").toLowerCase()] || "bg-gray-100 text-gray-800");
	const priorityColor = (p) => ({ high: "bg-red-100 text-red-800", medium: "bg-yellow-100 text-yellow-800", low: "bg-green-100 text-green-800" }[(p || "").toLowerCase()] || "bg-gray-100 text-gray-800");

	async function postComment() {
		if (!newComment.trim()) return;
		try {
			setPosting(true);
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
			await fetchFileData();
		} catch (e) {
			toast({ title: 'Error', description: e.message, variant: 'destructive' });
		} finally {
			setPosting(false);
		}
	}

	if (loading) return <div className="flex items-center justify-center h-96"><div className="text-lg">Loading document...</div></div>;
	if (!file) return <div className="flex items-center justify-center h-96"><div className="text-lg text-red-600">Document not found</div></div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
						<Button variant="ghost" onClick={() => router.back()} className="flex items-center"><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Document Viewer</h1>
                            <p className="text-sm text-gray-600">File: {file.file_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
						<Button variant="outline" onClick={() => window.print()}><Eye className="w-4 h-4 mr-2"/>Print</Button>
						<Button variant="outline" onClick={() => toast({ title: "Download", description: "Download functionality will be implemented" })}><Download className="w-4 h-4 mr-2"/>Download</Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        {pages.length > 1 && (
                            <Card className="mb-6">
								<CardHeader><CardTitle className="text-lg">Document Pages</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
										{pages.map((p) => (
											<Button key={p.id} variant={currentPageId === p.id ? "default" : "outline"} size="sm" onClick={() => setCurrentPageId(p.id)}>{p.title}</Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="min-h-[800px]">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
									<span>{currentPage?.title || "Document Content"}</span>
									<Badge className={statusColor(file.status_name)}>{file.status_name || "Unknown"}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
								<div className="bg-white border border-gray-300 shadow-lg mx-auto" style={{ width: "210mm", minHeight: "297mm", padding: "20mm" }}>
									{currentPage?.content?.logo && (
										<div className="mb-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentPage.content.logo) }} />
									)}
                                <div className="text-center mb-8">
									<div className="text-lg font-semibold text-gray-800 mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentPage?.content?.header || "Document Header") }} />
                                    </div>
                                <div className="text-center mb-6">
									<div className="text-2xl font-bold text-gray-900 mb-2">{currentPage?.content?.title || "Document Title"}</div>
                                    </div>
									<div className="mb-6"><div className="text-lg font-medium text-gray-800 mb-2">Subject: <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentPage?.content?.subject || "Document Subject") }} /></div></div>
									<div className="mb-6 text-right"><div className="text-sm text-gray-600">Date: {currentPage?.content?.date || new Date().toLocaleDateString()}</div></div>
									<div className="mb-8"><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentPage?.content?.matter || "<p>No content available</p>") }} /></div>
									<div className="mb-4"><div className="text-lg font-medium text-gray-800">{currentPage?.content?.regards || "Yours faithfully,"}</div></div>
									<div className="text-center mt-8"><div className="text-sm text-gray-600">{currentPage?.content?.footer || "Document Footer"}</div></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            <Card>
								<CardHeader><CardTitle className="text-lg">File Information</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
									<div className="flex items-center space-x-2"><FileText className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Number: {file.file_number}</span></div>
									<div className="flex items-center space-x-2"><Building2 className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Department: {file.department_name || "N/A"}</span></div>
									<div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Created by: {file.creator_user_name || file.created_by_name || 'Unknown'}</span></div>
									<div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Assigned to: {file.assigned_to_name || "Unassigned"}</span></div>
									<div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Created: {formatDate(file.created_at)}</span></div>
									<div className="flex items-center space-x-2"><Badge className={priorityColor(file.priority)}>{file.priority || "Normal"} Priority</Badge></div>
									<div className="flex items-center space-x-2"><Badge variant="outline">{file.confidentiality_level || "Normal"} Confidentiality</Badge></div>
                                </CardContent>
                            </Card>

                            <Card>
								<CardHeader><CardTitle className="text-lg flex items-center"><Paperclip className="w-4 h-4 mr-2"/>Attachments ({attachments.length})</CardTitle></CardHeader>
                                <CardContent>
                                    <AttachmentManager fileId={params.id} canEdit={true} viewOnly={false} />
                                </CardContent>
                            </Card>

                            <Card>
								<CardHeader><CardTitle className="text-lg flex items-center"><Shield className="w-4 h-4 mr-2"/>Signatures ({signatures.length})</CardTitle></CardHeader>
                                <CardContent>
                                    <DocumentSignatureSystem
                                        fileId={params.id}
                                        userRole={session?.user?.role}
                                        canEditDocument={false}
                                        viewOnly={true}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
								<CardHeader><CardTitle className="text-lg flex items-center"><MessageSquare className="w-4 h-4 mr-2"/>Comments ({comments.length})</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-80 overflow-auto pr-2">
                                        {comments.length > 0 ? (
                                            comments.map((c) => (
                                                <div key={c.id} className="border-l-4 border-blue-500 pl-3">
                                                    <div className="text-sm font-medium text-gray-900">{c.user_name}</div>
                                                    <div className="text-xs text-gray-500">{formatDate(c.timestamp)}</div>
                                                    <div className="text-sm text-gray-700 mt-1 break-words">{c.text}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">No comments yet</p>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows={3}
                                            placeholder="Add a comment..."
                                            className="w-full border rounded-md p-2 text-sm"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Button size="sm" onClick={postComment} disabled={posting || !newComment.trim()}>
                                                {posting ? 'Posting...' : 'Add Comment'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
