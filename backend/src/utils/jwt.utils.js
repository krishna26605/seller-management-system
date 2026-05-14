/**
 * JWT UTILITY FUNCTIONS
 * ======================
 * Helper functions for creating and working with JWT tokens.
 *
 * HOW JWT TOKEN GENERATION WORKS:
 * 1. jwt.sign(payload, secret, options) creates a token
 * 2. Payload: data embedded in token (user id, role)
 * 3. Secret: private key used to sign token (from .env)
 * 4. Options: expiry time, algorithm, etc.
 *
 * The generated token looks like:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YiIsInJvbGUiOiJhZG1pbiJ9.abc123
 * [Header].[Payload].[Signature]
 *
 * To decode payload (without verifying): jwt.decode(token)
 * To verify AND decode: jwt.verify(token, secret) - used in auth middleware
 */

const jwt = require("jsonwebtoken");

/**
 * generateToken - Creates a signed JWT token for a user
 *
 * @param {Object} payload - Data to embed in token
 *   - payload.id: MongoDB ObjectId of the user
 *   - payload.role: "admin" or "seller"
 * @returns {string} Signed JWT token string
 *
 * The token is sent to the frontend after successful login.
 * Frontend stores it and sends it with every request.
 * The auth middleware decodes it to identify the user.
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload, // What to store in the token
    process.env.JWT_SECRET, // Secret key from .env file
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d", // Token expires in 7 days
    }
  );
};

module.exports = { generateToken };
