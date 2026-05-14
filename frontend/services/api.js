/**
 * API SERVICE LAYER
 * ==================
 * Centralizes all API calls in one place.
 *
 * Why a service layer?
 * - Components shouldn't know about API endpoints
 * - If endpoint changes, update here - not in every component
 * - Easier to test, mock, and maintain
 * - Clear separation: UI logic (components) vs data logic (services)
 *
 * All functions return the response data directly.
 * Errors are thrown and caught by the calling component.
 */

import axiosInstance from "./axios";

// ============================================
// ADMIN APIs
// ============================================

export const adminAPI = {
  /**
   * Admin login
   * @param {Object} credentials - { email, password }
   * @returns {Object} { success, token, role, user }
   */
  login: async (credentials) => {
    const { data } = await axiosInstance.post("/admin/login", credentials);
    return data;
  },

  /**
   * Create a new seller (admin only)
   * @param {Object} sellerData - Seller form data
   * @returns {Object} { success, data: seller }
   */
  createSeller: async (sellerData) => {
    const { data } = await axiosInstance.post("/admin/create-seller", sellerData);
    return data;
  },

  /**
   * Get paginated list of sellers
   * @param {Object} params - { page, limit, search }
   * @returns {Object} { success, currentPage, totalPages, totalSellers, data }
   */
  getSellers: async (params = {}) => {
    const { data } = await axiosInstance.get("/admin/sellers", { params });
    return data;
  },

  /**
   * Get single seller by ID
   * @param {string} id
   */
  getSellerById: async (id) => {
    const { data } = await axiosInstance.get(`/admin/sellers/${id}`);
    return data;
  },

  /**
   * Update seller details
   * @param {string} id
   * @param {Object} sellerData
   */
  updateSeller: async (id, sellerData) => {
    const { data } = await axiosInstance.put(`/admin/sellers/${id}`, sellerData);
    return data;
  },
};

// ============================================
// SELLER APIs
// ============================================

export const sellerAPI = {
  /**
   * Seller login
   * @param {Object} credentials - { email, password }
   * @returns {Object} { success, token, role, user }
   */
  login: async (credentials) => {
    const { data } = await axiosInstance.post("/seller/login", credentials);
    return data;
  },

  /**
   * Add a new product with brand images
   * @param {FormData} formData - Multipart form data with files
   * @returns {Object} { success, data: product }
   */
  addProduct: async (formData) => {
    const { data } = await axiosInstance.post("/seller/products", formData);
    return data;
  },

  /**
   * Get paginated list of seller's own products
   * @param {Object} params - { page, limit, search }
   * @returns {Object} { success, currentPage, totalPages, totalProducts, data }
   */
  getProducts: async (params = {}) => {
    const { data } = await axiosInstance.get("/seller/products", { params });
    return data;
  },

  /**
   * Generate PDF URL for a product
   * Returns the URL to open in new tab
   * @param {string} productId - MongoDB ObjectId
   * @returns {string} PDF URL
   */
  getProductPDFUrl: (productId) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("token");
    // We return the URL - component opens it in new tab
    // Token is passed as query param for browser navigation (can't set headers)
    return `${baseUrl}/seller/products/${productId}/pdf`;
  },

  /**
   * Get single product details
   * @param {string} productId
   */
  getProductById: async (productId) => {
    const { data } = await axiosInstance.get(`/seller/products/${productId}`);
    return data;
  },

  /**
   * Update an existing product
   * @param {string} productId
   * @param {FormData} formData
   */
  updateProduct: async (productId, formData) => {
    const { data } = await axiosInstance.put(`/seller/products/${productId}`, formData);
    return data;
  },

  /**
   * Delete a product
   * @param {string} productId - MongoDB ObjectId
   * @returns {Object} { success, message }
   */
  deleteProduct: async (productId) => {
    const { data } = await axiosInstance.delete(`/seller/products/${productId}`);
    return data;
  },
};
