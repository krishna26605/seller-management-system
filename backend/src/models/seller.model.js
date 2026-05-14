/**
 * SELLER MODEL
 * ============
 * Mongoose schema for the Seller user.
 *
 * Seller responsibilities:
 * - Created by Admin only (sellers cannot self-register)
 * - Can log in using email/password set by admin
 * - Can add, view, delete their own products
 * - Can generate PDF reports for products
 *
 * Key differences from Admin:
 * - Has additional fields: mobileNo, country, state, skills
 * - role is "seller" (not "admin")
 * - Cannot access admin routes
 *
 * Security:
 * - Same bcrypt password hashing as Admin
 * - JWT tokens include role field for route protection
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Seller Schema Definition
 */
const sellerSchema = new mongoose.Schema(
  {
    // Seller's full name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // Email used for seller login - must be unique globally
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    // Mobile number with basic validation
    mobileNo: {
      type: Number,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please enter a valid mobile number"],
    },

    // Country of the seller
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },

    // State/Province of the seller
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    /**
     * Skills - stored as an Array of strings
     * Example: ["Node.js", "React", "MongoDB"]
     *
     * Why Array?
     * - A seller can have multiple skills
     * - Arrays in MongoDB are efficient for this use case
     * - Allows filtering sellers by skill in the future
     */
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          // Must have at least one skill
          return arr.length > 0;
        },
        message: "At least one skill is required",
      },
    },

    // Password - hashed before storing (see pre-save hook below)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Excluded from query results by default for security
    },

    // Role is always "seller" for this model
    role: {
      type: String,
      enum: ["seller"],
      default: "seller",
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt automatically
  }
);

// ============================================
// MONGOOSE MIDDLEWARE (Pre-save Hook)
// ============================================

/**
 * Pre-save Hook: Hash Password Before Saving
 * Same logic as Admin model - see admin.model.js for detailed explanation.
 */
sellerSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  } catch (error) {
    throw error;
  }
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * comparePassword - Verifies plain text password against stored bcrypt hash
 *
 * @param {string} candidatePassword - Plain text password from login form
 * @returns {Promise<boolean>} - true if passwords match
 */
sellerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export Seller model
const Seller = mongoose.model("Seller", sellerSchema);

module.exports = Seller;
