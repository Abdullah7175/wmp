"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function CeUsersList() {
  const [ceUsers, setCeUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchCeUsers();
  }, []);

  const fetchCeUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ce-users');
      if (!response.ok) {
        throw new Error('Failed to fetch CE users');
      }
      const data = await response.json();
      setCeUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this CE user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ce-users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete CE user');
      }

      toast({
        title: "CE User Deleted",
        description: "The CE user has been deleted successfully.",
        variant: "default",
      });

      fetchCeUsers();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getDepartmentColor = (department) => {
    switch (department?.toLowerCase()) {
      case 'water':
        return 'bg-blue-100 text-blue-800';
      case 'sewerage':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCeUsers = ceUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || 
                             user.department?.toLowerCase() === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading CE users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600">Error loading CE users: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/ce-users/add">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add CE User
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search CE users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Departments</option>
            <option value="water">Water</option>
            <option value="sewerage">Sewerage</option>
          </select>
        </div>
      </div>

      {/* CE Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCeUsers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No CE users found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first Chief Engineer user.</p>
                <Link href="/dashboard/ce-users/add">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add CE User
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredCeUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <p className="text-sm text-gray-600">{user.designation}</p>
                    </div>
                  </div>
                  <Badge className={getDepartmentColor(user.department)}>
                    {user.department || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{user.email}</span>
                  </div>
                  {user.contact_number && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{user.contact_number}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Department: {user.department || 'Not assigned'}</span>
                  </div>
                </div>

                {user.address && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    <strong>Address:</strong> {user.address}
                  </div>
                )}

                <div className="flex space-x-2 pt-3">
                  <Link href={`/dashboard/ce-users/edit/${user.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>CE Users Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{ceUsers.length}</div>
              <div className="text-sm text-gray-600">Total CE Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {ceUsers.filter(u => u.department === 'water').length}
              </div>
              <div className="text-sm text-gray-600">Water CE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {ceUsers.filter(u => u.department === 'sewerage').length}
              </div>
              <div className="text-sm text-gray-600">Sewerage CE</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
