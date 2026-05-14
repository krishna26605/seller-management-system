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
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validateAdminLogin, adminLogin);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @swagger
 * /api/admin/create-seller:
 *   post:
 *     summary: Admin creates a new seller account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - mobileNo
 *               - country
 *               - state
 *               - skills
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               mobileNo:
 *                 type: string
 *               country:
 *                 type: string
 *               state:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Seller created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/create-seller",
  validateCreateSeller,     // Step 1: Validate input
  authenticate,             // Step 2: Verify JWT
  authorize("admin"),       // Step 3: Check admin role
  createSeller              // Step 4: Business logic
);

/**
 * @swagger
 * /api/admin/sellers:
 *   get:
 *     summary: Get all sellers with pagination and optional search
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sellers
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/sellers",
  authenticate,       // Verify JWT
  authorize("admin"), // Admin only
  getSellers          // Return paginated sellers
);

/**
 * @swagger
 * /api/admin/sellers/{id}:
 *   get:
 *     summary: Get single seller details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller details
 *       404:
 *         description: Seller not found
 */
router.get(
  "/sellers/:id",
  authenticate,
  authorize("admin"),
  getSellerById
);

/**
 * @swagger
 * /api/admin/sellers/{id}:
 *   put:
 *     summary: Update seller details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               mobileNo:
 *                 type: string
 *               country:
 *                 type: string
 *               state:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Seller updated successfully
 *       404:
 *         description: Seller not found
 */
router.put(
  "/sellers/:id",
  authenticate,
  authorize("admin"),
  updateSeller
);

module.exports = router;
