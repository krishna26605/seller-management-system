/**
 * AUTHENTICATION CONTEXT
 * =======================
 * React Context provides a way to share state globally
 * without passing props through every component level.
 *
 * This context manages:
 * - Current user authentication state
 * - Login/logout functions
 * - Role information (admin or seller)
 *
 * HOW REACT CONTEXT WORKS:
 * 1. Create context with createContext()
 * 2. Wrap app with <AuthProvider> (provides state to all children)
 * 3. Child components use useAuth() hook to access auth state
 *
 * Why Context for Auth?
 * - Any component can check if user is logged in
 * - No "prop drilling" (passing user through 10 components just to reach a button)
 * - Single source of truth for auth state
 *
 * Persistence:
 * - Auth data stored in localStorage (persists across page refreshes)
 * - On app load, reads from localStorage to restore auth state
 */

"use client"; // This is a Client Component (uses browser APIs like localStorage)

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Create the context
// null is the default value (before provider wraps the tree)
const AuthContext = createContext(null);

/**
 * AuthProvider - Wraps the app and provides auth state
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  // State: current authenticated user data
  const [user, setUser] = useState(null);

  // State: user's role ("admin" or "seller")
  const [role, setRole] = useState(null);

  // State: JWT token
  const [token, setToken] = useState(null);

  // State: true while checking localStorage on mount
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // ----------------------------------------
  // RESTORE AUTH STATE ON PAGE LOAD
  // ----------------------------------------
  /**
   * useEffect runs after component mounts (first render).
   * Reads saved auth data from localStorage to restore login state.
   * This prevents logout when user refreshes the page.
   */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedRole && savedUser) {
      setToken(savedToken);
      setRole(savedRole);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false); // Done checking - app can render now
  }, []); // Empty array: run once on mount

  // ----------------------------------------
  // LOGIN FUNCTION
  // ----------------------------------------
  /**
   * login - Saves auth data after successful API login
   *
   * @param {Object} authData - { token, role, user }
   *
   * Called after successful login API response.
   * Saves to both state (reactive) and localStorage (persistent).
   */
  const login = (authData) => {
    const { token, role, user } = authData;

    // Save to state (triggers re-render, components update)
    setToken(token);
    setRole(role);
    setUser(user);

    // Save to localStorage (persists across page refreshes)
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // ----------------------------------------
  // LOGOUT FUNCTION
  // ----------------------------------------
  /**
   * logout - Clears all auth data and redirects to login
   */
  const logout = () => {
    // Clear state
    setToken(null);
    setRole(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    // Redirect based on role
    if (role === "admin") {
      router.push("/admin/login");
    } else {
      router.push("/seller/login");
    }
  };

  // Value object passed to all consumers of this context
  const contextValue = {
    user,    // { id, name, email, ... }
    role,    // "admin" or "seller"
    token,   // JWT token string
    loading, // true while restoring from localStorage
    login,   // Function to save auth data
    logout,  // Function to clear auth data
    isAuthenticated: !!token, // Boolean: true if logged in
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Custom hook to access auth context
 *
 * @returns {Object} Auth context value
 *
 * Usage in any component:
 *   const { user, role, logout, isAuthenticated } = useAuth();
 *
 * Throws error if used outside of AuthProvider
 * (catches common mistake of forgetting to wrap with provider)
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
