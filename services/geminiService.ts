
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client using the API key from the environment.
// Guideline: Always use process.env.API_KEY exclusively and initialize with a named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates course content based on subject and description using Gemini 3 Flash.
 */
export async function generateSessionContent(title: string, subjectName: string, description: string) {
  // Guideline: Always use ai.models.generateContent to query GenAI.
  const prompt = `Génère un cours court pour un enfant JA (Aventurier/Explorateur). Thème: ${subjectName}. Objectif: ${description}. Format: HTML simple (h2, p, ul, li).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Guideline: Access the .text property directly (not a method).
    return response.text || "Aucun contenu généré.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur lors de la génération du contenu.";
  }
}

/**
 * Generates a quiz for a given subject content with JSON schema validation.
 */
export async function generateQuizForSubject(subjectName: string, content: string) {
  // Guideline: Provide responseSchema and responseMimeType for structured JSON output.
  const prompt = `Génère un quiz de 4 questions sur ce contenu JA : ${content}. 4 options, 1 index correct.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER }
            },
            required: ["text", "options", "correctIndex"]
          }
        }
      }
    });
    
    // Guideline: Access the .text property and trim the string before parsing.
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
}
