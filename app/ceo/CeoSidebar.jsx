"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  Users, 
  Settings,
  Building2,
  User,
  LogOut,
  BarChart3,
  List,
  RefreshCw,
  Menu,
  X
} from "lucide-react";

export default function CeoSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { data: session, update } = useSession();
  const [imageError, setImageError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ceoImage, setCeoImage] = useState(null);

  // Debug session changes
  useEffect(() => {
    console.log('CEO Sidebar - Session updated:', session?.user);
    console.log('CEO Sidebar - Image URL:', session?.user?.image);
    // Reset image error when session changes
    setImageError(false);
  }, [session]);

  // Auto-refresh session on mount to get latest image
  useEffect(() => {
    if (session?.user?.id && !session?.user?.image) {
      console.log('No image in session, refreshing...');
      refreshSession();
    }
  }, [session?.user?.id]);

  // Fetch CEO image directly from database
  const fetchCeoImage = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/ceo/refresh-session', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success && result.data.user.image) {
        console.log('Setting CEO image from database:', result.data.user.image);
        setCeoImage(result.data.user.image);
        setImageError(false);
      }
    } catch (error) {
      console.error('Error fetching CEO image:', error);
    }
  };

  // Fetch image on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchCeoImage();
    }
  }, [session?.user?.id]);

  const refreshSession = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/ceo/refresh-session', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Refreshing session with:', result.data.user);
        await update({
          user: {
            ...session.user,
            name: result.data.user.name,
            email: result.data.user.email,
            image: result.data.user.image
          }
        });
        // Also update local image state
        if (result.data.user.image) {
          setCeoImage(result.data.user.image);
        }
        setImageError(false);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const navigation = [
    {
      name: "Analytics Dashboard",
      href: "/ceo",
      icon: BarChart3,
    },
    {
      name: "All Requests",
      href: "/ceo/requests",
      icon: List,
    },
    {
      name: "Profile",
      href: "/ceo/profile",
      icon: User,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* CEO Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              {(ceoImage || session?.user?.image) && !imageError ? (
                  <Image 
                    src={ceoImage || session.user.image} 
                    alt={session?.user?.name || 'CEO'} 
                    width={45}  
                    height={45} 
                    className="object-cover w-full h-full"
                    unoptimized
                    onLoad={() => {
                      console.log('Image loaded successfully:', ceoImage || session?.user?.image);
                      setImageError(false);
                    }}
                    onError={(e) => {
                      console.log('Image failed to load:', ceoImage || session?.user?.image);
                      console.log('Error event:', e);
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )} 
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CEO Portal</h1>
                <p className="text-sm text-gray-600">KW&SC Water Corporation</p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Close sidebar on mobile when link is clicked
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
                {item.badge && (
                  <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      {/* Logout Button */}
      <div className="mt-auto px-6 py-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
            {(ceoImage || session?.user?.image) && !imageError ? (
              <Image 
                src={ceoImage || session.user.image} 
                alt={session?.user?.name || 'CEO'} 
                width={40}  
                height={40} 
                className="object-cover w-full h-full"
                unoptimized
                onLoad={() => {
                  console.log('Image loaded successfully:', ceoImage || session?.user?.image);
                  setImageError(false);
                }}
                onError={(e) => {
                  console.log('Image failed to load:', ceoImage || session?.user?.image);
                  console.log('Error event:', e);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name || 'CEO'}
            </p>
            <p className="text-xs text-gray-500">Chief Executive Officer</p>
            {/* Debug info - remove this later */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400">
                <p>Session: {session?.user?.image ? 'Yes' : 'No'}</p>
                <p>Local: {ceoImage ? 'Yes' : 'No'}</p>
                <p>Display: {(ceoImage || session?.user?.image) ? 'Yes' : 'No'}</p>
              </div>
            )} */}
          </div>
          <button
            onClick={refreshSession}
            disabled={isRefreshing}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Refresh Profile Image"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
