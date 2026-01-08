
import React from 'react';
import { Session, Progress } from '../../types';

interface CourseCardProps {
  session: Session;
  progress?: Progress;
  theme: any;
  status: 'available' | 'locked-future' | 'locked-linear';
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ session, progress, theme, status, onClick }) => {
  const isCompleted = progress?.completed;
  const isLocked = status !== 'available';

  return (
    <div 
      onClick={!isLocked ? onClick : undefined}
      className={`group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${!isLocked ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-blue-300' : 'cursor-not-allowed opacity-90'}`}
    >
      <div className="h-20 relative flex items-center justify-center p-4" style={{ backgroundColor: theme.primary }}>
        <div className="text-white text-xl font-black uppercase tracking-tight">Semaine {session.number}</div>
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-2">
            <span className="text-lg">🔒</span>
            <p className="text-[7px] font-black text-white/90 uppercase mt-1 text-center leading-tight">
              {status === 'locked-future' ? `Libéré le ${new Date(session.availabilityDate).toLocaleDateString()}` : 'Terminez le cours précédent'}
            </p>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md text-[10px]">✓</div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          {session.subjects.map((s, i) => (
            <div key={i} className="flex flex-col border-b border-gray-50 last:border-0 pb-1.5 last:pb-0">
               <span className="text-[11px] font-black text-gray-800 leading-tight">{s.name}</span>
               <span className="text-[8px] text-gray-400 font-bold italic line-clamp-1">{s.prerequisite}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-t bg-gray-50/50 flex items-center justify-between">
         <span className={`text-[8px] font-black uppercase tracking-widest ${isCompleted ? 'text-green-600' : isLocked ? 'text-gray-400' : 'text-blue-600'}`}>
            {isCompleted ? `Fini : ${progress.score}%` : isLocked ? 'Verrouillé' : 'Commencer →'}
         </span>
         <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: isCompleted ? '100%' : '0%' }} />
         </div>
      </div>
    </div>
  );
};

export default CourseCard;
