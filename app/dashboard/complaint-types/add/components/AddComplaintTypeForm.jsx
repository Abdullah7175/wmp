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

export default function AddComplaintTypeForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [efilingDepartments, setEfilingDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivisionIds, setSelectedDivisionIds] = useState([]);
  const [formData, setFormData] = useState({
    type_name: "",
    description: "",
    efiling_department_id: "",
    division_id: ""
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
      fetchEfilingDepartments();
      fetchDivisions();
    }
  }, [status]);

  const fetchEfilingDepartments = async () => {
    try {
      const res = await fetch("/api/efiling/departments");
      if (res.ok) {
        const data = await res.json();
        // API returns array directly, or empty array if error
        setEfilingDepartments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching e-filing departments:", error);
      setEfilingDepartments([]);
    }
  };

  const fetchDivisions = async () => {
    try {
      const res = await fetch("/api/efiling/divisions?is_active=true");
      if (res.ok) {
        const data = await res.json();
        // API returns { success: true, divisions: [...] }
        setDivisions(data.success && data.divisions ? data.divisions : []);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
      setDivisions([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // If division_id is set, clear it when efiling_department_id changes (optional logic)
    // If division_id is set, it means this is division-based, so we might want to keep it
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
        description: "Department name must be at least 2 characters long.",
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
      const payload = {
        ...formData,
        division_ids: selectedDivisionIds.length > 0 ? selectedDivisionIds : (formData.division_id ? [parseInt(formData.division_id)] : [])
      };
      
      const res = await fetch("/api/admin/complaint-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Complaint type created successfully.",
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

  if (status === "loading") {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create New Department</CardTitle>
          <p className="text-sm text-gray-600">
          Department represent different departments or categories of work requests.
            CE users can be assigned to one or more Departments.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type_name">Department Name *</Label>
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
                  Enter a descriptive name for this Department
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
                  Optional: Provide additional details about this Department
                </p>
              </div>

              <div>
                <Label htmlFor="efiling_department_id">E-Filing Department (Optional)</Label>
                <select
                  id="efiling_department_id"
                  name="efiling_department_id"
                  value={formData.efiling_department_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select e-filing department...</option>
                  {efilingDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Link this department to an e-filing department
                </p>
              </div>

              <div>
                <Label>Divisions (Multi-select)</Label>
                <p className="text-xs text-gray-500 mb-2">Select one or more divisions. Leave empty if this department is town-based.</p>
                <div className="max-h-48 overflow-y-auto border rounded p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {divisions.map((div) => (
                    <label key={div.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedDivisionIds.includes(div.id)}
                        onChange={() => {
                          if (selectedDivisionIds.includes(div.id)) {
                            setSelectedDivisionIds(prev => prev.filter(id => id !== div.id));
                          } else {
                            setSelectedDivisionIds(prev => [...prev, div.id]);
                          }
                        }}
                      />
                      <span>{div.name}</span>
                    </label>
                  ))}
                </div>
                {selectedDivisionIds.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedDivisionIds.length} division(s) selected
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Optional: If divisions are selected, this department will be division-based instead of town-based. Work requests for this department will use divisions instead of towns/subtowns.
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Department
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