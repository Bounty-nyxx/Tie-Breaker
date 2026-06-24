import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/analyze", async (req, res) => {
  const { decision, mode } = req.body;

  if (!decision) {
    return res.status(400).json({ error: "Decision is required" });
  }

  try {
    let systemInstruction = "";
    let responseSchema: any = {};

    if (mode === "pros-cons") {
      systemInstruction = "You are a logical decision analyst. Analyze the provided decision and provide a balanced list of pros and cons.";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          verdict: { type: Type.STRING, description: "A brief objective summary/recommendation" }
        },
        required: ["pros", "cons", "verdict"]
      };
    } else if (mode === "swot") {
      systemInstruction = "Perform a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the following decision.";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          threats: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["strengths", "weaknesses", "opportunities", "threats"]
      };
    } else if (mode === "comparison") {
      systemInstruction = "Analyze the decision and compare two or more main options or the current state vs the alternative. Provide a comparison table structure.";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          columns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. ['Criterion', 'Option A', 'Option B']" },
          rows: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            description: "Each item is a row corresponding to the columns"
          }
        },
        required: ["columns", "rows"]
      };
    } else if (mode === "brainstorm") {
      systemInstruction = "The user is stuck on a decision. Brainstorm creative solutions, alternative perspectives, or hidden factors they might not have considered.";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          ideas: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            } 
          }
        },
        required: ["ideas"]
      };
    }

    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Decision: ${decision}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema
          },
        });

        return res.json(JSON.parse(response.text || "{}"));
      } catch (error: any) {
        lastError = error;
        // If it's a 503 (high demand) or 504 (timeout), retry after a delay
        if (error.status === 503 || error.status === 504 || error.message?.includes("503") || error.message?.includes("504")) {
          console.warn(`Gemini API busy (attempt ${attempt + 1}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw error; // Other errors should be thrown immediately
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
