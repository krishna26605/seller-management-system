/**
 * SELLER LOGIN PAGE
 * ==================
 * Login form for seller users.
 * Same structure as admin login but uses seller API endpoint.
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sellerAPI } from "@/services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, Store, Loader2 } from "lucide-react";

export default function SellerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await sellerAPI.login(data);

      login({
        token: response.token,
        role: response.role,
        user: response.user,
      });

      toast.success(`Welcome back, ${response.user.name}!`);
      router.push("/seller/products");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-gray-950 to-gray-950 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl
                            flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Seller Login</h1>
            <p className="text-gray-400 text-sm mt-1">
              Access your seller dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="seller@example.com"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                            placeholder-gray-500 text-sm outline-none
                            focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
                            ${errors.email ? "border-red-500" : "border-gray-700"}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                })}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-12 bg-gray-800 border rounded-xl text-white
                              placeholder-gray-500 text-sm outline-none
                              focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all
                              ${errors.password ? "border-red-500" : "border-gray-700"}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold
                         rounded-xl transition-all duration-200 text-sm
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2
                         shadow-lg shadow-emerald-500/20"
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
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Are you an admin?{" "}
          <a href="/admin/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Admin Login →
          </a>
        </p>
      </div>
    </div>
  );
}
