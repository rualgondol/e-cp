
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session, Student, ClassLevel, Progress, Message, Instructor, ClubType } from '../types';

const getEnvVar = (name: string): string => {
  const localName = name.replace('VITE_', 'MJA_').replace('NEXT_PUBLIC_', 'MJA_');
  const localValue = localStorage.getItem(localName);
  if (localValue) return localValue;

  const viteName = name.startsWith('VITE_') ? name : `VITE_${name.replace('NEXT_PUBLIC_', '')}`;
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[viteName]) return metaEnv[viteName];
  } catch (e) {}

  return "";
};

let SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
let SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

let supabaseInstance: SupabaseClient | null = null;

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
    return null;
  }
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

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('MJA_SUPABASE_URL', url.trim());
  localStorage.setItem('MJA_SUPABASE_ANON_KEY', key.trim());
  initSupabase(true);
};

export const db = {
  subscribe(table: string, callback: (payload: any) => void) {
    const client = initSupabase();
    if (!client) return null;
    return client
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  },

  async fetchClasses(): Promise<ClassLevel[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data } = await client.from('classes').select('*').order('age', { ascending: true });
    return data || [];
  },

  async updateClassSingle(cls: ClassLevel) {
    const client = initSupabase();
    if (!client) return;
    await client.from('classes').upsert(cls);
  },

  async updateAllClassIcons(club: ClubType, icon: string) {
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.from('classes').update({ icon }).eq('club', club);
    if (error) console.error("Bulk Icon Update Error:", error.message);
  },

  async fetchStudents(): Promise<Student[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data } = await client.from('students').select('*');
    return data || [];
  },

  async syncStudentSingle(student: Student) {
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.from('students').upsert(student);
    if (error) console.error("Sync Student Error:", error.message);
  },

  async fetchSessions(): Promise<Session[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data } = await client.from('sessions').select('*');
    return data || [];
  },

  async syncSessionSingle(session: Session) {
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.from('sessions').upsert(session);
    if (error) console.error("Sync Session Error:", error.message);
  },

  async fetchProgress(): Promise<Progress[]> {
    const client = initSupabase();
    if (!client) return [];
    const { data } = await client.from('progress').select('*');
    return data || [];
  },

  async syncProgressSingle(prog: Progress) {
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.from('progress').upsert({
      studentId: prog.studentId,
      sessionId: prog.sessionId,
      score: prog.score,
      completed: prog.completed,
      completedSubjects: prog.completedSubjects,
      completionDate: prog.completionDate
    }, { onConflict: 'studentId,sessionId' });
    if (error) console.error("Supabase Upsert Error:", error.message);
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

  async markMessageAsRead(messageId: string) {
    const client = initSupabase();
    if (!client) return;
    await client.from('messages').update({ isRead: true }).eq('id', messageId);
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
  },

  async fetchClubLogos(): Promise<Record<ClubType, string> | null> {
    const client = initSupabase();
    if (!client) return null;
    const { data } = await client.from('club_config').select('*');
    if (!data) return null;
    const logos: any = {};
    data.forEach(item => { logos[item.id] = item.logo; });
    return logos as Record<ClubType, string>;
  },

  async updateClubLogo(club: ClubType, logo: string) {
    const client = initSupabase();
    if (!client) return;
    await client.from('club_config').upsert({ id: club, logo, updated_at: new Date().toISOString() });
  }
};
