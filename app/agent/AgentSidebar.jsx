import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Image as ImageIcon, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

const links = [
  {
    href: "/agent",
    label: "Home",
    icon: <Home className="w-5 h-5 mr-2" />,
  },
  {
    href: "/agent/requests",
    label: "Requests",
    icon: <List className="w-5 h-5 mr-2" />,
  },
  {
    href: "/agent/before-content",
    label: "Before Content",
    icon: <ImageIcon className="w-5 h-5 mr-2" />,
  },
  {
    href: "/agent/videos",
    label: "Engineer Videos",
    icon: <Video className="w-5 h-5 mr-2" />,
  },
  {
    href: "/agent/images",
    label: "Images",
    icon: <ImageIcon className="w-5 h-5 mr-2" />,
  },
];

export function AgentSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <aside className={`min-h-screen h-full ${collapsed ? "w-16" : "w-64"} bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-800 transition-all duration-200`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <span className={`text-xl font-bold tracking-wide transition-opacity duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>Engineer Panel</span>
      </div>
      <nav className="flex-1 py-6 px-2 space-y-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const iconClass = collapsed ? "w-10 h-8 mr-0" : "w-8 h-8 mr-2";
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-base hover:bg-gray-800 hover:text-blue-400 ${active ? "bg-gray-800 text-blue-400" : "text-white"}`}
            >
              {React.cloneElement(link.icon, { className: iconClass })}
              <span className={`transition-opacity duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto ml-2"}`}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-2 border-t border-gray-800 flex justify-end">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-400 hover:text-white">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
    </aside>
  );
} 