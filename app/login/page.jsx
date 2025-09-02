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
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  // Redirect authenticated users away from /login
  React.useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.userType === "agent") window.location.href = "/agent";
      else if (session.user.userType === "socialmedia" || session.user.userType === "socialmediaperson") window.location.href = "/smagent";
      else if (session.user.userType === "user") window.location.href = "/dashboard";
    }
  }, [session, status]);

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
          setTimeout(async () => {
            try {
              const sessionRes = await fetch("/api/auth/session");
              const session = await sessionRes.json();
              const userType = session?.user?.userType;
              switch (userType) {
                case "agent":
                  window.location.href = "/agent";
                  break;
                case "socialmedia":
                case "socialmediaperson":
                  window.location.href = "/smagent";
                  break;
                case "user":
                default:
                  window.location.href = "/dashboard";
                  break;
              }
            } catch (error) {
              window.location.href = "/dashboard";
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
      className="flex flex-col h-screen w-full items-center pt-10 md:pt-28 px-4 border-t-8 border-blue-100"
      style={{
        backgroundImage: `url('/pattern.png')`, // ✅ no public prefix
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* Overlay */}
      <div className="flex items-center justify-center gap-0">
         <Image src="/logo.png" className="py-0 px-1" width="150" height="150" alt="logo" />
       </div>
       <div className="flex gap-4 items-center mb-8">
         <h1 className="text-2xl font-semibold">Video Archiving Portal</h1>
       </div>

      <motion.div
        className="z-5 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Selection</span>
          </Link>
        </div>


        <Card className="shadow-lg backdrop-blur-lg bg-white/90 border border-blue-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">Login</CardTitle>
            <CardDescription className="text-gray-600">Enter your credentials to access the portal</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={formik.handleSubmit} className="grid gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-red-600">{formik.errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-800 hover:bg-blue-900 transition"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-center mt-6 text-white/80">
          Need help? <a href="#" className="underline text-white">Contact support</a>
        </p>
      </motion.div>
    </div>
  );
}