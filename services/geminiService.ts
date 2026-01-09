
import { GoogleGenAI, Type } from "@google/genai";

export async function generateSessionContent(title: string, subjectName: string, description: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Erreur : Clé API non configurée. Veuillez renommer votre variable d'environnement en 'API_KEY' dans Vercel.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Génère un cours structuré pour un enfant de club de jeunesse adventiste (Aventurier/Explorateur). 
  Thème : ${subjectName}. 
  Objectif : ${description}. 
  Format : HTML propre avec h2, p, et listes ul/li. 
  Ton : Pédagogique, encourageant et spirituel.`;

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
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `En te basant sur le cours suivant : "${content}", génère exactement 4 questions de quiz à choix multiples (QCM) pour des enfants.
  Chaque question doit avoir 4 options claires et un index de réponse correcte (de 0 à 3).
  Retourne uniquement un tableau JSON valide.`;

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
    
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
}
