
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

const CloudIndicator = ({ status }: { status: 'loading' | 'connected' | 'error' }) => {
  const color = status === 'connected' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-orange-500';
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-black/10 rounded-xl">
      <div className={`w-2 h-2 rounded-full ${color} ${status === 'connected' ? 'animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : ''}`}></div>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Cloud {status === 'connected' ? 'Connecté' : status === 'error' ? 'Erreur' : 'Sync...'}</span>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onLogout, currentUserRole, sessions, setSessions, students, setStudents, classes, setClasses, progress, setProgress, messages, setMessages, instructors, setInstructors, dbStatus
}) => {
  const [activeClub, setActiveClub] = useState<ClubType>(() => {
    if (currentUserRole === 'EXPLORATEURS') return ClubType.EXPLORATEURS;
    return ClubType.AVENTURIERS;
  });
  const [activeTab, setActiveTab] = useState<'sessions' | 'students' | 'tracking' | 'classes' | 'messages' | 'docs' | 'users'>('sessions');
  const [targetStudentChat, setTargetStudentChat] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenChatWithStudent = (studentId: string) => {
    setTargetStudentChat(studentId);
    setActiveTab('messages');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const theme = THEMES[activeClub];
  const isAdmin = currentUserRole === 'ADMIN';

  const unreadCount = useMemo(() => 
    messages.filter(m => m.receiverId === 'admin' && !m.isRead).length
  , [messages]);

  const navItems = [
    { id: 'sessions', label: '📂 Classe Progressive' },
    { id: 'students', label: '👤 Jeunes' },
    { id: 'tracking', label: '📊 Progression' },
    { id: 'classes', label: '🏷️ Classes' },
  ];

  const adminNavItems = [
    { id: 'users', label: '🔑 Accès Staff' },
    { id: 'docs', label: '📜 Documentation' },
  ];

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 w-72 flex flex-col ${theme.sidebar} text-white transition-all duration-300 shadow-2xl z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">e-CP MJA</h1>
            <p className="text-[8px] opacity-60 uppercase font-black tracking-[0.2em] mt-2">Portail {currentUserRole}</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-2xl">✕</button>
        </div>

        <div className="px-6 mt-4">
           <CloudIndicator status={dbStatus} />
        </div>

        {isAdmin && (
          <div className="px-6 py-4">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1">CLUB</p>
            <div className="relative bg-black/20 p-1 rounded-2xl flex items-center h-12 overflow-hidden">
              <div 
                className={`absolute h-10 w-[calc(50%-4px)] bg-white/10 rounded-xl transition-all duration-300 ease-out z-0 ${activeClub === ClubType.EXPLORATEURS ? 'translate-x-full' : 'translate-x-0'}`}
              ></div>
              
              <button 
                onClick={() => setActiveClub(ClubType.AVENTURIERS)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-colors duration-300 ${activeClub === ClubType.AVENTURIERS ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                <span>⛵</span>
                <span>AVENT.</span>
              </button>
              <button 
                onClick={() => setActiveClub(ClubType.EXPLORATEURS)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-colors duration-300 ${activeClub === ClubType.EXPLORATEURS ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                <span>⛺</span>
                <span>EXPLOR.</span>
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Gestion</p>
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => handleTabChange(item.id as any)} 
                className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white/10 font-bold' : 'opacity-70 hover:bg-white/5'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Administration</p>
            <button onClick={() => { handleTabChange('messages'); setTargetStudentChat(null); }} className={`w-full flex justify-between items-center p-3 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-white/10 font-bold' : 'opacity-70 hover:bg-white/5'}`}>
              <span className="flex items-center gap-2">💬 Messagerie</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-red-500/50">{unreadCount}</span>
              )}
            </button>
            {isAdmin && adminNavItems.map(item => (
              <button 
                key={item.id}
                onClick={() => handleTabChange(item.id as any)} 
                className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white/10 font-bold' : 'opacity-70 hover:bg-white/5'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6">
          <button onClick={onLogout} className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest text-red-100">
            Quitter
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#F9FBFF] flex flex-col">
        {/* Mobile Header Toggle */}
        <header className="lg:hidden p-4 bg-white border-b flex justify-between items-center sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 rounded-lg text-xl">☰</button>
          <div className="text-right">
             <h2 className="text-xs font-black uppercase tracking-tighter text-gray-900 leading-none">e-CP MJA</h2>
             <p className="text-[7px] font-bold text-gray-400 uppercase mt-1">Admin Panel</p>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'sessions' && <SessionManager club={activeClub} sessions={sessions.filter(s => s.club === activeClub)} setSessions={setSessions} classes={classes} />}
            {activeTab === 'students' && <StudentManager club={activeClub} students={students} setStudents={setStudents} classes={classes} progress={progress} messages={messages} setMessages={setMessages} />}
            {activeTab === 'tracking' && <GlobalTracking club={activeClub} sessions={sessions} students={students} progress={progress} setProgress={setProgress} classes={classes} onOpenChat={handleOpenChatWithStudent} />}
            {activeTab === 'classes' && <ClassManager club={activeClub} classes={classes} setClasses={setClasses} />}
            {activeTab === 'messages' && <AdminMessaging club={activeClub} students={students} messages={messages} setMessages={setMessages} initialStudentId={targetStudentChat} />}
            {activeTab === 'docs' && isAdmin && (
              <Documentation 
                club={activeClub} students={students} classes={classes} sessions={sessions} progress={progress} instructors={instructors} dbStatus={dbStatus} 
                onManualSync={() => window.location.reload()}
              />
            )}
            {activeTab === 'users' && isAdmin && <InstructorManager instructors={instructors} setInstructors={setInstructors} />}
          </div>
        </div>
        <footer className="global-footer">
          Copyright © 2026 e-CP MJA - Tous droits réservés. <br/>
          by Kuvasz Fidèle
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
