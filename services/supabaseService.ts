
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Student, ClassLevel, Progress, Message, Instructor } from '../types';

/**
 * Récupère une variable d'environnement de manière sécurisée.
 * Priorité : 
 * 1. LocalStorage (Config manuelle)
 * 2. VITE_ prefix (Standard Vite/Vercel)
 * 3. NEXT_PUBLIC_ prefix (Ancien standard)
 * 4. process.env (Node/Vercel)
 */
const getEnvVar = (name: string): string => {
  // 1. Check LocalStorage first (Emergency config)
  const localName = name.replace('VITE_', 'MJA_').replace('NEXT_PUBLIC_', 'MJA_');
  const localValue = localStorage.getItem(localName);
  if (localValue) return localValue;

  // 2. Check for Vite prefix (Standard)
  const viteName = name.startsWith('VITE_') ? name : `VITE_${name.replace('NEXT_PUBLIC_', '')}`;
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[viteName]) return metaEnv[viteName];
  } catch (e) {}

  // 3. Check for Next prefix (Legacy fallback)
  const nextName = name.startsWith('NEXT_PUBLIC_') ? name : `NEXT_PUBLIC_${name.replace('VITE_', '')}`;
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[nextName]) return metaEnv[nextName];
  } catch (e) {}

  // 4. Check process.env (Vercel Node environment)
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[viteName]) return process.env[viteName] as string;
      if (process.env[nextName]) return process.env[nextName] as string;
      if (process.env[name]) return process.env[name] as string;
    }
  } catch (e) {}

  return "";
};

let SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
let SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http'));
};

export const initSupabase = (forceReinit: boolean = false): SupabaseClient | null => {
  if (supabaseInstance && !forceReinit) return supabaseInstance;
  
  SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
  SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    return supabaseInstance;
  } catch (e) {
    console.error("Supabase Client Init Error:", e);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('MJA_SUPABASE_URL', url.trim());
  localStorage.setItem('MJA_SUPABASE_ANON_KEY', key.trim());
  initSupabase(true);
};

export const checkConnection = async (): Promise<boolean> => {
  const client = initSupabase(true);
  if (!client) return false;
  try {
    const { error } = await client.from('classes').select('id').limit(1);
    return !error;
  } catch (err) {
    return false;
  }
};

export const db = {
  async fetchClasses(): Promise<ClassLevel[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data } = await client.from('classes').select('*').order('age', { ascending: true });
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
    const { data } = await client.from('students').select('*');
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
    const { data } = await client.from('sessions').select('*');
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
    const { data } = await client.from('progress').select('*');
    return data || [];
  },
  async syncProgress(progress: Progress[]) {
    const client = initSupabase();
    if (!client) return;
    const cleanProgress = progress.map(p => ({
      studentId: p.studentId,
      sessionId: p.sessionId,
      score: p.score,
      completed: p.completed,
      completedSubjects: p.completedSubjects,
      completionDate: p.completionDate
    }));
    await client.from('progress').upsert(cleanProgress, { onConflict: 'studentId,sessionId' });
  },
  async fetchMessages(): Promise<Message[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data } = await client.from('messages').select('*').order('timestamp', { ascending: true });
    return data || [];
  },
  async sendMessage(message: Message) {
    const client = initSupabase();
    if (!client) return;
    await client.from('messages').insert([message]);
  },
  async fetchInstructors(): Promise<Instructor[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data } = await client.from('instructors').select('*');
    return data || [];
  },
  async syncInstructors(instructors: Instructor[]) {
    const client = initSupabase();
    if (!client) return;
    await client.from('instructors').upsert(instructors);
  }
};
