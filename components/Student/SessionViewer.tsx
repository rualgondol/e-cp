
import React, { useState } from 'react';
import { Session, Progress, Subject } from '../../types';

interface SessionViewerProps {
  session: Session;
  progress?: Progress;
  onCompleteSubject: (subjectId: string, score: number) => void;
  onBack: () => void;
  theme: any;
}

const SessionViewer: React.FC<SessionViewerProps> = ({ session, progress, onCompleteSubject, onBack, theme }) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const activeSubject = session.subjects.find(s => s.id === activeSubjectId);
  const isSubjectCompleted = (id: string) => progress?.completedSubjects.includes(id);

  const handleStartQuiz = () => {
    if (!activeSubject?.quiz) return;
    setQuizAnswers(new Array(activeSubject.quiz.length).fill(-1));
    setShowQuiz(true);
  };

  const handleValidateWithoutQuiz = () => {
    if (!activeSubjectId) return;
    onCompleteSubject(activeSubjectId, 100);
    alert("Cours validé ! Bien joué.");
    setActiveSubjectId(null);
  };

  const handleSubmitQuiz = () => {
    if (!activeSubject?.quiz || !activeSubjectId) return;
    let correct = 0;
    activeSubject.quiz.forEach((q, i) => { if (quizAnswers[i] === q.correctIndex) correct++; });
    const score = Math.round((correct / activeSubject.quiz.length) * 100);
    onCompleteSubject(activeSubjectId, score);
    if (score >= 70) {
      alert(`Félicitations ! ${score}%. Matière validée.`);
      setShowQuiz(false); setActiveSubjectId(null);
    } else {
      alert(`Score : ${score}%. Réessayez pour atteindre 70%.`);
    }
  };

  const hasQuiz = activeSubject?.quiz && activeSubject.quiz.length > 0;

  return (
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col h-[80vh] animate-slide-up border border-gray-100">
      <div className="p-5 border-b flex justify-between items-center bg-gray-50/50 sticky top-0 z-20">
        <button onClick={() => activeSubjectId ? setActiveSubjectId(null) : onBack()} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 flex items-center gap-1">
          <span>←</span> {activeSubjectId ? 'Sommaire' : 'Retour'}
        </button>
        <div className="text-center">
          <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Semaine {session.number}</p>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">{activeSubject ? activeSubject.name : 'Classe Progressive'}</h2>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md" style={{ backgroundColor: theme.primary }}>{session.number}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        {!activeSubjectId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.subjects.map((sub, i) => (
              <div key={sub.id} onClick={() => setActiveSubjectId(sub.id)} className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${isSubjectCompleted(sub.id) ? 'bg-green-50 border-green-100 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-400 hover:shadow-lg'}`}>
                 <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900 leading-tight">{sub.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed line-clamp-2">Pre-requis: {sub.prerequisite}</p>
                 </div>
                 <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest">{isSubjectCompleted(sub.id) ? 'Complété' : 'Étudier →'}</span>
                    {isSubjectCompleted(sub.id) && <span className="text-green-500 text-sm">✅</span>}
                 </div>
              </div>
            ))}
          </div>
        ) : (
          !showQuiz ? (
            <div className="max-w-2xl mx-auto space-y-8">
               <div className="prose prose-sm prose-slate prose-blue max-w-none text-gray-700 font-medium quill-content" dangerouslySetInnerHTML={{ __html: activeSubject.content }} />
               
               <div className="pt-8 flex flex-col gap-4">
                {hasQuiz ? (
                  <button onClick={handleStartQuiz} className="w-full bg-yellow-500 text-white py-4 rounded-xl font-black text-sm uppercase shadow-lg hover:scale-[1.02] transition-all">Lancer le Quiz ⚡</button>
                ) : (
                  !isSubjectCompleted(activeSubjectId) && (
                    <button onClick={handleValidateWithoutQuiz} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-sm uppercase shadow-lg hover:scale-[1.02] transition-all">Valider ce cours ✅</button>
                  )
                )}
                
                {isSubjectCompleted(activeSubjectId) && (
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-green-700 font-black text-[10px] uppercase">Matière déjà validée</p>
                  </div>
                )}
               </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-8 py-4">
               {activeSubject.quiz?.map((q, idx) => (
                 <div key={idx} className="space-y-3">
                    <p className="font-black text-gray-900 text-base">{idx+1}. {q.text}</p>
                    <div className="grid grid-cols-1 gap-2">
                       {q.options.map((opt, oIdx) => (
                         <button key={oIdx} onClick={() => { const na = [...quizAnswers]; na[idx] = oIdx; setQuizAnswers(na); }} className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all ${quizAnswers[idx] === oIdx ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}>{opt}</button>
                       ))}
                    </div>
                 </div>
               ))}
               <button onClick={handleSubmitQuiz} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm shadow-xl mt-6 uppercase tracking-widest">Valider mes réponses 🚀</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SessionViewer;
