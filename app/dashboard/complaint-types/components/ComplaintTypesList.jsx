"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Eye, Building2, Users, FileText } from "lucide-react";

export default function ComplaintTypesList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && parseInt(session.user.role) === 1) {
      fetchComplaintTypes();
    } else if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && parseInt(session.user.role) !== 1) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [status, session]);

  const fetchComplaintTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/complaint-types");
      if (!res.ok) {
        throw new Error(`Failed to fetch complaint types: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setComplaintTypes(data.data);
      } else {
        setError(data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, typeName) => {
    const confirmed = confirm(
      `Are you sure you want to delete the complaint type "${typeName}"?\n\nThis action cannot be undone and will remove it from the system.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/complaint-types/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete complaint type: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Complaint type deleted successfully.",
          variant: "success",
        });
        fetchComplaintTypes(); // Refresh the list
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

  if (loading) return <div className="text-center py-8">Loading complaint types...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (complaintTypes.length === 0) return <div className="text-center py-8 text-gray-500">No complaint types found.</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Types</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaintTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Complaint types in system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subtypes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complaintTypes.reduce((sum, type) => sum + parseInt(type.subtype_count), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Subtypes across all types
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CE Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complaintTypes.reduce((sum, type) => sum + parseInt(type.assigned_ce_count), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              CE user assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Complaint Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Subtypes</TableHead>
                <TableHead>CE Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaintTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.type_name}</TableCell>
                  <TableCell>
                    {type.description ? (
                      <span className="text-sm text-gray-600">{type.description}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {type.subtype_count} subtypes
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={parseInt(type.assigned_ce_count) > 0 ? "default" : "outline"}>
                      {type.assigned_ce_count} CE users
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(type.created_date).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/complaint-types/${type.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/complaint-types/edit/${type.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(type.id, type.type_name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Eye, Building2, Users, FileText } from "lucide-react";

export default function ComplaintTypesList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && parseInt(session.user.role) === 1) {
      fetchComplaintTypes();
    } else if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && parseInt(session.user.role) !== 1) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [status, session]);

  const fetchComplaintTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/complaint-types");
      if (!res.ok) {
        throw new Error(`Failed to fetch complaint types: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setComplaintTypes(data.data);
      } else {
        setError(data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, typeName) => {
    const confirmed = confirm(
      `Are you sure you want to delete the complaint type "${typeName}"?\n\nThis action cannot be undone and will remove it from the system.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/complaint-types/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete complaint type: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Complaint type deleted successfully.",
          variant: "success",
        });
        fetchComplaintTypes(); // Refresh the list
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

  if (loading) return <div className="text-center py-8">Loading complaint types...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (complaintTypes.length === 0) return <div className="text-center py-8 text-gray-500">No complaint types found.</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Types</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaintTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Complaint types in system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subtypes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complaintTypes.reduce((sum, type) => sum + parseInt(type.subtype_count), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Subtypes across all types
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CE Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complaintTypes.reduce((sum, type) => sum + parseInt(type.assigned_ce_count), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              CE user assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Complaint Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Subtypes</TableHead>
                <TableHead>CE Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaintTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.type_name}</TableCell>
                  <TableCell>
                    {type.description ? (
                      <span className="text-sm text-gray-600">{type.description}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {type.subtype_count} subtypes
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={parseInt(type.assigned_ce_count) > 0 ? "default" : "outline"}>
                      {type.assigned_ce_count} CE users
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(type.created_date).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/complaint-types/${type.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/complaint-types/edit/${type.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(type.id, type.type_name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
