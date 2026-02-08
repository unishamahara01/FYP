const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Import database connection and User model
const connectDB = require("./config/database");
const User = require("./models/User");
const PasswordReset = require("./models/PasswordReset");

const app = express();

// Connect to MongoDB
connectDB();

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "your-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos[0].value;
      user.authProvider = 'google';
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    const newUser = new User({
      googleId: profile.id,
      fullName: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
      role: "Pharmacist", // Default role
      permissions: ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"],
      authProvider: "google"
    });
    
    await newUser.save();
    return done(null, newUser);
    
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Middleware to check user role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access denied. Insufficient permissions.",
        requiredRole: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware to check specific permissions
const authorizePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the full user object to check permissions
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every(permission => 
      user.permissions && user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Access denied. Missing required permissions.",
        requiredPermissions,
        userPermissions: user.permissions
      });
    }

    next();
  };
};

// Routes

// Health check
app.get("/", (req, res) => {
  res.json({ message: "MediTrust Backend API is running", status: "healthy" });
});

// Register endpoint
app.post("/api/auth/register", [
  body("fullName").trim().isLength({ min: 2 }).withMessage("Full name must be at least 2 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["Pharmacist", "Admin", "Staff"]).withMessage("Invalid role")
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }

    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set permissions based on role
    let permissions = [];
    if (role === "Admin") {
      permissions = ["view_all", "edit_all", "delete_all", "manage_users", "view_reports", "manage_inventory"];
    } else if (role === "Pharmacist") {
      permissions = ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"];
    } else if (role === "Staff") {
      permissions = ["view_inventory", "view_orders"];
    }

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      permissions,
      authProvider: 'local'
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    // Return user data (password excluded by toJSON method) and token
    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login endpoint
app.post("/api/auth/login", [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required")
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Save login history
    const loginRecord = {
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      browser: req.headers['user-agent'] || 'Unknown',
      device: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
      success: true
    };
    
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push(loginRecord);
    user.lastLogin = new Date();
    
    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user data (password excluded by toJSON method) and token
    res.json({
      message: "Login successful",
      user: user,
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user profile (protected route)
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Google OAuth routes
app.get("/api/auth/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT token for the user
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

// Google Token Verification (for frontend Google Sign-In)
app.post("/api/auth/google/verify", async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;
    
    // Check if user already exists with Google ID
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.avatar = picture;
        user.authProvider = 'google';
        await user.save();
      } else {
        // Create new user
        user = new User({
          googleId,
          fullName: name,
          email,
          avatar: picture,
          role: "Pharmacist", // Default role
          permissions: ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"],
          authProvider: "google"
        });
        await user.save();
      }
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data (password excluded by toJSON method) and token
    res.json({
      message: "Google authentication successful",
      user: user,
      token
    });
    
  } catch (error) {
    console.error("Google verification error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

// Logout endpoint (client-side token removal)
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" });
});

// Forgot Password endpoint - Send reset code to email
app.post("/api/auth/forgot-password", [
  body("email").isEmail().withMessage("Please provide a valid email")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in database with 15-minute expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Delete any existing reset codes for this email
    await PasswordReset.deleteMany({ email });
    
    // Create new reset code
    await PasswordReset.create({
      email,
      code: resetCode,
      expiresAt,
      used: false
    });

    // Send email with reset code
    try {
      await emailTransporter.sendMail({
        from: `"MediTrust" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Code - MediTrust",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Password Reset Request</h2>
            <p>Hello ${user.fullName},</p>
            <p>You requested to reset your password for your MediTrust account.</p>
            <p>Your password reset code is:</p>
            <div style="background-color: #f0f4f8; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; letter-spacing: 5px; margin: 0;">${resetCode}</h1>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">MediTrust - Intelligent Pharmacy Management System</p>
          </div>
        `,
      });

      res.json({ 
        message: "Password reset code sent to your email",
        email: email 
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      res.status(500).json({ message: "Failed to send email. Please try again later." });
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset Password endpoint - Verify code and update password
app.post("/api/auth/reset-password", [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("code").isLength({ min: 6, max: 6 }).withMessage("Reset code must be 6 digits"),
  body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }

    const { email, code, newPassword } = req.body;

    // Find reset code in database
    const resetRecord = await PasswordReset.findOne({ 
      email, 
      code,
      used: false,
      expiresAt: { $gt: new Date() } // Not expired
    });

    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    // Mark reset code as used
    resetRecord.used = true;
    await resetRecord.save();

    res.json({ message: "Password reset successful. You can now login with your new password." });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Dashboard data endpoint (protected)
app.get("/api/dashboard/stats", authenticateToken, (req, res) => {
  // Mock dashboard data
  const dashboardData = {
    totalSKUs: 5230,
    expiringItems: 124,
    predictedShortages: 18,
    todaysSales: 124500, // in NPR
    salesForecast: [
      { month: "Jan", actual: 95000, predicted: 98000 },
      { month: "Feb", actual: 102000, predicted: 105000 },
      { month: "Mar", actual: 118000, predicted: 115000 },
      { month: "Apr", actual: 125000, predicted: 128000 },
      { month: "May", actual: 134000, predicted: 132000 },
      { month: "Jun", actual: 142000, predicted: 145000 }
    ],
    expiryRisk: [
      {
        id: 1,
        productName: "Amoxicillin 750mg",
        batchNumber: "AMX-2023-001",
        expiryDate: "2024-08-15",
        riskScore: "High",
        action: "Transfer to another store"
      },
      {
        id: 2,
        productName: "Metformin 500mg",
        batchNumber: "MET-2023-025",
        expiryDate: "2024-09-01",
        riskScore: "Medium",
        action: "Promote sales/Offer discount"
      }
    ]
  };

  res.json(dashboardData);
});

// ============================================
// ROLE-BASED AUTHORIZATION ROUTES
// ============================================

// Admin Only Routes
app.get("/api/admin/users", authenticateToken, authorizeRole("Admin"), async (req, res) => {
  try {
    // Return all users (passwords excluded by toJSON method)
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      message: "All users retrieved successfully",
      users: users,
      total: users.length
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/admin/users", authenticateToken, authorizeRole("Admin"), [
  body("fullName").trim().isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("role").isIn(["Pharmacist", "Admin", "Staff"])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set permissions based on role
    let permissions = [];
    if (role === "Admin") {
      permissions = ["view_all", "edit_all", "delete_all", "manage_users", "view_reports", "manage_inventory"];
    } else if (role === "Pharmacist") {
      permissions = ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"];
    } else if (role === "Staff") {
      permissions = ["view_inventory", "view_orders"];
    }

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      permissions,
      authProvider: 'local'
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: newUser
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/admin/users/:id", authenticateToken, authorizeRole("Admin"), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Edit user endpoint
app.put("/api/admin/users/:id", authenticateToken, authorizeRole("Admin"), [
  body("fullName").optional().trim().isLength({ min: 2 }),
  body("email").optional().isEmail(),
  body("role").optional().isIn(["Pharmacist", "Admin", "Staff"])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    const { fullName, email, role } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use by another user" });
      }
    }

    // Update user fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (role) {
      user.role = role;
      // Update permissions based on new role
      if (role === "Admin") {
        user.permissions = ["view_all", "edit_all", "delete_all", "manage_users", "view_reports", "manage_inventory"];
      } else if (role === "Pharmacist") {
        user.permissions = ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"];
      } else if (role === "Staff") {
        user.permissions = ["view_inventory", "view_orders"];
      }
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: user
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin and Pharmacist Routes
app.get("/api/inventory", authenticateToken, authorizeRole("Admin", "Pharmacist"), (req, res) => {
  const inventory = [
    { id: 1, name: "Paracetamol 500mg", stock: 500, price: 5, category: "Pain Relief" },
    { id: 2, name: "Amoxicillin 750mg", stock: 200, price: 25, category: "Antibiotic" },
    { id: 3, name: "Metformin 500mg", stock: 350, price: 15, category: "Diabetes" },
    { id: 4, name: "Aspirin 100mg", stock: 450, price: 8, category: "Cardiovascular" },
    { id: 5, name: "Omeprazole 20mg", stock: 300, price: 12, category: "Gastric" }
  ];
  
  res.json({
    message: "Inventory retrieved successfully",
    inventory,
    total: inventory.length
  });
});

app.post("/api/inventory", authenticateToken, authorizePermission("edit_inventory"), (req, res) => {
  const { name, stock, price, category } = req.body;
  
  res.status(201).json({
    message: "Inventory item added successfully",
    item: { id: Date.now(), name, stock, price, category }
  });
});

app.put("/api/inventory/:id", authenticateToken, authorizePermission("edit_inventory"), (req, res) => {
  const { id } = req.params;
  const { name, stock, price, category } = req.body;
  
  res.json({
    message: "Inventory item updated successfully",
    item: { id: parseInt(id), name, stock, price, category }
  });
});

// OLD DUMMY ORDERS ENDPOINT REMOVED - Using MongoDB endpoint below

// OLD DUMMY POST ORDER ENDPOINT REMOVED - Using MongoDB endpoint below

// Reports - Admin and Pharmacist only
app.get("/api/reports", authenticateToken, authorizePermission("view_reports"), (req, res) => {
  const reports = {
    dailySales: 124500,
    monthlySales: 3500000,
    topSellingProducts: [
      { name: "Paracetamol 500mg", sold: 450, revenue: 2250 },
      { name: "Metformin 500mg", sold: 320, revenue: 4800 },
      { name: "Amoxicillin 750mg", sold: 180, revenue: 4500 }
    ],
    lowStockItems: [
      { name: "Aspirin 100mg", stock: 45, reorderLevel: 100 },
      { name: "Omeprazole 20mg", stock: 60, reorderLevel: 100 }
    ]
  };
  
  res.json({
    message: "Reports retrieved successfully",
    reports
  });
});

// Get user permissions
app.get("/api/auth/permissions", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      role: user.role,
      permissions: user.permissions || []
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile photo
app.put("/api/user/avatar", authenticateToken, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.avatar = avatar;
    await user.save();
    
    res.json({ message: "Profile photo updated successfully", user });
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user preferences
app.put("/api/user/preferences", authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    res.json({ message: "Preferences updated successfully", preferences: user.preferences });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user login history
app.get("/api/user/login-history", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ loginHistory: user.loginHistory || [] });
  } catch (error) {
    console.error("Get login history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== PHARMACY DATA ENDPOINTS ====================

// Import models
const Product = require("./models/Product");
const Order = require("./models/Order");
const Sale = require("./models/Sale");
const Supplier = require("./models/Supplier");
const Customer = require("./models/Customer");

// GET Dashboard Stats
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    
    // Expiring within 90 days
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringItems = await Product.countDocuments({
      expiryDate: {
        $lte: ninetyDaysFromNow,
        $gte: new Date()
      }
    });
    
    // Low stock (quantity < 50)
    const lowStockItems = await Product.countDocuments({
      quantity: { $lt: 50 }
    });
    
    // Today's sales from Orders
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todaysOrders = await Order.find({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    });
    
    const todaysSales = todaysOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      totalSKUs: totalProducts,
      expiringItems: expiringItems,
      predictedShortages: lowStockItems,
      todaysSales: todaysSales
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

// GET Top Selling Products (REAL DATA)
app.get("/api/dashboard/top-products", authenticateToken, async (req, res) => {
  try {
    // Aggregate orders to find top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          productName: "$productInfo.name",
          unitsSold: "$totalQuantity",
          revenue: "$totalRevenue"
        }
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ message: "Error fetching top products" });
  }
});

// GET Recent Activity (REAL DATA)
app.get("/api/dashboard/recent-activity", authenticateToken, async (req, res) => {
  try {
    const activities = [];
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();
    
    recentOrders.forEach(order => {
      activities.push({
        type: 'order',
        icon: 'green',
        text: `New order created - ${order.customerName}`,
        time: order.createdAt
      });
    });
    
    // Get recently updated products
    const recentProducts = await Product.find()
      .sort({ updatedAt: -1 })
      .limit(2)
      .lean();
    
    recentProducts.forEach(product => {
      activities.push({
        type: 'product',
        icon: 'blue',
        text: `Product stock updated - ${product.name}`,
        time: product.updatedAt || product.createdAt
      });
    });
    
    // Get recent customers
    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();
    
    recentCustomers.forEach(customer => {
      activities.push({
        type: 'customer',
        icon: 'purple',
        text: `New customer registered - ${customer.fullName}`,
        time: customer.createdAt
      });
    });
    
    // Sort all activities by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Add AI activity if there are expiring items
    const expiringCount = await Product.countDocuments({
      expiryDate: {
        $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        $gte: new Date()
      }
    });
    
    if (expiringCount > 0) {
      activities.splice(2, 0, {
        type: 'ai',
        icon: 'orange',
        text: `AI detected ${expiringCount} expiry risks`,
        time: new Date()
      });
    }
    
    res.json(activities.slice(0, 5));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Error fetching recent activity" });
  }
});

// GET Sales Forecast Data (last 6 months)
app.get("/api/sales/forecast", authenticateToken, async (req, res) => {
  try {
    const dailySales = [];
    const today = new Date();
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      // Get actual sales for this day
      const orders = await Order.find({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      const dailyTotal = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Format date as "Jan 1", "Jan 2", etc.
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateLabel = `${monthNames[startOfDay.getMonth()]} ${startOfDay.getDate()}`;
      
      dailySales.push({
        month: dateLabel,
        actual: dailyTotal
      });
    }
    
    res.json(dailySales);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    res.status(500).json({ message: "Error fetching sales data" });
  }
});

// GET All Products
app.get("/api/products", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find().populate('supplier').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// POST Create New Product
app.post("/api/products", authenticateToken, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
});

// GET All Orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer')
      .populate('processedBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// POST Create New Order
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    console.log("📦 Creating new order...");
    console.log("Request body:", req.body);
    
    const { customerName, items, paymentMethod } = req.body;
    
    // Calculate order details
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        });
      }
      
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: subtotal
      });
      
      // Update product quantity
      product.quantity -= item.quantity;
      await product.save();
    }
    
    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${(orderCount + 1001).toString()}`;
    
    // Create order
    const newOrder = new Order({
      orderNumber,
      customerName,
      items: orderItems,
      totalAmount,
      paymentMethod,
      status: 'Completed',
      processedBy: req.user.id,
      createdAt: new Date(),
      completedAt: new Date()
    });
    
    await newOrder.save();
    
    // Create sale record
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    
    const newSale = new Sale({
      order: newOrder._id,
      amount: totalAmount,
      date: now,
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      paymentMethod,
      processedBy: req.user.id
    });
    
    await newSale.save();
    
    // Update customer's last visit date if customer exists (case-insensitive search)
    const customer = await Customer.findOne({ 
      fullName: { $regex: new RegExp(`^${customerName}$`, 'i') } 
    });
    if (customer) {
      customer.lastVisit = now;
      customer.totalPurchases = (customer.totalPurchases || 0) + totalAmount;
      await customer.save();
      console.log("👤 Customer last visit updated:", customerName);
    }
    
    console.log("✅ Order created successfully:", orderNumber);
    console.log("💰 Sale amount:", totalAmount);
    
    res.status(201).json({ 
      message: "Order created successfully", 
      order: newOrder,
      sale: newSale
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});

// GET All Suppliers
app.get("/api/suppliers", authenticateToken, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ message: "Error fetching suppliers" });
  }
});

// GET All Customers
app.get("/api/customers", authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
});

// POST Create New Customer
app.post("/api/customers", authenticateToken, async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json({ message: "Customer created successfully", customer: newCustomer });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Error creating customer", error: error.message });
  }
});

// PUT Update Customer
app.put("/api/customers/:id", authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer updated successfully", customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Error updating customer", error: error.message });
  }
});

// DELETE Customer
app.delete("/api/customers/:id", authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Error deleting customer", error: error.message });
  }
});

// POST Create New Supplier
app.post("/api/suppliers", authenticateToken, async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();
    res.status(201).json({ message: "Supplier created successfully", supplier: newSupplier });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ message: "Error creating supplier", error: error.message });
  }
});

// PUT Update Supplier
app.put("/api/suppliers/:id", authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier updated successfully", supplier });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ message: "Error updating supplier", error: error.message });
  }
});

// DELETE Supplier
app.delete("/api/suppliers/:id", authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ message: "Error deleting supplier", error: error.message });
  }
});

// GET Monthly Sales Report
app.get("/api/sales/monthly", authenticateToken, async (req, res) => {
  try {
    const monthlySales = await Sale.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalSales: { $sum: "$amount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);
    res.json(monthlySales);
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    res.status(500).json({ message: "Error fetching monthly sales" });
  }
});

// ==================== REPORTS ENDPOINTS ====================

// Sales Report
app.get("/api/reports/sales", authenticateToken, async (req, res) => {
  try {
    const { range } = req.query;
    const now = new Date();
    let startDate;

    switch(range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const sales = await Sale.find({ date: { $gte: startDate } });
    const orders = await Order.find({ createdAt: { $gte: startDate } });

    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalOrders = orders.length;
    const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Top products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      totalSales,
      totalOrders,
      averageOrder: Math.round(averageOrder),
      topProducts
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Error generating sales report" });
  }
});

// Inventory Report
app.get("/api/reports/inventory", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStockItems = products.filter(p => p.quantity <= p.reorderLevel);
    const lowStockCount = lowStockItems.length;

    res.json({
      totalProducts,
      totalValue: Math.round(totalValue),
      lowStockCount,
      lowStockItems: lowStockItems.map(p => ({
        name: p.name,
        quantity: p.quantity,
        reorderLevel: p.reorderLevel
      }))
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({ message: "Error generating inventory report" });
  }
});

// Expiry Report
app.get("/api/reports/expiry", authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const products = await Product.find();
    
    const expiringProducts = products
      .filter(p => p.expiryDate && new Date(p.expiryDate) <= thirtyDaysFromNow && new Date(p.expiryDate) > now)
      .map(p => {
        const daysLeft = Math.ceil((new Date(p.expiryDate) - now) / (1000 * 60 * 60 * 24));
        return {
          name: p.name,
          batchNumber: p.batchNumber,
          expiryDate: p.expiryDate,
          quantity: p.quantity,
          daysLeft
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const expired = products.filter(p => p.expiryDate && new Date(p.expiryDate) <= now).length;

    res.json({
      expiringSoon: expiringProducts.length,
      expired,
      expiringProducts
    });
  } catch (error) {
    console.error("Error generating expiry report:", error);
    res.status(500).json({ message: "Error generating expiry report" });
  }
});

// Customer Report
app.get("/api/reports/customer", authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.find();
    
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.lastVisit).length;
    
    const topCustomers = customers
      .filter(c => c.totalPurchases > 0)
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 10)
      .map(c => ({
        fullName: c.fullName,
        totalPurchases: c.totalPurchases,
        lastVisit: c.lastVisit
      }));

    res.json({
      totalCustomers,
      activeCustomers,
      topCustomers
    });
  } catch (error) {
    console.error("Error generating customer report:", error);
    res.status(500).json({ message: "Error generating customer report" });
  }
});

// ==================== AI EXPIRY PREDICTION ====================

// AI Expiry Prediction Endpoint (ML-Powered)
app.get("/api/ai/expiry-prediction", authenticateToken, async (req, res) => {
  console.log("🤖 AI Expiry Prediction endpoint called");
  try {
    // Try to use ML backend first
    try {
      const mlResponse = await fetch('http://localhost:5001/predict');
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        console.log("✅ Using ML predictions from Python backend");
        return res.json(mlData);
      }
    } catch (mlError) {
      console.log("⚠️ ML backend not available, using fallback algorithm");
    }
    
    // Fallback to rule-based if ML backend is not available
    const products = await Product.find({ expiryDate: { $exists: true } });
    const now = new Date();
    
    const predictions = products.map(product => {
      const expiryDate = new Date(product.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      // AI Risk Scoring Algorithm
      let riskScore = 0;
      let riskLevel = 'Low';
      let recommendation = '';
      let urgency = 'low';
      
      // Factor 1: Days until expiry (40% weight)
      if (daysUntilExpiry < 0) {
        riskScore += 40;
        urgency = 'critical';
      } else if (daysUntilExpiry <= 15) {
        riskScore += 40; // Very urgent
        urgency = 'critical';
      } else if (daysUntilExpiry <= 30) {
        riskScore += 35;
        urgency = 'high';
      } else if (daysUntilExpiry <= 60) {
        riskScore += 25;
        urgency = 'medium';
      } else if (daysUntilExpiry <= 90) {
        riskScore += 15;
      }
      
      // Factor 2: Stock quantity (30% weight)
      if (product.quantity > 500) {
        riskScore += 30; // Very high stock = high risk
      } else if (product.quantity > 100) {
        riskScore += 25;
      } else if (product.quantity > 50) {
        riskScore += 20;
      } else if (product.quantity > 10) {
        riskScore += 10;
      }
      
      // Factor 3: Product value (30% weight)
      const productValue = product.price * product.quantity;
      if (productValue > 20000) {
        riskScore += 30; // Very high value at risk
      } else if (productValue > 10000) {
        riskScore += 25;
      } else if (productValue > 5000) {
        riskScore += 20;
      } else if (productValue > 2000) {
        riskScore += 15;
      } else if (productValue > 500) {
        riskScore += 10;
      }
      
      // Determine risk level
      if (riskScore >= 70) {
        riskLevel = 'Critical';
        urgency = 'critical';
      } else if (riskScore >= 50) {
        riskLevel = 'High';
        urgency = 'high';
      } else if (riskScore >= 30) {
        riskLevel = 'Medium';
        urgency = 'medium';
      }
      
      // AI Recommendations
      if (daysUntilExpiry < 0) {
        recommendation = 'EXPIRED - Remove from inventory immediately';
      } else if (daysUntilExpiry <= 15 && product.quantity > 10) {
        recommendation = 'Urgent: Offer 30-50% discount to clear stock';
      } else if (daysUntilExpiry <= 30 && product.quantity > product.reorderLevel) {
        recommendation = 'Promote with 20% discount or bundle offers';
      } else if (daysUntilExpiry <= 60) {
        recommendation = 'Monitor closely, consider promotional pricing';
      } else if (daysUntilExpiry <= 90) {
        recommendation = 'Plan marketing campaign to increase sales';
      } else {
        recommendation = 'Stock level optimal, continue monitoring';
      }
      
      return {
        productId: product._id,
        productName: product.name,
        batchNumber: product.batchNumber,
        expiryDate: product.expiryDate,
        daysUntilExpiry,
        currentStock: product.quantity,
        stockValue: productValue,
        riskScore: Math.round(riskScore),
        riskLevel,
        urgency,
        recommendation,
        aiConfidence: Math.min(95, 75 + (riskScore / 5)) // Simulated confidence score
      };
    });
    
    // Filter and sort by risk
    const criticalPredictions = predictions
      .filter(p => p.daysUntilExpiry <= 90)
      .sort((a, b) => b.riskScore - a.riskScore);
    
    // Summary statistics
    const summary = {
      totalAnalyzed: products.length,
      criticalRisk: criticalPredictions.filter(p => p.riskLevel === 'Critical').length,
      highRisk: criticalPredictions.filter(p => p.riskLevel === 'High').length,
      mediumRisk: criticalPredictions.filter(p => p.riskLevel === 'Medium').length,
      totalValueAtRisk: criticalPredictions
        .filter(p => p.riskLevel === 'Critical' || p.riskLevel === 'High')
        .reduce((sum, p) => sum + p.stockValue, 0),
      predictions: criticalPredictions.slice(0, 20) // Top 20 predictions
    };
    
    res.json(summary);
  } catch (error) {
    console.error("Error in AI expiry prediction:", error);
    res.status(500).json({ message: "Error generating AI predictions" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MediTrust Backend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`✅ AI Expiry Prediction route registered at /api/ai/expiry-prediction`);
});