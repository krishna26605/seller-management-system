/**
 * REUSABLE PAGINATION COMPONENT
 * ================================
 * Displays page navigation buttons.
 * Used on both admin sellers list and seller products list.
 *
 * Props:
 * - currentPage: Current active page number
 * - totalPages: Total number of pages
 * - onPageChange: Callback function called with new page number
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // Don't show if only 1 page

  /**
   * Generate page numbers to show.
   * Shows: first page, last page, and 3 pages around current page.
   * Uses "..." for gaps.
   *
   * Example (page 5 of 10):
   * [1] [...] [3] [4] [5] [6] [7] [...] [10]
   */
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Pages to show on each side of current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||                                     // Always show first
        i === totalPages ||                            // Always show last
        (i >= currentPage - delta && i <= currentPage + delta) // Show around current
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("..."); // Add ellipsis for gaps
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-700 text-gray-400
                   hover:border-indigo-500 hover:text-indigo-400
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="px-3 py-2 text-gray-500 text-sm">
            ...
          </span>
        ) : (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${page === currentPage
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "border border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400"
              }
            `}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-700 text-gray-400
                   hover:border-indigo-500 hover:text-indigo-400
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
