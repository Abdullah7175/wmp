"use client";
import { useState } from "react";
import { useSession, update } from "next-auth/react";
import { CheckCircle, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";

export default function CeoImageMigration() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runMigration = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/ceo/migrate-image', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        
        // Update session with new image path
        if (data.data.user.image) {
          await updateSession({
            user: {
              ...session.user,
              image: data.data.user.image
            }
          });
        }
      } else {
        setError(data.message || 'Migration failed');
      }
    } catch (err) {
      console.error('Error running migration:', err);
      setError('Failed to run migration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current Image Path:</span>
            <span className="text-sm text-gray-900 font-mono">
              {session?.user?.image || 'No image'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">User ID:</span>
            <span className="text-sm text-gray-900">{session?.user?.id}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">User Name:</span>
            <span className="text-sm text-gray-900">{session?.user?.name}</span>
          </div>
        </div>
      </div>

      {/* Migration Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Run Migration</h2>
        
        <p className="text-gray-600 mb-4">
          This will migrate your profile image from the old location (/uploads/users/) to the new location (/uploads/ceo/) and update the database accordingly.
        </p>
        
        <button
          onClick={runMigration}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Migrating...' : 'Run Image Migration'}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-green-900">Migration Successful!</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-800">Message:</span>
              <span className="text-sm text-green-700">{result.message}</span>
            </div>
            
            {result.data.oldPath && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-800">Old Path:</span>
                <span className="text-sm text-green-700 font-mono">{result.data.oldPath}</span>
              </div>
            )}
            
            {result.data.newPath && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-800">New Path:</span>
                <span className="text-sm text-green-700 font-mono">{result.data.newPath}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Next Steps:</strong> The image has been migrated and your session has been updated. 
              You should now see your profile image in the sidebar. If not, try refreshing the page.
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">Migration Failed</h3>
          </div>
          <p className="text-sm text-red-800 mt-2">{error}</p>
        </div>
      )}
    </div>
  );
}
