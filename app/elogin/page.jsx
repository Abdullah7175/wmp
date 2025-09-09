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
        
        if (userRole === 4) {
          // Normal e-filing users (role 4) → redirect to efilinguser
          window.location.href = "/efilinguser";
        } else if (userRole === 1) {
          // Admin users (role 1) → redirect to efiling
          window.location.href = "/efiling";
        } else {
          // Other roles → redirect to efilinguser as default
          window.location.href = "/efilinguser";
        }
      } else {
        // If can't fetch user data, default to efilinguser
        window.location.href = "/efilinguser";
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      // Default to efilinguser on error
      window.location.href = "/efilinguser";
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (result?.error) {
          toast({
            title: "Login Failed",
            description: result.error,
            variant: "destructive",
          });
          return;
        }

        if (result?.ok) {
          // After successful login, check user role and redirect accordingly
          setTimeout(() => {
            if (!hasRedirected) {
              setHasRedirected(true);
              checkUserRoleAndRedirect(result.user || session?.user);
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Login error:", error);
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred",
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
         <Image src="/logo.png" className="py-0 px-1" width="150" height="150" alt="logo" />
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
                  disabled={formik.isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-medium"
                >
                  {formik.isSubmitting ? "Signing In..." : "Sign In to Works Management"}
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