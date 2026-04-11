import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";      // NAYA: Password Hacker-proof karne ke liye
import jwt from "jsonwebtoken";     // NAYA: VIP Token bananey ke liye

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
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ==========================================
// 2. DATABASE SCHEMAS
// ==========================================
// NAYA: User Schema (Security ke liye)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// Purana: Threat Scenario Schema
const scenarioSchema = new mongoose.Schema({
  scenarioType: String,
  threatTheme: String,
  targetProfile: String,
  contextualFactor: String,
  generatedEmail: String,
  modelUsed: String,
  scores: {
    feasibility: Number,
    personalization: Number,
    completeness: Number
  },
  createdAt: { type: Date, default: Date.now }
});
const Scenario = mongoose.model("Scenario", scenarioSchema);

// ==========================================
// 3. AUTHENTICATION ROUTES (The Bouncers)
// ==========================================
// SIGNUP: Naya admin account bananey ke liye
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists!" });

    // Password ko encrypt karna (Salt round: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    
    res.json({ success: true, message: "Admin account created successfully!" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// LOGIN: Token lene ke liye
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid Credentials" });

    // Encrypted password ko compare karna
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

    // JWT Token generate karna (VIP Pass)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    res.json({ success: true, token, username: user.username });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ==========================================
// 4. INFERENCE ENGINE (Generate Scenario)
// ==========================================
app.post("/generate", async (req, res) => {
  const { scenarioType, targetCharacteristic, phishingContent, contextualFactor } = req.body;

  const prompt = `You are an expert cybersecurity training scenario generator. 
  Create a highly realistic phishing scenario using these 4 vectors:
  1. Delivery Channel: ${scenarioType}
  2. Threat Theme: ${phishingContent}
  3. Target Characteristics: ${targetCharacteristic}
  4. Contextual Factor: ${contextualFactor}

  IMPORTANT: Evaluate the scenario using these metrics: Feasibility, Personalization, and Completeness.
  Respond STRICTLY in valid JSON format ONLY. Do not use markdown blocks. 
  JSON Structure:
  {
    "scenarioText": "realistic message content",
    "feasibility": <number 70-100>,
    "personalization": <number 70-100>,
    "completeness": <number 70-100>
  }`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let parsedAIResponse = null;
  let successfulModel = "";

  for (const modelName of modelsToTry) {
    try {
      console.log(`⏳ Attempting Inference: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      let textResponse = result.response.text();
      
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedAIResponse = JSON.parse(textResponse);
      successfulModel = modelName;
      break; 
    } catch (error) {
      console.log(`⚠️ ${modelName} failed. Trying fallback...`);
    }
  }

  if (!parsedAIResponse) {
    return res.status(503).json({ error: "Generation Engine Timeout" });
  }

  try {
    const newRecord = new Scenario({
      scenarioType, threatTheme: phishingContent, targetProfile: targetCharacteristic, contextualFactor,
      generatedEmail: parsedAIResponse.scenarioText, modelUsed: successfulModel,
      scores: { feasibility: parsedAIResponse.feasibility, personalization: parsedAIResponse.personalization, completeness: parsedAIResponse.completeness }
    });
    await newRecord.save();
  } catch (dbError) {
    console.error("Database save error:", dbError);
  }

  res.json({
    model: successfulModel, scenario: parsedAIResponse.scenarioText,
    scores: { feasibility: parsedAIResponse.feasibility, personalization: parsedAIResponse.personalization, completeness: parsedAIResponse.completeness }
  });
});

// ==========================================
// 5. FETCH SCENARIOS FOR DASHBOARD
// ==========================================
app.get("/api/scenarios", async (req, res) => {
  try {
    const allScenarios = await Scenario.find().sort({ createdAt: -1 });
    res.json(allScenarios);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve threat intelligence data." });
  }
});

// ==========================================
// 6. WEAPONIZED ROUTE: SEND REAL EMAIL
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

app.post("/api/send-mail", async (req, res) => {
  const { targetEmail, subject, emailBody } = req.body;
  try {
    const formattedBody = emailBody.replace(/\n/g, '<br>');
    const mailOptions = {
      from: `"PhishGuard Threat Simulator" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: `[TRAINING DRILL] ${subject}`,
      html: `
        <div style="border-left: 4px solid #ef4444; padding-left: 15px; margin-bottom: 20px; background-color: #fef2f2; color: #991b1b; padding: 10px;">
          <strong>⚠️ PHISHGUARD SECURITY DRILL ⚠️</strong><br/>
          This is an authorized, simulated cybersecurity training scenario generated by AI. Do not interact with any links or reply with real information.
        </div>
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
          ${formattedBody}
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Threat Payload Dispatched!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to dispatch payload." });
  }
});

// ==========================================
// 7. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));