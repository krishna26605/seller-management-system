/**
 * MULTER FILE UPLOAD CONFIGURATION
 * ==================================
 * Multer is a middleware for handling multipart/form-data (file uploads).
 *
 * Why Multer?
 * - Express cannot handle file uploads by default
 * - Multer processes multipart form data and saves files to disk
 * - Provides file type validation, size limits, and custom naming
 *
 * HOW FILE UPLOAD WORKS:
 * 1. Frontend sends form with files (multipart/form-data)
 * 2. Multer intercepts the request before route handler
 * 3. Multer saves files to disk, adds file info to req.files
 * 4. Route handler can access req.files to get saved file paths
 * 5. File path/name is saved to database (not the file itself)
 *
 * Storage Strategy:
 * - diskStorage: saves files to local filesystem
 * - Alternative: memoryStorage (store in RAM temporarily, then upload to cloud)
 * - For production: consider AWS S3, Cloudinary, etc.
 *
 * File URL Access:
 * - Saved to: uploads/<timestamp>-<originalname>
 * - Accessible via: GET /uploads/<filename>
 * - This works because app.js serves the uploads folder statically
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================================
// ENSURE UPLOAD DIRECTORY EXISTS
// ============================================

// Create uploads directory if it doesn't exist
// fs.mkdirSync with recursive:true creates nested directories if needed
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================
// DISK STORAGE CONFIGURATION
// ============================================

/**
 * diskStorage - Defines WHERE and HOW to save files
 *
 * destination: function that determines the folder to save files
 * filename: function that determines the file name to use
 */
const storage = multer.diskStorage({
  /**
   * destination - Specifies upload folder
   * @param {Object} req - Express request
   * @param {Object} file - File information
   * @param {Function} cb - Callback: cb(error, folderPath)
   */
  destination: (req, file, cb) => {
    // Save all uploads to the "uploads" folder
    // cb(null, path) - null means no error
    cb(null, uploadDir);
  },

  /**
   * filename - Specifies how to name the saved file
   * @param {Object} req - Express request
   * @param {Object} file - File information (originalname, mimetype, etc.)
   * @param {Function} cb - Callback: cb(error, filename)
   *
   * Why use timestamp + random number?
   * - Prevents filename collisions (two files with same name)
   * - Makes filenames unique and unpredictable (security)
   * - Example: "1715789123456-847362-product-image.jpg"
   */
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const extension = path.extname(file.originalname); // e.g., ".jpg"
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, "-") // Replace special chars with dash
      .toLowerCase();
    cb(null, `${uniqueSuffix}-${baseName}${extension}`);
  },
});

// ============================================
// FILE FILTER (Validation)
// ============================================

/**
 * fileFilter - Validates file type before accepting upload
 * Only allows image files (JPEG, PNG, GIF, WebP)
 *
 * @param {Object} req - Express request
 * @param {Object} file - File information
 * @param {Function} cb - Callback: cb(error, accept)
 *   - cb(null, true) - Accept file
 *   - cb(null, false) - Reject file without error
 *   - cb(new Error()) - Reject file with error
 */
const fileFilter = (req, file, cb) => {
  // Allowed MIME types for image uploads
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    // Reject with descriptive error
    cb(
      new Error(
        `File type '${file.mimetype}' is not allowed. Only JPEG, PNG, GIF, and WebP images are accepted.`
      ),
      false
    );
  }
};

// ============================================
// MULTER INSTANCE
// ============================================

/**
 * upload - Configured multer instance
 * Ready to use as middleware in routes
 *
 * limits.fileSize: Maximum file size in bytes (5MB = 5 * 1024 * 1024)
 */
const upload = multer({
  storage, // Use disk storage defined above
  fileFilter, // Validate file types
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});

module.exports = upload;
