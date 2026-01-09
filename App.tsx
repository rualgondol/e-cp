
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Student, Session, Progress, Message, ClassLevel, Instructor } from './types';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentPortal from './components/Student/StudentPortal';
import Login from './components/Login';
import { db, checkConnection, initSupabase } from './services/supabaseService';
import { initialSessions, initialStudents, initialProgress, initialMessages } from './mockData';
import { CLASSES } from './constants';

const DEFAULT_ADMIN: Instructor = {
  id: 'admin-0',
  fullName: 'Administrateur Principal',
  username: 'admin',
  password: 'admin',
  role: 'ADMIN'
};

const App: React.FC = () => {
  const [user, setUser] = useState<{ type: 'admin' | 'student'; id: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [isDataReady, setIsDataReady] = useState(false);
  
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [classes, setClasses] = useState<ClassLevel[]>(CLASSES);
  const [progress, setProgress] = useState<Progress[]>(initialProgress);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    const saved = localStorage.getItem('mja_instructors');
    return saved ? JSON.parse(saved) : [DEFAULT_ADMIN];
  });

  // Refs pour éviter les boucles de synchronisation infinies
  const lastUpdateRef = useRef<{ [key: string]: number }>({});

  const loadCloudData = useCallback(async () => {
    setIsDataReady(false);
    const isOk = await checkConnection();
    
    if (!isOk) {
      setDbStatus('error');
      setIsDataReady(true);
      setLoading(false);
      return;
    }

    try {
      const [s, st, cl, p, m, ins] = await Promise.all([
        db.fetchSessions(),
        db.fetchStudents(),
        db.fetchClasses(),
        db.fetchProgress(),
        db.fetchMessages(),
        db.fetchInstructors()
      ]);

      if (s && s.length > 0) setSessions(s);
      if (st && st.length > 0) setStudents(st);
      if (cl && cl.length > 0) setClasses(cl);
      if (p && p.length > 0) setProgress(p);
      if (m && m.length > 0) setMessages(m);
      if (ins && ins.length > 0) setInstructors(ins);
      
      setDbStatus('connected');
    } catch (err) {
      setDbStatus('error');
    } finally {
      setIsDataReady(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCloudData();
    const savedUser = localStorage.getItem('mja_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mja_user');
      }
    }
  }, [loadCloudData]);

  // ABONNEMENTS REALTIME (Filtrage des échos pour éviter les crashs)
  useEffect(() => {
    if (dbStatus !== 'connected') return;

    const progressSub = db.subscribe('progress', (payload) => {
      const newProg = payload.new as Progress;
      setProgress(prev => {
        const existing = prev.find(p => p.studentId === newProg.studentId && p.sessionId === newProg.sessionId);
        // On ne met à jour que si les données ont réellement changé par rapport à ce qu'on a localement
        if (existing && JSON.stringify(existing) === JSON.stringify(newProg)) return prev;
        
        const idx = prev.findIndex(p => p.studentId === newProg.studentId && p.sessionId === newProg.sessionId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newProg;
          return updated;
        }
        return [...prev, newProg];
      });
    });

    const messagesSub = db.subscribe('messages', (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } else if (payload.eventType === 'UPDATE') {
        const updatedMsg = payload.new as Message;
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
      }
    });

    const studentsSub = db.subscribe('students', (payload) => {
      const updatedStudent = payload.new as Student;
      setStudents(prev => {
        const existing = prev.find(s => s.id === updatedStudent.id);
        if (existing && JSON.stringify(existing) === JSON.stringify(updatedStudent)) return prev;
        return prev.map(s => s.id === updatedStudent.id ? updatedStudent : s);
      });
    });

    return () => {
      progressSub?.unsubscribe();
      messagesSub?.unsubscribe();
      studentsSub?.unsubscribe();
    };
  }, [dbStatus]);

  useEffect(() => {
    localStorage.setItem('mja_instructors', JSON.stringify(instructors));
    if (dbStatus === 'connected') db.syncInstructors(instructors);
  }, [instructors, dbStatus]);

  // FONCTIONS DE MISE À JOUR ATOMIQUES (Optimisation Performance)
  const updateSessions = (newSessions: React.SetStateAction<Session[]>) => {
    setSessions(prev => {
      const next = typeof newSessions === 'function' ? newSessions(prev) : newSessions;
      if (dbStatus === 'connected') {
        // Détecter quelle session a été modifiée précisément
        const changed = next.find((s, i) => JSON.stringify(s) !== JSON.stringify(prev[i])) || next[next.length - 1];
        if (changed) db.syncSessionSingle(changed).catch(e => console.error(e));
      }
      return next;
    });
  };

  const updateProgress = (newProgress: React.SetStateAction<Progress[]>) => {
    setProgress(prev => {
      const next = typeof newProgress === 'function' ? newProgress(prev) : newProgress;
      if (dbStatus === 'connected') {
        const changed = next.find((p, i) => JSON.stringify(p) !== JSON.stringify(prev[i])) || next[next.length - 1];
        if (changed) {
           db.syncProgressSingle(changed).catch(e => console.error("Sync Progress Error:", e));
        }
      }
      return next;
    });
  };

  const updateStudents = (newStudents: React.SetStateAction<Student[]>) => {
    setStudents(prev => {
      const next = typeof newStudents === 'function' ? newStudents(prev) : newStudents;
      if (dbStatus === 'connected') {
        const changed = next.find((s, i) => JSON.stringify(s) !== JSON.stringify(prev[i])) || next[next.length - 1];
        if (changed) db.syncStudentSingle(changed).catch(e => console.error(e));
      }
      return next;
    });
  };

  const updateMessages = (newMessages: React.SetStateAction<Message[]>) => {
    setMessages(prev => {
      const next = typeof newMessages === 'function' ? newMessages(prev) : newMessages;
      if (dbStatus === 'connected') {
        const latest = next[next.length - 1];
        if (latest && !prev.find(m => m.id === latest.id)) {
          db.sendMessage(latest).catch(e => console.error(e));
        } else if (latest) {
          db.markMessageAsRead(latest.id).catch(e => console.error(e));
        }
      }
      return next;
    });
  };

  const handleLogin = (type: 'admin' | 'student', id: string, role?: string) => {
    const userData = { type, id, role };
    setUser(userData);
    localStorage.setItem('mja_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mja_user');
  };

  if (loading && !isDataReady) {
    return (
      <div className="min-h-screen bg-[#004225] flex items-center justify-center font-sans">
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
             <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
          <div><p className="text-white text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Connexion Cloud MJA</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {!user ? (
        <Login onLogin={handleLogin} students={students} instructors={instructors} dbStatus={dbStatus} isLoading={!isDataReady} />
      ) : user.type === 'admin' ? (
        <AdminDashboard 
          onLogout={handleLogout} currentUserRole={user.role || 'ADMIN'}
          sessions={sessions} setSessions={updateSessions}
          students={students} setStudents={updateStudents}
          classes={classes} setClasses={setClasses}
          progress={progress} setProgress={updateProgress}
          messages={messages} setMessages={updateMessages}
          instructors={instructors} setInstructors={setInstructors}
          dbStatus={dbStatus}
        />
      ) : (
        <StudentPortal 
          studentId={user.id} onLogout={handleLogout}
          sessions={sessions} students={students} onUpdateStudent={updateStudents}
          classes={classes} progress={progress} setProgress={updateProgress}
          messages={messages} setMessages={updateMessages}
          dbStatus={dbStatus}
        />
      )}
    </div>
  );
};

export default App;
