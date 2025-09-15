"use client";
import { useState } from "react";
import CeoSidebar from "./CeoSidebar";
import { Menu } from "lucide-react";

export default function CeoLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">CEO Portal</h1>
          <div className="w-10 h-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Sidebar */}
      <CeoSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
