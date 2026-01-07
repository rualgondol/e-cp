
import React, { useState, useEffect } from 'react';
import { Student, Session, Progress, Message, ClassLevel } from './types';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentPortal from './components/Student/StudentPortal';
import Login from './components/Login';
import { db, checkConnection, isSupabaseConfigured } from './services/supabaseService';

const App: React.FC = () => {
  const [user, setUser] = useState<{ type: 'admin' | 'student'; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const connectAndLoad = async () => {
      setLoading(true);
      
      const isOk = await checkConnection();
      
      if (!isOk) {
        setDbStatus('error');
        setLoading(false);
        // On essaye quand même de charger les données locales si elles existent
        return;
      }

      try {
        const [s, st, cl, p, m] = await Promise.all([
          db.fetchSessions(),
          db.fetchStudents(),
          db.fetchClasses(),
          db.fetchProgress(),
          db.fetchMessages()
        ]);

        setSessions(s);
        setStudents(st);
        setClasses(cl);
        setProgress(p);
        setMessages(m);
        setDbStatus('connected');
      } catch (err) {
        console.error("Erreur de chargement:", err);
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

  const updateSessions = (newSessions: React.SetStateAction<Session[]>) => {
    setSessions(prev => {
      const next = typeof newSessions === 'function' ? newSessions(prev) : newSessions;
      if (dbStatus === 'connected') db.syncSessions(next).catch(e => console.error(e));
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

  const updateClasses = (newClasses: React.SetStateAction<ClassLevel[]>) => {
    setClasses(prev => {
      const next = typeof newClasses === 'function' ? newClasses(prev) : newClasses;
      if (dbStatus === 'connected') db.syncClasses(next).catch(e => console.error(e));
      return next;
    });
  };

  const updateProgress = (newProgress: React.SetStateAction<Progress[]>) => {
    setProgress(prev => {
      const next = typeof newProgress === 'function' ? newProgress(prev) : newProgress;
      if (dbStatus === 'connected') db.syncProgress(next).catch(e => console.error(e));
      return next;
    });
  };

  const handleLogin = (type: 'admin' | 'student', id: string) => {
    const userData = { type, id };
    setUser(userData);
    localStorage.setItem('mja_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mja_user');
  };

  // État de chargement initial pour éviter l'écran blanc
  if (loading && dbStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#004225] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold uppercase tracking-widest text-xs">e-CP MJA : Connexion au Cloud...</p>
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
          dbStatus={dbStatus}
          isLoading={loading}
        />
      ) : user.type === 'admin' ? (
        <AdminDashboard 
          onLogout={handleLogout}
          sessions={sessions}
          setSessions={updateSessions}
          students={students}
          setStudents={updateStudents}
          classes={classes}
          setClasses={updateClasses}
          progress={progress}
          setProgress={updateProgress}
          messages={messages}
          setMessages={setMessages}
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
