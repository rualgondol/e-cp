
import { GoogleGenAI, Type } from "@google/genai";

// Initialisation de l'IA avec la clé API provenant exclusivement de process.env.API_KEY
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("La clé API Gemini est manquante. Vérifiez votre configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateSessionContent(title: string, subjectName: string, description: string) {
  try {
    const ai = getAIClient();
    const prompt = `Génère un cours structuré pour un enfant de club de jeunesse adventiste. 
    Thème : ${subjectName}. Objectif : ${description}. 
    Format : HTML propre avec h2, p, ul/li. Ton : Pédagogique et spirituel.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Erreur de génération.";
  } catch (error) {
    console.error("Gemini Content Error:", error);
    return "Erreur lors de la génération du contenu.";
  }
}

export async function generateQuizForSubject(subjectName: string, content: string) {
  try {
    const ai = getAIClient();
    const prompt = `En te basant sur ce cours : "${content}", génère exactement 4 questions de quiz QCM pour enfants.
    Chaque question doit avoir 4 options et un index de réponse correcte (0-3). 
    Retourne UNIQUEMENT un tableau JSON valide.`;

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
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctIndex: { type: Type.INTEGER }
            },
            required: ["text", "options", "correctIndex"]
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
}
