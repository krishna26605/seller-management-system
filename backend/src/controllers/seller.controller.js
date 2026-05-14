/**
 * SELLER CONTROLLER
 * ==================
 * Handles all business logic for seller-related API endpoints.
 *
 * Endpoints handled:
 * - POST   /api/seller/login              -> sellerLogin
 * - POST   /api/seller/products           -> addProduct
 * - GET    /api/seller/products           -> getProducts
 * - GET    /api/seller/products/:id/pdf   -> generateProductPDF
 * - DELETE /api/seller/products/:id       -> deleteProduct
 *
 * Security:
 * - All product endpoints require seller authentication
 * - Sellers can only see/delete THEIR OWN products
 * - PDF is only accessible to the product's owner
 */

const path = require("path");
const PDFDocument = require("pdfkit");
const Seller = require("../models/seller.model");
const Product = require("../models/product.model");
const { generateToken } = require("../utils/jwt.utils");
const { handleValidationErrors } = require("../utils/validation.utils");

// ============================================
// SELLER LOGIN
// ============================================

/**
 * sellerLogin - Authenticates seller and returns JWT token
 *
 * Same flow as adminLogin in admin.controller.js:
 * 1. Validate input
 * 2. Find seller by email
 * 3. Compare password with bcrypt hash
 * 4. Generate JWT token
 * 5. Return token with role: "seller"
 *
 * @route POST /api/seller/login
 * @access Public
 */
const sellerLogin = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email, password } = req.body;

    // Find seller by email, explicitly include password for comparison
    const seller = await Seller.findOne({ email }).select("+password");

    // Check if seller exists AND password matches
    if (!seller || !(await seller.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token with seller's ID and role
    const token = generateToken({
      id: seller._id,
      role: seller.role, // "seller"
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: seller.role,
      user: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        skills: seller.skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ADD PRODUCT (Seller Only)
// ============================================

/**
 * addProduct - Creates a new product with multiple brands and images
 *
 * This endpoint uses multipart/form-data because of file uploads.
 * Multer middleware processes uploaded files BEFORE this controller runs.
 *
 * HOW MULTER + BRANDS WORK TOGETHER:
 * - Form data sends: productName, productDescription as text fields
 * - Form data sends: brands as JSON string (because arrays aren't multipart-native)
 * - Form data sends: brandImages as files (multiple files)
 * - Multer saves files to disk, provides req.files array
 * - This controller parses brands JSON string, then assigns uploaded images to brands
 *
 * Image-to-Brand mapping:
 * - req.files[0] -> brands[0].image
 * - req.files[1] -> brands[1].image
 * - Images are matched by INDEX order (frontend must send in same order)
 *
 * @route POST /api/seller/products
 * @access Private (Seller only)
 */
const addProduct = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    console.log("Add Product Request:", { body: req.body, filesCount: req.files?.length });

    const { productName, productDescription } = req.body;

    // ----------------------------------------
    // PARSE BRANDS JSON
    // ----------------------------------------
    // When sending multipart/form-data, JSON must be sent as a string
    // We parse it back to an array here
    let brands;
    try {
      brands = typeof req.body.brands === "string"
        ? JSON.parse(req.body.brands)
        : req.body.brands;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid brands format. Must be a valid JSON array.",
      });
    }

    // Validate brands exist
    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one brand is required",
      });
    }

    // ----------------------------------------
    // ASSIGN UPLOADED IMAGES TO BRANDS
    // ----------------------------------------
    // req.files: array of uploaded files (processed by Multer)
    // Each file has: filename, path, mimetype, size, etc.
    // We match files to brands by array index
    const uploadedFiles = req.files || [];
    let fileCounter = 0;

    const processedBrands = brands.map((brand) => ({
      brandName: brand.brandName?.trim(),
      detail: brand.detail?.trim(),
      price: Number(brand.price),
      // If flag is true, take the next file from Multer array
      image: brand.hasNewImage && uploadedFiles[fileCounter]
        ? uploadedFiles[fileCounter++].filename
        : null,
    }));

    // ----------------------------------------
    // CREATE PRODUCT IN DATABASE
    // ----------------------------------------
    // req.userId is set by authenticate middleware (from JWT payload)
    // This associates the product with the logged-in seller
    const product = await Product.create({
      sellerId: req.userId, // From authenticate middleware
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      brands: processedBrands,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET SELLER'S PRODUCTS (Paginated)
// ============================================

/**
 * getProducts - Returns paginated products for the logged-in seller only
 *
 * Key security point: { sellerId: req.userId }
 * - This ensures sellers ONLY see their own products
 * - req.userId is extracted from JWT token (not from request body)
 * - Cannot be manipulated by frontend to see other sellers' products
 *
 * Same pagination logic as admin's getSellers.
 * See admin.controller.js for detailed pagination explanation.
 *
 * @route GET /api/seller/products?page=1&limit=10
 * @access Private (Seller only)
 */
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    // Build query - ALWAYS filter by current seller's ID
    let query = { sellerId: req.userId };

    // Optional search by product name
    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    // Run count and find queries in parallel for efficiency
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalProducts,
      limit,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GENERATE PDF FOR PRODUCT
// ============================================

/**
 * generateProductPDF - Creates and streams a PDF for a specific product
 *
 * HOW PDF GENERATION WORKS (using PDFKit):
 * 1. Create a new PDF document
 * 2. Set response headers to tell browser it's a PDF file
 * 3. Pipe the PDF document stream to the response
 * 4. Add content: text, images, styling
 * 5. Finalize the document (sends it to browser)
 *
 * Why "streaming"?
 * - Instead of generating full PDF in memory then sending it,
 *   we pipe the PDF stream directly to the HTTP response
 * - More efficient - no need to store full PDF in RAM
 * - Browser receives and displays PDF as it's being generated
 *
 * PDF Content:
 * - Product name and description
 * - For each brand: name, price, image (if available)
 * - Total price (sum of all brand prices)
 *
 * @route GET /api/seller/products/:id/pdf
 * @access Private (Seller only - their own products)
 */
const generateProductPDF = async (req, res, next) => {
  try {
    const { id } = req.params; // Product ID from URL

    // ----------------------------------------
    // FIND PRODUCT (Owner check)
    // ----------------------------------------
    // Find product by ID AND sellerId (ensures seller owns this product)
    const product = await Product.findOne({
      _id: id,
      sellerId: req.userId, // Must belong to logged-in seller
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to access it",
      });
    }

    // ----------------------------------------
    // CALCULATE TOTAL PRICE
    // ----------------------------------------
    const totalPrice = product.brands.reduce(
      (sum, brand) => sum + (brand.price || 0),
      0
    );

    // ----------------------------------------
    // CREATE PDF DOCUMENT
    // ----------------------------------------
    // PDFKit creates a PDF in memory and streams it
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `${product.productName} - Product Report`,
        Author: "Seller Admin System",
      },
    });

    // ----------------------------------------
    // SET HTTP HEADERS FOR PDF RESPONSE
    // ----------------------------------------
    // These headers tell the browser to display/download as PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${product.productName.replace(/\s+/g, "_")}_report.pdf"`
    );

    // Pipe PDF output stream to HTTP response stream
    // This means PDF data flows directly to the browser
    doc.pipe(res);

    // ----------------------------------------
    // ADD PDF CONTENT
    // ----------------------------------------

    // --- Header ---
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#1a1a2e")
      .text("Product Report", { align: "center" });

    doc.moveDown(0.5);

    // Decorative line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#4361ee")
      .lineWidth(3)
      .stroke();

    doc.moveDown(1);

    // --- Product Details Section ---
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#4361ee")
      .text("Product Information");

    doc.moveDown(0.5);

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#333")
      .text("Product Name: ", { continued: true })
      .font("Helvetica")
      .fillColor("#555")
      .text(product.productName);

    doc.moveDown(0.3);

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#333")
      .text("Description: ", { continued: true })
      .font("Helvetica")
      .fillColor("#555")
      .text(product.productDescription);

    doc.moveDown(1.5);

    // --- Brand Details Section ---
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#4361ee")
      .text("Brand Details");

    doc.moveDown(0.5);

    // Thin separator line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#ddd")
      .lineWidth(1)
      .stroke();

    doc.moveDown(0.5);

    // --- Loop through each brand ---
    for (let i = 0; i < product.brands.length; i++) {
      const brand = product.brands[i];

      // Brand number header
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#222")
        .text(`Brand ${i + 1}: ${brand.brandName}`);

      doc.moveDown(0.3);

      // Brand detail
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#555")
        .text(`Detail: ${brand.detail}`);

      doc.moveDown(0.2);

      // Brand price
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#2d6a4f")
        .text(`Price: ₹${brand.price.toLocaleString()}`);

      // Brand image (if available)
      if (brand.image) {
        const imagePath = path.join(
          __dirname,
          "../../uploads",
          brand.image
        );
        try {
          // Check if image file exists before embedding
          const fs = require("fs");
          if (fs.existsSync(imagePath)) {
            doc.moveDown(0.3);
            doc.image(imagePath, {
              fit: [200, 150],
              align: "left",
            });
          }
        } catch (imgError) {
          // If image can't be loaded, skip it (don't fail the PDF)
          console.warn(`Could not load image for brand ${brand.brandName}:`, imgError.message);
        }
      }

      doc.moveDown(0.8);

      // Separator between brands (except after last brand)
      if (i < product.brands.length - 1) {
        doc
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .strokeColor("#eee")
          .lineWidth(1)
          .dash(5, { space: 5 })
          .stroke();

        doc.undash(); // Reset dash style
        doc.moveDown(0.5);
      }
    }

    doc.moveDown(1);

    // --- Total Price Section ---
    // Highlighted box for total price
    const boxY = doc.y;
    doc
      .rect(50, boxY, 495, 50)
      .fillColor("#f0f4ff")
      .fill();

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#1a1a2e")
      .text(
        `Total Price: ₹${totalPrice.toLocaleString()}`,
        60,
        boxY + 16,
        { align: "left" }
      );

    doc.moveDown(2);

    // --- Footer ---
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#aaa")
      .text(
        `Generated on ${new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        { align: "center" }
      );

    // ----------------------------------------
    // FINALIZE PDF
    // ----------------------------------------
    // doc.end() finalizes the PDF and signals end of stream
    // This triggers the piped response to complete
    doc.end();
  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE PRODUCT
// ============================================

/**
 * deleteProduct - Deletes a specific product by ID
 *
 * Security:
 * - Uses { _id: id, sellerId: req.userId } to ensure:
 *   a) Product with this ID exists
 *   b) Product belongs to the logged-in seller
 * - Without the sellerId check, any authenticated seller could delete others' products
 *
 * @route DELETE /api/seller/products/:id
 * @access Private (Seller only - their own products)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find and delete in one atomic operation
    // Condition: must match both _id AND sellerId (ownership check)
    const product = await Product.findOneAndDelete({
      _id: id,
      sellerId: req.userId, // Prevents deleting other sellers' products
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to delete it",
      });
    }

    // Optionally: Delete associated image files from disk
    // This prevents accumulation of orphaned files
    const fs = require("fs");
    for (const brand of product.brands) {
      if (brand.image) {
        const imagePath = path.join(__dirname, "../../uploads", brand.image);
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Delete file synchronously
          }
        } catch (fileError) {
          // Log but don't fail - product is already deleted from DB
          console.warn(`Could not delete image file: ${brand.image}`, fileError.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: { id: product._id, productName: product.productName },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE PRODUCT
// ============================================

/**
 * updateProduct - Updates an existing product
 * 
 * Logic:
 * 1. Find product by ID and ensure it belongs to the logged-in seller.
 * 2. Parse brands from JSON string (multipart/form-data).
 * 3. Handle images:
 *    - If new image is uploaded for a brand, update it.
 *    - If no new image, keep the existing one.
 * 4. Save updated product data.
 * 
 * @route PUT /api/seller/products/:id
 * @access Private (Seller only)
 */
const updateProduct = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { id } = req.params;
    console.log("Update Product Request:", { id, body: req.body, filesCount: req.files?.length });

    const { productName, productDescription } = req.body;

    // Find existing product first to verify ownership
    const product = await Product.findOne({ _id: id, sellerId: req.userId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you do not have permission to edit it",
      });
    }

    // Parse brands
    let brands;
    try {
      brands = typeof req.body.brands === "string"
        ? JSON.parse(req.body.brands)
        : req.body.brands;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid brands format",
      });
    }

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one brand is required",
      });
    }

    // Handle brand images
    const uploadedFiles = req.files || [];
    let fileCounter = 0;

    const updatedBrands = brands.map((brand) => {
      let image = brand.image; // Keep existing image string by default
      
      // If brand has a new image being uploaded
      if (brand.hasNewImage && uploadedFiles[fileCounter]) {
        image = uploadedFiles[fileCounter].filename;
        fileCounter++;
      }

      return {
        brandName: brand.brandName?.trim(),
        detail: brand.detail?.trim(),
        price: Number(brand.price),
        image: image,
      };
    });

    // Update product fields
    product.productName = productName.trim();
    product.productDescription = productDescription.trim();
    product.brands = updatedBrands;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getProductById - Gets a single product details
 * @route GET /api/seller/products/:id
 * @access Private (Seller only)
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, sellerId: req.userId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sellerLogin, addProduct, getProducts, generateProductPDF, deleteProduct, updateProduct, getProductById };


