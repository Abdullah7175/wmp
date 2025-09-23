import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Image as ImageIcon, Video, Download, Upload, Home } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

// Role mapping function (same as in page.js)
const getRoleDisplay = (roleId) => {
  const roleMap = {
    1: "CAMERA MAN",
    2: "ASSISTANT", 
    3: "PHOTOGRAPHER",
    4: "VIDEO EDITOR",
    5: "MANAGER",
    6: "CONTENT CREATOR", 
    // Add more mappings as needed
  };
  return roleMap[roleId] || "UNKNOWN ROLE";
};

// Check if user has special role (video editor or manager)
const isSpecialRole = (roleId) => {
  return roleId === 4 || roleId === 5 || roleId === 6; // video_editor or manager
};

// Check if user is editor role (can view uploads)
const isEditorRole = (roleId) => {
  return roleId === 4; // VIDEO EDITOR
};

export function SmAgentSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // Get user role from session with better debugging
  // const userRole = session?.user?.role;
  const userRole = status === "authenticated" ? session?.user?.role : null;
  
  // Debug logging
  useEffect(() => {
    if (status === "loading") return;
    const debugEnabled = process.env.NODE_ENV !== 'production' || typeof window !== 'undefined' && window.localStorage?.getItem('DEBUG') === '1';
    if (!debugEnabled) return;
    // eslint-disable-next-line no-console
    console.log("SmAgentSidebar session status:", status, "user:", session?.user, "role:", userRole);
  }, [status, session, userRole]);
  
  // Base links for all social media agents
  const baseLinks = [
    {
      href: "/smagent",
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: "/smagent/assigned-requests",
      label: "Assigned Requests",
      icon: <List className="w-5 h-5" />,
    },
    {
      href: "/smagent/before-images",
      label: "Before Content",
      icon: <ImageIcon className="w-5 h-5" />,
    },
  ];

  // Editor-only links
  const editorLinks = [
    {
      href: "/smagent/my-uploads",
      label: "My Uploads",
      icon: <Download className="w-5 h-5" />,
    },
  ];

  // Special links for video editors and managers
  const specialLinks = [
    {
      href: "/smagent/final-videos",
      label: "Final Videos",
      icon: <Video className="w-5 h-5" />,
    },
    {
      href: "/smagent/final-videos/add",
      label: "Upload Final Video",
      icon: <Upload className="w-5 h-5" />,
    },
    {
      href: "/smagent/images/download",
      label: "Download Images",
      icon: <Download className="w-5 h-5" />,
    },
    {
      href: "/smagent/videos/download",
      label: "Download Videos",
      icon: <Download className="w-5 h-5" />,
    },
  ];

  // Combine links based on user role
  let links = [...baseLinks];
  
  // Add editor-only links for VIDEO EDITOR role
  if (isEditorRole(userRole)) {
    links = [...links, ...editorLinks];
  }
  
  // Add special links for video editors and managers
  if (isSpecialRole(userRole)) {
    links = [...links, ...specialLinks];
  }

  const getRoleDisplayText = () => {
    if (status === "loading") return "Loading...";
    if (status !== "authenticated") return "Not signed in";
    return getRoleDisplay(userRole);
  };

  if (status === "loading") {
    return (
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-800">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <span className="text-xl font-bold tracking-wide">Media Cell</span>
        </div>
        <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
          Loading...
        </div>
        <nav className="flex-1 py-6 px-2 space-y-2">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-800">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <span className="text-xl font-bold tracking-wide">Media Cell</span>
      </div>
      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
        {getRoleDisplayText()}
      </div>
      <nav className="flex-1 py-6 px-2 space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-base hover:bg-gray-800 hover:text-blue-400 ${
                active ? "bg-gray-800 text-blue-400" : "text-white"
              }`}
            >
              {link.icon}
              <span className="ml-2">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 