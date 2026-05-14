/**
 * DATABASE SEEDER
 * ================
 * Seeds the database with an initial Admin account.
 *
 * Why a seeder?
 * - The app requires at least one admin to function
 * - Admin accounts cannot be created via API (no public registration)
 * - This script creates the first admin so the system can be used
 *
 * Usage:
 *   node src/utils/seeder.js
 *
 * The admin credentials are:
 *   Email: admin@example.com
 *   Password: Admin@123
 *
 * CHANGE THESE CREDENTIALS IMMEDIATELY in production!
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Admin = require("../models/admin.model");
const connectDB = require("../config/database");

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
      console.log("✅ Admin already exists! No seeding needed.");
      console.log(`   Email: admin@example.com`);
      process.exit(0);
    }

    // Create admin account
    const admin = await Admin.create({
      name: "Super Admin",
      email: "admin@example.com",
      password: "Admin@123", // Will be hashed by pre-save hook
      role: "admin",
    });

    console.log("✅ Admin seeded successfully!");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: Admin@123`);
    console.log("   ⚠️  Please change the password immediately in production!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
