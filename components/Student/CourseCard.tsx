
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
      className={`group relative bg-white rounded-[2.5rem] shadow-lg border-2 overflow-hidden transition-all duration-500 ${!isLocked ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:border-blue-400' : 'cursor-not-allowed opacity-80'}`}
    >
      <div className="h-32 relative flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
        <div className="text-white text-4xl font-black">SEMAINE {session.number}</div>
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <span className="text-2xl">🔒</span>
            <p className="text-[9px] font-black text-white uppercase mt-1">
              {status === 'locked-future' ? `Libéré le ${new Date(session.availabilityDate).toLocaleDateString()}` : 'Validez la semaine précédente'}
            </p>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg">✓</div>
        )}
      </div>

      <div className="p-8">
        <div className="space-y-3">
          {session.subjects.map((s, i) => (
            <div key={i} className="flex flex-col">
               <span className="text-xs font-black text-gray-900 leading-tight">{s.name}</span>
               <span className="text-[10px] text-gray-400 font-bold italic line-clamp-1">Pre-requis: {s.prerequisite}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-5 border-t bg-gray-50/50 flex items-center justify-between">
         <span className={`text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-green-600' : isLocked ? 'text-gray-400' : 'text-blue-600'}`}>
            {isCompleted ? `Réussi : ${progress.score}%` : isLocked ? 'Verrouillé' : 'Commencer →'}
         </span>
         <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: isCompleted ? '100%' : '0%' }} />
         </div>
      </div>
    </div>
  );
};

export default CourseCard;
