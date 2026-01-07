
import React, { useState, useMemo, useEffect } from 'react';
import { ClubType, Session, Student, Progress, Message, ClassLevel, Instructor } from '../../types';
import { THEMES } from '../../constants';
import SessionManager from './SessionManager';
import StudentManager from './StudentManager';
import GlobalTracking from './GlobalTracking';
import ClassManager from './ClassManager';
import AdminMessaging from './AdminMessaging';
import Documentation from './Documentation';
import InstructorManager from './InstructorManager';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUserRole: string;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: ClassLevel[];
  setClasses: React.Dispatch<React.SetStateAction<ClassLevel[]>>;
  progress: Progress[];
  setProgress: React.Dispatch<React.SetStateAction<Progress[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  instructors: Instructor[];
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
  dbStatus: 'loading' | 'connected' | 'error';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onLogout, currentUserRole, sessions, setSessions, students, setStudents, classes, setClasses, progress, setProgress, messages, setMessages, instructors, setInstructors, dbStatus
}) => {
  const [activeClub, setActiveClub] = useState<ClubType>(() => {
    if (currentUserRole === 'EXPLORATEURS') return ClubType.EXPLORATEURS;
    return ClubType.AVENTURIERS;
  });
  const [activeTab, setActiveTab] = useState<'sessions' | 'students' | 'tracking' | 'classes' | 'messages' | 'docs' | 'users'>('sessions');

  // Si l'utilisateur a un rôle restreint, on le force sur son club
  useEffect(() => {
    if (currentUserRole === 'AVENTURIERS') setActiveClub(ClubType.AVENTURIERS);
    if (currentUserRole === 'EXPLORATEURS') setActiveClub(ClubType.EXPLORATEURS);
  }, [currentUserRole]);

  const theme = THEMES[activeClub];
  const isAdmin = currentUserRole === 'ADMIN';

  const unreadCount = useMemo(() => 
    messages.filter(m => m.receiverId === 'admin' && !m.isRead).length
  , [messages]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <aside className={`w-72 flex flex-col ${theme.sidebar} text-white transition-all duration-300 shadow-2xl z-50`}>
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-black uppercase tracking-tighter">e-CP MJA</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <p className="text-[8px] opacity-60 uppercase font-black tracking-[0.2em]">{currentUserRole} Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {isAdmin && (
            <div className="bg-black/20 p-1.5 rounded-xl flex flex-col gap-1">
              <button 
                onClick={() => setActiveClub(ClubType.AVENTURIERS)}
                className={`p-2.5 rounded-lg text-left text-xs font-black uppercase tracking-wider transition-all ${activeClub === ClubType.AVENTURIERS ? 'bg-white text-blue-900' : 'opacity-70'}`}
              >
                ⚜️ Aventuriers
              </button>
              <button 
                onClick={() => setActiveClub(ClubType.EXPLORATEURS)}
                className={`p-2.5 rounded-lg text-left text-xs font-black uppercase tracking-wider transition-all ${activeClub === ClubType.EXPLORATEURS ? 'bg-white text-green-900' : 'opacity-70'}`}
              >
                ⛺ Explorateurs
              </button>
            </div>
          )}

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Gestion</p>
            <button onClick={() => setActiveTab('sessions')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'sessions' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>📅 Séances</button>
            <button onClick={() => setActiveTab('students')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'students' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>👥 Élèves</button>
            <button onClick={() => setActiveTab('tracking')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'tracking' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>📊 Suivi Global</button>
            {isAdmin && <button onClick={() => setActiveTab('classes')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'classes' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>⚙️ Classes</button>}
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Administration</p>
            <button onClick={() => setActiveTab('messages')} className={`w-full flex justify-between p-3 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>
              <span>💬 Messagerie</span>
              {unreadCount > 0 && <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
            {isAdmin && (
              <>
                <button onClick={() => setActiveTab('users')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>👤 Utilisateurs</button>
                <button onClick={() => setActiveTab('docs')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'docs' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>📚 Documentation</button>
              </>
            )}
          </div>
        </nav>

        <div className="p-6 bg-black/10">
          <button onClick={onLogout} className="w-full p-3 text-red-100 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all font-bold text-xs uppercase">
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#F9FBFF]">
        <header className="flex justify-between items-end mb-10 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-4xl font-black uppercase" style={{ color: theme.primary }}>
              {activeTab === 'sessions' ? 'Séances' : activeTab === 'students' ? 'Élèves' : activeTab === 'classes' ? 'Classes' : activeTab === 'messages' ? 'Messagerie' : activeTab === 'docs' ? 'Documentation' : activeTab === 'users' ? 'Utilisateurs' : 'Suivi Global'}
            </h2>
            <p className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.2em] mt-2">
              Club {activeClub === ClubType.AVENTURIERS ? 'Aventuriers' : 'Explorateurs'} • e-CP MJA
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto min-h-[calc(100vh-300px)]">
          {activeTab === 'sessions' && <SessionManager club={activeClub} sessions={sessions.filter(s => s.club === activeClub)} setSessions={setSessions} classes={classes} />}
          {activeTab === 'students' && <StudentManager club={activeClub} students={students} setStudents={setStudents} classes={classes} progress={progress} messages={messages} setMessages={setMessages} />}
          {activeTab === 'tracking' && <GlobalTracking club={activeClub} sessions={sessions} students={students} progress={progress} setProgress={setProgress} classes={classes} />}
          {activeTab === 'classes' && isAdmin && <ClassManager club={activeClub} classes={classes} setClasses={setClasses} />}
          {activeTab === 'messages' && <AdminMessaging club={activeClub} students={students} messages={messages} setMessages={setMessages} />}
          {activeTab === 'docs' && isAdmin && <Documentation club={activeClub} students={students} classes={classes} dbStatus={dbStatus} />}
          {activeTab === 'users' && isAdmin && <InstructorManager instructors={instructors} setInstructors={setInstructors} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
