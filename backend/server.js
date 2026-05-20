require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini (used in fallback)
let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (error) {
  console.warn("Warning: GEMINI_API_KEY is not set or invalid.");
}

async function callGroq(prompt) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }]
      })
  });
  if (!res.ok) throw new Error(`Groq API Error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt) {
  if (!ai) throw new Error("GEMINI_API_KEY missing");
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
  });
  return response.text;
}

async function callOpenRouter(prompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "StudyMate"
      },
      body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [{ role: "user", content: prompt }]
      })
  });
  if (!res.ok) throw new Error(`OpenRouter API Error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function generateAIResponse(prompt) {
  try {
      console.log("Attempting Groq...");
      return await callGroq(prompt);
  } catch (e1) {
      console.warn("Groq failed:", e1.message);
      try {
          console.log("Attempting Gemini...");
          return await callGemini(prompt);
      } catch (e2) {
          console.warn("Gemini failed:", e2.message);
          console.log("Attempting OpenRouter...");
          return await callOpenRouter(prompt);
      }
  }
}

// Simple in-memory rate limiter (100 messages per day per IP)
const rateLimitMap = new Map();

// Configure multer for file uploads (memory storage, max 5MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const checkRateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const today = new Date().toDateString();
  const key = `${ip}-${today}`;

  const userUsage = rateLimitMap.get(key) || { count: 0 };
  
  if (userUsage.count >= 100) {
    return res.status(429).json({ error: "You have reached your limit of 100 messages today. Please come back tomorrow!" });
  }

  userUsage.count += 1;
  rateLimitMap.set(key, userUsage);
  
  // Attach remaining count to request so we can send it back to frontend
  req.remainingMessages = 100 - userUsage.count;
  next();
};

app.post('/api/chat', checkRateLimit, async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Build history string for context (simplistic approach for prompt)
    let contextPrompt = "You are StudyMate, a helpful, encouraging, and concise AI study assistant. Answer the user's question clearly.\n\n";
    if (history && history.length > 0) {
      contextPrompt += "Previous context:\n" + history.map(m => `${m.sender}: ${m.text}`).join('\n') + "\n\n";
    }
    contextPrompt += `User: ${message}\nStudyMate:`;

    const replyText = await generateAIResponse(contextPrompt);
    res.json({ reply: replyText, remaining: req.remainingMessages });
  } catch (error) {
    console.error("Chat API Error:", error);
    let msg = "Failed to generate response. Please try again.";
    if (error.status === 503) msg = "StudyMate is currently experiencing high demand. Please try again later.";
    if (error.status === 429) msg = "The AI rate limit has been reached. Please wait 1 minute and try again.";
    res.status(500).json({ error: msg });
  }
});

app.post('/api/viva', checkRateLimit, async (req, res) => {
  try {
    const prompt = "You are conducting an oral viva examination. Ask a single, thought-provoking, and reasonably challenging conceptual question suitable for a computer science or general science student. Just ask the question directly without any introductory text.";
    const replyText = await generateAIResponse(prompt);
    res.json({ reply: replyText, remaining: req.remainingMessages });
  } catch (error) {
    console.error("Viva API Error:", error);
    let msg = "Failed to generate viva question.";
    if (error.status === 503) msg = "StudyMate is currently experiencing high demand. Please try again later.";
    if (error.status === 429) msg = "The AI rate limit has been reached. Please wait 1 minute and try again.";
    res.status(500).json({ error: msg });
  }
});

app.post('/api/simplify', checkRateLimit, async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes) return res.status(400).json({ error: "Notes are required." });

    const prompt = `Please simplify the following notes into concise, easy-to-read bullet points. Highlight the key concepts.\n\nNotes:\n${notes}`;
    
    const replyText = await generateAIResponse(prompt);
    res.json({ reply: replyText, remaining: req.remainingMessages });
  } catch (error) {
    console.error("Simplify API Error:", error);
    let msg = "Failed to simplify notes.";
    if (error.status === 503) msg = "StudyMate is currently experiencing high demand. Please try again later.";
    if (error.status === 429) msg = "The AI rate limit has been reached. Please wait 1 minute and try again.";
    res.status(500).json({ error: msg });
  }
});

app.post('/api/simplify-file', checkRateLimit, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    let extractedText = "";

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype === 'text/plain' || req.file.mimetype === 'text/markdown' || req.file.mimetype === 'text/csv') {
      extractedText = req.file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or text file." });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "Could not extract text from the file. It might be an image-based PDF or empty." });
    }

    // Truncate to ~15000 characters to stay well within Gemini's context limit
    const truncatedText = extractedText.substring(0, 15000);

    const prompt = `Please simplify the following notes into concise, easy-to-read bullet points. Highlight the key concepts.\n\nNotes:\n${truncatedText}`;
    
    const replyText = await generateAIResponse(prompt);
    res.json({ reply: replyText, remaining: req.remainingMessages });
  } catch (error) {
    console.error("Simplify File API Error:", error);
    let msg = "Failed to process and simplify the file.";
    if (error.status === 503) msg = "StudyMate is currently experiencing high demand. Please try again later. Kindly copy paste your notes and I'll simplify it";
    if (error.status === 429) msg = "The AI rate limit has been reached. Please wait 1 minute and try again.";
    res.status(500).json({ error: msg });
  }
});

app.post('/api/study-guide', checkRateLimit, async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes) return res.status(400).json({ error: "Notes are required." });

    const prompt = `Please act as an expert educator. Create a comprehensive, structured study guide based on the following notes. 
The study guide MUST include:
1. An Executive Summary (1-2 paragraphs summarizing the core topic).
2. Key Concepts & Definitions (bullet points).
3. 3-5 Flashcard-style Questions and Answers to test understanding.

Notes:
${notes}`;
    
    const replyText = await generateAIResponse(prompt);
    res.json({ reply: replyText, remaining: req.remainingMessages });
  } catch (error) {
    console.error("Study Guide API Error:", error);
    let msg = "Failed to generate study guide.";
    if (error.status === 503) msg = "StudyMate is currently experiencing high demand. Please try again later.";
    if (error.status === 429) msg = "The AI rate limit has been reached. Please wait 1 minute and try again.";
    res.status(500).json({ error: msg });
  }
});

app.post('/api/study-guide-file', checkRateLimit, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    let extractedText = "";
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype === 'text/plain' || req.file.mimetype === 'text/markdown' || req.file.mimetype === 'text/csv') {
      extractedText = req.file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or text file." });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "Could not extract text from the file." });
    }

    const truncatedText = extractedText.substring(0, 15000);
    const prompt = `Please act as an expert educator. Create a comprehensive, structured study guide based on the following notes. 
The study guide MUST include:
1. An Executive Summary (1-2 paragraphs summarizing the core topic).
2. Key Concepts & Definitions (bullet points).
3. 3-5 Flashcard-style Questions and Answers to test understanding.

Notes:
${truncatedText}`;
    
    const replyText = await generateAIResponse(prompt);
    res.json({ reply: replyText, remaining: req.remainingMessages });
  } catch (error) {
    console.error("Study Guide File API Error:", error);
    let msg = "Failed to process and generate study guide from the file.";
    if (error.status === 503) msg = "StudyMate is currently experiencing high demand. Please try again later.";
    if (error.status === 429) msg = "The AI rate limit has been reached. Please wait 1 minute and try again.";
    res.status(500).json({ error: msg });
  }
});

// Global error handler (catches Multer errors like file size limit)
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: "File is too large. Please upload a file smaller than 5MB." });
  }
  res.status(500).json({ error: err.message || "An unexpected error occurred." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
