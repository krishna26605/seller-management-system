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
 * @swagger
 * /api/seller/login:
 *   post:
 *     summary: Seller login
 *     tags: [Seller]
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
router.post("/login", validateSellerLogin, sellerLogin);

// ============================================
// PROTECTED ROUTES (Seller Authentication)
// ============================================

/**
 * @swagger
 * /api/seller/products:
 *   post:
 *     summary: Add a new product with multiple brands and images
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productDescription
 *               - brands
 *             properties:
 *               productName:
 *                 type: string
 *               productDescription:
 *                 type: string
 *               brands:
 *                 type: string
 *                 description: JSON string of brands array
 *               brandImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Bad request
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
 * @swagger
 * /api/seller/products:
 *   get:
 *     summary: Get logged-in seller's products with pagination
 *     tags: [Seller]
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
 *         description: List of products
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/products",
  authenticate,
  authorize("seller"),
  getProducts
);

/**
 * @swagger
 * /api/seller/products/{id}/pdf:
 *   get:
 *     summary: Generate and stream PDF for a specific product
 *     tags: [Seller]
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
 *         description: PDF file
 *       404:
 *         description: Product not found
 */
router.get(
  "/products/:id/pdf",
  authenticate,
  authorize("seller"),
  generateProductPDF
);

/**
 * @swagger
 * /api/seller/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Seller]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete(
  "/products/:id",
  authenticate,
  authorize("seller"),
  deleteProduct
);

/**
 * @swagger
 * /api/seller/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Seller]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               productDescription:
 *                 type: string
 *               brands:
 *                 type: string
 *               brandImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
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
 * @swagger
 * /api/seller/products/{id}:
 *   get:
 *     summary: Get a single product details
 *     tags: [Seller]
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
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get(
  "/products/:id",
  authenticate,
  authorize("seller"),
  getProductById
);

module.exports = router;
