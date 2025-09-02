"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pen, MessageSquare, User, Calendar, X, Edit, Trash2, Shield, Settings, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { useSession } from "next-auth/react";

export default function DocumentSignatureSystem({ 
    fileId, 
    onSignatureAdded, 
    onCommentAdded,
    userRole,
    canEditDocument 
}) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [signatures, setSignatures] = useState([]);
    const [comments, setComments] = useState([]);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [userSignatures, setUserSignatures] = useState([]);
    const [showSignatureManager, setShowSignatureManager] = useState(false);
    const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [signatureMethod, setSignatureMethod] = useState("otp");
    const [otpCode, setOtpCode] = useState("");
    const [googleAuthCode, setGoogleAuthCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [pendingSignatureData, setPendingSignatureData] = useState(null);
    const [showEmailRegistration, setShowEmailRegistration] = useState(false);
    const [registrationEmail, setRegistrationEmail] = useState("");
    
    // New signature creation states
    const [signatureText, setSignatureText] = useState("");
    const [signatureFont, setSignatureFont] = useState("Arial");
    const [scannedSignatureFile, setScannedSignatureFile] = useState(null);
    const [activeSignatureTab, setActiveSignatureTab] = useState("draw");
    const [editingSignatureId, setEditingSignatureId] = useState(null);
    
    const sigCanvasRef = useRef(null);
    const documentRef = useRef(null);
    const fileInputRef = useRef(null);

    // Signature fonts
    const signatureFonts = [
        { value: "Arial", label: "Arial" },
        { value: "Times New Roman", label: "Times New Roman" },
        { value: "Courier New", label: "Courier New" },
        { value: "Georgia", label: "Georgia" },
        { value: "Verdana", label: "Verdana" },
        { value: "Palatino", label: "Palatino" },
        { value: "Garamond", label: "Garamond" },
        { value: "Bookman", label: "Bookman" }
    ];

    // Countdown timer for OTP
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Load existing signatures and comments
    useEffect(() => {
        if (fileId) {
            loadSignatures();
            loadComments();
            loadUserSignatures();
        }
    }, [fileId]);

    // Initialize canvas when signature modal opens
    useEffect(() => {
        if (showSignatureModal && activeSignatureTab === "draw") {
            // Small delay to ensure the canvas is rendered
            const timer = setTimeout(() => {
                if (sigCanvasRef.current) {
                    console.log('Canvas initialized successfully');
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showSignatureModal, activeSignatureTab]);

    const loadSignatures = async () => {
        try {
            const response = await fetch(`/api/efiling/files/${fileId}/signatures`);
            if (response.ok) {
                const data = await response.json();
                setSignatures(data);
            }
        } catch (error) {
            console.error('Error loading signatures:', error);
        }
    };

    const loadComments = async () => {
        try {
            const response = await fetch(`/api/efiling/files/${fileId}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const loadUserSignatures = async () => {
        try {
            const response = await fetch(`/api/efiling/signatures/manage?userId=${session?.user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setUserSignatures(data.signatures || []);
            }
        } catch (error) {
            console.error('Error loading user signatures:', error);
        }
    };

    // Send OTP
    const sendOTP = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/efiling/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: 'sms' })
            });

            if (response.ok) {
                setOtpSent(true);
                setCountdown(60);
                toast({
                    title: "OTP Sent",
                    description: "OTP has been sent to your registered mobile number.",
                });
            } else {
                throw new Error('Failed to send OTP');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Verify authentication
    const verifyAuthentication = async () => {
        try {
            setLoading(true);
            
            let response;
            
            if (signatureMethod === 'googleOAuth') {
                // Use Google OAuth verification
                response = await fetch('/api/efiling/google-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: googleAuthCode, // googleAuthCode contains the email for OAuth
                        userId: session?.user?.id
                    })
                });

                if (response.status === 402) {
                    // User needs to register their Google email
                    const errorData = await response.json();
                    setShowEmailRegistration(true);
                    setRegistrationEmail(googleAuthCode);
                    setLoading(false);
                    return;
                }
            } else {
                // Use regular OTP/Google Authenticator verification
                response = await fetch('/api/efiling/verify-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        method: signatureMethod,
                        code: signatureMethod === 'otp' ? otpCode : googleAuthCode
                    })
                });
            }

            if (response.ok) {
                setShowAuthModal(false);
                setOtpCode("");
                setGoogleAuthCode("");
                
                // Execute the pending action
                if (pendingAction === 'addSignature' && pendingSignatureData) {
                    await addSignatureToDocument(pendingSignatureData);
                } else if (pendingAction === 'addComment') {
                    await addCommentToDocument();
                }
                
                toast({
                    title: "Authentication Successful",
                    description: "Your identity has been verified.",
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Authentication failed');
            }
        } catch (error) {
            toast({
                title: "Authentication Failed",
                description: error.message || "Invalid code. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Register Google email
    const registerGoogleEmail = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/efiling/google-auth', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: registrationEmail,
                    userId: session?.user?.id
                })
            });

            if (response.ok) {
                setShowEmailRegistration(false);
                setRegistrationEmail("");
                
                toast({
                    title: "Email Registered",
                    description: "Your Google email has been registered successfully. You can now use Google OAuth for authentication.",
                });
                
                // Retry the original authentication
                setGoogleAuthCode(registrationEmail);
                await verifyAuthentication();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to register email');
            }
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to register Google email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Add signature to document
    const addSignatureToDocument = async (signatureData) => {
        try {
            const newSignature = {
                id: Date.now(),
                user_id: session?.user?.id,
                user_name: session?.user?.name,
                user_role: userRole,
                type: signatureData.type,
                content: signatureData.content,
                position: signatureData.position,
                font: signatureData.font,
                timestamp: new Date().toISOString(),
                file_id: fileId
            };

            const response = await fetch(`/api/efiling/files/${fileId}/signatures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSignature)
            });

            if (response.ok) {
                setSignatures(prev => [...prev, newSignature]);
                onSignatureAdded && onSignatureAdded(newSignature);
                toast({
                    title: "Signature Added",
                    description: "Your signature has been added to the document.",
                });
            } else {
                throw new Error('Failed to add signature');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add signature. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Add comment to document
    const addCommentToDocument = async () => {
        try {
            const newComment = {
                id: Date.now(),
                user_id: session?.user?.id,
                user_name: session?.user?.name,
                user_role: userRole,
                text: commentText,
                timestamp: new Date().toISOString(),
                file_id: fileId
            };

            const response = await fetch(`/api/efiling/files/${fileId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });

            if (response.ok) {
                setComments(prev => [...prev, newComment]);
                onCommentAdded && onCommentAdded(newComment);
                setCommentText("");
                setShowCommentModal(false);
                toast({
                    title: "Comment Added",
                    description: "Your comment has been added to the document.",
                });
            } else {
                throw new Error('Failed to add comment');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add comment. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle signature creation
    const handleCreateSignature = (signatureData) => {
        setPendingAction('addSignature');
        setPendingSignatureData(signatureData);
        setShowAuthModal(true);
    };

    // Handle drawn signature
    const handleDrawnSignature = async () => {
        if (!sigCanvasRef.current) {
            toast({
                title: "Canvas Error",
                description: "Drawing canvas is not available. Please try again.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Check if canvas has content by getting image data
            const canvas = sigCanvasRef.current.getCanvas();
            if (!canvas) {
                toast({
                    title: "Canvas Error",
                    description: "Canvas element not found. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hasContent = imageData.data.some(channel => channel !== 0);

            if (!hasContent) {
                toast({
                    title: "No Signature",
                    description: "Please draw a signature first.",
                    variant: "destructive",
                });
                return;
            }

            // Convert to PNG
            const dataURL = sigCanvasRef.current.toDataURL("image/png");
            
            // Save to file storage first
            const uploadResponse = await fetch('/api/efiling/signatures/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signatureData: dataURL,
                    userId: session?.user?.id,
                    userName: session?.user?.name,
                    signatureType: 'drawn'
                }),
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload signature file');
            }

            const uploadResult = await uploadResponse.json();

            // Reload user signatures to reflect changes
            loadUserSignatures();

            // Now create the signature record
            handleCreateSignature({
                type: 'image',
                content: uploadResult.fileUrl, // Use the file URL instead of base64
                position: { x: 100, y: 100 },
                filePath: uploadResult.fileUrl,
                signatureId: uploadResult.signatureId
            });

            toast({
                title: "Signature Saved",
                description: "Your signature has been saved successfully.",
            });

        } catch (error) {
            console.error('Error processing signature:', error);
            toast({
                title: "Error",
                description: "Failed to process signature. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle typed signature
    const handleTypedSignature = () => {
        if (!signatureText.trim()) {
            toast({
                title: "No Signature Text",
                description: "Please enter signature text.",
                variant: "destructive",
            });
            return;
        }
        handleCreateSignature({
            type: 'text',
            content: signatureText,
            font: signatureFont,
            position: { x: 100, y: 100 }
        });
    };

    // Handle signature management (activate/deactivate)
    const manageSignature = async (action, signatureId) => {
        try {
            const response = await fetch('/api/efiling/signatures/manage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    signatureId,
                    userId: session?.user?.id
                }),
            });

            const result = await response.json();

            if (response.ok) {
                loadUserSignatures(); // Reload signatures
                toast({
                    title: "Success",
                    description: result.message,
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error managing signature:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to manage signature.",
                variant: "destructive",
            });
        }
    };

    // Handle scanned signature
    const handleScannedSignature = () => {
        if (!scannedSignatureFile) {
            toast({
                title: "No Scanned Signature",
                description: "Please upload a scanned signature image.",
                variant: "destructive",
            });
            return;
        }
        handleCreateSignature({
            type: 'image',
            content: scannedSignatureFile,
            position: { x: 100, y: 100 }
        });
    };

    // Handle file upload for scanned signature
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setScannedSignatureFile(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                toast({
                    title: "Invalid File",
                    description: "Please upload an image file (PNG, JPG, etc.).",
                    variant: "destructive",
                });
            }
        }
    };

    // Handle comment creation
    const handleAddComment = () => {
        if (!commentText.trim()) {
            toast({
                title: "No Comment",
                description: "Please enter a comment.",
                variant: "destructive",
            });
            return;
        }
        setPendingAction('addComment');
        setShowAuthModal(true);
    };

    // Edit comment
    const handleEditComment = async (commentId) => {
        try {
            const response = await fetch(`/api/efiling/files/${fileId}/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editCommentText })
            });

            if (response.ok) {
                setComments(prev => prev.map(comment => 
                    comment.id === commentId 
                        ? { ...comment, text: editCommentText, edited: true, edited_at: new Date().toISOString() }
                        : comment
                ));
                setEditingCommentId(null);
                setEditCommentText("");
                toast({
                    title: "Comment Updated",
                    description: "Your comment has been updated.",
                });
            } else {
                throw new Error('Failed to update comment');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update comment. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`/api/efiling/files/${fileId}/comments/${commentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setComments(prev => prev.filter(comment => comment.id !== commentId));
                toast({
                    title: "Comment Deleted",
                    description: "Your comment has been deleted.",
                });
            } else {
                throw new Error('Failed to delete comment');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete comment. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Check if user can edit comment
    const canEditComment = (comment) => {
        return comment.user_id === session?.user?.id || 
               ['superadmin', 'CEO', 'Chief IT Officer'].includes(userRole);
    };

    return (
        <div className="space-y-6">
            {/* Signature and Comment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                    onClick={() => setShowSignatureModal(true)}
                    className="flex items-center justify-center gap-2 w-full"
                    data-signature-button
                >
                    <Pen className="w-4 h-4" />
                    Add E-Signature
                </Button>
                <Button
                    onClick={() => setShowSignatureManager(true)}
                    variant="outline"
                    className="flex items-center justify-center gap-2 w-full"
                >
                    <Settings className="w-4 h-4" />
                    Manage Signatures
                </Button>
                <Button
                    onClick={() => setShowCommentModal(true)}
                    variant="outline"
                    className="flex items-center justify-center gap-2 w-full"
                >
                    <MessageSquare className="w-4 h-4" />
                    Add Comment
                </Button>
            </div>

            {/* Signatures Display */}
            {signatures.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Document Signatures ({signatures.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {signatures.map((signature) => (
                                <div key={signature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-8 border rounded bg-white flex items-center justify-center">
                                            {signature.type === 'text' ? (
                                                <span 
                                                    className="text-sm font-bold text-blue-600"
                                                    style={{ fontFamily: signature.font }}
                                                >
                                                    {signature.content}
                                                </span>
                                            ) : (
                                                <img
                                                    src={signature.content}
                                                    alt="Signature"
                                                    className="w-10 h-6 object-contain"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{signature.user_name}</div>
                                            <div className="text-sm text-gray-500">
                                                {signature.user_role} • {new Date(signature.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Position: ({Math.round(signature.position.x)}, {Math.round(signature.position.y)})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comments Display */}
            {comments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-4" />
                            Document Comments ({comments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">{comment.user_name}</span>
                                                <span className="text-sm text-gray-500">•</span>
                                                <span className="text-sm text-gray-500">{comment.user_role}</span>
                                                <span className="text-sm text-gray-500">•</span>
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">
                                                    {new Date(comment.timestamp).toLocaleString()}
                                                </span>
                                                {comment.edited && (
                                                    <span className="text-xs text-gray-400">(edited)</span>
                                                )}
                                            </div>
                                            {editingCommentId === comment.id ? (
                                                <div className="space-y-2">
                                                    <Input
                                                        value={editCommentText}
                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                        placeholder="Edit your comment..."
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleEditComment(comment.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingCommentId(null);
                                                                setEditCommentText("");
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-700">{comment.text}</div>
                                            )}
                                        </div>
                                        {canEditComment(comment) && (
                                            <div className="flex gap-1 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingCommentId(comment.id);
                                                        setEditCommentText(comment.text);
                                                    }}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Signature Creation Modal */}
            {showSignatureModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle>Create E-Signature</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setShowSignatureModal(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Signature Type Tabs */}
                            <div className="flex space-x-2 border-b">
                                <Button
                                    variant={activeSignatureTab === "draw" ? "default" : "ghost"}
                                    onClick={() => setActiveSignatureTab("draw")}
                                    className="flex items-center gap-2"
                                >
                                    <Pen className="w-4 h-4" />
                                    Draw Signature
                                </Button>
                                <Button
                                    variant={activeSignatureTab === "type" ? "default" : "ghost"}
                                    onClick={() => setActiveSignatureTab("type")}
                                    className="flex items-center gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    Type Signature
                                </Button>
                                <Button
                                    variant={activeSignatureTab === "scan" ? "default" : "ghost"}
                                    onClick={() => setActiveSignatureTab("scan")}
                                    className="flex items-center gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    Upload Scanned
                                </Button>
                            </div>

                            {/* Draw Signature Tab */}
                            {activeSignatureTab === "draw" && (
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <Label>Draw Your Signature</Label>
                                        <SignatureCanvas
                                            ref={sigCanvasRef}
                                            penColor="black"
                                            canvasProps={{
                                                width: 400,
                                                height: 150,
                                                className: "border rounded mx-auto mt-2"
                                            }}
                                        />
                                        <div className="flex gap-2 justify-center mt-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => sigCanvasRef.current?.clear()}
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button 
                                            onClick={handleDrawnSignature} 
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Save Drawn Signature
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Type Signature Tab */}
                            {activeSignatureTab === "type" && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="signatureText">Signature Text</Label>
                                        <Input
                                            id="signatureText"
                                            value={signatureText}
                                            onChange={(e) => setSignatureText(e.target.value)}
                                            placeholder="Enter your signature text"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="signatureFont">Signature Font</Label>
                                        <select
                                            id="signatureFont"
                                            value={signatureFont}
                                            onChange={(e) => setSignatureFont(e.target.value)}
                                            className="w-full p-2 border rounded-md mt-1"
                                        >
                                            {signatureFonts.map((font) => (
                                                <option key={font.value} value={font.value}>
                                                    {font.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {signatureText && (
                                        <div className="text-center p-4 border rounded-lg">
                                            <Label>Preview:</Label>
                                            <div
                                                className="text-3xl font-bold mt-2"
                                                style={{ fontFamily: signatureFont }}
                                            >
                                                {signatureText}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end">
                                        <Button onClick={handleTypedSignature} disabled={!signatureText.trim()}>
                                            Save Typed Signature
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Scanned Signature Tab */}
                            {activeSignatureTab === "scan" && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="scannedSignature">Upload Scanned Signature</Label>
                                        <Input
                                            id="scannedSignature"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="mt-1"
                                        />
                                    </div>
                                    {scannedSignatureFile && (
                                        <div className="text-center">
                                            <Label>Preview:</Label>
                                            <img
                                                src={scannedSignatureFile}
                                                alt="Scanned signature"
                                                className="mx-auto mt-2 border rounded max-w-xs"
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-end">
                                        <Button onClick={handleScannedSignature} disabled={!scannedSignatureFile}>
                                            Save Scanned Signature
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Comment Creation Modal */}
            {showCommentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Add Comment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="commentText">Comment</Label>
                                <Input
                                    id="commentText"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Enter your comment..."
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowCommentModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddComment}>
                                    Add Comment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Authentication Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Verify Your Identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label>Authentication Method</Label>
                                    <select
                                        value={signatureMethod}
                                        onChange={(e) => setSignatureMethod(e.target.value)}
                                        className="w-full p-2 border rounded-md mt-1"
                                    >
                                        <option value="otp">SMS OTP</option>
                                        <option value="google">Google Authenticator</option>
                                        <option value="googleOAuth">Google OAuth</option>
                                    </select>
                                </div>

                                {signatureMethod === 'otp' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="otpCode">OTP Code</Label>
                                            {!otpSent && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={sendOTP}
                                                    disabled={loading || countdown > 0}
                                                >
                                                    {countdown > 0 ? `Resend in ${countdown}s` : "Send OTP"}
                                                </Button>
                                            )}
                                        </div>
                                        <Input
                                            id="otpCode"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                        />
                                    </div>
                                )}

                                {signatureMethod === 'google' && (
                                    <div>
                                        <Label htmlFor="googleAuthCode">Google Authenticator Code</Label>
                                        <Input
                                            id="googleAuthCode"
                                            value={googleAuthCode}
                                            onChange={(e) => setGoogleAuthCode(e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            maxLength={6}
                                        />
                                    </div>
                                )}

                                {signatureMethod === 'googleOAuth' && (
                                    <div>
                                        <Label htmlFor="googleEmail">Email Address</Label>
                                        <Input
                                            id="googleEmail"
                                            type="email"
                                            placeholder="Enter your Google account email"
                                            onChange={(e) => setGoogleAuthCode(e.target.value)}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Enter the email address associated with your Google account
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowAuthModal(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={verifyAuthentication}
                                    disabled={loading || (signatureMethod === 'otp' && !otpCode) || (signatureMethod === 'google' && !googleAuthCode) || (signatureMethod === 'googleOAuth' && !googleAuthCode)}
                                >
                                    {loading ? "Verifying..." : "Verify"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Signature Manager Modal */}
            {showSignatureManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle>Manage Your Signatures</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setShowSignatureManager(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-gray-600 mb-4">
                                You can have up to 3 signatures (one for each type). Only one signature can be active at a time.
                            </div>
                            
                            {userSignatures.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No signatures created yet. Create your first signature using &quot;Add E-Signature&quot; button.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userSignatures.map((sig) => (
                                        <div key={sig.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <div className="font-medium capitalize">
                                                            {sig.signature_type} Signature
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Created: {new Date(sig.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {sig.is_active ? (
                                                                <div className="flex items-center gap-1 text-green-600">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">Active</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-gray-500">
                                                                    <AlertCircle className="w-4 h-4" />
                                                                    <span className="text-sm">Inactive</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {sig.is_active ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => manageSignature('deactivate', sig.id)}
                                                        >
                                                            <EyeOff className="w-4 h-4 mr-1" />
                                                            Deactivate
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => manageSignature('activate', sig.id)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Activate
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => manageSignature('delete', sig.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                            {sig.file_url && (
                                                <div className="mt-3 p-2 bg-gray-50 rounded border">
                                                    <img 
                                                        src={sig.file_url} 
                                                        alt={`${sig.signature_type} signature`}
                                                        className="max-h-16 max-w-32 object-contain"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Email Registration Modal */}
            {showEmailRegistration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Register Your Google Email
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-700">
                                It seems you are trying to use Google OAuth with an email address ({registrationEmail}) that is not yet registered in our system.
                                Please register this email address to complete your Google authentication.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowEmailRegistration(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={registerGoogleEmail}
                                    disabled={loading}
                                >
                                    {loading ? "Registering..." : "Register Email"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
