
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

  const parseEditorJS = (content: string) => {
    try {
      if (content.startsWith('{')) {
        const data = JSON.parse(content);
        return data.blocks.map((b: any, i: number) => {
          if (b.type === 'paragraph') return `<p key=${i} class="mb-4">${b.data.text}</p>`;
          if (b.type === 'header') return `<h${b.data.level} key=${i} class="text-2xl font-black mb-4">${b.data.text}</h${b.data.level}>`;
          if (b.type === 'list') return `<ul key=${i} class="list-disc pl-6 mb-4">${b.data.items.map((it: string) => `<li>${it}</li>`).join('')}</ul>`;
          return '';
        }).join('');
      }
      return content;
    } catch(e) { return content; }
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

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-slide-up">
      <div className="p-8 border-b flex justify-between items-center bg-gray-50/50 sticky top-0 z-20">
        <button onClick={() => activeSubjectId ? setActiveSubjectId(null) : onBack()} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900">← {activeSubjectId ? 'Sommaire' : 'Retour'}</button>
        <div className="text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Semaine {session.number}</p>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{activeSubject ? activeSubject.name : 'Classe Progressive'}</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-lg" style={{ backgroundColor: theme.primary }}>{session.number}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {!activeSubjectId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {session.subjects.map((sub, i) => (
              <div key={sub.id} onClick={() => setActiveSubjectId(sub.id)} className={`p-10 rounded-[2.5rem] border-4 transition-all cursor-pointer flex flex-col justify-between ${isSubjectCompleted(sub.id) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-50 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-2'}`}>
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1 leading-none">{sub.name}</h3>
                    <p className="text-xs text-gray-400 font-bold italic">Pre-requis: {sub.prerequisite}</p>
                 </div>
                 <div className="mt-8 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest">{isSubjectCompleted(sub.id) ? 'Complété' : 'Étudier →'}</span>
                    {isSubjectCompleted(sub.id) && <span className="text-green-500">✅</span>}
                 </div>
              </div>
            ))}
          </div>
        ) : (
          !showQuiz ? (
            <div className="max-w-3xl mx-auto space-y-12">
               <div className="prose prose-blue prose-lg max-w-none text-gray-700 font-medium" dangerouslySetInnerHTML={{ __html: parseEditorJS(activeSubject.content) }} />
               {activeSubject.quiz && (
                 <button onClick={handleStartQuiz} className="w-full bg-yellow-500 text-white py-6 rounded-[2rem] font-black text-xl uppercase shadow-2xl hover:scale-105 transition-transform">Lancer le Quiz ⚡</button>
               )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-10 py-10">
               {activeSubject.quiz?.map((q, idx) => (
                 <div key={idx} className="space-y-4">
                    <p className="font-black text-gray-900 text-lg">{idx+1}. {q.text}</p>
                    <div className="grid grid-cols-1 gap-3">
                       {q.options.map((opt, oIdx) => (
                         <button key={oIdx} onClick={() => { const na = [...quizAnswers]; na[idx] = oIdx; setQuizAnswers(na); }} className={`p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all ${quizAnswers[idx] === oIdx ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white text-gray-500'}`}>{opt}</button>
                       ))}
                    </div>
                 </div>
               ))}
               <button onClick={handleSubmitQuiz} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl">Valider 🚀</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SessionViewer;
