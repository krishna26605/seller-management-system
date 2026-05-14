/**
 * JWT AUTHENTICATION MIDDLEWARE
 * =============================
 * This middleware protects routes that require a logged-in user.
 *
 * HOW JWT (JSON Web Token) AUTHENTICATION WORKS:
 * ================================================
 *
 * 1. USER LOGS IN:
 *    - User sends email + password to /api/admin/login or /api/seller/login
 *    - Backend verifies credentials
 *    - Backend creates a JWT token containing: { id, role }
 *    - Token is sent back to frontend
 *
 * 2. SUBSEQUENT REQUESTS:
 *    - Frontend stores token (localStorage or cookie)
 *    - Frontend sends token in every request header:
 *      Authorization: Bearer <token>
 *    - This middleware runs BEFORE the route handler
 *    - Middleware extracts token, verifies it
 *    - If valid: attaches user data to req.user, continues to route
 *    - If invalid/missing: returns 401 Unauthorized error
 *
 * JWT Token Structure:
 *    Header.Payload.Signature
 *    - Header: algorithm type (HS256)
 *    - Payload: { id, role, iat (issued at), exp (expiry) }
 *    - Signature: HMAC-SHA256(header + payload + secret)
 *
 * Why JWT?
 * - Stateless: server doesn't store session data
 * - Scalable: works across multiple servers
 * - Self-contained: token includes user info
 */

const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Seller = require("../models/seller.model");

/**
 * authenticate - Middleware to verify JWT token
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * Usage: app.get('/protected', authenticate, routeHandler)
 */
const authenticate = async (req, res, next) => {
  try {
    // ----------------------------------------
    // STEP 1: Extract token from request header
    // ----------------------------------------
    // Token is sent in Authorization header as: "Bearer <token>"
    // We split by space to get just the token part
    const authHeader = req.headers.authorization;

    // Also support token as query parameter for browser-navigated URLs (e.g., PDF view)
    // When user opens PDF in new browser tab, custom headers can't be set
    // So frontend sends token as ?token=<jwt> query parameter
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token;
    } else {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided. Please login first.",
      });
    }

    // ----------------------------------------
    // STEP 2: Verify the token
    // ----------------------------------------
    // jwt.verify():
    // - Checks the signature using JWT_SECRET
    // - Checks if token has expired
    // - Returns decoded payload if valid
    // - Throws error if invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id: "...", role: "admin/seller", iat: ..., exp: ... }

    // ----------------------------------------
    // STEP 3: Find user in database
    // ----------------------------------------
    // We verify user still exists in DB (account not deleted)
    // This also handles cases where admin revoked access

    let user;
    if (decoded.role === "admin") {
      // Look up admin by ID from token payload
      user = await Admin.findById(decoded.id).select("-password");
    } else if (decoded.role === "seller") {
      // Look up seller by ID from token payload
      user = await Seller.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists. Please login again.",
      });
    }

    // ----------------------------------------
    // STEP 4: Attach user to request object
    // ----------------------------------------
    // Now route handlers can access req.user to know WHO is making the request
    req.user = user;
    req.userId = user._id;
    req.userRole = decoded.role;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle specific JWT errors with meaningful messages
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // Unknown error - pass to global error handler
    next(error);
  }
};

module.exports = { authenticate };
