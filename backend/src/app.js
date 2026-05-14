/**
 * EXPRESS APP CONFIGURATION
 * =========================
 * This is the core Express application setup.
 * It configures:
 * - Middleware (CORS, JSON parsing, file serving)
 * - Routes (admin and seller)
 * - Global error handler
 *
 * Note: Database connection is NOT here - it's in server.js
 * This separation allows for easier testing.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Import route handlers
const adminRoutes = require("./routes/admin.routes");
const sellerRoutes = require("./routes/seller.routes");

// Import centralized error handler middleware
const errorHandler = require("./middleware/error.middleware");

// Create Express application instance
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

/**
 * CORS Middleware
 * Cross-Origin Resource Sharing - allows frontend (different port/domain)
 * to make requests to this backend API.
 * Without CORS, browsers would block these requests for security.
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * JSON Body Parser
 * Parses incoming requests with JSON payloads.
 * Without this, req.body would be undefined for JSON requests.
 * limit: "10mb" - max request size
 */
app.use(express.json({ limit: "10mb" }));

/**
 * URL-Encoded Body Parser
 * Parses incoming requests with URL-encoded payloads (HTML form submissions).
 * extended: true allows nested objects in query strings.
 */
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Static File Serving for Uploads
 * Makes the "uploads" folder publicly accessible.
 * Example: GET /uploads/image.jpg serves the file from disk.
 * This allows frontend to display uploaded product images.
 */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

// ============================================
// ROUTE SETUP
// ============================================

/**
 * Admin Routes - handles all /api/admin/* endpoints
 * - POST /api/admin/login
 * - POST /api/admin/create-seller
 * - GET  /api/admin/sellers
 */
app.use("/api/admin", adminRoutes);

/**
 * Seller Routes - handles all /api/seller/* endpoints
 * - POST /api/seller/login
 * - POST /api/seller/products
 * - GET  /api/seller/products
 * - GET  /api/seller/products/:id/pdf
 * - DELETE /api/seller/products/:id
 */
app.use("/api/seller", sellerRoutes);

/**
 * API Documentation (Swagger)
 * Accessible at http://localhost:5000/api-docs
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Health Check Endpoint
 * Simple endpoint to verify the API is running.
 * Useful for deployment health checks.
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * 404 Handler
 * Catches all unmatched routes.
 * Must be placed AFTER all valid routes.
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/**
 * Global Error Handler
 * Catches all errors thrown by route handlers and middleware.
 * Must be placed LAST with 4 parameters (err, req, res, next).
 * See middleware/error.middleware.js for implementation.
 */
app.use(errorHandler);

module.exports = app;
