"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, X } from "lucide-react";

export default function EditComplaintTypeForm({ complaintTypeId }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    type_name: "",
    description: ""
  });

  useEffect(() => {
    if (status === "authenticated" && parseInt(session.user.role) !== 1) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchComplaintTypeData();
    }
  }, [status, complaintTypeId]);

  const fetchComplaintTypeData = async () => {
    try {
      setInitialLoading(true);
      const res = await fetch(`/api/admin/complaint-types/${complaintTypeId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch complaint type: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        const complaintType = data.data;
        setFormData({
          type_name: complaintType.type_name || "",
          description: complaintType.description || ""
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
        router.push("/dashboard/complaint-types");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      router.push("/dashboard/complaint-types");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.type_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Type name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.type_name.trim().length < 2) {
      toast({
        title: "Validation Error",
        description: "Type name must be at least 2 characters long.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/complaint-types/${complaintTypeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Complaint type updated successfully.",
          variant: "success",
        });
        router.push("/dashboard/complaint-types");
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/complaint-types");
  };

  if (status === "loading" || initialLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit Complaint Type</CardTitle>
          <p className="text-sm text-gray-600">
            Update the details of this complaint type. Changes will affect CE user assignments and work requests.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type_name">Type Name *</Label>
                <Input
                  id="type_name"
                  name="type_name"
                  type="text"
                  value={formData.type_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Water Supply, Road Maintenance, Electricity"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a descriptive name for this complaint type
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a detailed description of this complaint type..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Provide additional details about this complaint type
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Complaint Type
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, X } from "lucide-react";

export default function EditComplaintTypeForm({ complaintTypeId }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    type_name: "",
    description: ""
  });

  useEffect(() => {
    if (status === "authenticated" && parseInt(session.user.role) !== 1) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchComplaintTypeData();
    }
  }, [status, complaintTypeId]);

  const fetchComplaintTypeData = async () => {
    try {
      setInitialLoading(true);
      const res = await fetch(`/api/admin/complaint-types/${complaintTypeId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch complaint type: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        const complaintType = data.data;
        setFormData({
          type_name: complaintType.type_name || "",
          description: complaintType.description || ""
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
        router.push("/dashboard/complaint-types");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      router.push("/dashboard/complaint-types");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.type_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Type name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.type_name.trim().length < 2) {
      toast({
        title: "Validation Error",
        description: "Type name must be at least 2 characters long.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/complaint-types/${complaintTypeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Complaint type updated successfully.",
          variant: "success",
        });
        router.push("/dashboard/complaint-types");
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/complaint-types");
  };

  if (status === "loading" || initialLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit Complaint Type</CardTitle>
          <p className="text-sm text-gray-600">
            Update the details of this complaint type. Changes will affect CE user assignments and work requests.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type_name">Type Name *</Label>
                <Input
                  id="type_name"
                  name="type_name"
                  type="text"
                  value={formData.type_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Water Supply, Road Maintenance, Electricity"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a descriptive name for this complaint type
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a detailed description of this complaint type..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Provide additional details about this complaint type
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Complaint Type
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
