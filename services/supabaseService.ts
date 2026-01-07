
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Student, ClassLevel, Progress, Message } from '../types';

// Accès sécurisé aux variables d'environnement injectées par Vercel
// On utilise une approche multi-sources pour garantir la récupération des clés
const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
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
    console.error("CRITICAL: Supabase keys not found in environment.");
    throw new Error("Missing Supabase URL or Key");
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
  return SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http');
};

export const checkConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const client = initSupabase();
    // Test minimal sur la table classes
    const { data, error } = await client.from('classes').select('id').limit(1);
    if (error) {
      console.error("Supabase connection check error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase connection fatal error:", err);
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
    // Note: upsert nécessite que les colonnes correspondent exactement au schéma SQL
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
