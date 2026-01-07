
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Student, ClassLevel, Progress, Message } from '../types';

/**
 * Récupération des variables d'environnement.
 * Sur Vercel, les variables préfixées par NEXT_PUBLIC_ sont injectées dans le bundle client.
 */
const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    // On cherche d'abord avec le préfixe public Vercel, puis le nom standard
    return process.env[`NEXT_PUBLIC_${key}`] || process.env[key] || "";
  }
  return "";
};

const SUPABASE_URL = getEnvVar('SUPABASE_URL');
const SUPABASE_KEY = getEnvVar('SUPABASE_ANON_KEY');

let supabaseInstance: SupabaseClient | null = null;

export const initSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERREUR CRITIQUE : Les clés Supabase ne sont pas détectées dans l'environnement.");
    throw new Error("Configuration Supabase manquante.");
  }

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
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
  if (!isSupabaseConfigured()) {
    console.warn("Vérification de connexion : Configuration manquante.");
    return false;
  }
  try {
    const client = initSupabase();
    // Test minimal sur la table classes pour valider que le schéma SQL est en place
    const { data, error } = await client.from('classes').select('id').limit(1);
    if (error) {
      console.error("Échec de connexion Supabase (Table manquante ou clé invalide) :", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erreur fatale lors de la connexion Supabase :", err);
    return false;
  }
};

export const db = {
  async fetchClasses(): Promise<ClassLevel[]> {
    const { data, error } = await initSupabase().from('classes').select('*').order('age', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async syncClasses(classes: ClassLevel[]) {
    const { error } = await initSupabase().from('classes').upsert(classes);
    if (error) throw error;
  },
  async fetchStudents(): Promise<Student[]> {
    const { data, error } = await initSupabase().from('students').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncStudents(students: Student[]) {
    const { error } = await initSupabase().from('students').upsert(students);
    if (error) throw error;
  },
  async fetchSessions(): Promise<Session[]> {
    const { data, error } = await initSupabase().from('sessions').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncSessions(sessions: Session[]) {
    const { error } = await initSupabase().from('sessions').upsert(sessions);
    if (error) throw error;
  },
  async fetchProgress(): Promise<Progress[]> {
    const { data, error } = await initSupabase().from('progress').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncProgress(progress: Progress[]) {
    const { error } = await initSupabase().from('progress').upsert(progress);
    if (error) throw error;
  },
  async fetchMessages(): Promise<Message[]> {
    const { data, error } = await initSupabase().from('messages').select('*').order('timestamp', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async sendMessage(message: Message) {
    const { error } = await initSupabase().from('messages').insert([message]);
    if (error) throw error;
  }
};
