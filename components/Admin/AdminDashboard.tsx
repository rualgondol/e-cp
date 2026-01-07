
import React, { useState, useMemo } from 'react';
import { ClubType, Session, Student, Progress, Message, ClassLevel } from '../../types';
import { THEMES } from '../../constants';
import SessionManager from './SessionManager';
import StudentManager from './StudentManager';
import GlobalTracking from './GlobalTracking';
import ClassManager from './ClassManager';
import AdminMessaging from './AdminMessaging';
import Documentation from './Documentation';

interface AdminDashboardProps {
  onLogout: () => void;
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
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onLogout, sessions, setSessions, students, setStudents, classes, setClasses, progress, setProgress, messages, setMessages 
}) => {
  const [activeClub, setActiveClub] = useState<ClubType>(ClubType.AVENTURIERS);
  const [activeTab, setActiveTab] = useState<'sessions' | 'students' | 'tracking' | 'classes' | 'messages' | 'docs'>('sessions');

  const theme = THEMES[activeClub];
  
  const unreadCount = useMemo(() => 
    messages.filter(m => m.receiverId === 'admin' && !m.isRead).length
  , [messages]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <aside className={`w-72 flex flex-col ${theme.sidebar} text-white transition-all duration-300 shadow-2xl z-50`}>
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase leading-none">
            <div className="w-10 h-10 bg-white/10 rounded-xl p-1.5 flex items-center justify-center">
                {/* Mini logo scout */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="20" y="45" width="60" height="5" rx="1" fill="white" />
                    <rect x="25" y="48" width="4" height="35" rx="1" fill="white" opacity="0.6" />
                    <rect x="71" y="48" width="4" height="35" rx="1" fill="white" opacity="0.6" />
                    <rect x="40" y="60" width="20" height="3" rx="0.5" fill="white" />
                </svg>
            </div>
            e-CP MJA
          </h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-[8px] opacity-60 uppercase font-black tracking-[0.2em]">Instructeur Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-sidebar-scrollbar">
          <div className="bg-black/20 p-1.5 rounded-xl flex flex-col gap-1">
            <button 
              onClick={() => setActiveClub(ClubType.AVENTURIERS)}
              className={`p-2.5 rounded-lg text-left text-xs font-black uppercase tracking-wider transition-all ${activeClub === ClubType.AVENTURIERS ? 'bg-white text-blue-900 shadow-lg' : 'hover:bg-white/10 opacity-70'}`}
            >
              ⚜️ Aventuriers
            </button>
            <button 
              onClick={() => setActiveClub(ClubType.EXPLORATEURS)}
              className={`p-2.5 rounded-lg text-left text-xs font-black uppercase tracking-wider transition-all ${activeClub === ClubType.EXPLORATEURS ? 'bg-white text-green-900 shadow-lg' : 'hover:bg-white/10 opacity-70'}`}
            >
              ⛺ Explorateurs
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Gestion</p>
            <button onClick={() => setActiveTab('sessions')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'sessions' ? 'bg-white/10 font-bold shadow-inner' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}>📅 Séances</button>
            <button onClick={() => setActiveTab('students')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'students' ? 'bg-white/10 font-bold shadow-inner' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}>👥 Élèves</button>
            <button onClick={() => setActiveTab('tracking')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'tracking' ? 'bg-white/10 font-bold shadow-inner' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}>📊 Suivi Global</button>
            <button onClick={() => setActiveTab('classes')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'classes' ? 'bg-white/10 font-bold shadow-inner' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}>⚙️ Classes</button>
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Support</p>
            <button 
              onClick={() => setActiveTab('messages')} 
              className={`w-full flex justify-between items-center p-3 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-white/10 font-bold shadow-inner' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
            >
              <span className="flex items-center gap-3">💬 Messagerie</span>
              {unreadCount > 0 && <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce">{unreadCount}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('docs')} 
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'docs' ? 'bg-white/10 font-bold shadow-inner' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
            >
              📚 Documentation
            </button>
          </div>
        </nav>

        <div className="p-6 bg-black/10 border-t border-white/10">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-3 p-3 text-red-100 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all font-bold text-sm"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#F9FBFF] custom-scrollbar">
        <header className="flex justify-between items-end mb-10 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-4xl font-black tracking-tight uppercase" style={{ color: theme.primary }}>
              {activeTab === 'sessions' ? 'Séances' : activeTab === 'students' ? 'Élèves' : activeTab === 'classes' ? 'Classes' : activeTab === 'messages' ? 'Messagerie' : activeTab === 'docs' ? 'Documentation' : 'Suivi Global'}
            </h2>
            <p className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.2em] mt-2">
              Club {activeClub === ClubType.AVENTURIERS ? 'Aventuriers' : 'Explorateurs'} • Classe progressive des clubs junior de la MJA
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto min-h-[calc(100vh-300px)]">
          {activeTab === 'sessions' && <SessionManager club={activeClub} sessions={sessions.filter(s => s.club === activeClub)} setSessions={setSessions} classes={classes} />}
          {activeTab === 'students' && <StudentManager club={activeClub} students={students} setStudents={setStudents} classes={classes} progress={progress} messages={messages} setMessages={setMessages} />}
          {activeTab === 'tracking' && <GlobalTracking club={activeClub} sessions={sessions} students={students} progress={progress} setProgress={setProgress} classes={classes} />}
          {activeTab === 'classes' && <ClassManager club={activeClub} classes={classes} setClasses={setClasses} />}
          {activeTab === 'messages' && <AdminMessaging club={activeClub} students={students} messages={messages} setMessages={setMessages} />}
          {activeTab === 'docs' && <Documentation club={activeClub} students={students} classes={classes} />}
        </div>

        <footer className="global-footer mt-20">
            Copyright © 2026 e-CP MJA - Tous droits réservés. Système de Classe Progressive JA. - by Kuvasz Fidèle
        </footer>
      </main>

      <style>{`
        .custom-sidebar-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-sidebar-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
