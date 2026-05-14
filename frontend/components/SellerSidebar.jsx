/**
 * SELLER SIDEBAR COMPONENT
 * =========================
 * Navigation sidebar for the seller dashboard.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Package, PlusCircle, LogOut, Store } from "lucide-react";

const sellerNavItems = [
  {
    label: "My Products",
    href: "/seller/products",
    icon: Package,
  },
  {
    label: "Add Product",
    href: "/seller/add-product",
    icon: PlusCircle,
  },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Seller Portal</p>
            <p className="text-gray-400 text-xs">Product Management</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {sellerNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
              {item.label}
              {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="px-4 py-3 mb-2 rounded-xl bg-gray-800">
          <p className="text-white text-sm font-medium truncate">{user?.name || "Seller"}</p>
          <p className="text-gray-400 text-xs truncate">{user?.email}</p>
        </div>
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
