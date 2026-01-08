
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Student, ClassLevel, Progress, Message, Instructor } from '../types';

// Fonction de récupération sécurisée des clés (Vercel / Vite / Local)
const getEnvVar = (name: string): string => {
  try {
    // 1. Essai via process.env (Vercel / Node)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      // @ts-ignore
      return process.env[name] as string;
    }
  } catch (e) {}

  try {
    // 2. Essai via import.meta.env (Vite)
    // On accède directement à import.meta.env sans typeof sur 'import'
    // @ts-ignore
    if (import.meta.env && import.meta.env[name]) {
      // @ts-ignore
      return import.meta.env[name] as string;
    }
  } catch (e) {}

  // 3. Essai via localStorage (Configuration manuelle de secours)
  const localName = name.replace('NEXT_PUBLIC_', 'MJA_');
  return localStorage.getItem(localName) || "";
};

const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http'));
};

export const initSupabase = (forceReinit: boolean = false): SupabaseClient | null => {
  if (supabaseInstance && !forceReinit) return supabaseInstance;
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("Supabase Config Missing in Env. Checking local storage fallback.");
    const url = localStorage.getItem('MJA_SUPABASE_URL');
    const key = localStorage.getItem('MJA_SUPABASE_ANON_KEY');
    if (!url || !key) return null;
    supabaseInstance = createClient(url, key);
  } else {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.error("Supabase Init Error:", e);
      return null;
    }
  }
  return supabaseInstance;
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('MJA_SUPABASE_URL', url);
  localStorage.setItem('MJA_SUPABASE_ANON_KEY', key);
  initSupabase(true); 
};

export const checkConnection = async (): Promise<boolean> => {
  const client = initSupabase();
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
