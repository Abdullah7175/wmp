import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    FileText, 
    Bell,
    UserCheck,
    Calendar,
    ChevronLeft, 
    ChevronRight,
    LogOut,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import React from "react";

// Simplified sidebar for external users (ADLFA/CON)
const links = [
    {
        href: "/efilinguser/files",
        label: "My Files",
        icon: <FileText className="w-5 h-5 mr-2" />,
    },
    {
        href: "/efilinguser/notifications",
        label: "Notifications",
        icon: <Bell className="w-5 h-5 mr-2" />,
    },
    {
        href: "/efilinguser/settings/profile",
        label: "My Profile",
        icon: <UserCheck className="w-5 h-5 mr-2" />,
    },
    {
        href: "/efilinguser/daak",
        label: "E-Posted (Daak)",
        icon: <FileText className="w-5 h-5 mr-2" />,
    },
    {
        href: "/efilinguser/meetings",
        label: "Meetings",
        icon: <Calendar className="w-5 h-5 mr-2" />,
    },
];

export function EFileSidebarExternal() {
    const pathname = usePathname();
    const router = useRouter();
    const { state, toggleSidebar } = useSidebar();
    const collapsed = state === "collapsed";

    const isActive = (href) => {
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            // Call logout API
            await fetch('/api/users/logout', { method: 'GET' });
            
            // Clear any local storage or session data
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Redirect to main page
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect even if logout API fails
            router.push('/');
        }
    };

    return (
        <aside className={`min-h-screen h-full ${collapsed ? "w-16" : "w-64"} bg-blue-900 text-white flex flex-col shadow-lg border-r border-blue-800 transition-all duration-200`}>
            <div className="flex items-center justify-center h-16 border-b border-blue-800">
                <span className={`text-xl font-bold tracking-wide transition-opacity duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                    KWSC
                </span>
            </div>
            
            <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const active = isActive(link.href);
                    
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-base hover:bg-blue-800 hover:text-blue-200 ${
                                active ? "bg-blue-800 text-blue-200" : "text-white"
                            }`}
                        >
                            {React.cloneElement(link.icon, { 
                                className: collapsed ? "w-10 h-8 mr-0" : "w-8 h-8 mr-2" 
                            })}
                            <span className={`transition-opacity duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto ml-2"}`}>
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            
            <div className="mt-auto p-2 border-t border-blue-800">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-blue-300 hover:text-white w-full">
                    {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </Button>
            </div>
        </aside>
    );
}
