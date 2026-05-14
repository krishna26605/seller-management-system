/**
 * AXIOS INSTANCE CONFIGURATION
 * ==============================
 * Creates a pre-configured Axios instance for all API calls.
 *
 * Why a custom Axios instance?
 * - Set base URL once (not repeated in every API call)
 * - Add request interceptors (auto-attach JWT token to every request)
 * - Add response interceptors (handle 401 errors globally, redirect to login)
 *
 * HOW INTERCEPTORS WORK:
 * - Request Interceptor: Runs BEFORE every request is sent
 *   → Reads token from localStorage
 *   → Adds "Authorization: Bearer <token>" header automatically
 *   → No need to manually add auth header in every API call
 *
 * - Response Interceptor: Runs AFTER every response is received
 *   → If 401 (Unauthorized): token expired or invalid
 *   → Clears localStorage (remove old token)
 *   → Redirects to appropriate login page
 */

import axios from "axios";

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // From .env.local
  timeout: 30000, // 30 second timeout for requests
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

/**
 * Automatically adds JWT token to every outgoing request.
 *
 * Flow:
 * 1. User makes any API call (e.g., axios.get('/seller/products'))
 * 2. Interceptor runs before request is sent
 * 3. Reads token from localStorage
 * 4. Adds Authorization header
 * 5. Request proceeds with token attached
 *
 * Result: You never have to manually add auth headers in components!
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Read token from localStorage (set during login)
    const token = localStorage.getItem("token");

    if (token) {
      // Add JWT to Authorization header
      // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Return modified config to proceed with request
  },
  (error) => {
    // If there's an error creating the request
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

/**
 * Handles authentication errors globally.
 *
 * Flow for 401 error:
 * 1. API returns 401 (token expired/invalid)
 * 2. Interceptor catches this error
 * 3. Clears all auth data from localStorage
 * 4. Redirects to correct login page based on stored role
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Successful response - just pass through
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      const role = localStorage.getItem("role");

      // Clear all stored auth data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      // Redirect to appropriate login page
      if (typeof window !== "undefined") {
        if (role === "admin") {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/seller/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
