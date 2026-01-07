
import React, { useState, useEffect } from 'react';
import { Student, Session, Progress, Message, ClassLevel, Instructor } from './types';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentPortal from './components/Student/StudentPortal';
import Login from './components/Login';
import { db, checkConnection } from './services/supabaseService';
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
  
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [classes, setClasses] = useState<ClassLevel[]>(CLASSES);
  const [progress, setProgress] = useState<Progress[]>(initialProgress);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    const saved = localStorage.getItem('mja_instructors');
    return saved ? JSON.parse(saved) : [DEFAULT_ADMIN];
  });

  useEffect(() => {
    const connectAndLoad = async () => {
      setLoading(true);
      const isOk = await checkConnection();
      
      if (!isOk) {
        setDbStatus('error');
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
        setLoading(false);
      }
    };

    connectAndLoad();
    
    const savedUser = localStorage.getItem('mja_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mja_user');
      }
    }
  }, []);

  // Synchronisation automatique des instructeurs
  useEffect(() => {
    localStorage.setItem('mja_instructors', JSON.stringify(instructors));
    if (dbStatus === 'connected') db.syncInstructors(instructors);
  }, [instructors, dbStatus]);

  // Helper pour mettre à jour et synchroniser les sessions
  const updateSessions = (newSessions: React.SetStateAction<Session[]>) => {
    setSessions(prev => {
      const next = typeof newSessions === 'function' ? newSessions(prev) : newSessions;
      if (dbStatus === 'connected') db.syncSessions(next).catch(e => console.error(e));
      return next;
    });
  };

  // Helper pour mettre à jour et synchroniser la progression (Automatique pour les élèves)
  const updateProgress = (newProgress: React.SetStateAction<Progress[]>) => {
    setProgress(prev => {
      const next = typeof newProgress === 'function' ? newProgress(prev) : newProgress;
      if (dbStatus === 'connected') {
        // On synchronise vers le cloud de manière asynchrone sans bloquer l'UI
        db.syncProgress(next).catch(e => console.error("Sync Progress Error:", e));
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

  if (loading && dbStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#004225] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Chargement e-CP MJA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {!user ? (
        <Login 
          onLogin={handleLogin} 
          students={students} 
          instructors={instructors}
          dbStatus={dbStatus}
          isLoading={loading}
        />
      ) : user.type === 'admin' ? (
        <AdminDashboard 
          onLogout={handleLogout}
          currentUserRole={user.role || 'ADMIN'}
          sessions={sessions}
          setSessions={updateSessions}
          students={students}
          setStudents={setStudents}
          classes={classes}
          setClasses={setClasses}
          progress={progress}
          setProgress={updateProgress}
          messages={messages}
          setMessages={setMessages}
          instructors={instructors}
          setInstructors={setInstructors}
          dbStatus={dbStatus}
        />
      ) : (
        <StudentPortal 
          studentId={user.id}
          onLogout={handleLogout}
          sessions={sessions}
          students={students}
          classes={classes}
          progress={progress}
          setProgress={updateProgress}
          messages={messages}
          setMessages={setMessages}
        />
      )}
    </div>
  );
};

export default App;
