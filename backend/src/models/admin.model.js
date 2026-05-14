/**
 * ADMIN MODEL
 * ===========
 * Mongoose schema for the Admin user.
 *
 * Admin responsibilities:
 * - Can log in using email/password
 * - Can create seller accounts
 * - Can view all sellers with pagination
 *
 * Security:
 * - Password is NEVER stored as plain text
 * - bcryptjs hashes the password before saving (see middleware below)
 * - comparePassword() method allows safe password comparison
 *
 * Role-based design:
 * - role field is used in JWT token
 * - Middleware checks role to restrict access to admin-only routes
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Admin Schema Definition
 * Each field has:
 * - type: JavaScript data type
 * - required: validation - field must be present
 * - unique: prevents duplicate values in database
 * - trim: removes leading/trailing whitespace automatically
 */
const adminSchema = new mongoose.Schema(
  {
    // Admin's full name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // Email used for login - must be unique across all admins
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // Automatically converts to lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // Regex validation
    },

    // Password - NEVER stored as plain text!
    // The pre-save hook below hashes it before storing in MongoDB
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // IMPORTANT: password is excluded from query results by default
    },

    // Role determines what this user can access
    // Hardcoded as "admin" - cannot be changed to "seller"
    role: {
      type: String,
      enum: ["admin"], // Only "admin" is allowed for this model
      default: "admin",
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    // Mongoose manages these automatically on create/update
    timestamps: true,
  }
);

// ============================================
// MONGOOSE MIDDLEWARE (Pre-save Hook)
// ============================================

/**
 * Pre-save Hook: Hash Password Before Saving
 *
 * Why? Storing plain text passwords is a major security vulnerability.
 * If database is compromised, all passwords would be exposed.
 *
 * How bcrypt works:
 * 1. Takes plain text password
 * 2. Generates a random "salt" (random string added to password)
 * 3. Hashes password + salt using bcrypt algorithm
 * 4. Salt rounds (10) determines computational cost - higher = more secure but slower
 *
 * "this.isModified('password')" check:
 * - Ensures we only re-hash if password field changed
 * - Prevents re-hashing on other field updates (like name)
 */
adminSchema.pre("save", async function () {
  // Only hash if password was actually modified/new
  if (!this.isModified("password")) {
    return; // Skip hashing, continue save
  }

  try {
    // Salt rounds: 10 is industry standard (good balance of security/speed)
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  } catch (error) {
    throw error; // Mongoose will catch this in an async hook
  }
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * comparePassword - Verifies a plain text password against stored hash
 *
 * @param {string} candidatePassword - Plain text password from login request
 * @returns {Promise<boolean>} - true if match, false if not
 *
 * Why use bcrypt.compare()?
 * - Regular string comparison (===) won't work with hashed passwords
 * - bcrypt.compare() extracts the salt from hash and re-hashes candidatePassword
 * - Then compares the two hashes (timing-safe comparison)
 */
adminSchema.methods.comparePassword = async function (candidatePassword) {
  // 'this.password' is the stored hash from database
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the Admin model
// mongoose.model('Admin', schema) - 'Admin' becomes the collection name in MongoDB (admins)
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
