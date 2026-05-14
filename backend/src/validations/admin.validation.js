/**
 * VALIDATION SCHEMAS - ADMIN
 * ===========================
 * Input validation for all admin-related API endpoints.
 *
 * Why validate inputs?
 * - Never trust data from clients - always validate server-side
 * - Prevent malformed data from reaching the database
 * - Provide clear, helpful error messages to API consumers
 * - Protect against injection attacks
 *
 * Library: express-validator
 * - Provides chainable validation rules
 * - Works as Express middleware
 * - Collects all validation errors before responding
 *
 * HOW VALIDATION WORKS:
 * 1. Define array of validation rules (validators)
 * 2. Add validators as middleware before route handler
 * 3. In route handler, call validationResult(req) to check for errors
 * 4. If errors exist, return 400 Bad Request with error details
 */

const { body } = require("express-validator");

// ============================================
// ADMIN LOGIN VALIDATION
// ============================================

/**
 * validateAdminLogin - Validation rules for POST /api/admin/login
 *
 * Rules:
 * - email: must be present and valid email format
 * - password: must be present and at least 6 chars
 */
const validateAdminLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(), // Converts to lowercase, removes dots in gmail, etc.

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// ============================================
// CREATE SELLER VALIDATION
// ============================================

/**
 * validateCreateSeller - Validation rules for POST /api/admin/create-seller
 *
 * Rules:
 * - name: required, 2-100 chars
 * - email: required, valid format, unique (checked in controller)
 * - mobileNo: required, 10-15 digits only
 * - country: required
 * - state: required
 * - skills: required, must be a non-empty array of strings
 * - password: required, min 6 chars
 */
const validateCreateSeller = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("mobileNo")
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Mobile number must be 10-15 digits only"),

  body("country")
    .notEmpty()
    .withMessage("Country is required")
    .trim(),

  body("state")
    .notEmpty()
    .withMessage("State is required")
    .trim(),

  body("skills")
    .isArray({ min: 1 })
    .withMessage("At least one skill is required")
    .custom((skills) => {
      // Ensure each skill is a non-empty string
      if (!skills.every((skill) => typeof skill === "string" && skill.trim().length > 0)) {
        throw new Error("Each skill must be a non-empty string");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

module.exports = { validateAdminLogin, validateCreateSeller };
