"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OTPInput } from "@/components/ui/otp-input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail, MessageCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";

/**
 * Reusable OTP Verification Modal Component
 * 
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onVerify - Callback when OTP is verified successfully
 * @param {number} efilingUserId - Optional efiling user ID (if not provided, uses session)
 */
export function OTPVerificationModal({ show, onClose, onVerify, efilingUserId = null }) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [verificationMethod, setVerificationMethod] = useState("whatsapp");
    const [userContact, setUserContact] = useState({ phone: null, email: null });

    // Countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (show) {
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            return () => {
                // Restore body scroll when modal closes
                document.body.style.overflow = '';
            };
        }
    }, [show]);

    // Load user contact info when modal opens
    useEffect(() => {
        if (show) {
            // Reset state when modal opens
            setOtpSent(false);
            setOtpCode("");
            setCountdown(0);
            setVerificationMethod("whatsapp");

            // Fetch user contact info
            const fetchUserContact = async () => {
                try {
                    let response;
                    if (efilingUserId) {
                        response = await fetch(`/api/efiling/users/${efilingUserId}`);
                    } else if (session?.user?.id) {
                        // Use session user ID to fetch profile
                        response = await fetch(`/api/efiling/users/profile?userId=${session.user.id}`);
                    } else {
                        // Try without userId (might work if auth middleware handles it)
                        response = await fetch('/api/efiling/users/profile');
                    }
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    // Handle both response formats: { success: true, user: {...} } or direct user object
                    const userData = data.success ? data.user : data;
                    
                    if (userData) {
                        setUserContact({
                            phone: userData.contact_number || null,
                            email: userData.google_email || userData.email || null // Use google_email from efiling_users, fallback to users.email
                        });
                        console.log('User contact loaded:', {
                            phone: userData.contact_number ? '***' + userData.contact_number.slice(-4) : 'not found',
                            email: userData.google_email || userData.email ? '***' : 'not found'
                        });
                    } else {
                        console.warn('Profile API returned no user data:', data);
                        // Fallback: try to get from session if available
                        if (session?.user) {
                            setUserContact({
                                phone: session.user.contact_number || null,
                                email: session.user.email || null
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error fetching user contact:', err);
                    // Fallback: try to get from session if available
                    if (session?.user) {
                        setUserContact({
                            phone: session.user.contact_number || null,
                            email: session.user.email || null
                        });
                    }
                }
            };

            fetchUserContact();
        }
    }, [show, efilingUserId, session]);

    // Send OTP
    const sendOTP = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/efiling/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: verificationMethod })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setOtpSent(true);
                setCountdown(60);
                setOtpCode(""); // Clear previous OTP
                toast({
                    title: "OTP Sent",
                    description: data.message || `OTP has been sent to your ${verificationMethod === 'email' ? 'email address' : 'WhatsApp number'}.`,
                });
            } else {
                // Handle rate limiting with user-friendly message
                if (response.status === 429) {
                    const secondsRemaining = data.secondsRemaining || 60;
                    toast({
                        title: "Please Wait",
                        description: data.message || `Your last OTP timer is still active. Please wait ${secondsRemaining} more seconds before requesting another OTP.`,
                        variant: "default",
                    });
                    // Set countdown to remaining seconds
                    if (countdown === 0 || countdown > secondsRemaining) {
                        setCountdown(secondsRemaining);
                    }
                } else if (data.forceEmail) {
                    // Force email verification after WhatsApp failures
                    toast({
                        title: "Switching to Email",
                        description: data.message || "WhatsApp verification has failed multiple times. Please use email verification instead.",
                        variant: "default",
                    });
                    setVerificationMethod("email");
                } else if (data.otpCode) {
                    // If sending fails but OTP is provided for testing
                    toast({
                        title: "OTP Generated (Testing Mode)",
                        description: `${verificationMethod} delivery failed. Your OTP is: ${data.otpCode}`,
                        variant: "default",
                    });
                    setOtpSent(true);
                    setCountdown(60);
                    setOtpCode(data.otpCode); // Auto-fill for testing
                } else {
                    throw new Error(data.error || 'Failed to send OTP');
                }
            }
        } catch (error) {
            // Check if it's a rate limit error
            if (error.message && (error.message.includes('Maximum OTP requests') || error.message.includes('last OTP timer'))) {
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

    // Verify authentication
    const verifyAuthentication = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/efiling/verify-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: efilingUserId || session?.user?.id,
                    code: otpCode,
                    method: verificationMethod
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Reset state
                    setOtpCode("");
                    setOtpSent(false);
                    setVerificationMethod("whatsapp");
                    setCountdown(0);
                    
                    toast({
                        title: "Authentication Successful",
                        description: "Your identity has been verified.",
                    });
                    
                    // Call success callback
                    onVerify?.();
                    
                    // Close modal after successful verification
                    setTimeout(() => {
                        onClose?.();
                    }, 500);
                } else {
                    throw new Error(data.error || 'Authentication failed');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Authentication failed');
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

    if (!show) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
            onWheel={(e) => {
                // Only prevent scroll on backdrop, not on card content
                if (e.target === e.currentTarget) {
                    e.preventDefault();
                }
            }}
        >
            <Card className="w-full max-w-md relative z-[65]" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Verify Your Identity
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0 rounded-full"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!otpSent ? (
                        // Method Selection Step
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="verificationMethod">Verification Method</Label>
                                <Select
                                    value={verificationMethod}
                                    onValueChange={setVerificationMethod}
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
                                            // Prevent page scroll when closing
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
                                    {verificationMethod === 'email' 
                                        ? `OTP will be sent to your registered email address${userContact.email ? `: ${userContact.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}` : '.'}`
                                        : `OTP will be sent to your registered WhatsApp number${userContact.phone ? `: ${userContact.phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3')}` : '.'}`
                                    }
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={sendOTP}
                                    disabled={loading || countdown > 0}
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </Button>
                                {(verificationMethod === 'whatsapp' && !userContact.phone) && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        ⚠️ Phone number not found. The API will validate this.
                                    </p>
                                )}
                                {(verificationMethod === 'email' && !userContact.email) && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        ⚠️ Email address not found. The API will validate this.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        // OTP Input Step
                        <div className="space-y-4">
                            <div>
                                <Label>Enter 6-digit OTP</Label>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    {verificationMethod === 'email' 
                                        ? `OTP sent to your email address${userContact.email ? `: ${userContact.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}` : ''}`
                                        : `OTP sent to your WhatsApp number${userContact.phone ? `: ${userContact.phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3')}` : ''}`
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

