import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Ye line Google se tere liye available models mangwayegi
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    console.log("=== Tere liye available models ye hain: ===");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log("- " + m.name.replace("models/", ""));
      }
    });
  } catch (error) {
    console.error("Models fetch karne mein galti hui:", error);
  }
}

listModels();