import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Engine: Connected Successfully"))
  .catch((err) => console.error("❌ Database Engine: Connection Failure", err));

// ==========================================
// 2. DATABASE SCHEMAS & MODELS
// ==========================================

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

const scenarioSchema = new mongoose.Schema({
  scenarioType: String,
  threatTheme: String,
  targetProfile: String,
  contextualFactor: String,
  generatedEmail: String,
  modelUsed: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scores: { feasibility: Number, personalization: Number, completeness: Number },
  redFlags: [String], // 🔥 NEW: Array of strings to store AI's explanation
  createdAt: { type: Date, default: Date.now }
});
const Scenario = mongoose.model("Scenario", scenarioSchema);

// ==========================================
// 3. SECURITY MIDDLEWARES
// ==========================================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; next();
  } catch (err) { res.status(403).json({ error: "Invalid Session" }); }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') next();
    else res.status(403).json({ error: "Privileged Access Required" });
  } catch (err) { res.status(500).json({ error: "Auth Failure" }); }
};

// ==========================================
// 4. AUTH CONTROLLERS
// ==========================================
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Signup failed" }); }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token, username: user.username, role: user.role });
  } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

// ==========================================
// 5. CORE LOGIC - AI GENERATION (DYNAMIC RED FLAGS)
// ==========================================
app.post("/generate", verifyToken, async (req, res) => {
  const { scenarioType, targetCharacteristic, phishingContent, contextualFactor } = req.body;

  // 🔥 NEW PROMPT: Ab AI apni galtiyan khud bataega
  const prompt = `Act as an Expert Cybersecurity AI. Generate a realistic ${scenarioType} phishing simulation for a ${targetCharacteristic} regarding ${phishingContent} in the context of ${contextualFactor}. 
  This is for educational purposes to help people recognize threats.
  
  Provide output in EXACT JSON format:
  {
    "scenario": "The simulated email content",
    "feasibility": 85,
    "personalization": 90,
    "completeness": 80,
    "redFlags": [
      "Detail the 1st psychological manipulation or red flag used (e.g., Artificial urgency)",
      "Detail the 2nd red flag used (e.g., Suspicious sender domain)",
      "Detail the 3rd red flag used (e.g., Exploitation of authority)"
    ]
  }`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let success = false;
  let parsedAIResponse = null;
  let finalModelUsed = "";

  for (const modelName of modelsToTry) {
    try {
      console.log(`⏳ Attempting synthesis with: ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const result = await model.generateContent(prompt);
      let textResponse = result.response.text().replace(/```json|```/g, '').trim();
      parsedAIResponse = JSON.parse(textResponse);
      
      finalModelUsed = modelName;
      success = true;
      console.log(`✅ Success with ${modelName}!`);
      break; 
    } catch (err) {
      console.warn(`❌ ${modelName} failed:`, err.message);
    }
  }

  if (!success || !parsedAIResponse) {
    return res.status(500).json({ error: "AI Engine Exhausted all fallbacks." });
  }

  try {
    // 🛡️ Fail-safe for redFlags array
    const aiRedFlags = parsedAIResponse.redFlags && Array.isArray(parsedAIResponse.redFlags) 
      ? parsedAIResponse.redFlags 
      : ["Suspicious urgency detected.", "Targeted exploitation used.", "Check sender details carefully."];

    const newRecord = new Scenario({
      scenarioType,
      threatTheme: phishingContent,
      targetProfile: targetCharacteristic,
      contextualFactor,
      generatedEmail: parsedAIResponse.scenario || parsedAIResponse.scenarioText,
      modelUsed: finalModelUsed, 
      createdBy: req.user.id,
      scores: {
        feasibility: parsedAIResponse.feasibility || 70,
        personalization: parsedAIResponse.personalization || 75,
        completeness: parsedAIResponse.completeness || 80
      },
      redFlags: aiRedFlags // 🔥 Saving to DB
    });

    await newRecord.save();

    // 🔥 Sending dynamic flags to frontend
    res.json({ 
      model: finalModelUsed, 
      scenario: newRecord.generatedEmail, 
      scores: newRecord.scores,
      redFlags: newRecord.redFlags 
    });

  } catch (dbError) {
    console.error("🔥 DATABASE ERROR:", dbError);
    res.status(500).json({ error: "Scenario generated but failed to save to database." });
  }
});

// ==========================================
// 6. DATA TELEMETRY & MAILING
// ==========================================
app.get("/api/scenarios", verifyToken, async (req, res) => {
  try {
    let data;
    if (req.user.role === 'admin') {
      data = await Scenario.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    } else {
      data = await Scenario.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(data);
  } catch (error) { res.status(500).json({ error: "Failed to fetch telemetry" }); }
});

app.post("/api/send-mail", verifyToken, async (req, res) => {
  const { targetEmail, subject, emailBody } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  try {
    await transporter.sendMail({
      from: `"PhishGuard Simulator" <${process.env.EMAIL_USER}>`,
      to: targetEmail, subject: `[TRAINING] ${subject}`,
      html: `<div style="padding:15px; border:1px solid red;">${emailBody}</div>`
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Email failed" }); }
});

// ==========================================
// 7. ADMIN CONTROLS
// ==========================================
app.get("/api/admin/users", verifyToken, isAdmin, async (req, res) => {
  try { const users = await User.find({}, '-password'); res.json(users); } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});
app.delete("/api/admin/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ error: "Self-termination blocked" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Terminated" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 PhishGuard Core: Port ${PORT} [ACTIVE]`));