/**
 * DATABASE CONFIGURATION (WITH SMART DNS FALLBACK)
 * ==============================================
 * This file handles the MongoDB connection with a manual DNS resolution 
 * fallback to solve 'querySrv ECONNREFUSED' issues.
 */

const mongoose = require("mongoose");
const dns = require("dns");
const { promisify } = require("util");

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

/**
 * resolveManualUri - Manually resolves SRV and TXT records
 * This constructs a standard connection string if the +srv lookup fails.
 */
async function resolveManualUri(srvUri) {
  try {
    console.log("🔍 Attempting manual SRV resolution...");
    
    // Parse the srvUri
    const url = new URL(srvUri.replace("mongodb+srv://", "http://"));
    const username = url.username;
    const password = url.password;
    const hostname = url.hostname;
    const searchParams = url.searchParams;

    // 1. Resolve SRV records (Find the shards)
    const srvHostname = `_mongodb._tcp.${hostname}`;
    const srvRecords = await resolveSrv(srvHostname);
    
    if (!srvRecords || srvRecords.length === 0) {
      throw new Error("No SRV records found");
    }

    const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(",");

    // 2. Resolve TXT records (Find options like replicaSet)
    let extraOptions = "";
    try {
      const txtRecords = await resolveTxt(hostname);
      if (txtRecords && txtRecords.length > 0) {
        extraOptions = txtRecords.flat().join("&");
      }
    } catch (e) {
      console.warn("⚠️ TXT resolution failed, using default options:", e.message);
    }

    // 3. Construct Standard URI
    const finalOptions = new URLSearchParams(searchParams);
    if (extraOptions) {
      const txtParams = new URLSearchParams(extraOptions);
      txtParams.forEach((value, key) => finalOptions.set(key, value));
    }

    // Ensure ssl is true for Atlas
    if (!finalOptions.has("ssl") && !finalOptions.has("tls")) {
      finalOptions.set("ssl", "true");
    }

    const standardUri = `mongodb://${username}:${password}@${hosts}/?${finalOptions.toString()}`;
    console.log("✅ Manual URI constructed successfully");
    return standardUri;
  } catch (error) {
    console.error("❌ Manual resolution failed:", error.message);
    return null;
  }
}

/**
 * connectDB - Establishes connection to MongoDB
 */
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    // Configure DNS to use reliable servers and prefer IPv4
    try {
      if (typeof dns.setDefaultResultOrder === 'function') {
        dns.setDefaultResultOrder("ipv4first");
      }
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (e) {
      console.warn("⚠️ DNS configuration warning:", e.message);
    }

    console.log("⏳ Connecting to MongoDB...");

    const options = {
      serverSelectionTimeoutMS: 5000,
    };

    try {
      // Attempt standard connection
      const conn = await mongoose.connect(MONGO_URI, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      // If SRV error, trigger the smart fallback
      if (err.message.includes("querySrv") || err.message.includes("SRV") || err.code === "ECONNREFUSED") {
        console.warn("⚠️ SRV Connection failed, trying Smart Fallback...");
        const manualUri = await resolveManualUri(MONGO_URI);
        
        if (manualUri) {
          console.log("🔄 Retrying with standard connection string...");
          const conn = await mongoose.connect(manualUri, options);
          console.log(`✅ MongoDB Connected (via Fallback): ${conn.connection.host}`);
          return;
        }
      }
      throw err;
    }
  } catch (error) {
    console.error(`❌ Final MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
