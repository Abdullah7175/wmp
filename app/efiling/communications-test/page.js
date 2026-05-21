"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, MessageCircle, ShieldAlert } from "lucide-react";

const DEFAULT_WHATSAPP_MESSAGE =
    "This is a test message from the E-Filing admin communications panel. If you received this, the WhatsApp API is working.";

const DEFAULT_EMAIL_MESSAGE =
    "This is a test email from the E-Filing admin communications panel. If you received this, the email (SMTP) service is working.";

export default function CommunicationsTestPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const [whatsappPhone, setWhatsappPhone] = useState("");
    const [whatsappMessage, setWhatsappMessage] = useState(DEFAULT_WHATSAPP_MESSAGE);
    const [whatsappLoading, setWhatsappLoading] = useState(false);
    const [whatsappResult, setWhatsappResult] = useState(null);

    const [emailAddress, setEmailAddress] = useState("");
    const [emailMessage, setEmailMessage] = useState(DEFAULT_EMAIL_MESSAGE);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailResult, setEmailResult] = useState(null);

    const isAdmin = Number(session?.user?.role) === 1;

    const sendWhatsAppTest = async (e) => {
        e.preventDefault();
        setWhatsappResult(null);
        setWhatsappLoading(true);
        try {
            const res = await fetch("/api/efiling/admin/test-communications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "whatsapp",
                    phoneNumber: whatsappPhone,
                    message: whatsappMessage,
                }),
            });
            const data = await res.json();
            setWhatsappResult(data);
            if (res.ok && data.success) {
                toast({
                    title: "WhatsApp sent",
                    description: data.message || "Test message delivered successfully.",
                });
            } else {
                toast({
                    title: "WhatsApp failed",
                    description: data.error || "Could not send test message.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            const msg = err.message || "Network error";
            setWhatsappResult({ success: false, error: msg });
            toast({ title: "Error", description: msg, variant: "destructive" });
        } finally {
            setWhatsappLoading(false);
        }
    };

    const sendEmailTest = async (e) => {
        e.preventDefault();
        setEmailResult(null);
        setEmailLoading(true);
        try {
            const res = await fetch("/api/efiling/admin/test-communications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "email",
                    email: emailAddress,
                    message: emailMessage,
                }),
            });
            const data = await res.json();
            setEmailResult(data);
            if (res.ok && data.success) {
                toast({
                    title: "Email sent",
                    description: data.message || "Test email delivered successfully.",
                });
            } else {
                toast({
                    title: "Email failed",
                    description: data.error || "Could not send test email.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            const msg = err.message || "Network error";
            setEmailResult({ success: false, error: msg });
            toast({ title: "Error", description: msg, variant: "destructive" });
        } finally {
            setEmailLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <ShieldAlert className="w-5 h-5" />
                            Access denied
                        </CardTitle>
                        <CardDescription>
                            This page is only available to e-filing administrators (role 1).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => router.push("/efiling")}>
                            Back to dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Communications test</h1>
                <p className="text-gray-600 mt-1">
                    Verify WhatsApp OTP delivery and email (SMTP) from the E-Filing admin panel.
                    Use real phone numbers and email addresses you can access.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            WhatsApp test
                        </CardTitle>
                        <CardDescription>
                            Sends a test message via the same API used for OTP on WhatsApp.
                            Format: 03XXXXXXXXX or 923XXXXXXXXX.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={sendWhatsAppTest} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp-phone">Contact number</Label>
                                <Input
                                    id="whatsapp-phone"
                                    type="tel"
                                    placeholder="e.g. 03001234567 or +923001234567"
                                    value={whatsappPhone}
                                    onChange={(e) => setWhatsappPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp-message">Test message</Label>
                                <Textarea
                                    id="whatsapp-message"
                                    rows={4}
                                    value={whatsappMessage}
                                    onChange={(e) => setWhatsappMessage(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={whatsappLoading} className="w-full">
                                {whatsappLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    "Send WhatsApp test"
                                )}
                            </Button>
                            {whatsappResult && (
                                <ResultBanner result={whatsappResult} />
                            )}
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Email test
                        </CardTitle>
                        <CardDescription>
                            Sends a test email via SMTP (same service used for OTP emails).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={sendEmailTest} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="test-email">Email address</Label>
                                <Input
                                    id="test-email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email-message">Test message</Label>
                                <Textarea
                                    id="email-message"
                                    rows={4}
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={emailLoading} className="w-full">
                                {emailLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    "Send email test"
                                )}
                            </Button>
                            {emailResult && (
                                <ResultBanner result={emailResult} />
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ResultBanner({ result }) {
    const ok = result.success;
    return (
        <div
            className={`rounded-md p-3 text-sm ${
                ok
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
            }`}
        >
            <p className="font-medium">{ok ? "Success" : "Failed"}</p>
            <p className="mt-1">{result.message || result.error || (ok ? "Sent." : "Unknown error.")}</p>
            {result.messageId && (
                <p className="mt-1 text-xs opacity-80">Message ID: {result.messageId}</p>
            )}
        </div>
    );
}
