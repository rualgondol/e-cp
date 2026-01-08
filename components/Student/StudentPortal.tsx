
import React, { useState, useMemo } from 'react';
import { Session, Student, Progress, Message, ClassLevel } from '../../types';
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
}

const StudentPortal: React.FC<StudentPortalProps> = ({ 
  studentId, onLogout, sessions, students, onUpdateStudent, classes, progress, setProgress, messages, setMessages 
}) => {
  const [view, setView] = useState<'courses' | 'progress' | 'messages' | 'change-pwd'>('courses');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const student = students.find(s => s.id === studentId);
  const studentClass = classes.find(c => c.id === student?.classId);

  // Vérification mot de passe temporaire : forcer le changement si pas encore fait
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
    
    // On met à jour l'élève dans la base
    onUpdateStudent(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, password: newPassword, passwordChanged: true, temporaryPassword: "" } 
        : s
    ));
    
    alert("Mot de passe enregistré ! Bienvenue dans votre classe progressive.");
    setView('courses');
  };

  if (!student || !studentClass) return <div>Data Error</div>;

  // Si le mot de passe n'a pas été changé, on n'affiche que l'écran de changement
  if (isPwdChangeRequired && view !== 'change-pwd') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
         <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center space-y-8 animate-scale-in">
            <div className="text-6xl">🛡️</div>
            <h2 className="text-2xl font-black text-gray-900 uppercase">Sécurité Obligatoire</h2>
            <p className="text-sm text-gray-400 font-medium">C'est votre première connexion. Veuillez définir un mot de passe personnel pour protéger vos progrès.</p>
            <div className="space-y-4">
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Nouveau mot de passe" 
                className="w-full border-2 border-gray-100 p-5 rounded-2xl font-bold text-center outline-none focus:border-blue-500 shadow-inner" 
              />
              <button onClick={handleUpdatePassword} className="w-full bg-[#004225] text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all">Valider et Entrer</button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className={`p-6 text-white shadow-xl sticky top-0 z-40 transition-all`} style={{ backgroundColor: theme.primary }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <span className="text-4xl bg-white/10 w-14 h-14 flex items-center justify-center rounded-3xl shadow-inner overflow-hidden">
                {studentClass.icon && studentClass.icon.length > 5 ? (
                    <img src={studentClass.icon} className="w-full h-full object-cover" alt="" />
                ) : studentClass.icon || '⛺'}
            </span>
            <div>
              <h1 className="text-2xl font-black leading-none">{student.fullName}</h1>
              <p className="text-[10px] opacity-70 uppercase font-black tracking-widest mt-1">{studentClass.name} • Toujours prêt</p>
            </div>
          </div>
          <nav className="flex items-center gap-8">
            <button onClick={() => {setView('courses'); setActiveSessionId(null);}} className={`text-[10px] font-black uppercase tracking-widest ${view === 'courses' ? 'border-b-2 border-white' : 'opacity-60'}`}>Cours</button>
            <button onClick={() => {setView('progress'); setActiveSessionId(null);}} className={`text-[10px] font-black uppercase tracking-widest ${view === 'progress' ? 'border-b-2 border-white' : 'opacity-60'}`}>Record</button>
            <button onClick={() => {setView('messages'); setActiveSessionId(null);}} className={`relative text-[10px] font-black uppercase tracking-widest ${view === 'messages' ? 'border-b-2 border-white' : 'opacity-60'}`}>
                Messages
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>
            <button onClick={onLogout} className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center">🚪</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 pb-32">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
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
