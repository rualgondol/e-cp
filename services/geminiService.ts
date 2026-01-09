
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Récupère la clé API de manière robuste.
 * Vérifie process.env.API_KEY (standard), 
 * puis les variantes liées à Vite/Vercel si nécessaire.
 */
function getApiKey(): string | null {
  try {
    // 1. Priorité aux guidelines (process.env.API_KEY)
    let key = process.env.API_KEY;

    // 2. Fallback sur VITE_API_KEY (standard pour les builds Vite/Vercel côté client)
    if (!key || key === "undefined") {
      // @ts-ignore - Accès sécurisé au contexte de build
      const metaEnv = (import.meta as any).env;
      key = metaEnv?.VITE_API_KEY || metaEnv?.API_KEY;
    }

    // 3. Fallback sur le stockage local (pour le diagnostic et l'urgence)
    if (!key || key === "undefined") {
      key = localStorage.getItem('MJA_API_KEY') || localStorage.getItem('API_KEY');
    }

    if (key && key !== "undefined" && key !== "null" && key.trim() !== "") {
      return key.trim().replace(/['"]/g, ''); // Nettoie les guillemets éventuels
    }
  } catch (e) {
    console.warn("Erreur lors de la lecture de la clé API:", e);
  }
  return null;
}

/**
 * Génère le contenu pédagogique d'un cours en HTML.
 */
export async function generateSessionContent(title: string, subjectName: string, description: string) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return `ERREUR CONFIGURATION : Clé API introuvable. 
    Sur Vercel, renommez votre variable en 'VITE_API_KEY' (le préfixe VITE_ est requis pour le frontend) et faites un REDEPLOY.`;
  }

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
    console.error("Gemini Content Error:", error);
    return `Erreur Gemini (${error.status || 'API'}): ${error.message}`;
  }
}

/**
 * Génère un quiz de 4 questions basé sur le contenu d'un cours.
 */
export async function generateQuizForSubject(subjectName: string, content: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Clé API Gemini manquante.");
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
    
    return JSON.parse(jsonStr.trim());
  } catch (error: any) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
}
