import { GoogleGenAI } from "@google/genai";

// Load API key from .env
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("API Key is missing. Check your .env file.");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export const generateContent = async (userQuery) => {
  try {
    const prompt = promptGenerator(userQuery);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // safer extraction
    const text =
      response?.text ||
      response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No content generated from AI");
    }

    return text;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error(error.message || "AI generation failed");
  }
};

export const promptGenerator = (userQuery) => {
  return `Create a simple React functional component based on this description: "${userQuery}"

Requirements:
- Use React.createElement instead of JSX syntax
- Keep it simple, no imports needed
- Name the function 'GeneratedComponent'
- Use inline styles as regular JavaScript objects
- Don't use any JSX syntax
- Don't include any markdown
- Don't include any export statements

Return only the component code.`;
};

export const purifyCode = (code) => {
  if (!code) return "";

  code = code.replace(/import\s+.*?;\s*/g, "");
  code = code.replace(/export\s+.*?;\s*/g, "");
  code = code.replace(/```[\s\S]*?```/g, "");
  code = code.replace(/```/g, "");

  return code.trim();
};
