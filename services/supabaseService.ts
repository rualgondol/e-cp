
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Student, ClassLevel, Progress, Message } from '../types';

// Récupération des clés (Vercel ou LocalStorage)
const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('MJA_SUPABASE_URL');
  const localKey = localStorage.getItem('MJA_SUPABASE_ANON_KEY');
  
  return {
    url: localUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: localKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return !!(url && key && url.startsWith('http'));
};

export const initSupabase = (forceReinit: boolean = false): SupabaseClient | null => {
  if (supabaseInstance && !forceReinit) return supabaseInstance;
  
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return supabaseInstance;
  } catch (e) {
    console.error("Erreur critique initialisation Supabase:", e);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('MJA_SUPABASE_URL', url);
  localStorage.setItem('MJA_SUPABASE_ANON_KEY', key);
  initSupabase(true); // Forcer la réinitialisation avec les nouvelles clés
};

export const checkConnection = async (): Promise<boolean> => {
  const client = initSupabase();
  if (!client) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const { error } = await client.from('classes').select('id').limit(1);
    clearTimeout(timeoutId);
    return !error;
  } catch (err) {
    return false;
  }
};

export const db = {
  // ... (le reste de l'objet db reste identique à la version précédente)
  async fetchClasses(): Promise<ClassLevel[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data, error } = await client.from('classes').select('*').order('age', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async syncClasses(classes: ClassLevel[]) {
    const client = initSupabase();
    if (!client) return;
    await client.from('classes').upsert(classes);
  },
  async fetchStudents(): Promise<Student[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data, error } = await client.from('students').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncStudents(students: Student[]) {
    const client = initSupabase();
    if (!client) return;
    await client.from('students').upsert(students);
  },
  async fetchSessions(): Promise<Session[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data, error } = await client.from('sessions').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncSessions(sessions: Session[]) {
    const client = initSupabase();
    if (!client) return;
    await client.from('sessions').upsert(sessions);
  },
  async fetchProgress(): Promise<Progress[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data, error } = await client.from('progress').select('*');
    if (error) throw error;
    return data || [];
  },
  async syncProgress(progress: Progress[]) {
    const client = initSupabase();
    if (!client) return;
    await client.from('progress').upsert(progress);
  },
  async fetchMessages(): Promise<Message[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data, error } = await client.from('messages').select('*').order('timestamp', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async sendMessage(message: Message) {
    const client = initSupabase();
    if (!client) return;
    await client.from('messages').insert([message]);
  },
  // Nouveauté : Persistance des instructeurs si table existe
  async fetchInstructors(): Promise<any[]> {
    const client = initSupabase();
    if (!client) return [];
    try {
      const { data, error } = await client.from('instructors').select('*');
      if (error) return [];
      return data || [];
    } catch(e) { return []; }
  },
  async syncInstructors(instructors: any[]) {
    const client = initSupabase();
    if (!client) return;
    try {
      await client.from('instructors').upsert(instructors);
    } catch(e) {}
  }
};
