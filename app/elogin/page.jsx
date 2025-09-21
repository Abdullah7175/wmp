"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import React from "react";
import { FileText, ArrowLeft, Eye, EyeOff, Mail } from "lucide-react";
import Link from "next/link";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

export default function EFileLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = React.useState(false);
  const [hasRedirected, setHasRedirected] = React.useState(false);
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [isLocked, setIsLocked] = React.useState(false);
  const [lockoutTime, setLockoutTime] = React.useState(null);

  // Check for lockout on component mount
  React.useEffect(() => {
    const storedAttempts = localStorage.getItem('eloginFailedAttempts');
    const storedLockout = localStorage.getItem('eloginLockoutTime');
    
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
        // Lockout expired, clear stored data
        localStorage.removeItem('eloginFailedAttempts');
        localStorage.removeItem('eloginLockoutTime');
        setFailedAttempts(0);
        setIsLocked(false);
        setLockoutTime(null);
      }
    }
  }, []);

  // Redirect authenticated users away from /elogin based on their role
  React.useEffect(() => {
    if (status === "authenticated" && session?.user && !hasRedirected) {
      setHasRedirected(true);
      // Check user role and redirect accordingly
      checkUserRoleAndRedirect(session.user);
    }
  }, [session, status, hasRedirected]);

  const checkUserRoleAndRedirect = async (user) => {
    try {
      // Fetch user details to get role
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        const userRole = userData.role;
        
        // E-filing access control: Only allow role 1 (admin) and role 4 (e-filing user)
        if (userRole === 1) {
          // Admin users (role 1) → redirect to efiling
          window.location.href = "/efiling";
        } else if (userRole === 4) {
          // Normal e-filing users (role 4) → redirect to efilinguser
          window.location.href = "/efilinguser";
        } else {
          // Other roles are not allowed to access e-filing system
          toast({
            title: "Access Denied",
            description: "You do not have permission to access the e-filing system. Only administrators and e-filing users are allowed.",
            variant: "destructive",
          });
          // Sign out the user and redirect to main portal
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }
      } else {
        // If can't fetch user data, deny access
        toast({
          title: "Access Denied",
          description: "Unable to verify user permissions. Please contact administrator.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return;
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      toast({
        title: "Access Denied",
        description: "Error verifying user permissions. Please contact administrator.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      return;
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      // Check if account is locked
      if (isLocked) {
        const remainingTimeMs = lockoutTime - new Date();
        const remainingTimeSeconds = Math.ceil(remainingTimeMs / 1000);
        const remainingTimeMinutes = Math.ceil(remainingTimeMs / 1000 / 60);
        
        let timeMessage;
        if (remainingTimeSeconds < 60) {
          timeMessage = `${remainingTimeSeconds} seconds`;
        } else {
          timeMessage = `${remainingTimeMinutes} minutes`;
        }
        
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
          localStorage.setItem('eloginFailedAttempts', newAttempts.toString());

          let errorMessage = "Invalid email or password";
          let title = "Login Failed";
          let lockoutDuration = 0;

          if (newAttempts >= 5) {
            // 5th+ failed attempt: 15 minutes lockout
            lockoutDuration = 15 * 60 * 1000; // 15 minutes
            title = "Account Locked";
            errorMessage = "Too many failed attempts. Your account has been locked for 15 minutes.";
          } else if (newAttempts === 4) {
            // 4th failed attempt: 1 minute lockout
            lockoutDuration = 1 * 60 * 1000; // 1 minute
            title = "Account Locked";
            errorMessage = "Too many failed attempts. Your account has been locked for 1 minute.";
          } else if (newAttempts === 3) {
            // 3rd failed attempt: 30 seconds lockout
            lockoutDuration = 30 * 1000; // 30 seconds
            title = "Account Locked";
            errorMessage = "Too many failed attempts. Your account has been locked for 30 seconds.";
          } else if (newAttempts === 2) {
            title = "Warning: Last Attempt";
            errorMessage = "Invalid credentials. One more failed attempt will lock your account.";
          } else if (newAttempts === 1) {
            title = "Login Failed";
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          }

          // Apply lockout if needed
          if (lockoutDuration > 0) {
            const lockoutEndTime = new Date(Date.now() + lockoutDuration);
            setIsLocked(true);
            setLockoutTime(lockoutEndTime);
            localStorage.setItem('eloginLockoutTime', lockoutEndTime.toISOString());
            
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
          // Reset failed attempts on successful login
          setFailedAttempts(0);
          setIsLocked(false);
          setLockoutTime(null);
          localStorage.removeItem('eloginFailedAttempts');
          localStorage.removeItem('eloginLockoutTime');

          // Check user role before showing success message
          try {
            const userResponse = await fetch(`/api/users/${result.user?.id || session?.user?.id}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              const userRole = userData.role;
              
              // E-filing access control: Only allow role 1 (admin) and role 4 (e-filing user)
              if (userRole === 1 || userRole === 4) {
                toast({
                  title: "Login Successful",
                  description: "Welcome to Works Management Portal! Redirecting...",
                  variant: "success",
                });

                // After successful login, check user role and redirect accordingly
                setTimeout(() => {
                  if (!hasRedirected) {
                    setHasRedirected(true);
                    checkUserRoleAndRedirect(result.user || session?.user);
                  }
                }, 1000);
              } else {
                // User doesn't have permission for e-filing system
                toast({
                  title: "Access Denied",
                  description: "You do not have permission to access the e-filing system. Only administrators and e-filing users are allowed.",
                  variant: "destructive",
                });
                // Sign out the user
                setTimeout(() => {
                  window.location.href = "/";
                }, 3000);
              }
            } else {
              toast({
                title: "Access Denied",
                description: "Unable to verify user permissions. Please contact administrator.",
                variant: "destructive",
              });
              setTimeout(() => {
                window.location.href = "/";
              }, 3000);
            }
          } catch (error) {
            console.error("Error checking user role:", error);
            toast({
              title: "Access Denied",
              description: "Error verifying user permissions. Please contact administrator.",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
          }
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

  return (
    <div
      className="flex flex-col h-screen w-full items-center pt-10 md:pt-28 px-4 border-t-8 border-green-100"
      style={{
        backgroundImage: `url('/pattern.png')`, // ✅ no public prefix
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Overlay */}
      <div className="flex items-center justify-center gap-0">
         <Image src="/logo.png" className="py-0 px-1" width="150" height="150" alt="logo" priority />
       </div>
       <div className="flex gap-4 items-center mb-8">
         <h1 className="text-2xl font-semibold">Works Management Portal</h1>
       </div>
        


        {/* Back to Home */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Selection</span>
          </Link>
        </div>

        <motion.div
          className="z-5 w-full"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">Works Management Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Electronic Filing System Login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLocked && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Account Temporarily Locked
                      </h3>
                      <div className="mt-1 text-sm text-red-700">
                        <p>
                          Too many failed login attempts. Please try again in {
                            (() => {
                              const remainingTimeMs = lockoutTime - new Date();
                              const remainingTimeSeconds = Math.ceil(remainingTimeMs / 1000);
                              const remainingTimeMinutes = Math.ceil(remainingTimeMs / 1000 / 60);
                              return remainingTimeSeconds < 60 ? `${remainingTimeSeconds} seconds` : `${remainingTimeMinutes} minutes`;
                            })()
                          }.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {failedAttempts > 0 && !isLocked && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Warning: {failedAttempts} Failed Attempt{failedAttempts > 1 ? 's' : ''}
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700">
                        <p>
                          {failedAttempts === 2 
                            ? 'One more failed attempt will lock your account for 30 seconds.' 
                            : failedAttempts === 3
                            ? 'One more failed attempt will lock your account for 1 minute.'
                            : failedAttempts === 4
                            ? 'One more failed attempt will lock your account for 15 minutes.'
                            : 'Please check your credentials and try again.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-red-600">{formik.errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-red-600">{formik.errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLocked || formik.isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLocked ? "Account Locked" : formik.isSubmitting ? "Signing In..." : "Sign In to Works Management"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => signIn("google", { callbackUrl: "/elogin" })}
                className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 py-3 font-medium"
              >
                <Mail className="w-4 h-4 mr-2" />
                Sign in with Google
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Need access? Contact your system administrator
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/logo.png" width={40} height={40} alt="Logo" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Karachi Water & Sewerage Corporation</p>
              <p className="text-xs text-gray-600">Government of Pakistan</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            © 2025 KW&SC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}