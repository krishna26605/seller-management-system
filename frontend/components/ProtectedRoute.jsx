/**
 * PROTECTED ROUTE COMPONENT
 * ==========================
 * Wraps pages/routes that require authentication.
 * If user is not logged in (or wrong role), redirects to login.
 *
 * Usage:
 *   // Only authenticated admins can see this page
 *   <ProtectedRoute allowedRole="admin">
 *     <AdminDashboard />
 *   </ProtectedRoute>
 *
 * HOW ROUTE PROTECTION WORKS:
 * 1. Component mounts
 * 2. Reads auth state from AuthContext
 * 3. If not authenticated: redirect to appropriate login
 * 4. If wrong role (seller trying to access admin page): redirect
 * 5. If correct role: render the children (actual page content)
 *
 * Why client-side protection?
 * - Simple to implement for this project
 * - JWT is in localStorage (server can't read it easily)
 * - For production, consider middleware.ts for server-side protection
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * LoadingSpinner - Shows while auth state is being determined
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * ProtectedRoute - Higher-Order Component for route protection
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to protect
 * @param {string} props.allowedRole - Required role: "admin" or "seller"
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to be restored from localStorage
    if (loading) return;

    if (!isAuthenticated) {
      // User is not logged in - redirect to appropriate login page
      if (allowedRole === "admin") {
        router.replace("/admin/login");
      } else {
        router.replace("/seller/login");
      }
      return;
    }

    // User is logged in but wrong role
    if (allowedRole && role !== allowedRole) {
      // Redirect to their correct dashboard
      if (role === "admin") {
        router.replace("/admin/sellers");
      } else {
        router.replace("/seller/products");
      }
    }
  }, [isAuthenticated, role, loading, allowedRole, router]);

  // Show spinner while determining auth state
  if (loading) return <LoadingSpinner />;

  // Not authenticated - will redirect (show nothing while redirecting)
  if (!isAuthenticated) return null;

  // Wrong role - will redirect
  if (allowedRole && role !== allowedRole) return null;

  // All checks passed - render the protected content
  return <>{children}</>;
}
