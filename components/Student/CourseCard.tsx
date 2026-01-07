
import React from 'react';
import { Session, Progress } from '../../types';

interface CourseCardProps {
  session: Session;
  progress?: Progress;
  theme: any;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ session, progress, theme, onClick }) => {
  const isAvailable = new Date(session.availabilityDate) <= new Date();
  const isCompleted = progress?.completed;

  return (
    <div 
      onClick={isAvailable ? onClick : undefined}
      className={`group relative bg-white rounded-2xl shadow-md border overflow-hidden transition-all duration-300 ${isAvailable ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-2' : 'cursor-not-allowed opacity-70 grayscale'}`}
    >
      <div className="h-32 relative overflow-hidden" style={{ backgroundColor: theme.primary }}>
        <div className="absolute inset-0 opacity-10 flex items-center justify-center text-8xl">📖</div>
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-tighter">
          Semaine {session.number}
        </div>
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm z-10 p-4 text-center">
             <div className="bg-white text-gray-900 px-4 py-2 rounded-2xl font-black text-[10px] shadow-2xl flex items-center gap-2 uppercase tracking-widest border-2 border-yellow-500">
                🔒 Verrouillé
             </div>
             <p className="text-white text-[9px] font-black mt-2 uppercase tracking-tighter drop-shadow-md">
                Libéré le {new Date(session.availabilityDate).toLocaleDateString('fr-FR')}
             </p>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
             ✅
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition tracking-tighter">Semaine {session.number}</h3>
        <p className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-tighter">Matières : {session.subjects.map(s => s.name).join(', ')}</p>
        
        <div className="space-y-1">
          {session.subjects.slice(0, 2).map((s, i) => (
            <div key={i} className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border flex items-center gap-1">
              <span className="text-blue-500">📌</span> Pre-requis: {s.prerequisite}
            </div>
          ))}
          {session.subjects.length > 2 && <p className="text-[8px] text-center font-bold text-gray-300">+ {session.subjects.length - 2} autres matières</p>}
        </div>
      </div>

      <div className="px-6 py-4 border-t bg-gray-50/50 flex items-center justify-between">
         {isCompleted ? (
           <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Réussi : {progress.score}%</span>
         ) : isAvailable ? (
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Commencer →</span>
         ) : (
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date future</span>
         )}
         
         <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-green-500 transition-all duration-500 shadow-sm" 
              style={{ width: isCompleted ? '100%' : '0%' }}
            />
         </div>
      </div>
    </div>
  );
};

export default CourseCard;
