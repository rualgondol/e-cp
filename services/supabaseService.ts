
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Student, ClassLevel, Progress, Message, Instructor } from '../types';

// Récupération des clés : Vercel (Production) > LocalStorage (Développement/Override)
const getSupabaseConfig = () => {
  // Sur Vercel, ces variables doivent être définies dans le Dashboard Settings > Environment Variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  const localUrl = localStorage.getItem('MJA_SUPABASE_URL');
  const localKey = localStorage.getItem('MJA_SUPABASE_ANON_KEY');
  
  return {
    url: envUrl || localUrl || "",
    key: envKey || localKey || ""
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
      auth: { 
        persistSession: false, 
        autoRefreshToken: true,
        detectSessionInUrl: false
      },
      global: {
        headers: { 'x-application-name': 'e-cp-mja' }
      }
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
  initSupabase(true); 
};

export const checkConnection = async (): Promise<boolean> => {
  const client = initSupabase();
  if (!client) return false;

  try {
    // Utilisation d'un timeout court pour ne pas bloquer l'UI
    const { error } = await Promise.race([
      client.from('classes').select('id').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))
    ]) as any;
    
    return !error;
  } catch (err) {
    return false;
  }
};

export const db = {
  async fetchClasses(): Promise<ClassLevel[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data, error } = await client.from('classes').select('*').order('age', { ascending: true });
    if (error) return [];
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
    if (error) return [];
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
    if (error) return [];
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
    if (error) return [];
    return data || [];
  },
  async syncProgress(progress: Progress[]) {
    const client = initSupabase();
    if (!client) return;
    // On nettoie les objets pour ne garder que les champs SQL
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
    const { data, error } = await client.from('messages').select('*').order('timestamp', { ascending: true });
    if (error) return [];
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
    try {
      const { data, error } = await client.from('instructors').select('*');
      if (error) return [];
      return data || [];
    } catch(e) { return []; }
  },
  async syncInstructors(instructors: Instructor[]) {
    const client = initSupabase();
    if (!client) return;
    try {
      await client.from('instructors').upsert(instructors);
    } catch(e) {}
  }
};
