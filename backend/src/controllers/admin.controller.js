/**
 * ADMIN CONTROLLER
 * =================
 * Handles all business logic for admin-related API endpoints.
 *
 * MVC Pattern:
 * - Model (admin.model.js): Database schema and operations
 * - View: JSON responses (API returns JSON, not HTML)
 * - Controller (this file): Business logic between routes and models
 *
 * Controllers are responsible for:
 * 1. Receiving request data (req.body, req.query, req.params)
 * 2. Validating business rules (beyond field validation)
 * 3. Calling models/services to interact with database
 * 4. Returning appropriate JSON response
 * 5. Passing errors to next() for central error handler
 *
 * Endpoints handled:
 * - POST   /api/admin/login          -> adminLogin
 * - POST   /api/admin/create-seller  -> createSeller
 * - GET    /api/admin/sellers        -> getSellers (with pagination)
 */

const Admin = require("../models/admin.model");
const Seller = require("../models/seller.model");
const { generateToken } = require("../utils/jwt.utils");
const { handleValidationErrors } = require("../utils/validation.utils");

// ============================================
// ADMIN LOGIN
// ============================================

/**
 * adminLogin - Authenticates admin and returns JWT token
 *
 * Flow:
 * 1. Validate input (email, password)
 * 2. Find admin by email in database
 * 3. Compare provided password with stored hash
 * 4. Generate JWT token with admin ID and role
 * 5. Return token and role to frontend
 *
 * Security Notes:
 * - We use .select('+password') because password field has select:false by default
 * - Password comparison is done with bcrypt (not plain text comparison)
 * - Generic error message ("Invalid credentials") prevents user enumeration attacks
 *
 * @route POST /api/admin/login
 * @access Public (no authentication required)
 */
const adminLogin = async (req, res, next) => {
  try {
    // Check for validation errors from express-validator
    if (handleValidationErrors(req, res)) return;

    const { email, password } = req.body;

    // STEP 1: Find admin by email
    // .select('+password') includes password field (excluded by default for security)
    const admin = await Admin.findOne({ email }).select("+password");

    // STEP 2: Verify admin exists AND password is correct
    // Using a single check to prevent "user enumeration" attacks
    // (attackers shouldn't know if email exists without correct password)
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // STEP 3: Generate JWT token
    // Token contains: id (MongoDB ObjectId) and role ("admin")
    // This token is sent with every future request as proof of authentication
    const token = generateToken({
      id: admin._id,
      role: admin.role,
    });

    // STEP 4: Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // Frontend stores this and sends in Authorization header
      role: admin.role, // Frontend uses this to show correct dashboard
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    // Pass to centralized error handler
    next(error);
  }
};

// ============================================
// CREATE SELLER (Admin Only)
// ============================================

/**
 * createSeller - Admin creates a new seller account
 *
 * Flow:
 * 1. Validate input fields
 * 2. Check email uniqueness
 * 3. Create new seller (password auto-hashed by pre-save hook)
 * 4. Return seller data (without password)
 *
 * This endpoint is protected:
 * - authenticate middleware: verifies JWT token
 * - authorize('admin') middleware: ensures only admins can access
 *
 * Why only admin can create sellers?
 * - Sellers cannot self-register (controlled environment)
 * - Admin manages who can sell on the platform
 *
 * @route POST /api/admin/create-seller
 * @access Private (Admin only)
 */
const createSeller = async (req, res, next) => {
  try {
    // Check validation errors from middleware
    if (handleValidationErrors(req, res)) return;

    const { name, email, mobileNo, country, state, skills, password } = req.body;

    // STEP 1: Check if email is already registered
    // Mongoose will also throw a duplicate key error, but this gives a cleaner message
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(409).json({
        success: false,
        message: "A seller with this email already exists",
      });
    }

    // STEP 2: Create new seller
    // The pre-save hook in seller.model.js automatically hashes the password
    // before it gets stored in MongoDB
    const seller = await Seller.create({
      name,
      email,
      mobileNo,
      country,
      state,
      skills: Array.isArray(skills) ? skills : [skills], // Ensure array format
      password, // Will be hashed by pre-save hook
      role: "seller", // Hardcoded - sellers cannot be admins
    });

    // STEP 3: Return seller data (excluding password)
    // toObject() converts Mongoose document to plain JS object
    const sellerData = seller.toObject();
    delete sellerData.password; // Remove password from response

    res.status(201).json({
      success: true,
      message: "Seller account created successfully",
      data: sellerData,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ALL SELLERS (Paginated)
// ============================================

/**
 * getSellers - Returns paginated list of all sellers
 *
 * HOW PAGINATION WORKS:
 * - Client sends page number (default: 1) and limit (default: 10)
 * - Backend calculates how many documents to SKIP
 * - Formula: skip = (page - 1) * limit
 * - Example: page=2, limit=10 -> skip=10 (skip first 10, get next 10)
 *
 * - totalPages = Math.ceil(totalCount / limit)
 *   Math.ceil ensures we include partial page
 *   Example: 25 sellers, limit 10 -> 3 pages (10, 10, 5)
 *
 * Optional Search:
 * - If 'search' query param is provided, filter by name or email
 * - Uses regex with 'i' flag for case-insensitive matching
 *
 * @route GET /api/admin/sellers?page=1&limit=10&search=john
 * @access Private (Admin only)
 */
const getSellers = async (req, res, next) => {
  try {
    // ----------------------------------------
    // PARSE QUERY PARAMETERS
    // ----------------------------------------
    // req.query contains URL query string parameters
    // Example: /api/admin/sellers?page=2&limit=5
    const page = parseInt(req.query.page) || 1; // Default page 1
    const limit = parseInt(req.query.limit) || 10; // Default 10 per page
    const search = req.query.search || ""; // Optional search query

    // Validate page and limit values
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive numbers",
      });
    }

    // ----------------------------------------
    // BUILD SEARCH QUERY
    // ----------------------------------------
    // MongoDB query object - starts empty (match all)
    let query = {};

    if (search) {
      // $or: match documents where name OR email contains the search term
      // $regex: pattern matching (like SQL LIKE)
      // $options: 'i' makes it case-insensitive
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    // ----------------------------------------
    // PAGINATION CALCULATION
    // ----------------------------------------
    // skip: how many documents to skip (offset)
    // Example: page=3, limit=10 -> skip=20 (skip items 1-20, return 21-30)
    const skip = (page - 1) * limit;

    // ----------------------------------------
    // DATABASE QUERIES (Parallel)
    // ----------------------------------------
    // Promise.all runs both queries simultaneously (faster than sequential)
    // countDocuments: count matching documents (for total pages calculation)
    // find: get actual seller documents with pagination
    const [totalSellers, sellers] = await Promise.all([
      Seller.countDocuments(query),
      Seller.find(query)
        .select("-password") // Exclude password from results
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip) // Skip previous pages
        .limit(limit), // Limit to page size
    ]);

    // Calculate total pages
    // Math.ceil: round up (e.g., 25/10 = 2.5 -> 3 pages)
    const totalPages = Math.ceil(totalSellers / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalSellers,
      limit,
      data: sellers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getSellerById - Fetch single seller details
 * @route GET /api/admin/sellers/:id
 */
const getSellerById = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id).select("-password");
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }
    res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * updateSeller - Update seller info
 * @route PUT /api/admin/sellers/:id
 */
const updateSeller = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { name, email, mobileNo, country, state, skills, password } = req.body;

    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (email && email !== seller.email) {
      const existingEmail = await Seller.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
      seller.email = email;
    }

    if (name) seller.name = name;
    if (mobileNo) seller.mobileNo = mobileNo;
    if (country) seller.country = country;
    if (state) seller.state = state;
    if (skills) seller.skills = Array.isArray(skills) ? skills : [skills];
    if (password) seller.password = password;

    await seller.save();

    const updatedSeller = seller.toObject();
    delete updatedSeller.password;

    res.status(200).json({
      success: true,
      message: "Seller updated successfully",
      data: updatedSeller,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { adminLogin, createSeller, getSellers, getSellerById, updateSeller };
