"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from 'next-auth/react';
import { useUserContext } from "@/context/UserContext";
import { useSession } from "next-auth/react";

export default function Layout({ children }) {
    const router = useRouter();
    const { setUser } = useUserContext();
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
      const userId = session?.user?.id || (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}').id);
      if (!userId) return;
      const fetchNotifications = async () => {
        try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
            console.log('Notifications API response:', data);
            console.log('Raw notifications data:', data.data?.notifications);
            
            let notificationsData = [];
            
            // Handle the specific API response format: { success: true, data: { notifications: {...}, unreadCount: 0 } }
            // Note: notifications might be an object instead of array
            if (data && data.success && data.data) {
              if (Array.isArray(data.data.notifications)) {
                notificationsData = data.data.notifications;
              } else if (data.data.notifications && typeof data.data.notifications === 'object') {
                // If notifications is an object, convert it to array
                notificationsData = Object.values(data.data.notifications);
              }
            } else if (Array.isArray(data)) {
              notificationsData = data;
            } else if (data && Array.isArray(data.data)) {
              notificationsData = data.data;
            } else if (data && Array.isArray(data.notifications)) {
              notificationsData = data.notifications;
            } else if (data && typeof data === 'object') {
              // If data is an object but not an array, try to extract array from any property
              const possibleArrays = Object.values(data).filter(Array.isArray);
              if (possibleArrays.length > 0) {
                notificationsData = possibleArrays[0];
              }
            }
            
            // Final safety check - ensure we have an array
            if (!Array.isArray(notificationsData)) {
              console.warn('Notifications data is not an array:', notificationsData);
              notificationsData = [];
            }
            
            // Filter notifications safely - ensure valid objects with messages
            const filteredNotifications = notificationsData.filter(n => {
              return n && 
                     typeof n === 'object' && 
                     n.id && 
                     n.message && 
                     n.message.trim() !== '' &&
                     n.message !== 'No message';
            });
            
            console.log('Filtered notifications:', filteredNotifications);
            setNotifications(filteredNotifications);
          } else {
            console.error('Failed to fetch notifications:', res.status);
            setNotifications([]);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
        }
      };
      fetchNotifications();
    }, [session?.user?.id]);

    const handleNotificationClick = async (notif) => {
      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            notificationIds: [notif.id], 
            action: 'mark_read' 
          })
        });
        
        if (response.ok) {
          // Remove the notification from the list
          setNotifications(notifications.filter(n => n.id !== notif.id));
        } else {
          console.error('Failed to mark notification as read:', response.status);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
      
      // Optionally, navigate to request or assignment if notif.type/entity_id
      if (notif.entity_type === 'WORK_REQUEST' && notif.entity_id) {
        router.push(`/dashboard/requests/${notif.entity_id}`);
      }
    };

    const handleLogout = async () => {
      await signOut({ redirect: false });
      localStorage.removeItem('jwtToken');
      document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      if (setUser) setUser(null);
      router.push('/login');
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="h-16 border-b w-full bg-gray-800 text-white flex items-center justify-between p-4 shadow-sm">
                    <div className="flex gap-4 items-center">
                        <SidebarTrigger />
                        <h1 className="text-2xl font-semibold hidden md:block">Works Management Portal</h1>
                        <h1 className="text-2xl font-bold block md:hidden">WMP</h1>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={handleLogout} variant="secondary" className="border px-3">
                            <LogOut className="w-5 h-5" />
                        </Button>
                        <div className="relative">
                          <button onClick={() => setShowDropdown(v => !v)} className="relative">
                            <Bell className="w-5 h-5" />
                            {notifications.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{notifications.length}</span>
                            )}
                          </button>
                          {showDropdown && notifications.length > 0 && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                              <div className="p-2 font-semibold border-b">Notifications</div>
                              <ul>
                                {notifications.map((n, index) => (
                                  <li key={n.id || `notification-${index}`} className="p-2 hover:bg-gray-100 border-b last:border-b-0 cursor-pointer" onClick={() => handleNotificationClick(n)}>
                                    <div className="font-medium text-black">{n.message || "No message"}</div>
                                    <div className="text-xs text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                    </div>
                </div>
                {children}
                <Toaster />
            </main>
        </SidebarProvider>
    );
}