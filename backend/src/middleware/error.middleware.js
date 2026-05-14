/**
 * CENTRALIZED ERROR HANDLING MIDDLEWARE
 * ======================================
 * This is the global error handler for the entire Express application.
 *
 * Why Centralized Error Handling?
 * - Without this, every route handler would need its own try/catch with res.json()
 * - Centralizing reduces code duplication
 * - Ensures consistent error response format across ALL endpoints
 * - Makes debugging easier (single place to add logging)
 *
 * HOW IT WORKS:
 * 1. Any route that throws an error calls next(error)
 * 2. Express detects this is an error handler because it has 4 parameters
 * 3. This function processes the error and sends appropriate response
 *
 * Express Error Handler Rule:
 * - MUST have exactly 4 parameters: (err, req, res, next)
 * - Must be registered AFTER all routes
 *
 * Error Types Handled:
 * - Mongoose Validation Errors (missing required fields, invalid data)
 * - Mongoose Duplicate Key Errors (unique constraint violations)
 * - Mongoose Cast Errors (invalid ObjectId format)
 * - JWT Errors (handled in auth middleware, but backup here)
 * - General Application Errors
 */

/**
 * errorHandler - Global error handling middleware
 *
 * @param {Error} err - Error object thrown by route handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function (required even if unused)
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging (in production, use a proper logger like Winston)
  console.error("🚨 Error:", err.message);
  console.error("Stack:", err.stack);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null; // Detailed validation errors

  // ----------------------------------------
  // MONGOOSE VALIDATION ERROR
  // ----------------------------------------
  // Happens when required fields are missing or data fails schema validation
  // Example: saving a seller without email field
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Extract all validation error messages into an array
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = "Validation failed";
  }

  // ----------------------------------------
  // MONGOOSE DUPLICATE KEY ERROR
  // ----------------------------------------
  // Happens when trying to save a document that violates a unique index
  // Example: creating a seller with an email that already exists
  if (err.code === 11000) {
    statusCode = 409; // 409 Conflict - resource already exists
    // Extract which field caused the duplicate
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `${field} '${value}' already exists. Please use a different ${field}.`;
  }

  // ----------------------------------------
  // MONGOOSE CAST ERROR
  // ----------------------------------------
  // Happens when an invalid MongoDB ObjectId is provided
  // Example: GET /api/seller/products/invalid-id (not a valid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
  }

  // ----------------------------------------
  // MULTER ERROR (File Upload)
  // ----------------------------------------
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large. Maximum file size is 5MB.";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file field. Check the upload field names.";
  }

  // ----------------------------------------
  // SEND ERROR RESPONSE
  // ----------------------------------------
  // Always return consistent JSON format
  res.status(statusCode).json({
    success: false,
    message,
    errors, // null if no validation errors, array if validation failed
    // Only include stack trace in development for security
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
