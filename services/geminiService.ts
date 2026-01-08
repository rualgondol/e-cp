
import { GoogleGenAI, Type } from "@google/genai";

const getGeminiApiKey = () => {
  return localStorage.getItem('MJA_GEMINI_API_KEY') || process.env.API_KEY || "";
};

export async function generateSessionContent(title: string, subjectName: string, description: string) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return "Erreur : La clé API Gemini n'est pas configurée dans la Documentation.";

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Génère un cours court pour un enfant JA (Aventurier/Explorateur). Thème: ${subjectName}. Objectif: ${description}. Format: HTML simple (h2, p, ul, li).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Erreur de génération.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur Gemini : " + (error instanceof Error ? error.message : "Inconnue");
  }
}

export async function generateQuizForSubject(subjectName: string, content: string) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
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
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
}
