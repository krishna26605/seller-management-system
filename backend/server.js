/**
 * SERVER ENTRY POINT
 * ==================
 * This is the main entry file for the backend server.
 * It loads environment variables, connects to MongoDB,
 * and starts the Express HTTP server.
 *
 * Flow:
 * 1. Load .env variables
 * 2. Import the configured Express app
 * 3. Connect to MongoDB
 * 4. Start listening on the specified port
 */

// Load environment variables from .env file FIRST
// Must be called before any other imports that rely on process.env
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");

// Get PORT from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

/**
 * Start the server after connecting to MongoDB.
 * Using async IIFE (Immediately Invoked Function Expression)
 * to allow await at top-level.
 */
(async () => {
  try {
    // Step 1: Connect to MongoDB database
    await connectDB();

    // Step 2: Start the Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // Exit process with failure code
  }
})();
