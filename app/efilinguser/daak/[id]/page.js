"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
    CheckCircle, 
    Clock, 
    Users, 
    Calendar, 
    FileText,
    ArrowLeft,
    Check,
    PenLine
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEfilingUser } from "@/context/EfilingUserContext";
import { Input } from "@/components/ui/input";
import DaakLetterDocument from "@/app/efiling/components/DaakLetterDocument";
import DaakAttachmentsGrid from "@/app/efiling/components/DaakAttachmentsGrid";
import "@/app/efiling/components/TipTapEditor.css";

export default function DaakDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise); // 3. Unwrap the promise
    const id = params.id;
    const router = useRouter();
    const { toast } = useToast();
    const { efilingUserId } = useEfilingUser();
    const [loading, setLoading] = useState(true);
    const [acknowledging, setAcknowledging] = useState(false);
    const [signing, setSigning] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [daak, setDaak] = useState(null);
    const [acknowledgmentText, setAcknowledgmentText] = useState("");

    useEffect(() => {
        if (id) {
            fetchDaak();
        }
    }, [id]);

    const fetchDaak = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/efiling/daak/${id}`);
            if (res.ok) {
                const data = await res.json();
                setDaak(data.daak);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch daak",
                    variant: "destructive",
                });
                router.push("/efilinguser/daak");
            }
        } catch (error) {
            console.error("Error fetching daak:", error);
            toast({
                title: "Error",
                description: "Failed to fetch daak",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async () => {
        if (!efilingUserId) return;

        setAcknowledging(true);
        try {
            const res = await fetch(`/api/efiling/daak/${id}/acknowledge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    acknowledgment_text: acknowledgmentText,
                }),
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Daak acknowledged successfully",
                });
                fetchDaak(); // Refresh to show acknowledgment
            } else {
                const error = await res.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to acknowledge daak",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error acknowledging daak:", error);
            toast({
                title: "Error",
                description: "Failed to acknowledge daak",
                variant: "destructive",
            });
        } finally {
            setAcknowledging(false);
        }
    };

    const handleSign = async () => {
        setSigning(true);
        try {
            const res = await fetch(`/api/efiling/daak/${id}/sign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}",
            });
            const data = await res.json();
            if (res.ok) {
                toast({ title: "Signed", description: "E-signature applied" });
                fetchDaak();
            } else {
                toast({
                    title: "Could not sign",
                    description: data.error || "Upload a signature in your profile first",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to apply signature", variant: "destructive" });
        } finally {
            setSigning(false);
        }
    };

    const handleAttachmentUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch(`/api/efiling/daak/${id}/attachments`, {
                    method: "POST",
                    body: fd,
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Upload failed");
                }
            }
            toast({ title: "Uploaded", description: "Attachment(s) added" });
            fetchDaak();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "URGENT":
                return "bg-red-500";
            case "HIGH":
                return "bg-orange-500";
            case "NORMAL":
                return "bg-blue-500";
            case "LOW":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-8">Loading...</div>
            </div>
        );
    }

    if (!daak) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-8">Daak not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Daak Letter</h1>
                        <p className="text-gray-600 text-sm mt-0.5">{daak.daak_number}</p>
                    </div>
                </div>
            </div>

            <DaakLetterDocument daak={daak} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={daak.status === "SENT" ? "bg-green-500" : "bg-yellow-500"}>
                            {daak.status}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getPriorityColor(daak.priority)}>
                            {daak.priority}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {daak.category_name && (
                            <Badge
                                style={{
                                    backgroundColor: daak.category_color || "#6B7280",
                                }}
                            >
                                {daak.category_name}
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Recipients
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{daak.recipient_count || 0}</p>
                        <p className="text-sm text-gray-500">
                            {daak.acknowledged_count || 0} acknowledged
                        </p>
                        <div className="mt-3 text-sm space-y-1">
                            <p><span className="font-medium">TO:</span> {(daak.to_recipients || []).length}</p>
                            <p><span className="font-medium">CC:</span> {(daak.cc_recipients || []).length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            <strong>Created:</strong>{" "}
                            {new Date(daak.created_at).toLocaleString()}
                        </p>
                        {daak.sent_at && (
                            <p className="text-sm">
                                <strong>Sent:</strong>{" "}
                                {new Date(daak.sent_at).toLocaleString()}
                            </p>
                        )}
                        {daak.expires_at && (
                            <p className="text-sm">
                                <strong>Expires:</strong>{" "}
                                {new Date(daak.expires_at).toLocaleString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* E-Signatures (separate from letter body) */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center gap-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <PenLine className="w-4 h-4" />
                            E-Signature
                        </CardTitle>
                        {daak.status === "DRAFT" && Number(daak.created_by) === Number(efilingUserId) && (
                            <Button variant="outline" size="sm" onClick={handleSign} disabled={signing}>
                                <PenLine className="w-4 h-4 mr-2" />
                                {signing ? "Signing..." : (daak.signatures?.length ? "Update E-Sign" : "Add E-Sign")}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {(!daak.signatures || daak.signatures.length === 0) ? (
                        <p className="text-sm text-gray-500">No e-signature on this daak yet</p>
                    ) : (
                        <div className="space-y-4">
                            {daak.signatures.map((sig) => (
                                <div key={sig.id} className="border rounded-lg p-4 bg-gray-50">
                                    {sig.signature_content?.startsWith("data:") ||
                                    sig.signature_content?.startsWith("/") ||
                                    sig.signature_content?.startsWith("http") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={sig.signature_content}
                                            alt="E-signature"
                                            className="max-h-24 object-contain mb-2"
                                        />
                                    ) : (
                                        <p className="italic text-2xl mb-2 text-gray-800">{sig.signature_content}</p>
                                    )}
                                    <p className="text-sm font-medium">{sig.user_name}</p>
                                    {sig.user_role && (
                                        <p className="text-xs text-gray-600">{sig.user_role}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Signed: {new Date(sig.signed_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center gap-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Attachments
                        </CardTitle>
                        {daak.status === "DRAFT" && Number(daak.created_by) === Number(efilingUserId) && (
                            <Input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleAttachmentUpload}
                                disabled={uploading}
                                className="max-w-xs"
                            />
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <DaakAttachmentsGrid attachments={daak.attachments || []} />
                </CardContent>
            </Card>

            {/* Recipients acknowledge only — creator never sees this */}
            {daak.can_acknowledge && (
                <Card>
                    <CardHeader>
                        <CardTitle>Acknowledge Daak</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Comments (Optional)</Label>
                            <Textarea
                                value={acknowledgmentText}
                                onChange={(e) => setAcknowledgmentText(e.target.value)}
                                placeholder="Add any comments..."
                                rows={4}
                            />
                        </div>
                        <Button
                            onClick={handleAcknowledge}
                            disabled={acknowledging}
                            className="w-full"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            {acknowledging ? "Acknowledging..." : "Acknowledge Daak"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {daak.is_acknowledged && daak.user_acknowledgment && !daak.is_creator && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Acknowledged
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            Acknowledged on:{" "}
                            {new Date(daak.user_acknowledgment.acknowledged_at).toLocaleString()}
                        </p>
                        {daak.user_acknowledgment.acknowledgment_text && (
                            <p className="mt-2">{daak.user_acknowledgment.acknowledgment_text}</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

