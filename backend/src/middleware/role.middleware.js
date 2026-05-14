/**
 * ROLE-BASED ACCESS CONTROL MIDDLEWARE
 * =====================================
 * This middleware implements Role-Based Access Control (RBAC).
 *
 * RBAC Concept:
 * - Different users have different roles ("admin", "seller")
 * - Each role has specific permissions (what they can access)
 * - Routes are protected based on required role
 *
 * HOW IT WORKS:
 * 1. authenticate middleware runs first (verifies JWT, sets req.user)
 * 2. This middleware runs second (checks if user's role is allowed)
 * 3. If role is not allowed, return 403 Forbidden
 * 4. If role is allowed, continue to route handler
 *
 * Usage Example:
 *   // Only admins can access this route
 *   router.post('/create-seller', authenticate, authorize('admin'), createSeller)
 *
 *   // Both admins and sellers can access
 *   router.get('/dashboard', authenticate, authorize('admin', 'seller'), dashboard)
 *
 * Why separate from authenticate?
 * - Single Responsibility Principle: auth = verify identity, role = check permissions
 * - Can reuse authorize() with different roles on different routes
 * - Cleaner, more readable route definitions
 */

/**
 * authorize - Creates middleware that checks if user has required role
 *
 * @param {...string} roles - Allowed roles (variadic arguments)
 * @returns {Function} Express middleware function
 *
 * This is a "middleware factory" - it returns a middleware function.
 * This pattern allows passing parameters to middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.userRole is set by authenticate middleware
    // It contains the role from the decoded JWT token

    if (!req.userRole) {
      // This shouldn't happen if authenticate ran first
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // Check if the user's role is in the list of allowed roles
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Role '${req.userRole}' is not authorized for this resource.`,
        requiredRoles: roles,
      });
    }

    // Role is authorized - proceed to route handler
    next();
  };
};

module.exports = { authorize };
