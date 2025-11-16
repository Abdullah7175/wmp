"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, X } from "lucide-react";

export default function EditCeUserForm({ ceUserId }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedTowns, setSelectedTowns] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact_number: "",
    designation: "",
    address: ""
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
      fetchCeUserData();
      fetchDepartments();
      fetchZones();
      fetchDivisions();
      fetchDistricts();
      fetchTowns();
    }
  }, [status, ceUserId]);

  const fetchCeUserData = async () => {
    try {
      setInitialLoading(true);
      const res = await fetch(`/api/admin/ce-users/${ceUserId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch CE user: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        const ceUser = data.data;
        setFormData({
          name: ceUser.name || "",
          email: ceUser.email || "",
          password: "",
          confirmPassword: "",
          contact_number: ceUser.contact_number || "",
          designation: ceUser.designation || "",
          address: ceUser.address || ""
        });
        setSelectedDepartments(ceUser.assigned_department_ids || []);
        setSelectedZones(ceUser.assigned_zone_ids || []);
        setSelectedDivisions(ceUser.assigned_division_ids || []);
        setSelectedDistricts(ceUser.assigned_district_ids || []);
        setSelectedTowns(ceUser.assigned_town_ids || []);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
        router.push("/dashboard/ce-users");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      router.push("/dashboard/ce-users");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/complaint-types");
      if (!res.ok) {
        throw new Error(`Failed to fetch departments: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
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
    }
  };

  const fetchZones = async () => {
    try {
      const res = await fetch("/api/efiling/zones");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.zones) {
          setZones(data.zones);
        }
      }
    } catch (err) {
      console.error("Error fetching zones:", err);
    }
  };

  const fetchDivisions = async () => {
    try {
      const res = await fetch("/api/efiling/divisions");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.divisions) {
          setDivisions(data.divisions);
        }
      }
    } catch (err) {
      console.error("Error fetching divisions:", err);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await fetch("/api/districts");
      if (res.ok) {
        const data = await res.json();
        setDistricts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  const fetchTowns = async () => {
    try {
      const res = await fetch("/api/towns");
      if (res.ok) {
        const data = await res.json();
        setTowns(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching towns:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (departmentId, checked) => {
    if (checked) {
      setSelectedDepartments(prev => [...prev, departmentId]);
    } else {
      setSelectedDepartments(prev => prev.filter(id => id !== departmentId));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.designation.trim()) {
      toast({
        title: "Validation Error",
        description: "Designation is required.",
        variant: "destructive",
      });
      return false;
    }

    if (selectedDepartments.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one department must be selected.",
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
      const updateData = {
        name: formData.name,
        email: formData.email,
        contact_number: formData.contact_number,
        designation: formData.designation,
        address: formData.address,
        departments: selectedDepartments,
        zone_ids: selectedZones,
        division_ids: selectedDivisions,
        district_ids: selectedDistricts,
        town_ids: selectedTowns
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const res = await fetch(`/api/admin/ce-users/${ceUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "CE user updated successfully.",
          variant: "success",
        });
        router.push("/dashboard/ce-users");
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
    router.push("/dashboard/ce-users");
  };

  if (status === "loading" || initialLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit Chief Engineer User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Security</h3>
                <p className="text-sm text-gray-600">
                  Leave password fields empty to keep current password
                </p>
                
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* CE Specific Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chief Engineer Information</h3>
              
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  name="designation"
                  type="text"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g., Chief Engineer, Senior Engineer"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter physical address"
                  rows={3}
                />
              </div>
            </div>

            {/* Department Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Department Assignment *</h3>
              <p className="text-sm text-gray-600">
                Select the departments (complaint types) this CE user will be responsible for:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept.id}`}
                      checked={selectedDepartments.includes(dept.id)}
                      onCheckedChange={(checked) => handleDepartmentChange(dept.id, checked)}
                    />
                    <Label htmlFor={`dept-${dept.id}`} className="text-sm">
                      {dept.type_name}
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedDepartments.length === 0 && (
                <p className="text-sm text-red-600">
                  Please select at least one department.
                </p>
              )}
            </div>

            {/* Geographic Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Geographic Assignment (Optional)</h3>
              <p className="text-sm text-gray-600">
                Optionally assign this CE user to specific geographic locations. If no locations are selected, they will have access to all locations within their assigned departments.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zones */}
                <div className="space-y-2">
                  <Label>Zones</Label>
                  <div className="border rounded p-3 max-h-40 overflow-y-auto">
                    {zones.length === 0 ? (
                      <p className="text-sm text-gray-500">No zones available</p>
                    ) : (
                      zones.map((zone) => (
                        <div key={zone.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`zone-${zone.id}`}
                            checked={selectedZones.includes(zone.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedZones(prev => [...prev, zone.id]);
                              } else {
                                setSelectedZones(prev => prev.filter(id => id !== zone.id));
                              }
                            }}
                          />
                          <Label htmlFor={`zone-${zone.id}`} className="text-sm cursor-pointer">
                            {zone.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Divisions */}
                <div className="space-y-2">
                  <Label>Divisions</Label>
                  <div className="border rounded p-3 max-h-40 overflow-y-auto">
                    {divisions.length === 0 ? (
                      <p className="text-sm text-gray-500">No divisions available</p>
                    ) : (
                      divisions.map((division) => (
                        <div key={division.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`division-${division.id}`}
                            checked={selectedDivisions.includes(division.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDivisions(prev => [...prev, division.id]);
                              } else {
                                setSelectedDivisions(prev => prev.filter(id => id !== division.id));
                              }
                            }}
                          />
                          <Label htmlFor={`division-${division.id}`} className="text-sm cursor-pointer">
                            {division.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Districts */}
                <div className="space-y-2">
                  <Label>Districts</Label>
                  <div className="border rounded p-3 max-h-40 overflow-y-auto">
                    {districts.length === 0 ? (
                      <p className="text-sm text-gray-500">No districts available</p>
                    ) : (
                      districts.map((district) => (
                        <div key={district.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`district-${district.id}`}
                            checked={selectedDistricts.includes(district.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDistricts(prev => [...prev, district.id]);
                              } else {
                                setSelectedDistricts(prev => prev.filter(id => id !== district.id));
                              }
                            }}
                          />
                          <Label htmlFor={`district-${district.id}`} className="text-sm cursor-pointer">
                            {district.title}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Towns */}
                <div className="space-y-2">
                  <Label>Towns</Label>
                  <div className="border rounded p-3 max-h-40 overflow-y-auto">
                    {towns.length === 0 ? (
                      <p className="text-sm text-gray-500">No towns available</p>
                    ) : (
                      towns.map((town) => (
                        <div key={town.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`town-${town.id}`}
                            checked={selectedTowns.includes(town.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTowns(prev => [...prev, town.id]);
                              } else {
                                setSelectedTowns(prev => prev.filter(id => id !== town.id));
                              }
                            }}
                          />
                          <Label htmlFor={`town-${town.id}`} className="text-sm cursor-pointer">
                            {town.town} {town.district_name ? `(${town.district_name})` : ''}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
                    Update CE User
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