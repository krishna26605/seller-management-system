/**
 * SELLER ROUTES
 * ==============
 * Defines all HTTP routes for seller-related endpoints.
 *
 * All routes mounted at /api/seller in app.js.
 * Full paths: /api/seller/login, /api/seller/products, etc.
 *
 * Product Upload (Multer) Explanation:
 * - POST /api/seller/products sends multipart/form-data
 * - upload.array('brandImages', 10): accepts up to 10 files
 *   with field name "brandImages"
 * - Multer processes files BEFORE controller runs
 * - Files are available in req.files after multer processes them
 * - Controller maps req.files[i] to brands[i].image
 */

const express = require("express");
const router = express.Router();

// Controllers
const {
  sellerLogin,
  addProduct,
  getProducts,
  generateProductPDF,
  deleteProduct,
  updateProduct,
  getProductById,
} = require("../controllers/seller.controller");

// Middleware
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// Validation
const { validateSellerLogin, validateAddProduct } = require("../validations/seller.validation");

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   POST /api/seller/login
 * @desc    Seller login - returns JWT token
 * @access  Public
 */
router.post("/login", validateSellerLogin, sellerLogin);

// ============================================
// PROTECTED ROUTES (Seller Authentication)
// ============================================

/**
 * @route   POST /api/seller/products
 * @desc    Add a new product with multiple brands and images
 * @access  Private (Seller only)
 *
 * Multer Middleware:
 * upload.array('brandImages', 10)
 * - 'brandImages': HTML form field name for files
 * - 10: maximum number of files allowed
 * - Processes files before reaching controller
 * - Saves files to uploads/ folder
 * - Makes files available as req.files array
 *
 * Frontend must send:
 * - productName (text field)
 * - productDescription (text field)
 * - brands (JSON string field)
 * - brandImages (file fields, one per brand)
 */
router.post(
  "/products",
  authenticate,                          // Verify seller is logged in
  authorize("seller"),                   // Sellers only
  upload.array("brandImages", 10),       // Process file uploads (max 10)
  validateAddProduct,                    // Validate text fields
  addProduct                             // Business logic
);

/**
 * @route   GET /api/seller/products?page=1&limit=10&search=query
 * @desc    Get logged-in seller's products with pagination
 * @access  Private (Seller only)
 */
router.get(
  "/products",
  authenticate,
  authorize("seller"),
  getProducts
);

/**
 * @route   GET /api/seller/products/:id/pdf
 * @desc    Generate and stream PDF for a specific product
 * @access  Private (Seller only - their own products)
 *
 * Note: :id is a dynamic URL parameter (MongoDB ObjectId)
 * Accessible via req.params.id in controller
 */
router.get(
  "/products/:id/pdf",
  authenticate,
  authorize("seller"),
  generateProductPDF
);

/**
 * @route   DELETE /api/seller/products/:id
 * @desc    Delete a product (only owner can delete)
 * @access  Private (Seller only - their own products)
 */
router.delete(
  "/products/:id",
  authenticate,
  authorize("seller"),
  deleteProduct
);

/**
 * @route   PUT /api/seller/products/:id
 * @desc    Update an existing product
 * @access  Private (Seller only)
 */
router.put(
  "/products/:id",
  authenticate,
  authorize("seller"),
  upload.array("brandImages", 10),
  validateAddProduct,
  updateProduct
);

/**
 * @route   GET /api/seller/products/:id
 * @desc    Get a single product details
 * @access  Private (Seller only)
 */
router.get(
  "/products/:id",
  authenticate,
  authorize("seller"),
  getProductById
);

module.exports = router;
