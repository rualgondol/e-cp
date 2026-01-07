
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

  const handleSubmitQuiz = () => {
    if (!activeSubject?.quiz || !activeSubjectId) return;
    
    let correct = 0;
    activeSubject.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });
    
    const score = Math.round((correct / activeSubject.quiz.length) * 100);
    onCompleteSubject(activeSubjectId, score);
    
    if (score >= 70) {
      alert(`Bravo ! Tu as réussi avec ${score}%. La matière "${activeSubject.name}" est validée !`);
      setShowQuiz(false);
      setActiveSubjectId(null);
    } else {
      alert(`Tu as obtenu ${score}%. Relis bien le cours et réessaie pour atteindre 70% !`);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col h-[85vh]">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur-md sticky top-0 z-20">
        <button onClick={() => activeSubjectId ? setActiveSubjectId(null) : onBack()} className="flex items-center gap-2 text-gray-500 hover:text-black font-black text-xs uppercase tracking-widest">
          {activeSubjectId ? '← Liste des matières' : '← Retour aux cours'}
        </button>
        <div className="text-center px-4">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Semaine {session.number}</p>
          <h2 className="text-lg font-black text-gray-900 truncate max-w-[250px] md:max-w-md lg:max-w-2xl leading-tight">
            {activeSubjectId ? (activeSubject?.prerequisite || activeSubject?.name) : 'Programme de la semaine'}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-lg" style={{ backgroundColor: theme.primary }}>
          {session.number}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!activeSubjectId ? (
          /* Liste des matières de la séance */
          <div className="p-8 md:p-12 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {session.subjects.map((sub, i) => (
                <div 
                  key={sub.id}
                  onClick={() => setActiveSubjectId(sub.id)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col justify-between ${isSubjectCompleted(sub.id) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1'}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${isSubjectCompleted(sub.id) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Matière {i+1}</span>
                      {isSubjectCompleted(sub.id) && <span className="text-green-500 text-xl">✅</span>}
                    </div>
                    <h3 className={`text-xl font-black mb-2 ${isSubjectCompleted(sub.id) ? 'text-green-900' : 'text-gray-800'}`}>{sub.name}</h3>
                    <p className="text-sm text-gray-400 font-bold italic tracking-tight">Pre-requis: {sub.prerequisite}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase text-blue-600 group-hover:gap-4 transition-all tracking-widest">
                    {isSubjectCompleted(sub.id) ? 'Revoir le cours' : 'Commencer →'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-6">
               <div className="text-4xl filter drop-shadow-md">🎓</div>
               <div>
                  <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-1">Objectif de la semaine</h4>
                  <p className="text-blue-700 text-sm font-bold leading-relaxed">Valide chaque matière en obtenant au moins 70% au quiz pour terminer ta semaine !</p>
               </div>
            </div>
          </div>
        ) : !showQuiz ? (
          /* Contenu de la matière */
          <div className="p-8 md:p-16 max-w-4xl mx-auto space-y-10">
            {/* Affichage du nom de la matière en haut du contenu pour contexte */}
            <div className="bg-gray-50 border-l-4 border-blue-600 p-4 rounded-r-xl">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Matière étudiée :</span>
               <h4 className="font-black text-gray-900 text-xl">{activeSubject?.name}</h4>
            </div>

            <div className="prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: activeSubject?.content || '<p>Aucun contenu disponible.</p>' }} />
            
            {activeSubject?.quiz ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[2rem] p-10 text-center space-y-6 shadow-inner animate-fade-in mt-12">
                 <div className="text-5xl">⚡</div>
                 <div>
                    <h3 className="text-2xl font-black text-yellow-900 uppercase tracking-tight">C'est l'heure du Quiz !</h3>
                    <p className="text-yellow-700 font-bold">Prouve que tu as tout compris pour valider cette matière.</p>
                 </div>
                 <button 
                   onClick={handleStartQuiz}
                   className="bg-yellow-500 text-white px-12 py-4 rounded-full font-black text-lg uppercase shadow-xl hover:bg-yellow-600 transition-all transform hover:scale-105 active:scale-95"
                 >
                   Lancer le Quiz
                 </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 italic text-sm font-bold border-2 border-dashed">
                Pas de quiz disponible pour cette matière pour le moment.
              </div>
            )}
          </div>
        ) : (
          /* Quiz de la matière */
          <div className="p-8 md:p-16 max-w-3xl mx-auto space-y-12 animate-fade-in">
            <div className="text-center">
               <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">Quiz : {activeSubject?.name}</h3>
               <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Atteins 70% pour valider</p>
            </div>

            {activeSubject?.quiz?.map((q, qIdx) => (
              <div key={qIdx} className="space-y-6">
                <p className="text-xl font-black text-gray-800 flex gap-4">
                   <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm flex-shrink-0 font-black">{qIdx + 1}</span>
                   {q.text}
                </p>
                <div className="grid grid-cols-1 gap-3 pl-12">
                  {q.options.map((opt, oIdx) => (
                    <button 
                      key={oIdx}
                      onClick={() => {
                        const newAns = [...quizAnswers];
                        newAns[qIdx] = oIdx;
                        setQuizAnswers(newAns);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all font-bold ${quizAnswers[qIdx] === oIdx ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-lg' : 'border-gray-100 hover:border-gray-200 bg-white text-gray-500'}`}
                    >
                      <span className="mr-3 opacity-30 font-black">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-10 border-t flex flex-col md:flex-row justify-center items-center gap-4">
               <button onClick={() => setShowQuiz(false)} className="px-8 py-2 text-gray-400 font-bold uppercase text-xs tracking-widest">Retour au cours</button>
               <button 
                 onClick={handleSubmitQuiz}
                 disabled={quizAnswers.includes(-1)}
                 className="bg-blue-600 text-white px-16 py-5 rounded-2xl font-black text-lg uppercase disabled:opacity-30 shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95"
               >
                 Vérifier mes réponses 🚀
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionViewer;
