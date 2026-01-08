
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
  classes: ClassLevel[];
  progress: Progress[];
  setProgress: (newProgress: React.SetStateAction<Progress[]>) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ 
  studentId, onLogout, sessions, students, classes, progress, setProgress, messages, setMessages 
}) => {
  const [view, setView] = useState<'courses' | 'progress' | 'messages' | 'change-pwd'>('courses');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const student = students.find(s => s.id === studentId);
  const studentClass = classes.find(c => c.id === student?.classId);

  // Vérification mot de passe temporaire
  if (student && !student.passwordChanged && view !== 'change-pwd') {
    setView('change-pwd');
  }

  const mySessions = useMemo(() => sessions.filter(s => s.classId === studentClass?.id).sort((a,b) => a.number - b.number), [sessions, studentClass]);
  const myProgress = progress.filter(p => p.studentId === studentId);
  const theme = studentClass ? THEMES[studentClass.club] : THEMES['AVENTURIERS'];

  // Logique Linéaire : Une séance est accessible seulement si la précédente est complétée
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
    if (newPassword.length < 4) return alert("Mot de passe trop court");
    // Logique simulée de mise à jour (nécessite syncStudents dans App)
    alert("Mot de passe mis à jour !");
    setView('courses');
  };

  if (!student || !studentClass) return <div>Data Error</div>;

  if (view === 'change-pwd') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
         <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center space-y-8">
            <div className="text-6xl">🛡️</div>
            <h2 className="text-2xl font-black text-gray-900 uppercase">Sécurité Obligatoire</h2>
            <p className="text-sm text-gray-400 font-medium">Vous utilisez un mot de passe temporaire. Pour continuer, veuillez définir votre propre mot de passe.</p>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" className="w-full border-2 border-gray-100 p-5 rounded-2xl font-bold text-center outline-none focus:border-blue-500" />
            <button onClick={handleUpdatePassword} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl">Valider mon nouveau mot de passe</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className={`p-6 text-white shadow-xl sticky top-0 z-40 transition-all`} style={{ backgroundColor: theme.primary }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <span className="text-4xl bg-white/10 w-14 h-14 flex items-center justify-center rounded-3xl shadow-inner">{studentClass.icon || '⛺'}</span>
            <div>
              <h1 className="text-2xl font-black leading-none">{student.fullName}</h1>
              <p className="text-[10px] opacity-70 uppercase font-black tracking-widest mt-1">{studentClass.name} • Toujours prêt</p>
            </div>
          </div>
          <nav className="flex items-center gap-8">
            <button onClick={() => setView('courses')} className={`text-[10px] font-black uppercase tracking-widest ${view === 'courses' ? 'border-b-2 border-white' : 'opacity-60'}`}>Cours</button>
            <button onClick={() => setView('progress')} className={`text-[10px] font-black uppercase tracking-widest ${view === 'progress' ? 'border-b-2 border-white' : 'opacity-60'}`}>Record</button>
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
              // Logique de complétion
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
          ) : null
        )}
      </main>

      <footer className="global-footer">
          e-CP MJA - Classe progressive des clubs juniors MJA - by Kuvasz Fidèle
      </footer>
    </div>
  );
};

export default StudentPortal;
