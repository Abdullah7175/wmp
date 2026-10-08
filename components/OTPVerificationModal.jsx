"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OTPInput } from "@/components/ui/otp-input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail, MessageCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";

const OTP_SESSION_KEY = "wmp_otp_verify_modal";

function remainingSeconds(expiresAt) {
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

function readOtpSession() {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(OTP_SESSION_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data?.open) return null;
        return data;
    } catch {
        return null;
    }
}

function writeOtpSession(data) {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(data));
    } catch {
        /* ignore quota / private mode */
    }
}

function clearOtpSession() {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.removeItem(OTP_SESSION_KEY);
    } catch {
        /* ignore */
    }
}

/**
 * Reusable OTP Verification Modal Component
 *
 * Stays open across tab switches, browser notifications, and session refetches
 * until the user cancels or verifies.
 */
export function OTPVerificationModal({ show, onClose, onVerify, efilingUserId = null, purpose = "esignature" }) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const storedRef = useRef(null);
    if (storedRef.current === null && typeof window !== "undefined") {
        storedRef.current = readOtpSession();
    }
    const stored = storedRef.current;

    const [heldOpen, setHeldOpen] = useState(() => Boolean(stored?.open));
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(() => Boolean(stored?.otpSent));
    const [countdown, setCountdown] = useState(() => remainingSeconds(stored?.expiresAt));
    const [verificationMethod, setVerificationMethod] = useState(stored?.method || "whatsapp");
    const [userContact, setUserContact] = useState({ phone: null, email: null });
    const expiresAtRef = useRef(stored?.expiresAt || 0);
    const isOpen = Boolean(show || heldOpen);

    const persist = useCallback((overrides = {}) => {
        const next = {
            open: true,
            purpose,
            efilingUserId,
            method: verificationMethod,
            otpSent,
            expiresAt: expiresAtRef.current,
            ...overrides,
        };
        writeOtpSession(next);
        storedRef.current = next;
    }, [purpose, efilingUserId, verificationMethod, otpSent]);

    const dismiss = useCallback(() => {
        clearOtpSession();
        storedRef.current = { open: false };
        setHeldOpen(false);
        setOtpSent(false);
        setOtpCode("");
        setCountdown(0);
        expiresAtRef.current = 0;
        setVerificationMethod("whatsapp");
        onClose?.();
    }, [onClose]);

    useEffect(() => {
        if (show) {
            setHeldOpen(true);
            persist({ open: true });
        }
    }, [show, persist]);

    // Countdown — wall-clock based so tab sleep does not skip it incorrectly
    useEffect(() => {
        if (!isOpen || countdown <= 0) return undefined;
        const timer = setTimeout(() => {
            setCountdown(remainingSeconds(expiresAtRef.current));
        }, 1000);
        return () => clearTimeout(timer);
    }, [isOpen, countdown]);

    useEffect(() => {
        if (!isOpen) return undefined;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Restore countdown if the user returns to this tab
    useEffect(() => {
        if (!isOpen) return undefined;
        const sync = () => {
            const latest = readOtpSession();
            if (!latest?.open) return;
            if (latest.otpSent) setOtpSent(true);
            if (latest.method) setVerificationMethod(latest.method);
            const left = remainingSeconds(latest.expiresAt);
            expiresAtRef.current = latest.expiresAt || 0;
            setCountdown(left);
            setHeldOpen(true);
        };
        const onVisibility = () => {
            if (document.visibilityState === "visible") sync();
        };
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("focus", sync);
        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("focus", sync);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const fetchUserContact = async () => {
            try {
                let response;
                if (efilingUserId) {
                    response = await fetch(`/api/efiling/users/${efilingUserId}`);
                } else if (session?.user?.id) {
                    response = await fetch(`/api/efiling/users/profile?userId=${session.user.id}`);
                } else {
                    response = await fetch("/api/efiling/users/profile");
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const userData = data.success ? data.user : data;

                if (userData) {
                    setUserContact({
                        phone: userData.contact_number || null,
                        email: userData.google_email || userData.email || null,
                    });
                } else if (session?.user) {
                    setUserContact({
                        phone: session.user.contact_number || null,
                        email: session.user.email || null,
                    });
                }
            } catch (err) {
                console.error("Error fetching user contact:", err);
                if (session?.user) {
                    setUserContact({
                        phone: session.user.contact_number || null,
                        email: session.user.email || null,
                    });
                }
            }
        };

        fetchUserContact();
    }, [isOpen, efilingUserId, session?.user?.id]);

    const sendOTP = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/efiling/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method: verificationMethod, purpose }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const expiresAt = Date.now() + 120 * 1000;
                expiresAtRef.current = expiresAt;
                setOtpSent(true);
                setCountdown(120);
                setOtpCode("");
                persist({ open: true, otpSent: true, method: verificationMethod, expiresAt });
                toast({
                    title: "OTP Sent",
                    description: data.message || `OTP has been sent to your ${verificationMethod === "email" ? "email address" : "WhatsApp number"}.`,
                });
            } else if (response.status === 429) {
                const secondsRemaining = data.secondsRemaining || 60;
                toast({
                    title: "Please Wait",
                    description: data.message || `Your last OTP timer is still active. Please wait ${secondsRemaining} more seconds before requesting another OTP.`,
                    variant: "default",
                });
                if (countdown === 0 || countdown > secondsRemaining) {
                    const expiresAt = Date.now() + secondsRemaining * 1000;
                    expiresAtRef.current = expiresAt;
                    setCountdown(secondsRemaining);
                    persist({ open: true, expiresAt });
                }
            } else if (data.forceEmail) {
                toast({
                    title: "Switching to Email",
                    description: data.message || "WhatsApp verification has failed multiple times. Please use email verification instead.",
                    variant: "default",
                });
                setVerificationMethod("email");
                persist({ open: true, method: "email" });
            } else if (data.otpCode) {
                const expiresAt = Date.now() + 120 * 1000;
                expiresAtRef.current = expiresAt;
                toast({
                    title: "OTP Generated (Testing Mode)",
                    description: `${verificationMethod} delivery failed. Your OTP is: ${data.otpCode}`,
                    variant: "default",
                });
                setOtpSent(true);
                setCountdown(120);
                setOtpCode(data.otpCode);
                persist({ open: true, otpSent: true, method: verificationMethod, expiresAt });
            } else {
                throw new Error(data.error || "Failed to send OTP");
            }
        } catch (error) {
            if (error.message && (error.message.includes("Maximum OTP requests") || error.message.includes("last OTP timer"))) {
                toast({
                    title: "Please Wait",
                    description: "Your last OTP timer is still active. Please wait for 60 seconds before requesting another OTP.",
                    variant: "default",
                });
                if (countdown === 0) {
                    setCountdown(60);
                }
            } else {
                toast({
                    title: "Error",
                    description: error.message || "Failed to send OTP. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const verifyAuthentication = async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/efiling/verify-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: efilingUserId || session?.user?.id,
                    code: otpCode,
                    method: verificationMethod,
                    purpose,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    toast({
                        title: "Authentication Successful",
                        description: "Your identity has been verified.",
                    });
                    onVerify?.();
                    setTimeout(() => {
                        dismiss();
                    }, 500);
                } else {
                    throw new Error(data.error || "Authentication failed");
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Authentication failed");
            }
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
            onMouseDown={(e) => {
                // Never close by clicking the backdrop — user must Cancel / X / Verify
                e.stopPropagation();
            }}
            onWheel={(e) => {
                if (e.target === e.currentTarget) {
                    e.preventDefault();
                }
            }}
        >
            <Card className="w-full max-w-md relative z-[65]" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {purpose === "close_file" ? "Verify Identity to Close File" : "Verify Your Identity"}
                </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={dismiss}
                        className="h-6 w-6 p-0 rounded-full"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!otpSent ? (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="verificationMethod">Verification Method</Label>
                                <Select
                                    value={verificationMethod}
                                    onValueChange={(value) => {
                                        setVerificationMethod(value);
                                        persist({ open: true, method: value });
                                    }}
                                    disabled={loading}
                                >
                                    <SelectTrigger
                                        id="verificationMethod"
                                        className="mt-2"
                                    >
                                        <SelectValue placeholder="Select verification method" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="!z-[70]"
                                        style={{ zIndex: 70 }}
                                        onCloseAutoFocus={(e) => {
                                            e.preventDefault();
                                        }}
                                    >
                                        <SelectItem value="whatsapp">
                                            <div className="flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4" />
                                                <span>WhatsApp</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="email">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <span>Email</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {verificationMethod === "email"
                                        ? `OTP will be sent to your registered email address${userContact.email ? `: ${userContact.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}` : "."}`
                                        : `OTP will be sent to your registered WhatsApp number${userContact.phone ? `: ${userContact.phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1***$3")}` : "."}`
                                    }
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={dismiss}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={sendOTP}
                                    disabled={loading || countdown > 0}
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </Button>
                                {(verificationMethod === "whatsapp" && !userContact.phone) && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        ⚠️ Phone number not found. The API will validate this.
                                    </p>
                                )}
                                {(verificationMethod === "email" && !userContact.email) && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        ⚠️ Email address not found. The API will validate this.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <Label>Enter 6-digit OTP</Label>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    {verificationMethod === "email"
                                        ? `OTP sent to your email address${userContact.email ? `: ${userContact.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}` : ""}`
                                        : `OTP sent to your WhatsApp number${userContact.phone ? `: ${userContact.phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1***$3")}` : ""}`
                                    }
                                </p>
                            </div>

                            <div className="space-y-2">
                                <OTPInput
                                    value={otpCode}
                                    onChange={setOtpCode}
                                    disabled={loading}
                                />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Didn't receive OTP?
                                    </span>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={sendOTP}
                                        disabled={loading || countdown > 0}
                                        className="h-auto p-0"
                                    >
                                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => {
                                    setOtpSent(false);
                                    setOtpCode("");
                                    persist({ open: true, otpSent: false });
                                }}>
                                    Back
                                </Button>
                                <Button
                                    onClick={verifyAuthentication}
                                    disabled={loading || !otpCode || otpCode.length !== 6}
                                >
                                    {loading ? "Verifying..." : "Verify"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
