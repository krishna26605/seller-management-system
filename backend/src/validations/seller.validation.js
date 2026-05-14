/**
 * VALIDATION SCHEMAS - SELLER
 * ============================
 * Input validation for all seller-related API endpoints.
 *
 * See admin.validation.js for detailed explanation of how validation works.
 */

const { body } = require("express-validator");

// ============================================
// SELLER LOGIN VALIDATION
// ============================================

/**
 * validateSellerLogin - Validation rules for POST /api/seller/login
 */
const validateSellerLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// ============================================
// ADD PRODUCT VALIDATION
// ============================================

/**
 * validateAddProduct - Validation rules for POST /api/seller/products
 *
 * Product has nested brands array, so we validate:
 * - Top level: productName, productDescription
 * - brands array: must exist with at least one item
 * - Each brand: brandName, detail, price (image is uploaded separately)
 *
 * Note about brands validation with Multer:
 * - When using multipart/form-data, JSON arrays come as strings
 * - The controller parses brands JSON string before validation
 * - So we validate after parsing
 */
const validateAddProduct = [
  body("productName")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 500 })
    .withMessage("Product name must be between 2 and 500 characters")
    .trim(),

  body("productDescription")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 2, max: 500 })
    .withMessage("Description must be between 2 and 500 characters")
    .trim(),

  // Validate brands array - after parsing from JSON string (done in controller)
  body("brands")
    .custom((value) => {
      let brands;
      // If brands is a string (from multipart form), parse it
      if (typeof value === "string") {
        try {
          brands = JSON.parse(value);
        } catch {
          throw new Error("Brands must be a valid JSON array");
        }
      } else {
        brands = value;
      }

      if (!Array.isArray(brands) || brands.length === 0) {
        throw new Error("At least one brand is required");
      }

      // Validate each brand object
      for (let i = 0; i < brands.length; i++) {
        const brand = brands[i];
        if (!brand.brandName || brand.brandName.trim() === "") {
          throw new Error(`Brand ${i + 1}: brandName is required`);
        }
        if (!brand.detail || brand.detail.trim() === "") {
          throw new Error(`Brand ${i + 1}: detail is required`);
        }
        if (brand.price === undefined || brand.price === null) {
          throw new Error(`Brand ${i + 1}: price is required`);
        }
        if (isNaN(Number(brand.price)) || Number(brand.price) < 0) {
          throw new Error(`Brand ${i + 1}: price must be a non-negative number`);
        }
      }
      return true;
    }),
];

module.exports = { validateSellerLogin, validateAddProduct };
