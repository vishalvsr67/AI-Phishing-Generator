import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Fetches the list of available models from the Google Generative Language API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    console.log("=== Available Models: ===");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log("- " + m.name.replace("models/", ""));
      }
    });
  } catch (error) {
    console.error("[ERROR] Failed to fetch models:", error);
  }
}

listModels();