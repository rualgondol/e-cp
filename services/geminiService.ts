
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Récupère et vérifie la clé API depuis l'environnement.
 */
function getApiKey(): string | null {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "") {
    return null;
  }
  return apiKey.trim();
}

/**
 * Génère le contenu pédagogique d'un cours en HTML.
 */
export async function generateSessionContent(title: string, subjectName: string, description: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "Erreur : La clé API Gemini n'est pas détectée. Vérifiez vos variables d'environnement sur Vercel (nom exact: API_KEY).";
  }

  // Création d'une nouvelle instance à chaque appel pour éviter les problèmes de contexte
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Agis en tant qu'instructeur de club de jeunesse adventiste (MJA).
  Génère un cours structuré et passionnant pour des enfants (Aventuriers ou Explorateurs).
  Thème : ${subjectName}.
  Objectif : ${description}.
  Format : Retourne uniquement du HTML propre (utilisant h2, p, ul, li). 
  N'inclus pas de balises <html> ou <body>, juste le contenu.
  Ton : Pédagogique, biblique, interactif et encourageant.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Désolé, je n'ai pas pu générer le contenu du cours.";
  } catch (error: any) {
    console.error("Gemini Content Generation Error:", error);
    if (error.message?.includes("API key not valid")) {
      return "Erreur : La clé API fournie est rejetée par Google. Vérifiez qu'elle est bien active dans Google AI Studio.";
    }
    return `Une erreur est survenue : ${error.message || "Erreur inconnue"}`;
  }
}

/**
 * Génère un quiz de 4 questions basé sur le contenu d'un cours.
 */
export async function generateQuizForSubject(subjectName: string, content: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Clé API manquante ou invalide.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Tu es un expert en pédagogie ludique. Basé sur le contenu suivant de la leçon "${subjectName}" : 
  ---
  ${content}
  ---
  Génère exactement 4 questions de quiz à choix multiples (QCM). 
  Chaque question doit être claire, adaptée à l'âge (4-15 ans) et avoir une seule bonne réponse parmi 4 options.`;

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
                description: 'Le texte de la question.',
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Les 4 options de réponse possibles.',
              },
              correctIndex: {
                type: Type.INTEGER,
                description: 'L\'index (0-3) de la réponse correcte.',
              },
            },
            required: ["text", "options", "correctIndex"],
          },
        },
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    const quizData = JSON.parse(jsonStr.trim());
    return Array.isArray(quizData) ? quizData : [];
  } catch (error: any) {
    console.error("Gemini Quiz Generation Error:", error);
    // En cas d'erreur de clé spécifique renvoyée par l'API
    if (error.message?.includes("Requested entity was not found")) {
      console.error("Le modèle spécifié est introuvable ou la clé ne permet pas d'y accéder.");
    }
    return [];
  }
}
