
import React, { useState, useEffect, useCallback } from 'react';
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

  const loadCloudData = useCallback(async () => {
    setIsDataReady(false);
    const isOk = await checkConnection();
    
    if (!isOk) {
      console.warn("Cloud connection failed. Using local/mock data.");
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

      // On n'écrase les données que si le cloud renvoie quelque chose
      if (s && s.length > 0) setSessions(s);
      if (st && st.length > 0) setStudents(st);
      if (cl && cl.length > 0) setClasses(cl);
      if (p && p.length > 0) setProgress(p);
      if (m && m.length > 0) setMessages(m);
      if (ins && ins.length > 0) setInstructors(ins);
      
      setDbStatus('connected');
    } catch (err) {
      console.error("Cloud data load error:", err);
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

  // Synchronisation automatique des instructeurs
  useEffect(() => {
    localStorage.setItem('mja_instructors', JSON.stringify(instructors));
    if (dbStatus === 'connected') db.syncInstructors(instructors);
  }, [instructors, dbStatus]);

  // Helpers de mise à jour synchronisée
  const updateSessions = (newSessions: React.SetStateAction<Session[]>) => {
    setSessions(prev => {
      const next = typeof newSessions === 'function' ? newSessions(prev) : newSessions;
      if (dbStatus === 'connected') db.syncSessions(next).catch(e => console.error(e));
      return next;
    });
  };

  const updateProgress = (newProgress: React.SetStateAction<Progress[]>) => {
    setProgress(prev => {
      const next = typeof newProgress === 'function' ? newProgress(prev) : newProgress;
      if (dbStatus === 'connected') {
        db.syncProgress(next).catch(e => console.error("Sync Progress Error:", e));
      }
      return next;
    });
  };

  const updateStudents = (newStudents: React.SetStateAction<Student[]>) => {
    setStudents(prev => {
      const next = typeof newStudents === 'function' ? newStudents(prev) : newStudents;
      if (dbStatus === 'connected') db.syncStudents(next).catch(e => console.error(e));
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
          <div>
            <p className="text-white text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Connexion Cloud MJA</p>
            <p className="text-white/30 text-[8px] font-bold uppercase mt-2">Vérification de la base de données...</p>
          </div>
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
          isLoading={!isDataReady}
        />
      ) : user.type === 'admin' ? (
        <AdminDashboard 
          onLogout={handleLogout}
          currentUserRole={user.role || 'ADMIN'}
          sessions={sessions}
          setSessions={updateSessions}
          students={students}
          setStudents={updateStudents}
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
