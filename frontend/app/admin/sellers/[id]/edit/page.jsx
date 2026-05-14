/**
 * EDIT SELLER PAGE
 * ================
 * Form for admin to update an existing seller account.
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { adminAPI } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import toast from "react-hot-toast";
import { UserCog, Loader2, Eye, EyeOff, X, ArrowLeft } from "lucide-react";

const AVAILABLE_SKILLS = [
  "Node.js", "React", "MongoDB", "Express.js", "Next.js",
  "Python", "Django", "PostgreSQL", "MySQL", "TypeScript",
  "Vue.js", "Angular", "PHP", "Laravel", "AWS",
  "Docker", "GraphQL", "REST APIs", "Redis", "Firebase",
];

export default function EditSellerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Fetch seller data on mount
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const response = await adminAPI.getSellerById(id);
        const seller = response.data;
        
        // Pre-fill form
        setValue("name", seller.name);
        setValue("email", seller.email);
        setValue("mobileNo", seller.mobileNo);
        setValue("country", seller.country);
        setValue("state", seller.state);
        setSelectedSkills(seller.skills || []);
      } catch (error) {
        toast.error("Failed to fetch seller details");
        router.push("/admin/sellers");
      } finally {
        setIsFetching(false);
      }
    };
    fetchSeller();
  }, [id, setValue, router]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const onSubmit = async (formData) => {
    if (selectedSkills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    setIsLoading(true);
    try {
      // Only send password if it's not empty
      const payload = { ...formData, skills: selectedSkills };
      if (!payload.password) delete payload.password;

      await adminAPI.updateSeller(id, payload);

      toast.success("Seller updated successfully!");
      router.push("/admin/sellers");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update seller";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <ProtectedRoute allowedRole="admin">
        <div className="flex min-h-screen bg-gray-950">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex min-h-screen bg-gray-950">
        <AdminSidebar />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sellers
            </button>
            <div className="flex items-center gap-3 mb-1">
              <UserCog className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">Edit Seller</h1>
            </div>
            <p className="text-gray-400 text-sm ml-9">
              Update seller account information
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
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 transition-all
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
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 transition-all
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
                  maxLength="10"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  }}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                              placeholder-gray-500 text-sm outline-none
                              focus:ring-2 focus:ring-indigo-500 transition-all
                              ${errors.mobileNo ? "border-red-500" : "border-gray-700"}`}
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
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 transition-all
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
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 transition-all
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

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skills <span className="text-red-400">*</span>
                  <span className="text-gray-500 text-xs ml-2">
                    ({selectedSkills.length} selected)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200
                          ${isSelected
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                          }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  New Password <span className="text-gray-500 text-xs ml-1">(Leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters (A-z, 0-9, !@#$)"
                    className={`w-full px-4 py-3 pr-12 bg-gray-800 border rounded-xl text-white
                                placeholder-gray-500 text-sm outline-none
                                focus:ring-2 focus:ring-indigo-500 transition-all
                                ${errors.password ? "border-red-500" : "border-gray-700"}`}
                    {...register("password", {
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
                             disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Seller"
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
