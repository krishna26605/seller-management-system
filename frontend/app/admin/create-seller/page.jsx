/**
 * CREATE SELLER PAGE
 * ==================
 * Form for admin to create a new seller account.
 *
 * Features:
 * - React Hook Form with validation
 * - Multi-select skills (toggle chips)
 * - Loading state on submit
 * - Success/error toast notifications
 * - Redirect to sellers list after creation
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import toast from "react-hot-toast";
import { UserPlus, Loader2, Eye, EyeOff, X } from "lucide-react";

// Available skills list for multi-select
const AVAILABLE_SKILLS = [
  "Node.js", "React", "MongoDB", "Express.js", "Next.js",
  "Python", "Django", "PostgreSQL", "MySQL", "TypeScript",
  "Vue.js", "Angular", "PHP", "Laravel", "AWS",
  "Docker", "GraphQL", "REST APIs", "Redis", "Firebase",
];

export default function CreateSellerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]); // Array of selected skill strings

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  /**
   * toggleSkill - Adds or removes a skill from selectedSkills array
   * @param {string} skill - Skill name to toggle
   */
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill) // Remove if already selected
        : [...prev, skill]               // Add if not selected
    );
  };

  /**
   * onSubmit - Sends create seller request to API
   * @param {Object} formData - Form field values
   */
  const onSubmit = async (formData) => {
    // Validate skills selection
    if (selectedSkills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    setIsLoading(true);
    try {
      await adminAPI.createSeller({
        ...formData,
        skills: selectedSkills, // Add selected skills to payload
      });

      toast.success("Seller created successfully!");
      reset(); // Clear form
      setSelectedSkills([]); // Clear skills
      router.push("/admin/sellers"); // Go to sellers list
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create seller";
      toast.error(message);

      // Show validation errors from server if any
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex min-h-screen bg-gray-950">
        <AdminSidebar />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <UserPlus className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">Create Seller</h1>
            </div>
            <p className="text-gray-400 text-sm ml-9">
              Create a new seller account
            </p>
          </div>

          {/* Form Card */}
          <div className="max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                                ${errors.name ? "border-red-500" : "border-gray-700"}`}
                    {...register("name", {
                      required: "Name is required",
                      minLength: { value: 2, message: "Min 2 characters" },
                      maxLength: { value: 500, message: "Max 500 characters" },
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="seller@example.com"
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                                ${errors.email ? "border-red-500" : "border-gray-700"}`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="9876543210"
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                              placeholder-gray-500 text-sm outline-none
                              focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                              ${errors.mobileNo ? "border-red-500" : "border-gray-700"}`}
                  maxLength="10"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  }}
                  {...register("mobileNo", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Enter exactly 10 digits",
                    },
                  })}
                />
                {errors.mobileNo && (
                  <p className="text-red-400 text-xs mt-1">{errors.mobileNo.message}</p>
                )}
              </div>

              {/* Country + State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="India"
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                                ${errors.country ? "border-red-500" : "border-gray-700"}`}
                    {...register("country", {
                      required: "Country is required",
                      maxLength: { value: 500, message: "Max 500 characters" },
                    })}
                  />
                  {errors.country && (
                    <p className="text-red-400 text-xs mt-1">{errors.country.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    State <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                                ${errors.state ? "border-red-500" : "border-gray-700"}`}
                    {...register("state", {
                      required: "State is required",
                      maxLength: { value: 500, message: "Max 500 characters" },
                    })}
                  />
                  {errors.state && (
                    <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>

              {/* Skills Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skills <span className="text-red-400">*</span>
                  <span className="text-gray-500 text-xs ml-2">
                    ({selectedSkills.length} selected)
                  </span>
                </label>

                {/* Selected Skills Display */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-600/20
                                   border border-indigo-500/30 text-indigo-300 text-xs rounded-full"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Skill Toggle Chips */}
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`
                          px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200
                          ${isSelected
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                          }
                        `}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters (A-z, 0-9, !@#$)"
                    className={`w-full px-4 py-3 pr-12 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                                ${errors.password ? "border-red-500" : "border-gray-700"}`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: "Password must contain uppercase, lowercase, number and special character",
                      },
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
                  <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/admin/sellers")}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300
                             text-sm font-medium rounded-xl transition-all border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white
                             text-sm font-semibold rounded-xl transition-all
                             disabled:opacity-60 flex items-center justify-center gap-2
                             shadow-lg shadow-indigo-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Seller"
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
