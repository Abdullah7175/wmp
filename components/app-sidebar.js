"use client"
import { UserProvider, useUserContext } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, Home, Signature, LogOut, ChevronDown, Map, ChartPie, Archive, CircleCheck, Bolt, UserIcon, GalleryThumbnails, NotebookText, Activity, PlusCircle, FileText } from "lucide-react";
import Image from "next/image";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";

const items = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
        visible: [1, 2, 3]
    },
    {
        title: "Reports",
        url: "/dashboard/reports",
        icon: ChartPie,
        visible: [1, 2, 3]
    },
    {
        title: "Generate Reports",
        url: "/dashboard/generate-reports",
        icon: NotebookText,
        visible: [1, 2]
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { user, loading } = useUserContext();
    const { data: session } = useSession();
    const userRole = parseInt(session?.user?.role || user?.role || 0);
    const isDualPortal = Boolean(session?.user?.isDualPortal || user?.isDualPortal || userRole === 1);
    const [canShowEfiling, setCanShowEfiling] = React.useState(false);

    React.useEffect(() => {
        let isMounted = true;
        const checkNetworkStatus = async () => {
            try {
                const res = await fetch('/api/auth/dual-portal-status');
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setCanShowEfiling(Boolean(data.showBothPortals || isDualPortal || data.isDualPortalUser || (data.isInternalNetwork && userRole === 1)));
                    }
                }
            } catch (err) {
                console.error("Sidebar network check failed:", err);
            }
        };
        if (isDualPortal) {
            checkNetworkStatus();
        }
        return () => {
            isMounted = false;
        };
    }, [isDualPortal, session?.user]);

    if (loading) {
        return (
            <Sidebar>
                <SidebarContent>
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </SidebarContent>
            </Sidebar>
        );
    }

    // Only render dashboard controls for valid dashboard roles (1: Super Admin, 2: Manager/Admin, 3: Operator) or dual portal users
    const hasDashboardAccess = [1, 2, 3].includes(userRole) || isDualPortal;

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-2">
                            {/* Logo Section */}
                            <div className="flex items-center justify-center gap-2">
                                <Image src="/logo.png" className="py-2 px-1" width="150" height="150" alt="logo" />
                            </div>

                            {/* User Profile Section */}
                            <Card className="mb-1 bg-transparent bg-white py-1 mt-1">
                                <CardContent className="p-0 flex items-center gap-3 px-4 py-2">
                                    <img
                                        src={user?.image || "/avatar.png"}
                                        alt="profile"
                                        width={40}
                                        height={40}
                                        className="rounded-xl"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/avatar.png";
                                        }}
                                    />
                                    <p className="text-muted-foreground">
                                        {user?.name || session?.user?.name || 'Guest'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Home Section */}
                            {items.map((item, index) => {
                                if (index === 0 && (item.visible.includes(userRole) || isDualPortal)) {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className={`text-base gap-2 py-6 px-2 ${pathname === item.url ? "font-bold text-blue-950" : ""}`}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className="w-5 h-5" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }
                                return null;
                            })}

                            {/* Dual Portal Switch Button - ONLY shown when IP is in allowed EFILING_ALLOWED_IPS */}
                            {canShowEfiling && (
                                <SidebarMenuItem className="my-1">
                                    <SidebarMenuButton
                                        asChild
                                        className="text-sm gap-2 py-5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg shadow-sm transition-all font-medium"
                                    >
                                        <Link href={userRole === 1 ? "/efiling" : "/efilinguser"}>
                                            <FileText className="w-4 h-4 text-white" />
                                            <span>Switch to E-Filing</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}

                            {/* Location Control Section (Admin / Manager) */}
                            {hasDashboardAccess && [1, 2].includes(userRole) && (
                                <Collapsible className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className={`text-base gap-2 py-6`}>
                                                <Map className="w-5 h-5" />
                                                <span>Location Control</span>
                                                <ChevronDown />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/districts" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/districts">
                                                        <span>Manage Districts</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/towns" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/towns">
                                                        <span>Manage Towns</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/subtowns" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/subtowns">
                                                        <span>Manage Subtowns</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )}

                            {/* Department Control Section (Admin / Manager) */}
                            {hasDashboardAccess && [1, 2].includes(userRole) && (
                                <Collapsible className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className={`text-base gap-2 py-6`}>
                                                <Bolt className="w-5 h-5" />
                                                <span>Department Control</span>
                                                <ChevronDown />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/complaint-types" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/complaint-types">
                                                        <span>Departments</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/complaints/sub-types" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/complaints/sub-types">
                                                        <span>Works</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )}

                            {/* Request Control Section (Admin, Manager, Operator) */}
                            {hasDashboardAccess && [1, 2, 3].includes(userRole) && (
                                <Collapsible className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild> 
                                            <SidebarMenuButton className={`text-base gap-2 py-6`}>
                                                <NotebookText className="w-5 h-5" />
                                                <span>Request Control</span>
                                                <ChevronDown />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/requests" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/requests">
                                                        <span>Requests</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                {[1, 2].includes(userRole) && (
                                                    <SidebarMenuSubItem
                                                        className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/requests/new" ? "font-bold text-blue-950" : ""}`}
                                                    >
                                                        <Link href="/dashboard/requests/new">
                                                            <span>Add Requests</span>
                                                        </Link>
                                                    </SidebarMenuSubItem>
                                                )}
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/videos" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/videos">
                                                        <span>Videos</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/milestone-content" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/milestone-content">
                                                        <span>Milestone Progress</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                {[1, 2].includes(userRole) && (
                                                    <SidebarMenuSubItem
                                                        className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/milestone-content/add" ? "font-bold text-blue-950" : ""}`}
                                                    >
                                                        <Link href="/dashboard/milestone-content/add">
                                                            <span>Add Milestones</span>
                                                        </Link>
                                                    </SidebarMenuSubItem>
                                                )}
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/final-videos" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/final-videos">
                                                        <span>Final Videos</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/images" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/images">
                                                        <span>Images</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/before-images" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/before-images">
                                                        <span>Before Content</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )}

                            {/* User Control Section (Admin / Manager) */}
                            {hasDashboardAccess && [1, 2].includes(userRole) && (
                                <Collapsible className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className={`text-base gap-2 py-6`}>
                                                <UserIcon className="w-5 h-5" />
                                                <span>User Control</span>
                                                <ChevronDown />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/users" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/users">
                                                        <span>Users</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/agents" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/agents">
                                                        <span>Engineers/Contractors</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/socialmediaagent" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/socialmediaagent">
                                                        <span>Media Cell Agents</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                                {userRole === 1 && (
                                                    <SidebarMenuSubItem
                                                        className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/ceo-users" ? "font-bold text-blue-950" : ""}`}
                                                    >
                                                        <Link href="/dashboard/ceo-users">
                                                            <span>CEO Users</span>
                                                        </Link>
                                                    </SidebarMenuSubItem>
                                                )}
                                                {userRole === 1 && (
                                                    <SidebarMenuSubItem
                                                        className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/ce-users" ? "font-bold text-blue-950" : ""}`}
                                                    >
                                                        <Link href="/dashboard/ce-users">
                                                            <span>CE Users</span>
                                                        </Link>
                                                    </SidebarMenuSubItem>
                                                )}
                                                {userRole === 1 && (
                                                    <SidebarMenuSubItem
                                                        className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/user-actions" ? "font-bold text-blue-950" : ""}`}
                                                    >
                                                        <Link href="/dashboard/user-actions">
                                                            <span>User Actions</span>
                                                        </Link>
                                                    </SidebarMenuSubItem>
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )}

                            {/* Milestone Control Section (Admin / Manager) */}
                            {hasDashboardAccess && [1, 2].includes(userRole) && (
                                <Collapsible className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className={`text-base gap-2 py-6`}>
                                                <Activity className="w-5 h-5" />
                                                <span>Milestones Control</span>
                                                <ChevronDown />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem
                                                    className={`py-2 text-base ml-2 text-gray-500 underline ${pathname === "/dashboard/milestones" ? "font-bold text-blue-950" : ""}`}
                                                >
                                                    <Link href="/dashboard/milestones">
                                                        <span>Manage Milestones</span>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )}

                            {/* Render Remaining Items (Reports etc) */}
                            {items.slice(1).map((item) => {
                                if (item.visible.includes(userRole) || isDualPortal) {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className={`text-base gap-2 py-6 px-2 ${pathname === item.url ? "font-bold text-blue-950" : ""}`}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className="w-5 h-5" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }
                                return null;
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-sm p-4 text-gray-400">&copy; copyright 2025</SidebarFooter>
        </Sidebar>
    );
}
