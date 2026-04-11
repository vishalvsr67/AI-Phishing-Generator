import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Initialize environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ==========================================
// 2. DATABASE SCHEMAS & MODELS
// ==========================================

/**
 * User Schema with Role-Based Access Control
 * Default role is set to 'user' for security.
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

/**
 * Threat Scenario Schema for Analytics
 */
const scenarioSchema = new mongoose.Schema({
  scenarioType: String,
  threatTheme: String,
  targetProfile: String,
  contextualFactor: String,
  generatedEmail: String,
  modelUsed: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tracking who generated it
  scores: {
    feasibility: Number,
    personalization: Number,
    completeness: Number
  },
  createdAt: { type: Date, default: Date.now }
});
const Scenario = mongoose.model("Scenario", scenarioSchema);

// ==========================================
// 3. MIDDLEWARE (Security Guards)
// ==========================================

/**
 * Middleware to verify JWT Token
 */
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

/**
 * Middleware to restrict access to Admin only
 */
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ==========================================
// 4. AUTHENTICATION ROUTES
// ==========================================

app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    
    res.json({ success: true, message: "Account created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

    // Pack role into JWT for frontend access control
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    res.json({ success: true, token, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ==========================================
// 5. ADMIN CONTROL ROUTES (The Creator Control)
// ==========================================

/**
 * Fetch all registered users - Admin Only
 */
app.get("/api/admin/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude passwords for security
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * Global Analytics - Fetch all scenarios ever generated - Admin Only
 */
app.get("/api/admin/all-scenarios", verifyToken, isAdmin, async (req, res) => {
  try {
    const allData = await Scenario.find().populate('createdBy', 'username');
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch global analytics" });
  }
});

// ==========================================
// 6. INFERENCE & NOTIFICATION (Existing Logic)
// ==========================================

// ... (Your /generate, /api/scenarios, and /api/send-mail routes remain here)
// Note: In /generate, make sure to add createdBy: req.user.id if you want to track it.

// ==========================================
// 7. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 PhishGuard Core active on port ${PORT}`));