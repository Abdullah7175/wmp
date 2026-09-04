"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signIn, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Video, FileText, ArrowRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Dual Portal Selection Modal State
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  // Check for lockout on component mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginFailedAttempts');
    const storedLockout = localStorage.getItem('loginLockoutTime');
    
    if (storedAttempts) {
      setFailedAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockout) {
      const lockoutEndTime = new Date(storedLockout);
      const now = new Date();
      
      if (now < lockoutEndTime) {
        setIsLocked(true);
        setLockoutTime(lockoutEndTime);
      } else {
        localStorage.removeItem('loginFailedAttempts');
        localStorage.removeItem('loginLockoutTime');
        setFailedAttempts(0);
        setIsLocked(false);
        setLockoutTime(null);
      }
    }
  }, []);

  // Determine user destination & handle dual-portal choice
  const handleUserRouting = async (user) => {
    if (!user) return;

    const userType = user.userType || "user";
    const userRole = parseInt(user.role || 0);
    const email = (user.email || '').toLowerCase();

    // Check client network authorization & dual portal status against .env
    let isInternal = false;
    let isDualFromApi = false;
    try {
      const netRes = await fetch("/api/auth/dual-portal-status");
      if (netRes.ok) {
        const netData = await netRes.json();
        isInternal = Boolean(netData.isInternalNetwork);
        isDualFromApi = Boolean(netData.isDualPortalUser);
      }
    } catch (err) {
      console.error("Network verification error:", err);
    }

    // ONLY emails explicitly configured in DUAL_PORTAL_USERS in .env have remote dual-portal access
    const isEnvDualUser = Boolean(
      user.isDualPortal ||
      isDualFromApi
    );

    // Case 1: Configured Dual-Portal User in .env (e.g. e-ceo@kwsc.gos.pk)
    if (isEnvDualUser) {
      // User in DUAL_PORTAL_USERS can access both portals from ANY network (office, home, mobile)
      setTargetUser(user);
      setShowPortalModal(true);
      return;
    }

    // Case 2: Super Admin (Role 1)
    if (userRole === 1) {
      if (isInternal) {
        // Super admin inside office network -> Show Dual Portal Selection Modal
        setTargetUser(user);
        setShowPortalModal(true);
        return;
      }
      // Super admin outside office network -> Route to Works Management Dashboard ONLY
      navigateToWMP(user);
      return;
    }

    // Case 3: E-Filing Only Users (Role 4 or 5)
    if (userType === "user" && (userRole === 4 || userRole === 5)) {
      if (isInternal) {
        // Inside allowed office network -> Route to E-Filing User Portal
        window.location.href = "/efilinguser";
        return;
      }
      // Outside office network: User has NO access to dashboard and is not allowed efiling in public
      // Silently disallow login without showing any error
      await signOut({ redirect: false });
      localStorage.removeItem('jwtToken');
      document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      return;
    }

    // Case 3: Specific WMP Executive and Operational Roles
    if (userType === "user") {
      if (userRole === 8 || userRole === 24 || email.includes('ceo')) {
        window.location.href = "/ceo";
        return;
      } else if (userRole === 6 || userRole === 26 || email.includes('coo')) {
        window.location.href = "/coo";
        return;
      } else if (userRole === 7 || email.includes('ce@')) {
        window.location.href = "/ce";
        return;
      } else if ([1, 2, 3].includes(userRole)) {
        // Valid Dashboard users (1: Super Admin, 2: Manager/Admin, 3: Operator)
        window.location.href = "/dashboard";
        return;
      }
    }

    // Case 4: Other userTypes
    if (userType === "agent") {
      window.location.href = "/agent";
      return;
    }
    if (userType === "socialmedia" || userType === "socialmediaperson") {
      window.location.href = "/smagent";
      return;
    }

    // Case 5: No authorized portal for user on this network
    // Silently disallow without showing error
    await signOut({ redirect: false });
    localStorage.removeItem('jwtToken');
    document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    return;
  };

  // Check already authenticated users
  useEffect(() => {
    if (status === "authenticated" && session?.user && !showPortalModal) {
      handleUserRouting(session.user);
    }
  }, [session, status]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isLocked) {
        const remainingTimeMs = lockoutTime - new Date();
        const remainingTimeSeconds = Math.ceil(remainingTimeMs / 1000);
        const remainingTimeMinutes = Math.ceil(remainingTimeMs / 1000 / 60);
        
        let timeMessage = remainingTimeSeconds < 60 ? `${remainingTimeSeconds} seconds` : `${remainingTimeMinutes} minutes`;
        
        toast({
          title: "Account Temporarily Locked",
          description: `Too many failed attempts. Please try again in ${timeMessage}.`,
          variant: "destructive",
        });
        return;
      }

      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (result?.error) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          localStorage.setItem('loginFailedAttempts', newAttempts.toString());

          let errorMessage = "Invalid email or password";
          let title = "Login Failed";
          let lockoutDuration = 0;

          if (newAttempts >= 5) {
            lockoutDuration = 15 * 60 * 1000;
            title = "Account Locked";
            errorMessage = "Too many failed attempts. Your account has been locked for 15 minutes.";
          } else if (newAttempts === 4) {
            lockoutDuration = 1 * 60 * 1000;
            title = "Account Locked";
            errorMessage = "Too many failed attempts. Your account has been locked for 1 minute.";
          } else if (newAttempts === 3) {
            lockoutDuration = 30 * 1000;
            title = "Account Locked";
            errorMessage = "Too many failed attempts. Your account has been locked for 30 seconds.";
          } else if (newAttempts === 2) {
            title = "Warning: Last Attempt";
            errorMessage = "Invalid credentials. One more failed attempt will lock your account.";
          } else if (newAttempts === 1) {
            title = "Login Failed";
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          }

          if (lockoutDuration > 0) {
            const lockoutEndTime = new Date(Date.now() + lockoutDuration);
            setIsLocked(true);
            setLockoutTime(lockoutEndTime);
            localStorage.setItem('loginLockoutTime', lockoutEndTime.toISOString());
            
            toast({
              title: title,
              description: errorMessage,
              variant: "destructive",
            });
            return;
          }

          toast({
            title: title,
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        if (result?.ok) {
          setFailedAttempts(0);
          setIsLocked(false);
          setLockoutTime(null);
          localStorage.removeItem('loginFailedAttempts');
          localStorage.removeItem('loginLockoutTime');

          toast({
            title: "Login Successful",
            description: "Authenticating...",
            variant: "success",
          });

          // Fetch updated session and route
          setTimeout(async () => {
            try {
              const sessionRes = await fetch("/api/auth/session");
              const userSession = await sessionRes.json();
              if (userSession?.user) {
                handleUserRouting(userSession.user);
              } else {
                handleUserRouting({ email: values.email });
              }
            } catch (error) {
              handleUserRouting({ email: values.email });
            }
          }, 300);
        }
      } catch (error) {
        console.error("Login error:", error);
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const navigateToWMP = (userOverride) => {
    const usr = userOverride || targetUser || session?.user;
    const userRole = parseInt(usr?.role || 0);
    const email = (usr?.email || '').toLowerCase();

    if (userRole === 8 || userRole === 24 || email.includes('ceo')) {
      window.location.href = "/ceo";
    } else if (userRole === 6 || userRole === 26 || email.includes('coo')) {
      window.location.href = "/coo";
    } else if (userRole === 7 || email.includes('ce@')) {
      window.location.href = "/ce";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const navigateToEfiling = () => {
    const usr = targetUser || session?.user;
    const userRole = parseInt(usr?.role || 0);
    if (userRole === 1) {
      window.location.href = "/efiling";
    } else {
      window.location.href = "/efilinguser";
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/pattern.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-white/70 to-blue-900/20 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" width={110} height={110} alt="KW&SC Logo" priority className="drop-shadow-md mb-2" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Works Management Portal</h1>
          <p className="text-xs text-gray-600 font-medium tracking-wide">Karachi Water & Sewerage Corporation</p>
        </div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="shadow-2xl backdrop-blur-xl bg-white/95 border border-blue-100 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-4 pt-6 bg-gradient-to-b from-blue-50/60 to-transparent">
              <CardTitle className="text-xl font-bold text-blue-950">Account Login</CardTitle>
              <CardDescription className="text-gray-500 text-xs">
                Enter your official credentials to access the system
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2 px-6 pb-6">
              {isLocked && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <div className="ml-2">
                      <h3 className="text-sm font-semibold text-red-800">Account Temporarily Locked</h3>
                      <p className="text-xs text-red-700 mt-1">
                        Too many failed attempts. Please wait before trying again.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {failedAttempts > 0 && !isLocked && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <h3 className="text-xs font-semibold text-amber-800">
                    Warning: {failedAttempts} Failed Attempt{failedAttempts > 1 ? 's' : ''}
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">Please check your credentials.</p>
                </div>
              )}

              <form onSubmit={formik.handleSubmit} className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Official Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@kwsc.gos.pk"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white text-sm"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-xs text-red-600 font-medium">{formik.errors.email}</p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-xs text-red-600 font-medium">{formik.errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLocked || formik.isSubmitting}
                  className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mt-2 text-sm"
                >
                  {isLocked ? "Account Locked" : formik.isSubmitting ? "Signing In..." : "Sign In to Portal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <p className="text-xs text-gray-500 mt-6 tracking-wide">
          © {new Date().getFullYear()} Karachi Water & Sewerage Corporation
        </p>
      </div>

      {/* Dual Portal Selection Modal */}
      <AnimatePresence>
        {showPortalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full p-6 md:p-8 overflow-hidden relative"
            >
              {/* Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600" />

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dual Portal Access Authorized</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome, {targetUser?.name || session?.user?.name || "User"}!
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select which management portal you want to open:
                </p>
              </div>

              {/* Selection Cards */}
              <div className="grid md:grid-cols-2 gap-4 my-6">
                {/* Option 1: Works Management Portal */}
                <button
                  type="button"
                  onClick={navigateToWMP}
                  className="group flex flex-col items-start p-5 rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-blue-50/40 to-white hover:border-blue-500 hover:shadow-xl hover:bg-blue-50/80 transition-all duration-300 text-left relative"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <Video className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                    Works Portal
                  </h3>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                    Works requests, field monitoring, media archiving & reports
                  </p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Works Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Option 2: E-Filing System */}
                <button
                  type="button"
                  onClick={navigateToEfiling}
                  className="group flex flex-col items-start p-5 rounded-2xl border-2 border-emerald-100 bg-gradient-to-b from-emerald-50/40 to-white hover:border-emerald-500 hover:shadow-xl hover:bg-emerald-50/80 transition-all duration-300 text-left relative"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-emerald-700 transition-colors">
                    E-Filing System
                  </h3>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                    Official file workflows, Daak management, notesheets & e-signatures
                  </p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open E-Filing System</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-400">
                  Tip: You can seamlessly switch between both portals anytime from the sidebar.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}