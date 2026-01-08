
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
  const [targetStudentChat, setTargetStudentChat] = useState<string | null>(null);

  const handleOpenChatWithStudent = (studentId: string) => {
    setTargetStudentChat(studentId);
    setActiveTab('messages');
  };

  const theme = THEMES[activeClub];
  const isAdmin = currentUserRole === 'ADMIN';

  const unreadCount = useMemo(() => 
    messages.filter(m => m.receiverId === 'admin' && !m.isRead).length
  , [messages]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <aside className={`w-72 flex flex-col ${theme.sidebar} text-white transition-all duration-300 shadow-2xl z-50`}>
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">e-CP MJA</h1>
          <p className="text-[8px] opacity-60 uppercase font-black tracking-[0.2em] mt-2">Portail {currentUserRole}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Gestion</p>
            <button onClick={() => setActiveTab('sessions')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'sessions' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>📂 Classe Progressive</button>
            <button onClick={() => setActiveTab('students')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'students' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>👤 Jeunes</button>
            <button onClick={() => setActiveTab('tracking')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'tracking' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>📊 Progression</button>
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Canal</p>
            <button onClick={() => { setActiveTab('messages'); setTargetStudentChat(null); }} className={`w-full flex justify-between p-3 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>
              <span>💬 Messagerie</span>
              {unreadCount > 0 && <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
            {isAdmin && (
              <>
                <button onClick={() => setActiveTab('users')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>🔑 Accès Staff</button>
                <button onClick={() => setActiveTab('docs')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'docs' ? 'bg-white/10 font-bold' : 'opacity-70'}`}>📜 Documentation</button>
              </>
            )}
          </div>
        </nav>

        <div className="p-6">
          <button onClick={onLogout} className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
            Quitter
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#F9FBFF]">
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-300px)]">
          {activeTab === 'sessions' && <SessionManager club={activeClub} sessions={sessions.filter(s => s.club === activeClub)} setSessions={setSessions} classes={classes} />}
          {activeTab === 'students' && <StudentManager club={activeClub} students={students} setStudents={setStudents} classes={classes} progress={progress} messages={messages} setMessages={setMessages} />}
          {activeTab === 'tracking' && <GlobalTracking club={activeClub} sessions={sessions} students={students} progress={progress} setProgress={setProgress} classes={classes} onOpenChat={handleOpenChatWithStudent} />}
          {activeTab === 'classes' && isAdmin && <ClassManager club={activeClub} classes={classes} setClasses={setClasses} />}
          {activeTab === 'messages' && <AdminMessaging club={activeClub} students={students} messages={messages} setMessages={setMessages} initialStudentId={targetStudentChat} />}
          {activeTab === 'docs' && isAdmin && (
            <Documentation 
              club={activeClub} students={students} classes={classes} sessions={sessions} progress={progress} instructors={instructors} dbStatus={dbStatus} 
              onManualSync={() => window.location.reload()}
            />
          )}
          {activeTab === 'users' && isAdmin && <InstructorManager instructors={instructors} setInstructors={setInstructors} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
