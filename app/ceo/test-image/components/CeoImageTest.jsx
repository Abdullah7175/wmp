"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { User, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

export default function CeoImageTest() {
  const { data: session, update } = useSession();
  const [testData, setTestData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTestData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ceo/test-image');
      const result = await response.json();
      
      if (result.success) {
        setTestData(result.data);
      } else {
        setError(result.message || 'Failed to fetch test data');
      }
    } catch (err) {
      console.error('Error fetching test data:', err);
      setError('Failed to fetch test data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestData();
  }, []);

  const refreshSession = async () => {
    try {
      await update();
      fetchTestData();
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">User ID:</p>
            <p className="text-sm text-gray-900">{session?.user?.id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Name:</p>
            <p className="text-sm text-gray-900">{session?.user?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Email:</p>
            <p className="text-sm text-gray-900">{session?.user?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Image URL:</p>
            <p className="text-sm text-gray-900 break-all">{session?.user?.image || 'N/A'}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={refreshSession}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Session
          </button>
        </div>
      </div>

      {/* Image Display Test */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Display Test</h2>
        
        <div className="flex items-center space-x-6">
          {/* Session Image */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Session Image</h3>
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 mx-auto">
              {session?.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt="Session Image" 
                  width={80}  
                  height={80} 
                  className="object-cover w-full h-full"
                  unoptimized
                  onLoad={() => console.log('Session image loaded successfully')}
                  onError={(e) => console.log('Session image failed to load:', e)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {session?.user?.image ? 'Has Image' : 'No Image'}
            </p>
          </div>

          {/* Database Image */}
          {testData && (
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Database Image</h3>
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 mx-auto">
                {testData.user.image ? (
                  <Image 
                    src={testData.user.image} 
                    alt="Database Image" 
                    width={80}  
                    height={80} 
                    className="object-cover w-full h-full"
                    unoptimized
                    onLoad={() => console.log('Database image loaded successfully')}
                    onError={(e) => console.log('Database image failed to load:', e)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {testData.user.image ? 'Has Image' : 'No Image'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Data */}
      {testData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Information</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">User Data</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(testData.user, null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Image Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Image Path:</span>
                    <span className="text-sm text-gray-900">{testData.imageInfo.imagePath || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">File Exists:</span>
                    {testData.imageInfo.exists ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-900">
                      {testData.imageInfo.exists ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Full Path:</span>
                    <span className="text-sm text-gray-900 break-all">{testData.imageInfo.fullPath || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Uploads Directory:</span>
                    <span className="text-sm text-gray-900 break-all">{testData.imageInfo.uploadsDir}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={fetchTestData}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh Test Data'}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
