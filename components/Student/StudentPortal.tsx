
import React, { useState } from 'react';
import { Session, Student, Progress, Message, ClubType, ClassLevel } from '../../types';
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
  const [view, setView] = useState<'courses' | 'progress' | 'messages'>('courses');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const student = students.find(s => s.id === studentId);
  const studentClass = classes.find(c => c.id === student?.classId);
  if (!student || !studentClass) return <div className="p-10 text-center">Student or Class not found</div>;

  const club = studentClass.club;
  const theme = THEMES[club];
  const mySessions = sessions.filter(s => s.classId === studentClass.id).sort((a,b) => a.number - b.number);
  const myProgress = progress.filter(p => p.studentId === studentId);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleCompleteSubject = (subjectId: string, score: number) => {
    if (!activeSessionId || score < 70) return;

    setProgress(prev => {
      const existingIdx = prev.findIndex(p => p.studentId === studentId && p.sessionId === activeSessionId);
      const session = sessions.find(s => s.id === activeSessionId);
      if (!session) return prev;

      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentCompleted = updated[existingIdx].completedSubjects;
        if (currentCompleted.includes(subjectId)) return prev;

        const newCompleted = [...currentCompleted, subjectId];
        updated[existingIdx] = {
          ...updated[existingIdx],
          completedSubjects: newCompleted,
          completed: newCompleted.length === session.subjects.length,
          score: Math.round((newCompleted.length / session.subjects.length) * 100),
          completionDate: new Date().toISOString()
        };
        return updated;
      } else {
        const newRecord: Progress = {
          studentId,
          sessionId: activeSessionId,
          score: Math.round((1 / session.subjects.length) * 100),
          completed: session.subjects.length === 1,
          completedSubjects: [subjectId],
          completionDate: new Date().toISOString()
        };
        return [...prev, newRecord];
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className={`p-4 text-white shadow-lg sticky top-0 z-40 transition-colors duration-500`} style={{ backgroundColor: theme.primary }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl bg-white/10 w-12 h-12 flex items-center justify-center rounded-2xl">{studentClass.icon && studentClass.icon.length > 5 ? <img src={studentClass.icon} className="w-8 h-8 rounded" alt=""/> : studentClass.icon}</span>
            <div>
              <h1 className="text-xl font-bold">{student.fullName}</h1>
              <p className="text-xs opacity-80 uppercase tracking-widest leading-none mt-1">
                {studentClass.name} • Classe progressive des clubs junior de la MJA
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <button onClick={() => setView('courses')} className={`text-sm font-semibold border-b-2 transition ${view === 'courses' ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}>Cours</button>
            <button onClick={() => setView('progress')} className={`text-sm font-semibold border-b-2 transition ${view === 'progress' ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}>Progression</button>
            <button onClick={() => setView('messages')} className={`text-sm font-semibold border-b-2 transition ${view === 'messages' ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              Messages {messages.filter(m => m.receiverId === studentId && !m.isRead).length > 0 && <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}
            </button>
            <button onClick={onLogout} className="bg-white/10 p-2 rounded-full hover:bg-white/20">🚪</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 pb-20">
        {activeSessionId ? (
          <SessionViewer 
            session={activeSession!}
            progress={myProgress.find(p => p.sessionId === activeSessionId)}
            onCompleteSubject={handleCompleteSubject}
            onBack={() => setActiveSessionId(null)}
            theme={theme}
          />
        ) : (
          <div className="min-h-[70vh] flex flex-col justify-between">
            <div>
                {view === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {mySessions.map(s => (
                    <CourseCard 
                        key={s.id}
                        session={s}
                        progress={myProgress.find(p => p.sessionId === s.id)}
                        theme={theme}
                        onClick={() => setActiveSessionId(s.id)}
                    />
                    ))}
                </div>
                )}
                {view === 'progress' && (
                <ProgressRecord 
                    student={student}
                    sessions={mySessions}
                    progress={myProgress}
                    theme={theme}
                />
                )}
                {view === 'messages' && (
                <Messaging 
                    studentId={studentId}
                    messages={messages}
                    setMessages={setMessages}
                    theme={theme}
                />
                )}
            </div>

            <footer className="global-footer mt-20">
                Copyright © 2026 e-CP MJA - Tous droits réservés. Système de Classe Progressive JA. - by Kuvasz Fidèle
            </footer>
          </div>
        )}
      </main>

      {!activeSessionId && (
        <footer className="fixed bottom-0 w-full bg-white border-t p-3 shadow-2xl z-40">
           <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase">Progrès Annuel</p>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ 
                      backgroundColor: theme.primary, 
                      width: `${(myProgress.filter(p => p.completed).length / 20) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: theme.primary }}>
                  {myProgress.filter(p => p.completed).length} / 20
                </span>
              </div>
           </div>
        </footer>
      )}
    </div>
  );
};

export default StudentPortal;
