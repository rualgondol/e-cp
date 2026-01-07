
import React, { useState, useMemo } from 'react';
import { ClubType, Session, Student, Progress, ClassLevel } from '../../types';

interface GlobalTrackingProps {
  club: ClubType;
  sessions: Session[];
  students: Student[];
  progress: Progress[];
  setProgress: React.Dispatch<React.SetStateAction<Progress[]>>;
  classes: ClassLevel[];
}

const GlobalTracking: React.FC<GlobalTrackingProps> = ({ club, sessions, students, progress, setProgress, classes }) => {
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
          studentId,
          sessionId,
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
      {/* Sélecteur de Classe */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Carte de Record Virtuelle</h3>
          <p className="text-sm text-gray-400">Suivi hebdomadaire des objectifs par élève</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-700 uppercase">Classe :</label>
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          >
            {filteredClasses.map(c => (
              <option key={c.id} value={c.id} className="text-gray-900">
                {/* Note: Un <option> ne peut pas afficher d'image Base64, on filtre pour n'afficher que le texte si court */}
                {c.icon && c.icon.length < 5 ? c.icon : '📌'} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille Ultra-Compacte */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="sticky left-0 z-40 bg-blue-900 px-6 py-4 text-left font-black uppercase text-xs tracking-widest border-r border-blue-800 w-[280px]">
                  Semaines / Objectifs
                </th>
                {classStudents.map(student => (
                  <th 
                    key={student.id} 
                    className="p-0 border-r border-blue-800 vertical-header-cell w-[50px] min-w-[50px] relative overflow-visible"
                  >
                    <div className="vertical-text-container">
                      <div className="vertical-text-content">
                        <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap block">
                          {student.fullName}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classSessions.length > 0 ? classSessions.map(session => (
                <React.Fragment key={session.id}>
                  {/* Ligne d'entête de Séance */}
                  <tr className="bg-yellow-50/50">
                    <td className="sticky left-0 z-30 bg-yellow-50 font-black text-yellow-800 px-6 py-2 text-[10px] uppercase tracking-widest border-r border-yellow-100">
                      SEMAINE {session.number}
                    </td>
                    {classStudents.map(s => (
                      <td key={s.id} className="bg-yellow-50/30 border-r border-yellow-100"></td>
                    ))}
                  </tr>
                  
                  {/* Lignes d'objectifs individuels */}
                  {session.subjects.map(subject => (
                    <tr key={subject.id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className="sticky left-0 z-30 bg-white group-hover:bg-blue-50 px-6 py-3 border-r border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-gray-800 leading-tight">{subject.name}</span>
                          <span className="text-[9px] text-gray-400 italic line-clamp-1">{subject.prerequisite}</span>
                        </div>
                      </td>
                      {classStudents.map(student => (
                        <td key={student.id} className="p-0 border-r border-gray-100 text-center">
                          <label className="flex items-center justify-center w-full h-full p-2 cursor-pointer hover:bg-blue-50/50 transition-all">
                            <input 
                              type="checkbox"
                              checked={isSubjectCompleted(student.id, session.id, subject.id)}
                              onChange={() => handleToggleSubject(student.id, session.id, subject.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-transform transform active:scale-125 cursor-pointer shadow-sm"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={classStudents.length + 1} className="py-20 text-center text-gray-400 font-medium italic">
                    Aucune semaine créée pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          border: 3px solid #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Styles pour le texte vertical des noms d'élèves */
        .vertical-header-cell {
          height: 140px; /* Hauteur pour les noms longs */
          vertical-align: bottom;
          position: relative;
        }

        .vertical-text-container {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .vertical-text-content {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          text-align: left;
          padding-bottom: 5px;
        }

        .table-fixed {
            table-layout: fixed;
        }
      `}</style>

      {/* Légende et Info */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-blue-800 text-[10px] flex items-center gap-4">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-black uppercase mb-0.5 tracking-tighter">Mode Performance</p>
            <p className="font-medium opacity-80 leading-snug">
              Grille hebdomadaire. La validation d'une matière via le quiz élève coche automatiquement la case correspondante ici.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalTracking;
