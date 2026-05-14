/**
 * SELLER PRODUCTS LISTING PAGE
 * ==============================
 * Displays the logged-in seller's products with pagination.
 *
 * Features:
 * - View all products with brand details
 * - Search by product name
 * - Pagination
 * - Generate PDF (opens in new tab)
 * - Delete product with confirmation
 * - Product brand count and total price shown
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { sellerAPI } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import SellerSidebar from "@/components/SellerSidebar";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import {
  Package,
  Search,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  IndianRupee,
  Tag,
  Edit3,
  X as XIcon,
  ExternalLink,
} from "lucide-react";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // ID being deleted
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  const LIMIT = 5;

  const fetchProducts = useCallback(async (page, searchQuery) => {
    setLoading(true);
    try {
      const data = await sellerAPI.getProducts({ page, limit: LIMIT, search: searchQuery });
      setProducts(data.data);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalProducts(data.totalProducts);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, search);
  }, [currentPage, search, fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  /**
   * handleDelete - Confirms and deletes a product
   * @param {string} productId - MongoDB ObjectId
   * @param {string} productName - For display in confirmation
   */
  const handleDelete = async (productId, productName) => {
    if (!confirm(`Delete "${productName}"? This action cannot be undone.`)) return;

    setDeletingId(productId);
    try {
      await sellerAPI.deleteProduct(productId);
      toast.success("Product deleted successfully");
      // Refresh list after deletion
      fetchProducts(currentPage, search);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * handleViewPDF - Opens product PDF in new browser tab
   * @param {string} productId - MongoDB ObjectId
   */
  const handleViewPDF = (productId) => {
    const url = sellerAPI.getProductPDFUrl(productId);
    const token = localStorage.getItem("token");
    setSelectedPdfUrl(`${url}?token=${token}`);
  };

  /**
   * Calculate total price of all brands in a product
   */
  const getTotalPrice = (brands) =>
    brands.reduce((sum, b) => sum + (b.price || 0), 0);

  return (
    <ProtectedRoute allowedRole="seller">
      <div className="flex min-h-screen bg-gray-950">
        <SellerSidebar />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Package className="w-6 h-6 text-emerald-400" />
                <h1 className="text-2xl font-bold text-white">My Products</h1>
              </div>
              <p className="text-sm text-gray-400 ml-9">
                {totalProducts > 0 ? (
                  <>
                    Showing <span className="text-white font-medium">{(currentPage - 1) * LIMIT + 1}</span> to{" "}
                    <span className="text-white font-medium">
                      {Math.min(currentPage * LIMIT, totalProducts)}
                    </span>{" "}
                    of <span className="text-white font-medium">{totalProducts}</span> products
                  </>
                ) : (
                  "No products to display"
                )}
              </p>
            </div>
          </div>

          {/* Search + Add button */}
          <div className="flex items-center gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700
                             text-white text-sm rounded-xl placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </form>

            <a
              href="/seller/add-product"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm
                         font-medium rounded-xl transition-all whitespace-nowrap"
            >
              + Add Product
            </a>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-white text-lg font-medium mb-1">No products yet</p>
              <p className="text-gray-400 text-sm mb-4">
                Start by adding your first product
              </p>
              <a
                href="/seller/add-product"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white
                           text-sm font-medium rounded-xl transition-all"
              >
                Add Product
              </a>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6
                             hover:border-gray-700 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg mb-1 truncate">
                        {product.productName}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {product.productDescription}
                      </p>

                      {/* Brands list */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.brands.map((brand, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800
                                       border border-gray-700 rounded-lg"
                          >
                            {/* Brand image thumbnail */}
                            {brand.image ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_UPLOADS_URL}/${brand.image}`}
                                alt={brand.brandName}
                                className="w-6 h-6 rounded object-cover"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <Tag className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-gray-300 text-xs font-medium">
                              {brand.brandName}
                            </span>
                            <span className="text-emerald-400 text-xs flex items-center">
                              <IndianRupee className="w-3 h-3" />
                              {brand.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Summary row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{product.brands.length} brand(s)</span>
                        <span className="text-emerald-400 font-medium flex items-center">
                          Total: <IndianRupee className="w-3 h-3 mx-0.5" />
                          {getTotalPrice(product.brands).toLocaleString()}
                        </span>
                        <span>
                          Added {new Date(product.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {/* Edit Button */}
                      <a
                        href={`/seller/products/${product._id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-500/20
                                   text-emerald-400 text-sm rounded-xl hover:bg-emerald-600/20 transition-all text-center justify-center"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </a>

                      {/* View PDF */}
                      <button
                        onClick={() => handleViewPDF(product._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20
                                   text-blue-400 text-sm rounded-xl hover:bg-blue-600/20 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(product._id, product.productName)}
                        disabled={deletingId === product._id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-500/20
                                   text-red-400 text-sm rounded-xl hover:bg-red-600/20 transition-all
                                   disabled:opacity-50"
                      >
                        {deletingId === product._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          {/* PDF Preview Modal */}
          {selectedPdfUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
              <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Product Report Preview</h3>
                      <p className="text-xs text-gray-500">View and print your product details</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={selectedPdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button 
                      onClick={() => setSelectedPdfUrl(null)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all"
                    >
                      <XIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 bg-gray-800/50 relative">
                  <iframe 
                    src={selectedPdfUrl} 
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                  {/* Overlay to handle loading state/errors if needed */}
                </div>
                
                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-900 border-t border-gray-800 flex justify-end">
                  <button
                    onClick={() => setSelectedPdfUrl(null)}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
