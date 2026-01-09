
import React, { useState, useMemo } from 'react';
import { Session, Student, Progress, Message, ClassLevel, ClubType } from '../../types';
import { THEMES } from '../../constants';
import CourseCard from './CourseCard';
import SessionViewer from './SessionViewer';
import ProgressRecord from './ProgressRecord';
import Messaging from './Messaging';

interface StudentPortalProps {
  studentId: string;
  onLogout: () => void;
  sessions: Session[];
  students: Student[];
  onUpdateStudent: (newStudents: React.SetStateAction<Student[]>) => void;
  classes: ClassLevel[];
  progress: Progress[];
  setProgress: (newProgress: React.SetStateAction<Progress[]>) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clubLogos: Record<ClubType, string>;
  dbStatus: 'loading' | 'connected' | 'error';
}

const CloudIndicator = ({ status }: { status: 'loading' | 'connected' | 'error' }) => {
  const color = status === 'connected' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-orange-500';
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-black/10 rounded-lg">
      <div className={`w-1.5 h-1.5 rounded-full ${color} ${status === 'connected' ? 'animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]' : ''}`}></div>
      <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Cloud {status === 'connected' ? 'OK' : 'ERR'}</span>
    </div>
  );
};

const StudentPortal: React.FC<StudentPortalProps> = ({ 
  studentId, onLogout, sessions, students, onUpdateStudent, classes, progress, setProgress, messages, setMessages, clubLogos, dbStatus
}) => {
  const [view, setView] = useState<'courses' | 'progress' | 'messages' | 'change-pwd'>('courses');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const student = students.find(s => s.id === studentId);
  const studentClass = classes.find(c => c.id === student?.classId);
  const isPwdChangeRequired = student && !student.passwordChanged;

  const mySessions = useMemo(() => sessions.filter(s => s.classId === studentClass?.id).sort((a,b) => a.number - b.number), [sessions, studentClass]);
  const myProgress = progress.filter(p => p.studentId === studentId);
  const theme = studentClass ? THEMES[studentClass.club] : THEMES['AVENTURIERS'];

  const unreadCount = useMemo(() => 
    messages.filter(m => m.receiverId === studentId && !m.isRead).length
  , [messages, studentId]);

  const getSessionStatus = (session: Session) => {
    const isPast = new Date(session.availabilityDate) <= new Date();
    if (!isPast) return 'locked-future';
    const index = mySessions.findIndex(s => s.id === session.id);
    if (index === 0) return 'available';
    const prevSession = mySessions[index - 1];
    const prevProg = myProgress.find(p => p.sessionId === prevSession.id);
    return prevProg?.completed ? 'available' : 'locked-linear';
  };

  const handleUpdatePassword = () => {
    if (newPassword.length < 4) return alert("Mot de passe trop court (min 4 caractères)");
    onUpdateStudent(prev => prev.map(s => s.id === studentId ? { ...s, password: newPassword, passwordChanged: true, temporaryPassword: "" } : s));
    alert("Mot de passe enregistré ! Bienvenue.");
    setView('courses');
  };

  if (!student || !studentClass) return <div>Data Error</div>;

  if (isPwdChangeRequired && view !== 'change-pwd') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
         <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl max-w-md w-full text-center space-y-8 animate-scale-in">
            <div className="text-5xl md:text-6xl flex justify-center">
              <img src={clubLogos[studentClass.club]} className="w-24 h-24 object-contain" alt="Club Logo" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase">Sécurité Obligatoire</h2>
            <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed">Veuillez définir un mot de passe personnel pour protéger vos progrès.</p>
            <div className="space-y-4">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" className="w-full border-2 border-gray-100 p-4 rounded-2xl font-bold text-center outline-none focus:border-blue-500 shadow-inner" />
              <button onClick={handleUpdatePassword} className="w-full bg-[#004225] text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all">Valider</button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className={`p-4 text-white shadow-xl sticky top-0 z-40 transition-all`} style={{ backgroundColor: theme.primary }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <span className="text-xl bg-white w-9 h-9 flex items-center justify-center rounded-xl shadow-inner overflow-hidden p-1">
                  <img src={clubLogos[studentClass.club]} className="w-full h-full object-contain" alt="" />
              </span>
              <div>
                <h1 className="text-base font-black leading-none truncate max-w-[150px]">{student.fullName}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className="text-[7px] opacity-70 uppercase font-black tracking-widest">{studentClass.name}</p>
                   <CloudIndicator status={dbStatus} />
                </div>
              </div>
            </div>
            <button onClick={onLogout} className="sm:hidden bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm">🚪</button>
          </div>
          
          <nav className="flex items-center justify-center gap-4 md:gap-8 w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
            <button onClick={() => {setView('courses'); setActiveSessionId(null);}} className={`text-[9px] font-black uppercase tracking-widest px-2 pb-1 ${view === 'courses' ? 'border-b-2 border-white' : 'opacity-60'}`}>Cours</button>
            <button onClick={() => {setView('progress'); setActiveSessionId(null);}} className={`text-[9px] font-black uppercase tracking-widest px-2 pb-1 ${view === 'progress' ? 'border-b-2 border-white' : 'opacity-60'}`}>Record</button>
            <button onClick={() => {setView('messages'); setActiveSessionId(null);}} className={`relative text-[9px] font-black uppercase tracking-widest px-2 pb-1 ${view === 'messages' ? 'border-b-2 border-white' : 'opacity-60'}`}>
                Messages
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-[7px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white animate-pulse">{unreadCount}</span>
                )}
            </button>
            <button onClick={onLogout} className="hidden sm:flex bg-white/10 w-8 h-8 rounded-full items-center justify-center text-sm">🚪</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 pb-32">
        {activeSessionId ? (
          <SessionViewer 
            session={mySessions.find(s => s.id === activeSessionId)!}
            progress={myProgress.find(p => p.sessionId === activeSessionId)}
            onBack={() => setActiveSessionId(null)}
            theme={theme}
            onCompleteSubject={(subId, score) => {
              setProgress(prev => {
                const sIdx = prev.findIndex(p => p.studentId === studentId && p.sessionId === activeSessionId);
                const curSession = mySessions.find(s => s.id === activeSessionId)!;
                if (sIdx >= 0) {
                  const updated = [...prev];
                  const newCompleted = Array.from(new Set([...updated[sIdx].completedSubjects, subId]));
                  updated[sIdx] = { ...updated[sIdx], completedSubjects: newCompleted, score: Math.round((newCompleted.length/curSession.subjects.length)*100), completed: newCompleted.length === curSession.subjects.length, completionDate: new Date().toISOString() };
                  return updated;
                }
                return [...prev, { studentId, sessionId: activeSessionId, score: Math.round((1/curSession.subjects.length)*100), completed: curSession.subjects.length === 1, completedSubjects: [subId], completionDate: new Date().toISOString() }];
              });
            }}
          />
        ) : (
          view === 'courses' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 animate-fade-in">
              {mySessions.map(s => (
                <CourseCard 
                  key={s.id} session={s} theme={theme}
                  progress={myProgress.find(p => p.sessionId === s.id)}
                  status={getSessionStatus(s)}
                  onClick={() => setActiveSessionId(s.id)}
                />
              ))}
            </div>
          ) : view === 'progress' ? (
            <ProgressRecord student={student} sessions={mySessions} progress={myProgress} theme={theme} />
          ) : view === 'messages' ? (
            <Messaging studentId={studentId} messages={messages} setMessages={setMessages} theme={theme} />
          ) : null
        )}
      </main>

      <footer className="global-footer">
          Copyright © 2026 e-CP MJA - Tous droits réservés. <br/>
          by Kuvasz Fidèle
      </footer>
    </div>
  );
};

export default StudentPortal;
