
import React, { useState, useMemo } from 'react';
import { ClubType, Session, Student, Progress, ClassLevel } from '../../types';

interface GlobalTrackingProps {
  club: ClubType;
  sessions: Session[];
  students: Student[];
  progress: Progress[];
  setProgress: React.Dispatch<React.SetStateAction<Progress[]>>;
  classes: ClassLevel[];
  onOpenChat: (studentId: string) => void;
}

const GlobalTracking: React.FC<GlobalTrackingProps> = ({ club, sessions, students, progress, setProgress, classes, onOpenChat }) => {
  const filteredClasses = useMemo(() => classes.filter(c => c.club === club), [classes, club]);
  const [selectedClassId, setSelectedClassId] = useState<string>(filteredClasses[0]?.id || '');

  const classSessions = useMemo(() => 
    sessions.filter(s => s.classId === selectedClassId).sort((a, b) => a.number - b.number),
  [sessions, selectedClassId]);

  const classStudents = useMemo(() => 
    students.filter(s => s.classId === selectedClassId),
  [students, selectedClassId]);

  const handleToggleSubject = (studentId: string, sessionId: string, subjectId: string) => {
    setProgress(prev => {
      const existingIdx = prev.findIndex(p => p.studentId === studentId && p.sessionId === sessionId);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return prev;

      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentCompleted = updated[existingIdx].completedSubjects;
        let newCompleted: string[];
        if (currentCompleted.includes(subjectId)) {
          newCompleted = currentCompleted.filter(id => id !== subjectId);
        } else {
          newCompleted = [...currentCompleted, subjectId];
        }
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
          studentId, sessionId,
          score: Math.round((1 / session.subjects.length) * 100),
          completed: session.subjects.length === 1,
          completedSubjects: [subjectId],
          completionDate: new Date().toISOString()
        };
        return [...prev, newRecord];
      }
    });
  };

  const isSubjectCompleted = (studentId: string, sessionId: string, subjectId: string) => {
    const prog = progress.find(p => p.studentId === studentId && p.sessionId === sessionId);
    return prog?.completedSubjects.includes(subjectId) || false;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Carte de Progression</h3>
          <p className="text-[10px] md:text-xs text-gray-400 font-bold">Cliquer sur le nom d'un jeune pour discuter.</p>
        </div>
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full md:w-auto bg-gray-50 border-2 border-gray-100 rounded-xl md:rounded-2xl px-4 py-2.5 font-black text-[10px] uppercase outline-none">
          {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#002366] text-white">
                <th className="sticky left-0 z-40 bg-[#002366] px-4 md:px-8 py-4 md:py-6 text-left font-black uppercase text-[9px] tracking-widest border-r border-white/10 min-w-[150px] md:w-64">Sujets MJA</th>
                {classStudents.map(student => (
                  <th key={student.id} className="px-2 py-4 md:py-6 border-r border-white/10 min-w-[40px] md:w-12">
                    <button onClick={() => onOpenChat(student.id)} className="hover:text-yellow-400 transition-colors">
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter whitespace-nowrap block rotate-180" style={{ writingMode: 'vertical-rl' }}>
                        {student.fullName}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classSessions.map(session => (
                <React.Fragment key={session.id}>
                  <tr className="bg-yellow-50/40">
                    <td className="sticky left-0 z-30 bg-yellow-50/80 backdrop-blur-md font-black text-yellow-800 px-4 md:px-8 py-2 md:py-3 text-[9px] uppercase border-r border-yellow-100">Semaine {session.number}</td>
                    {classStudents.map(s => <td key={s.id} className="border-r border-yellow-100/30"></td>)}
                  </tr>
                  {session.subjects.map(subject => (
                    <tr key={subject.id} className="hover:bg-blue-50/10 transition-colors">
                      <td className="sticky left-0 z-30 bg-white px-4 md:px-8 py-3 md:py-4 border-r border-gray-100">
                        <p className="text-[10px] md:text-xs font-black text-gray-800 leading-tight">{subject.name}</p>
                        <p className="text-[8px] text-gray-400 italic mt-0.5 line-clamp-1">{subject.prerequisite}</p>
                      </td>
                      {classStudents.map(student => (
                        <td key={student.id} className="p-0 border-r border-gray-100 text-center">
                          <label className="flex items-center justify-center w-full h-full p-2 cursor-pointer hover:bg-blue-50/50">
                            <input type="checkbox" checked={isSubjectCompleted(student.id, session.id, subject.id)} onChange={() => handleToggleSubject(student.id, session.id, subject.id)} className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300 text-blue-600" />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalTracking;
