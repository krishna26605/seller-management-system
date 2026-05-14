/**
 * ADMIN SIDEBAR COMPONENT
 * ========================
 * Navigation sidebar for the admin dashboard.
 * Shows navigation links and current user info.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  ShieldCheck,
} from "lucide-react";

// Navigation items for admin sidebar
const adminNavItems = [
  {
    label: "Sellers",
    href: "/admin/sellers",
    icon: Users,
  },
  {
    label: "Create Seller",
    href: "/admin/create-seller",
    icon: UserPlus,
  },
];

/**
 * AdminSidebar - Left navigation panel for admin pages
 */
export default function AdminSidebar() {
  const pathname = usePathname(); // Current URL path
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* ---- Logo / Brand ---- */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Admin Panel</p>
            <p className="text-gray-400 text-xs">Management System</p>
          </div>
        </div>
      </div>

      {/* ---- Navigation Links ---- */}
      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          // Check if this link is the current page
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-white" : "text-gray-500 group-hover:text-white"
                }`}
              />
              {item.label}
              {/* Active indicator dot */}
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ---- User Info + Logout ---- */}
      <div className="p-4 border-t border-gray-800">
        {/* User info */}
        <div className="px-4 py-3 mb-2 rounded-xl bg-gray-800">
          <p className="text-white text-sm font-medium truncate">
            {user?.name || "Admin"}
          </p>
          <p className="text-gray-400 text-xs truncate">{user?.email}</p>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                     text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
