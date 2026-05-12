// lib/ai/gemini.ts
// Single place to configure Google Generative AI
// All AI features import from here — never create client elsewhere

import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is missing from .env.local")
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

// gemini-1.5-flash — fastest and free tier friendly
// Good enough for structured medical suggestions
export const geminiFlash = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
})
