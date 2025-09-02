"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, ArrowRight, Users, Database, Shield, BarChart3 } from "lucide-react";

export default function PortalSelectionPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-center gap-4 mb-6"
                    >
                        <Image src="/logo.png" width={80} height={80} alt="KW&SC Logo" className="rounded-lg shadow-lg" />
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-gray-900">Works Management Portal</h1>
                            <p className="text-lg text-gray-600">Karachi Water & Sewerage Corporation</p>
                        </div>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-700 max-w-2xl mx-auto"
                    >
                        Choose your portal to access the comprehensive works management system
                    </motion.p>
                </div>

                {/* Portal Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Video Archiving Portal */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300">
                            <CardHeader className="text-center pb-6">
                                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Video className="w-10 h-10 text-blue-600" />
                                </div>
                                <CardTitle className="text-2xl text-blue-900">Video Archiving Portal</CardTitle>
                                <CardDescription className="text-gray-600">
                                    Comprehensive video management and archiving system
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Video className="w-5 h-5 text-blue-600" />
                                        <span className="text-gray-700">Video upload and management</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Database className="w-5 h-5 text-blue-600" />
                                        <span className="text-gray-700">Advanced search and filtering</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span className="text-gray-700">Multi-user access control</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="w-5 h-5 text-blue-600" />
                                        <span className="text-gray-700">Analytics and reporting</span>
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <Link href="/login">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium group">
                                            <span>Access Video Portal</span>
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* E-Filing System */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-green-100 hover:border-green-300">
                            <CardHeader className="text-center pb-6">
                                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="w-10 h-10 text-green-600" />
                                </div>
                                <CardTitle className="text-2xl text-green-900">E-Filing System</CardTitle>
                                <CardDescription className="text-gray-600">
                                    Electronic document filing and workflow management
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">Document creation and filing</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Database className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">Centralized file management</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">Secure access control</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">Department-based workflows</span>
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <Link href="/elogin">
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-medium group">
                                            <span>Access E-Filing System</span>
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-16 text-center border-t pt-8"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Image src="/logo.png" width={40} height={40} alt="Logo" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Karachi Water & Sewerage Corporation</p>
                            <p className="text-xs text-gray-600">Government of Pakistan</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        © 2025 KW&SC. All rights reserved. | Secure • Reliable • Efficient
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
