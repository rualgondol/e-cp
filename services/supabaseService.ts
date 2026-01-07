
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Student, ClassLevel, Progress, Message } from '../types';

/**
 * Récupère une variable d'environnement de manière sécurisée pour le navigateur.
 */
const getEnvVar = (key: string): string => {
  try {
    // Tentative d'accès via process.env (injecté par Vercel/Vite)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[`NEXT_PUBLIC_${key}`] || process.env[key] || "";
    }
  } catch (e) {
    console.warn(`Impossible d'accéder à la variable ${key}:`, e);
  }
  return "";
};

const SUPABASE_URL = getEnvVar('SUPABASE_URL');
const SUPABASE_KEY = getEnvVar('SUPABASE_ANON_KEY');

let supabaseInstance: SupabaseClient | null = null;

export const initSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Au lieu de throw, on retourne un objet qui logguera les erreurs lors des appels
    console.error("Configuration Supabase manquante (URL ou Clé).");
    // On crée quand même un client vide ou on gère l'erreur plus tard
    // Pour éviter le crash immédiat, on vérifie avant chaque appel
  }

  supabaseInstance = createClient(SUPABASE_URL || "https://placeholder.supabase.co", SUPABASE_KEY || "placeholder", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  return supabaseInstance;
};

export const isSupabaseConfigured = () => {
  return !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http'));
};

export const checkConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const client = initSupabase();
    const { error } = await client.from('classes').select('id').limit(1);
    return !error;
  } catch (err) {
    return false;
  }
};

export const db = {
  async fetchClasses(): Promise<ClassLevel[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await initSupabase().from('classes').select('*').order('age', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async syncClasses(classes: ClassLevel[]) {
    if (!isSupabaseConfigured()) return;
    const { error } = await initSupabase().from('classes').upsert(classes);
    if (error) throw error;
  },
  async fetchStudents(): Promise<Student[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await initSupabase().from('students').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncStudents(students: Student[]) {
    if (!isSupabaseConfigured()) return;
    const { error } = await initSupabase().from('students').upsert(students);
    if (error) throw error;
  },
  async fetchSessions(): Promise<Session[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await initSupabase().from('sessions').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncSessions(sessions: Session[]) {
    if (!isSupabaseConfigured()) return;
    const { error } = await initSupabase().from('sessions').upsert(sessions);
    if (error) throw error;
  },
  async fetchProgress(): Promise<Progress[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await initSupabase().from('progress').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncProgress(progress: Progress[]) {
    if (!isSupabaseConfigured()) return;
    const { error } = await initSupabase().from('progress').upsert(progress);
    if (error) throw error;
  },
  async fetchMessages(): Promise<Message[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await initSupabase().from('messages').select('*').order('timestamp', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async sendMessage(message: Message) {
    if (!isSupabaseConfigured()) return;
    const { error } = await initSupabase().from('messages').insert([message]);
    if (error) throw error;
  }
};
