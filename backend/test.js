require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

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

async function main() {
    try {
        const reply = await generateAIResponse("what is linked list");
        console.log("REPLY:", reply);
    } catch(e) {
        console.error("FATAL:", e);
    }
}
main();
