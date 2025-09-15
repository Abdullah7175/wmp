"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  Users, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  User,
  LogOut,
  BarChart3
} from "lucide-react";

export default function CeoSidebar() {
  const pathname = usePathname();
  const { data: session, update } = useSession();

  // Debug session changes
  useEffect(() => {
    console.log('CEO Sidebar - Session updated:', session?.user);
  }, [session]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/ceo",
      icon: LayoutDashboard,
    },
    {
      name: "Analytics",
      href: "/ceo/analytics",
      icon: BarChart3,
    },
    {
      name: "Pending Approvals",
      href: "/ceo/requests",
      icon: Clock,
      badge: "pending"
    },
    {
      name: "Approved Requests",
      href: "/ceo/approved",
      icon: CheckCircle,
    },
    {
      name: "Rejected Requests",
      href: "/ceo/rejected",
      icon: XCircle,
    },
    {
      name: "Notifications",
      href: "/ceo/notifications",
      icon: Bell,
      badge: "notifications"
    },
    {
      name: "Profile",
      href: "/ceo/profile",
      icon: User,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* CEO Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            {session?.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt={session.user.name || 'CEO'} 
                  width={40}  
                  height={40} 
                  className="object-cover w-full h-full"
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
            {session?.user?.image ? (
              <Image 
                src={session.user.image} 
                alt={session.user.name || 'CEO'} 
                width={40}  
                height={40} 
                className="object-cover w-full h-full"
                unoptimized
                onError={() => {
                  console.log('Image failed to load:', session.user.image);
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name || 'CEO'}
            </p>
            <p className="text-xs text-gray-500">Chief Executive Officer</p>
            {/* Debug info - remove this later */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-400">
                Image: {session?.user?.image ? 'Yes' : 'No'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
