/**
 * ADMIN LOGIN PAGE
 * =================
 * Login form for admin users.
 *
 * Features:
 * - React Hook Form for form management and validation
 * - Shows loading state during API call
 * - Shows error messages from server
 * - Saves token and redirects on success
 * - Password show/hide toggle
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminAPI } from "@/services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * React Hook Form setup
   * register: connects inputs to form state
   * handleSubmit: validates before calling onSubmit
   * formState.errors: contains validation errors
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /**
   * onSubmit - Called after successful form validation
   * @param {Object} data - { email, password }
   */
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Call admin login API
      const response = await adminAPI.login(data);

      // Save auth data to context and localStorage
      login({
        token: response.token,
        role: response.role,
        user: response.user,
      });

      toast.success("Welcome back, Admin!");

      // Redirect to admin dashboard
      router.push("/admin/sellers");
    } catch (error) {
      // Extract error message from API response
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-gray-950 to-gray-950 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-gray-400 text-sm mt-1">
              Sign in to access the admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className={`
                  w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                  placeholder-gray-500 text-sm outline-none
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-all duration-200
                  ${errors.email ? "border-red-500" : "border-gray-700"}
                `}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email",
                  },
                })}
              />
              {/* Validation error message */}
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`
                    w-full px-4 py-3 pr-12 bg-gray-800 border rounded-xl text-white
                    placeholder-gray-500 text-sm outline-none
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.password ? "border-red-500" : "border-gray-700"}
                  `}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold
                         rounded-xl transition-all duration-200 text-sm
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2
                         shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Default: admin@example.com / Admin@123
          </p>
        </div>

        {/* Seller login link */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Are you a seller?{" "}
          <a href="/seller/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Seller Login →
          </a>
        </p>
      </div>
    </div>
  );
}
