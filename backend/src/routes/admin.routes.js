/**
 * ADMIN ROUTES
 * =============
 * Defines all HTTP routes for admin-related endpoints.
 *
 * Route Structure in Express:
 * router.METHOD(path, ...middleware, controller)
 *
 * Middleware chain (executed left to right):
 * 1. Validation middleware: validates input fields
 * 2. authenticate: verifies JWT token
 * 3. authorize: checks user role
 * 4. Controller: handles business logic
 *
 * RESTful Naming Conventions:
 * - POST /admin/login         -> Authenticate admin
 * - POST /admin/create-seller -> Create a resource (seller)
 * - GET  /admin/sellers       -> Get collection of resources
 *
 * All routes are mounted at /api/admin in app.js
 * So full paths are: /api/admin/login, /api/admin/sellers, etc.
 */

const express = require("express");
const router = express.Router();

// Controllers (business logic)
const { adminLogin, createSeller, getSellers, getSellerById, updateSeller } = require("../controllers/admin.controller");

// Middleware
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// Validation schemas
const { validateAdminLogin, validateCreateSeller } = require("../validations/admin.validation");

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   POST /api/admin/login
 * @desc    Admin login - validates credentials, returns JWT token
 * @access  Public
 *
 * Middleware chain:
 * validateAdminLogin -> adminLogin
 *
 * validateAdminLogin: checks email/password fields are valid
 * adminLogin: finds admin, compares password, returns token
 */
router.post("/login", validateAdminLogin, adminLogin);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route   POST /api/admin/create-seller
 * @desc    Admin creates a new seller account
 * @access  Private (Admin only)
 *
 * Middleware chain:
 * validateCreateSeller -> authenticate -> authorize('admin') -> createSeller
 *
 * validateCreateSeller: validates all seller fields
 * authenticate: verifies JWT token, sets req.user
 * authorize('admin'): ensures only admins can create sellers
 * createSeller: hashes password, creates seller in DB
 */
router.post(
  "/create-seller",
  validateCreateSeller,     // Step 1: Validate input
  authenticate,             // Step 2: Verify JWT
  authorize("admin"),       // Step 3: Check admin role
  createSeller              // Step 4: Business logic
);

/**
 * @route   GET /api/admin/sellers?page=1&limit=10&search=query
 * @desc    Get all sellers with pagination and optional search
 * @access  Private (Admin only)
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 10)
 * - search: Search by name or email (optional)
 */
router.get(
  "/sellers",
  authenticate,       // Verify JWT
  authorize("admin"), // Admin only
  getSellers          // Return paginated sellers
);

/**
 * @route   GET /api/admin/sellers/:id
 * @desc    Get single seller details
 * @access  Private (Admin only)
 */
router.get(
  "/sellers/:id",
  authenticate,
  authorize("admin"),
  getSellerById
);

/**
 * @route   PUT /api/admin/sellers/:id
 * @desc    Update seller details
 * @access  Private (Admin only)
 */
router.put(
  "/sellers/:id",
  authenticate,
  authorize("admin"),
  updateSeller
);

module.exports = router;
