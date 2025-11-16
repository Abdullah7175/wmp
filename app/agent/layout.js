"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AgentSidebar } from "./AgentSidebar";
import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation";
import { useState , useEffect} from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import RouteGuard from "@/components/RouteGuard";

export default function Layout({ children }) {
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    useEffect(() => {
      if (!session?.user?.id) return;

      const fetchNotifications = async () => {
        try {
          const res = await fetch("/api/notifications");
          if (!res.ok) {
            console.error("Failed to fetch notifications", res.status);
            setNotifications([]);
            return;
          }

          const payload = await res.json();
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

          const userId = session.user.id;
          const filtered = list.filter((n) => {
            const targetId = n.user_id ?? n.userId ?? n.recipient_id ?? n.recipientId;
            return !userId || targetId === userId;
          });

          setNotifications(filtered);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setNotifications([]);
        }
      };

      fetchNotifications();
    }, [session?.user?.id]);

    const handleLogout = async () => {
      setLoading(true);
      try {
        await signOut({ 
          redirect: true,
          callbackUrl: '/login'
        });
      } catch (error) {
        console.error('Logout error:', error);
        setLoading(false);
      }
    };

    const handleNotificationClick = async (notif) => {
      // Mark notification as read
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id })
      });
      setNotifications(notifications.filter(n => n.id !== notif.id));
      if (notif.type === 'request' && notif.entity_id) {
        router.push(`/agent/requests/${notif.entity_id}`);
      }
      // Add more navigation logic for other types if needed
    };

    return (
        <SidebarProvider>
            <AgentSidebar />
            <main className="w-full">
                <RouteGuard>
                <div className="h-16 border-b w-full bg-gray-800 text-white flex items-center justify-between p-4 shadow-sm">
                    <div className="flex gap-4 items-center">
                        <SidebarTrigger />
                        <h1 className="text-2xl font-semibold hidden md:block">Works Management Portal</h1>
                        <h1 className="text-2xl font-bold block md:hidden">WMP</h1>
                    </div>
                    <div className="flex gap-4">
                        {/* Notification Bell */}
                        <div className="relative">
                          <button onClick={() => setShowDropdown(v => !v)} className="relative">
                            <Bell className="w-6 h-6" />
                            {notifications.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{notifications.length}</span>
                            )}
                          </button>
                          {showDropdown && notifications.length > 0 && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                              <div className="p-2 font-semibold border-b">Notifications</div>
                              <ul>
                                {notifications.map(n => (
                                  <li key={n.id} className="p-2 hover:bg-gray-100 border-b last:border-b-0 cursor-pointer" onClick={() => handleNotificationClick(n)}>
                                    <div className="font-medium text-black">{n.message || "No message"}</div>
                                    <div className="text-xs text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Button 
                          onClick={handleLogout} 
                          variant="secondary" 
                          className="border px-3"
                          disabled={loading}
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
                {children}
                <Toaster />
                </RouteGuard>
            </main>
        </SidebarProvider>
    );
}
