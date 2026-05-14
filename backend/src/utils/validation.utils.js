/**
 * VALIDATION RESULT HELPER
 * =========================
 * Utility function to check express-validator results.
 *
 * Why a helper function?
 * - Every route that uses validators needs to check for errors
 * - Centralizes the error-checking logic in one place
 * - Keeps controllers clean (just call handleValidationErrors, done)
 *
 * Usage in controller:
 *   const { handleValidationErrors } = require('../utils/validation.utils');
 *
 *   const myController = async (req, res, next) => {
 *     // Check if validation middleware found any errors
 *     if (handleValidationErrors(req, res)) return;
 *
 *     // Continue with business logic...
 *   }
 */

const { validationResult } = require("express-validator");

/**
 * handleValidationErrors - Checks and responds with validation errors
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} true if there were errors (and response was sent), false if no errors
 *
 * Pattern: if (handleValidationErrors(req, res)) return;
 * - If validation failed: this function sends error response and returns true
 * - Controller then returns early (stops execution)
 * - If validation passed: returns false, controller continues normally
 */
const handleValidationErrors = (req, res) => {
  // validationResult(req) collects all errors from express-validator
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Errors found - format and send 400 Bad Request response
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path, // Which field failed
        message: err.msg, // What went wrong
      })),
    });
    return true; // Signal that we handled the error
  }

  return false; // No errors, continue to business logic
};

module.exports = { handleValidationErrors };
