"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone,
  Calendar,
  Building2,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";

export default function CeoUsersList({ ceoUsers }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete CEO user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/ceo-users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete CEO user');
      }

      alert('CEO user deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting CEO user:', error);
      alert('Error deleting CEO user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            CEO Users ({ceoUsers.length})
          </h2>
          <p className="text-gray-600 mt-1">
            Only administrators can create and manage CEO accounts
          </p>
        </div>
        
        <button
          onClick={() => router.push('/dashboard/ceo-users/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add CEO User</span>
        </button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              CEO users have full approval authority over work requests. Only create CEO accounts for authorized personnel.
            </p>
          </div>
        </div>
      </div>

      {/* CEO Users List */}
      {ceoUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CEO Users Found</h3>
          <p className="text-gray-500 mb-6">
            Create the first CEO user to enable the approval workflow system.
          </p>
          <button
            onClick={() => router.push('/dashboard/ceo-users/add')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Create First CEO User
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              CEO Users List
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {ceoUsers.map((user) => (
              <div key={user.id} className="px-6 py-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-300">
                      {user.image ? (
                        <Image 
                          src={user.image} 
                          alt={user.name} 
                          width={48}  
                          height={48} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          CEO
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          
                          {user.contact_number && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{user.contact_number}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {new Date(user.created_date).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>Role: Chief Executive Officer</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/ceo-users/edit/${user.id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                      title="Edit CEO User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      disabled={isLoading}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                      title="Delete CEO User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
