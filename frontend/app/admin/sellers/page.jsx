/**
 * ADMIN SELLERS LISTING PAGE
 * ===========================
 * Displays all sellers with pagination and search.
 * Only accessible by authenticated admin.
 *
 * Features:
 * - Search by name or email
 * - Pagination
 * - Loading state
 * - Skills displayed as badges
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import { Search, Users, MapPin, Phone, Loader2, UserCircle, Edit2 } from "lucide-react";

// Skill badge colors - cycles through these for visual variety
const skillColors = [
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bg-green-500/10 text-green-400 border-green-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
];

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);
  const [limit, setLimit] = useState(5); // Default 5 per page as requested
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Controlled input value



  /**
   * fetchSellers - Loads paginated seller data from API
   * useCallback memoizes function to prevent unnecessary re-creation
   */
  const fetchSellers = useCallback(async (page, searchQuery) => {
    setLoading(true);
    try {
      const data = await adminAPI.getSellers({
        page,
        limit,
        search: searchQuery,
      });
      setSellers(data.data);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalSellers(data.totalSellers);
    } catch (error) {
      toast.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sellers when page, limit, or search changes
  useEffect(() => {
    fetchSellers(currentPage, search);
  }, [currentPage, limit, search, fetchSellers]);

  /**
   * handleSearch - Triggered when search form is submitted
   * Resets to page 1 when searching (always start from beginning)
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex min-h-screen bg-gray-950">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 pb-12">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <Users className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">Sellers</h1>
            </div>
            <p className="text-gray-400 text-sm ml-9">
              {totalSellers} total sellers registered
            </p>
          </div>

          {/* Search Bar + Actions */}
          <div className="flex items-center gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700
                             text-white text-sm rounded-xl placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-transparent transition-all"
                />
              </div>
            </form>

            <a
              href="/admin/create-seller"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm
                         font-medium rounded-xl transition-all duration-200 whitespace-nowrap"
            >
              + Add Seller
            </a>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-sm text-gray-400">
              {totalSellers > 0 ? (
                <>
                  Showing <span className="text-white font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
                  <span className="text-white font-medium">
                    {Math.min(currentPage * limit, totalSellers)}
                  </span>{" "}
                  of <span className="text-white font-medium">{totalSellers}</span> sellers
                </>
              ) : (
                "No sellers to display"
              )}
            </p>
          </div>

          {/* Sellers Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-800 bg-gray-800/50">
              <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Seller
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Location
              </div>
              <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Skills
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Joined
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                Actions
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : sellers.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <UserCircle className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">No sellers found</p>
                {search && (
                  <button
                    onClick={() => { setSearch(""); setSearchInput(""); }}
                    className="text-indigo-400 text-sm mt-2 hover:text-indigo-300"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              /* Seller Rows */
              <div className="divide-y divide-gray-800">
                {sellers.map((seller) => (
                  <div
                    key={seller._id}
                    className="grid grid-cols-12 px-6 py-4 hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Name + Email + Phone */}
                    <div className="col-span-3 flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 bg-indigo-600/20 border border-indigo-500/30
                                      rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs font-bold">
                          {seller.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{seller.name}</p>
                        <p className="text-gray-400 text-xs truncate">{seller.email}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-500 text-xs">{seller.mobileNo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-sm truncate">{seller.state}, {seller.country}</span>
                      </div>
                    </div>

                    {/* Skills as Badges */}
                    <div className="col-span-3 flex items-center">
                      <div className="flex flex-wrap gap-1">
                        {seller.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${skillColors[i % skillColors.length]}`}
                          >
                            {skill}
                          </span>
                        ))}
                        {seller.skills.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-gray-500">
                            +{seller.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-400 text-xs">
                        {new Date(seller.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end">
                      <a
                        href={`/admin/sellers/${seller._id}/edit`}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                        title="Edit Seller"
                      >
                        <Edit2 className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
