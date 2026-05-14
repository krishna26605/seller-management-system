/**
 * PRODUCT MODEL
 * =============
 * Mongoose schema for Products created by Sellers.
 *
 * Structure:
 * - A Product belongs to one Seller (via sellerId reference)
 * - A Product can have MULTIPLE Brands (embedded array)
 * - Each Brand has its own name, detail, image, and price
 *
 * Why embedded brands instead of separate Brand collection?
 * - Brands are always accessed together with their product
 * - Embedding avoids extra database queries (denormalization)
 * - Makes PDF generation simpler (one query gets everything)
 *
 * Database Relationship:
 * Product --> Seller (Many-to-One)
 * One seller can have many products,
 * but each product belongs to exactly one seller.
 *
 * sellerId is a "reference" (ref) to the Seller model.
 * Use .populate('sellerId') to get seller details with product.
 */

const mongoose = require("mongoose");

/**
 * Brand Sub-Schema
 * This is embedded inside Product - not a separate collection.
 * Each product can have 1 or more brands.
 */
const brandSchema = new mongoose.Schema({
  // Brand company name (e.g., "Dell", "HP", "Apple")
  brandName: {
    type: String,
    required: [true, "Brand name is required"],
    trim: true,
    maxlength: [500, "Brand name cannot exceed 500 characters"],
  },

  // Additional details about this brand's product
  detail: {
    type: String,
    required: [true, "Brand detail is required"],
    trim: true,
    maxlength: [500, "Detail cannot exceed 500 characters"],
  },

  /**
   * Image field stores the filename/path of uploaded image.
   * Actual file is stored in the "uploads/" folder.
   * URL to access: GET /uploads/<image filename>
   * We store just the filename, not full URL (more flexible for deployment)
   */
  image: {
    type: String,
    default: null, // Optional - product might not have image initially
  },

  // Price of this brand's product in currency units
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
});

/**
 * Product Schema Definition
 */
const productSchema = new mongoose.Schema(
  {
    /**
     * sellerId - References which Seller created this product
     *
     * type: mongoose.Schema.Types.ObjectId - MongoDB's unique ID type
     * ref: "Seller" - Tells Mongoose to look in the "Seller" collection
     *
     * This creates a "virtual relationship" between Product and Seller.
     * Use: Product.find().populate('sellerId') to get seller data too.
     *
     * Why store reference instead of embedding?
     * - Seller data can be updated independently
     * - Multiple products can reference same seller efficiently
     * - Avoids data duplication
     */
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller", // References the Seller model
      required: [true, "Seller ID is required"],
    },

    // Name of the product (e.g., "Mouse", "Laptop", "Keyboard")
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [500, "Product name cannot exceed 500 characters"],
    },

    // Detailed description of the product
    productDescription: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    /**
     * brands - Array of Brand objects
     * Each brand is defined by brandSchema above.
     * A product MUST have at least one brand.
     *
     * Example:
     * brands: [
     *   { brandName: "Dell", detail: "...", image: "dell.jpg", price: 1000 },
     *   { brandName: "HP", detail: "...", image: "hp.jpg", price: 2000 }
     * ]
     */
    brands: {
      type: [brandSchema],
      validate: {
        validator: function (arr) {
          return arr.length > 0; // Must have at least one brand
        },
        message: "At least one brand is required",
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt managed automatically
  }
);

// ============================================
// VIRTUAL FIELD
// ============================================

/**
 * totalPrice - Virtual computed field (not stored in DB)
 * Calculates sum of all brand prices dynamically.
 *
 * Why virtual?
 * - Price data might change, so computing dynamically is safer
 * - Avoids storing redundant/stale data
 * - Automatically stays in sync with brand prices
 *
 * To include virtuals in JSON output, use:
 * product.toJSON({ virtuals: true })
 */
productSchema.virtual("totalPrice").get(function () {
  return this.brands.reduce((sum, brand) => sum + (brand.price || 0), 0);
});

// Create and export Product model
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
