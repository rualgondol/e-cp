
import { GoogleGenAI, Type } from "@google/genai";

// Guideline: API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Guideline: Use this process.env.API_KEY string directly when initializing the @google/genai client instance.

export async function generateSessionContent(title: string, subjectName: string, description: string) {
  // Always use a named parameter: new GoogleGenAI({apiKey: process.env.API_KEY})
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Génère un cours court pour un enfant JA (Aventurier/Explorateur). Thème: ${subjectName}. Objectif: ${description}. Format: HTML simple (h2, p, ul, li).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // The GenerateContentResponse object features a text property (not a method) that directly returns the string output.
    return response.text || "Erreur de génération.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur Gemini : " + (error instanceof Error ? error.message : "Inconnue");
  }
}

export async function generateQuizForSubject(subjectName: string, content: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
              text: { 
                type: Type.STRING,
                description: 'The quiz question text.'
              },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'Four possible answers.'
              },
              correctIndex: { 
                type: Type.INTEGER,
                description: 'Index of the correct answer (0-3).'
              }
            },
            required: ["text", "options", "correctIndex"]
          }
        }
      }
    });
    // The text property is used directly to get the generated string.
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
}
