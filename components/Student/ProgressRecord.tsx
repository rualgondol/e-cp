
import React from 'react';
import { Student, Session, Progress, Subject } from '../../types';

interface ProgressRecordProps {
  student: Student;
  sessions: Session[];
  progress: Progress[];
  theme: any;
}

const ProgressRecord: React.FC<ProgressRecordProps> = ({ student, sessions, progress, theme }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 animate-fade-in border-t-8 border-yellow-500">
      <div className="flex justify-between items-start mb-10 pb-6 border-b">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Fiche d'enregistrement</h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Suivi hebdomadaire des pré-requis</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score Moyen</p>
           <p className="text-4xl font-black tracking-tighter" style={{ color: theme.primary }}>
             {progress.length > 0 
               ? Math.round(progress.reduce((acc, curr) => acc + curr.score, 0) / progress.length)
               : 0}%
           </p>
        </div>
      </div>

      <div className="space-y-8">
        {sessions.sort((a,b) => a.number - b.number).map((session, i) => {
          const prog = progress.find(p => p.sessionId === session.id && p.completed);
          
          return (
            <div key={session.id} className={`rounded-[2rem] border-2 overflow-hidden transition-all ${prog ? 'border-green-100 bg-green-50/10' : 'border-gray-100 bg-white'}`}>
              <div className={`px-6 py-4 flex items-center justify-between ${prog ? 'bg-green-100/50' : 'bg-gray-50/50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${prog ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
                    {session.number}
                  </span>
                  <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Semaine {session.number}</h3>
                </div>
                {prog && <span className="text-[9px] font-black text-green-600 bg-white px-3 py-1 rounded-full border border-green-200 uppercase">Validée le {new Date(prog.completionDate).toLocaleDateString()}</span>}
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.subjects.map((sub) => {
                  const subCompleted = prog?.completedSubjects.includes(sub.id); 
                  return (
                    <div key={sub.id} className={`flex items-start gap-4 p-4 rounded-2xl border transition shadow-sm ${subCompleted ? 'bg-white border-green-100' : 'bg-gray-50/50 border-gray-100'}`}>
                      <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition shadow-sm ${subCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}>
                        {subCompleted && <span className="text-xs font-black">✓</span>}
                      </div>
                      <div>
                        <h4 className={`font-black text-sm tracking-tight ${subCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{sub.name}</h4>
                        <p className={`text-[10px] font-bold mt-1 tracking-tight ${subCompleted ? 'text-gray-500' : 'text-gray-300 italic'}`}>Pre-requis: {sub.prerequisite}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {sessions.length === 0 && (
          <div className="text-center py-20 text-gray-400">
             <div className="text-6xl mb-4 opacity-10 text-gray-400">📄</div>
             <p className="font-black uppercase tracking-widest text-xs">Aucune donnée disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressRecord;
