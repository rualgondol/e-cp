
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
      
      // On attend un peu que les variables d'env soient prêtes si besoin
      const isOk = await checkConnection();
      
      if (!isOk) {
        console.warn("Connexion Supabase échouée. Vérifiez vos variables d'environnement.");
        setDbStatus('error');
        setLoading(false);
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
        console.error("Erreur lors du chargement des données:", err);
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
      if (dbStatus === 'connected') db.syncSessions(next).catch(e => console.error("Sync error:", e));
      return next;
    });
  };

  const updateStudents = (newStudents: React.SetStateAction<Student[]>) => {
    setStudents(prev => {
      const next = typeof newStudents === 'function' ? newStudents(prev) : newStudents;
      if (dbStatus === 'connected') db.syncStudents(next).catch(e => console.error("Sync error:", e));
      return next;
    });
  };

  const updateClasses = (newClasses: React.SetStateAction<ClassLevel[]>) => {
    setClasses(prev => {
      const next = typeof newClasses === 'function' ? newClasses(prev) : newClasses;
      if (dbStatus === 'connected') db.syncClasses(next).catch(e => console.error("Sync error:", e));
      return next;
    });
  };

  const updateProgress = (newProgress: React.SetStateAction<Progress[]>) => {
    setProgress(prev => {
      const next = typeof newProgress === 'function' ? newProgress(prev) : newProgress;
      if (dbStatus === 'connected') db.syncProgress(next).catch(e => console.error("Sync error:", e));
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
