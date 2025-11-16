"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Briefcase
} from "lucide-react";

export default function CEUsersList() {
  const [ceUsers, setCeUsers] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact_number: '',
    designation: '',
    address: '',
    departments: [],
    zone_ids: [],
    division_ids: [],
    district_ids: [],
    town_ids: []
  });

  useEffect(() => {
    fetchCEUsers();
    fetchComplaintTypes();
    fetchZones();
    fetchDivisions();
    fetchDistricts();
    fetchTowns();
  }, []);

  const fetchCEUsers = async () => {
    try {
      const response = await fetch('/api/admin/ce-users');
      const data = await response.json();
      
      if (data.success) {
        setCeUsers(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch CE users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching CE users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch CE users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintTypes = async () => {
    try {
      const response = await fetch('/api/admin/complaint-types');
      const data = await response.json();
      
      if (data.success) {
        setComplaintTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaint types:', error);
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

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.departments.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one department",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/ce-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          departments: formData.departments,
          zone_ids: formData.zone_ids,
          division_ids: formData.division_ids,
          district_ids: formData.district_ids,
          town_ids: formData.town_ids
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "CE user created successfully",
          variant: "default",
        });
        
        await fetchCEUsers();
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create CE user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating CE user:', error);
      toast({
        title: "Error",
        description: "Failed to create CE user",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.departments.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one department",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        contact_number: formData.contact_number,
        designation: formData.designation,
        address: formData.address,
        departments: formData.departments,
        zone_ids: formData.zone_ids,
        division_ids: formData.division_ids,
        district_ids: formData.district_ids,
        town_ids: formData.town_ids
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/ce-users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "CE user updated successfully",
          variant: "default",
        });
        
        await fetchCEUsers();
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update CE user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating CE user:', error);
      toast({
        title: "Error",
        description: "Failed to update CE user",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this CE user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ce-users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "CE user deleted successfully",
          variant: "default",
        });
        
        await fetchCEUsers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete CE user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting CE user:', error);
      toast({
        title: "Error",
        description: "Failed to delete CE user",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      contact_number: '',
      designation: '',
      address: '',
      departments: [],
      zone_ids: [],
      division_ids: [],
      district_ids: [],
      town_ids: []
    });
    setSelectedUser(null);
  };

  const openEditDialog = async (user) => {
    setSelectedUser(user);
    
    // Fetch full user data including geographic assignments
    try {
      const response = await fetch(`/api/admin/ce-users/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        const ceUser = data.data;
        setFormData({
          name: ceUser.name || user.name,
          email: ceUser.email || user.email,
          password: '',
          contact_number: ceUser.contact_number || user.contact_number || '',
          designation: ceUser.designation || user.designation || '',
          address: ceUser.address || user.address || '',
          departments: ceUser.assigned_department_ids || (user.departments ? user.departments.map(dept => dept.id || dept) : []),
          zone_ids: ceUser.assigned_zone_ids || [],
          division_ids: ceUser.assigned_division_ids || [],
          district_ids: ceUser.assigned_district_ids || [],
          town_ids: ceUser.assigned_town_ids || []
        });
      } else {
        // Fallback to basic user data
        setFormData({
          name: user.name,
          email: user.email,
          password: '',
          contact_number: user.contact_number || '',
          designation: user.designation || '',
          address: user.address || '',
          departments: user.departments ? user.departments.map(dept => dept.id || dept) : [],
          zone_ids: [],
          division_ids: [],
          district_ids: [],
          town_ids: []
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to basic user data
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        contact_number: user.contact_number || '',
        designation: user.designation || '',
        address: user.address || '',
        departments: user.departments ? user.departments.map(dept => dept.id || dept) : [],
        zone_ids: [],
        division_ids: [],
        district_ids: [],
        town_ids: []
      });
    }
    
    setIsEditDialogOpen(true);
  };

  const handleDepartmentChange = (departmentId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, departmentId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        departments: prev.departments.filter(id => id !== departmentId)
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading CE users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add User Button */}
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add CE User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New CE User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                  placeholder="Enter designation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Departments *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {complaintTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${type.id}`}
                        checked={formData.departments.includes(type.id)}
                        onCheckedChange={(checked) => handleDepartmentChange(type.id, checked)}
                      />
                      <Label htmlFor={`dept-${type.id}`} className="text-sm">
                        {type.type_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Assignment */}
              <div className="space-y-2 border-t pt-4">
                <Label className="text-base font-semibold">Geographic Assignment (Optional)</Label>
                <p className="text-xs text-gray-600 mb-3">
                  Optionally assign this CE user to specific geographic locations. If no locations are selected, they will have access to all locations within their assigned departments.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Zones */}
                  <div className="space-y-2">
                    <Label className="text-sm">Zones</Label>
                    <div className="border rounded p-2 max-h-32 overflow-y-auto">
                      {zones.length === 0 ? (
                        <p className="text-xs text-gray-500">No zones available</p>
                      ) : (
                        zones.map((zone) => (
                          <div key={zone.id} className="flex items-center space-x-2 mb-1">
                            <Checkbox
                              id={`add-zone-${zone.id}`}
                              checked={formData.zone_ids.includes(zone.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({ ...prev, zone_ids: [...prev.zone_ids, zone.id] }));
                                } else {
                                  setFormData(prev => ({ ...prev, zone_ids: prev.zone_ids.filter(id => id !== zone.id) }));
                                }
                              }}
                            />
                            <Label htmlFor={`add-zone-${zone.id}`} className="text-xs cursor-pointer">
                              {zone.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Divisions */}
                  <div className="space-y-2">
                    <Label className="text-sm">Divisions</Label>
                    <div className="border rounded p-2 max-h-32 overflow-y-auto">
                      {divisions.length === 0 ? (
                        <p className="text-xs text-gray-500">No divisions available</p>
                      ) : (
                        divisions.map((division) => (
                          <div key={division.id} className="flex items-center space-x-2 mb-1">
                            <Checkbox
                              id={`add-division-${division.id}`}
                              checked={formData.division_ids.includes(division.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({ ...prev, division_ids: [...prev.division_ids, division.id] }));
                                } else {
                                  setFormData(prev => ({ ...prev, division_ids: prev.division_ids.filter(id => id !== division.id) }));
                                }
                              }}
                            />
                            <Label htmlFor={`add-division-${division.id}`} className="text-xs cursor-pointer">
                              {division.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Districts */}
                  <div className="space-y-2">
                    <Label className="text-sm">Districts</Label>
                    <div className="border rounded p-2 max-h-32 overflow-y-auto">
                      {districts.length === 0 ? (
                        <p className="text-xs text-gray-500">No districts available</p>
                      ) : (
                        districts.map((district) => (
                          <div key={district.id} className="flex items-center space-x-2 mb-1">
                            <Checkbox
                              id={`add-district-${district.id}`}
                              checked={formData.district_ids.includes(district.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({ ...prev, district_ids: [...prev.district_ids, district.id] }));
                                } else {
                                  setFormData(prev => ({ ...prev, district_ids: prev.district_ids.filter(id => id !== district.id) }));
                                }
                              }}
                            />
                            <Label htmlFor={`add-district-${district.id}`} className="text-xs cursor-pointer">
                              {district.title}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Towns */}
                  <div className="space-y-2">
                    <Label className="text-sm">Towns</Label>
                    <div className="border rounded p-2 max-h-32 overflow-y-auto">
                      {towns.length === 0 ? (
                        <p className="text-xs text-gray-500">No towns available</p>
                      ) : (
                        towns.map((town) => (
                          <div key={town.id} className="flex items-center space-x-2 mb-1">
                            <Checkbox
                              id={`add-town-${town.id}`}
                              checked={formData.town_ids.includes(town.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({ ...prev, town_ids: [...prev.town_ids, town.id] }));
                                } else {
                                  setFormData(prev => ({ ...prev, town_ids: prev.town_ids.filter(id => id !== town.id) }));
                                }
                              }}
                            />
                            <Label htmlFor={`add-town-${town.id}`} className="text-xs cursor-pointer">
                              {town.town} {town.district_name ? `(${town.district_name})` : ''}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* CE Users List */}
      <div className="space-y-4">
        {ceUsers.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No CE Users Found</h3>
                <p>No Chief Engineer users have been created yet.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          ceUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      {user.name}
                      <Badge variant="outline">CE User</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span><strong>Email:</strong> {user.email}</span>
                    </div>
                    {user.contact_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span><strong>Contact:</strong> {user.contact_number}</span>
                      </div>
                    )}
                    {user.designation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span><strong>Designation:</strong> {user.designation}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {user.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span><strong>Address:</strong> {user.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Departments */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Assigned Departments:</div>
                  <div className="flex flex-wrap gap-2">
                    {user.departments && user.departments.length > 0 ? (
                      user.departments.map((dept) => (
                        <Badge key={dept.id || dept} variant="secondary">
                          {dept.type_name || dept}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No departments assigned</span>
                    )}
                  </div>
                </div>

                {/* Geographic Assignments */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Geographic Assignments:</div>
                  <div className="space-y-2">
                    {user.zones && user.zones.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">Zones: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.zones.map((zone) => (
                            <Badge key={zone.id} variant="outline" className="text-xs">
                              {zone.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.divisions && user.divisions.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">Divisions: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.divisions.map((division) => (
                            <Badge key={division.id} variant="outline" className="text-xs">
                              {division.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.districts && user.districts.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">Districts: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.districts.map((district) => (
                            <Badge key={district.id} variant="outline" className="text-xs">
                              {district.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.towns && user.towns.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">Towns: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.towns.map((town) => (
                            <Badge key={town.id} variant="outline" className="text-xs">
                              {town.town}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!user.zones || user.zones.length === 0) &&
                     (!user.divisions || user.divisions.length === 0) &&
                     (!user.districts || user.districts.length === 0) &&
                     (!user.towns || user.towns.length === 0) && (
                      <span className="text-sm text-gray-500">No geographic restrictions (access to all locations)</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit CE User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contact Number</Label>
                <Input
                  id="edit-contact"
                  value={formData.contact_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                  placeholder="Enter contact number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-designation">Designation</Label>
              <Input
                id="edit-designation"
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                placeholder="Enter designation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Departments *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {complaintTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-dept-${type.id}`}
                      checked={formData.departments.includes(type.id)}
                      onCheckedChange={(checked) => handleDepartmentChange(type.id, checked)}
                    />
                    <Label htmlFor={`edit-dept-${type.id}`} className="text-sm">
                      {type.type_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Assignment */}
            <div className="space-y-2 border-t pt-4">
              <Label className="text-base font-semibold">Geographic Assignment (Optional)</Label>
              <p className="text-xs text-gray-600 mb-3">
                Optionally assign this CE user to specific geographic locations. If no locations are selected, they will have access to all locations within their assigned departments.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Zones */}
                <div className="space-y-2">
                  <Label className="text-sm">Zones</Label>
                  <div className="border rounded p-2 max-h-32 overflow-y-auto">
                    {zones.length === 0 ? (
                      <p className="text-xs text-gray-500">No zones available</p>
                    ) : (
                      zones.map((zone) => (
                        <div key={zone.id} className="flex items-center space-x-2 mb-1">
                          <Checkbox
                            id={`edit-zone-${zone.id}`}
                            checked={formData.zone_ids.includes(zone.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({ ...prev, zone_ids: [...prev.zone_ids, zone.id] }));
                              } else {
                                setFormData(prev => ({ ...prev, zone_ids: prev.zone_ids.filter(id => id !== zone.id) }));
                              }
                            }}
                          />
                          <Label htmlFor={`edit-zone-${zone.id}`} className="text-xs cursor-pointer">
                            {zone.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Divisions */}
                <div className="space-y-2">
                  <Label className="text-sm">Divisions</Label>
                  <div className="border rounded p-2 max-h-32 overflow-y-auto">
                    {divisions.length === 0 ? (
                      <p className="text-xs text-gray-500">No divisions available</p>
                    ) : (
                      divisions.map((division) => (
                        <div key={division.id} className="flex items-center space-x-2 mb-1">
                          <Checkbox
                            id={`edit-division-${division.id}`}
                            checked={formData.division_ids.includes(division.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({ ...prev, division_ids: [...prev.division_ids, division.id] }));
                              } else {
                                setFormData(prev => ({ ...prev, division_ids: prev.division_ids.filter(id => id !== division.id) }));
                              }
                            }}
                          />
                          <Label htmlFor={`edit-division-${division.id}`} className="text-xs cursor-pointer">
                            {division.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Districts */}
                <div className="space-y-2">
                  <Label className="text-sm">Districts</Label>
                  <div className="border rounded p-2 max-h-32 overflow-y-auto">
                    {districts.length === 0 ? (
                      <p className="text-xs text-gray-500">No districts available</p>
                    ) : (
                      districts.map((district) => (
                        <div key={district.id} className="flex items-center space-x-2 mb-1">
                          <Checkbox
                            id={`edit-district-${district.id}`}
                            checked={formData.district_ids.includes(district.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({ ...prev, district_ids: [...prev.district_ids, district.id] }));
                              } else {
                                setFormData(prev => ({ ...prev, district_ids: prev.district_ids.filter(id => id !== district.id) }));
                              }
                            }}
                          />
                          <Label htmlFor={`edit-district-${district.id}`} className="text-xs cursor-pointer">
                            {district.title}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Towns */}
                <div className="space-y-2">
                  <Label className="text-sm">Towns</Label>
                  <div className="border rounded p-2 max-h-32 overflow-y-auto">
                    {towns.length === 0 ? (
                      <p className="text-xs text-gray-500">No towns available</p>
                    ) : (
                      towns.map((town) => (
                        <div key={town.id} className="flex items-center space-x-2 mb-1">
                          <Checkbox
                            id={`edit-town-${town.id}`}
                            checked={formData.town_ids.includes(town.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({ ...prev, town_ids: [...prev.town_ids, town.id] }));
                              } else {
                                setFormData(prev => ({ ...prev, town_ids: prev.town_ids.filter(id => id !== town.id) }));
                              }
                            }}
                          />
                          <Label htmlFor={`edit-town-${town.id}`} className="text-xs cursor-pointer">
                            {town.town} {town.district_name ? `(${town.district_name})` : ''}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
