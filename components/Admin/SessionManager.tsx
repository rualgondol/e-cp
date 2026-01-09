
import React, { useState, useEffect, useRef } from 'react';
import { ClubType, Session, Subject, ClassLevel } from '../../types';
import { generateQuizForSubject } from '../../services/geminiService';

declare global {
  interface Window {
    Quill: any;
  }
}

const QuillEditor: React.FC<{ value: string; onChange: (content: string) => void; id: string }> = ({ value, onChange, id }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const isUpdating = useRef(false);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new window.Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image', 'clean']
          ]
        },
        placeholder: 'Rédigez le contenu du cours ici...'
      });

      quillInstance.current.on('text-change', () => {
        if (!isUpdating.current) {
          const html = quillInstance.current.root.innerHTML;
          onChange(html);
        }
      });
    }

    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      isUpdating.current = true;
      quillInstance.current.root.innerHTML = value || '';
      isUpdating.current = false;
    }
  }, []);

  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML && !isUpdating.current) {
      isUpdating.current = true;
      quillInstance.current.root.innerHTML = value || '';
      isUpdating.current = false;
    }
  }, [value]);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 mt-1 shadow-sm">
      <div ref={editorRef} className="h-[250px] md:h-[350px]" />
    </div>
  );
};

interface SessionManagerProps {
  club: ClubType;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  classes: ClassLevel[];
}

const SessionManager: React.FC<SessionManagerProps> = ({ club, sessions, setSessions, classes }) => {
  const [editingSession, setEditingSession] = useState<Partial<Session> | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(classes.find(c => c.club === club)?.id || '');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    if (!editingSession) return;
    if (editingSession.id) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? (editingSession as Session) : s));
    } else {
      const newSession: Session = {
        id: Math.random().toString(36).substr(2, 9),
        club: club,
        classId: selectedClass,
        number: sessions.filter(s => s.classId === selectedClass).length + 1,
        subjects: editingSession.subjects || [],
        availabilityDate: editingSession.availabilityDate || new Date().toISOString().split('T')[0]
      };
      setSessions(prev => [...prev, newSession]);
    }
    setEditingSession(null);
  };

  const addSubject = () => {
    const subjects = [...(editingSession?.subjects || [])];
    subjects.push({ id: Math.random().toString(36).substr(2, 5), name: '', prerequisite: '', content: '', quiz: [] });
    setEditingSession({ ...editingSession, subjects });
  };

  const removeSubject = (idx: number) => {
    const subjects = [...(editingSession?.subjects || [])];
    subjects.splice(idx, 1);
    setEditingSession({ ...editingSession, subjects });
  };

  const handleAiQuiz = async (idx: number) => {
    const sub = editingSession?.subjects?.[idx];
    if (!sub?.name || !sub?.content) return alert("Veuillez d'abord écrire le contenu du cours.");
    
    setLoadingStates(prev => ({ ...prev, [idx]: true }));
    try {
      const generatedQuiz = await generateQuizForSubject(sub.name, sub.content);
      if (generatedQuiz && generatedQuiz.length > 0) {
        const subjects = [...(editingSession!.subjects!)];
        subjects[idx] = { ...subjects[idx], quiz: generatedQuiz };
        setEditingSession({ ...editingSession, subjects });
      } else {
        alert("Erreur de génération : assurez-vous que la clé API Gemini est valide.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur technique lors de la génération du quiz.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex flex-wrap gap-2">
          {classes.filter(c => c.club === club).map(cls => (
            <button key={cls.id} onClick={() => setSelectedClass(cls.id)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center gap-2 ${selectedClass === cls.id ? 'bg-blue-600 text-white shadow-md border-blue-600' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500'}`}>
              <span className="w-4 h-4 flex items-center justify-center overflow-hidden rounded">
                {cls.icon && cls.icon.length > 5 ? <img src={cls.icon} className="w-full h-full object-cover" alt="" /> : cls.icon || '⛺'}
              </span>
              {cls.name}
            </button>
          ))}
        </div>
        <button onClick={() => setEditingSession({ classId: selectedClass, subjects: [], availabilityDate: new Date().toISOString().split('T')[0] })} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-green-700 transition">+ Nouvelle Semaine</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sessions.filter(s => s.classId === selectedClass).map(session => (
          <div key={session.id} onClick={() => setEditingSession(session)} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1">
            <h3 className="text-base font-black text-gray-900 tracking-tight uppercase mb-3 pb-2 border-b">Semaine {session.number}</h3>
            <div className="space-y-2">
              {session.subjects.map((sub, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-gray-800 leading-tight truncate">{sub.name}</span>
                    <span className="text-[8px] text-gray-400 font-bold italic line-clamp-1">{sub.prerequisite}</span>
                  </div>
                  {sub.quiz && sub.quiz.length > 0 && (
                    <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black flex-shrink-0 ml-2">
                      {sub.quiz.length} QCM
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingSession && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-[150]">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/80">
              <h2 className="text-xl font-black text-gray-900 uppercase">Édition Semaine {editingSession.number || ""}</h2>
              <button onClick={() => setEditingSession(null)} className="text-gray-400 hover:text-red-500 text-xl font-light">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date de libération :</label>
                <input type="date" value={editingSession.availabilityDate} onChange={e => setEditingSession({...editingSession, availabilityDate: e.target.value})} className="bg-gray-50 border p-2 text-xs font-black rounded-lg outline-none" />
              </div>

              {editingSession.subjects?.map((sub, idx) => (
                <div key={sub.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                  {/* Bandeau de titre de la matière (évite le chevauchement avec l'icône poubelle) */}
                  <div className="bg-gray-100/80 px-6 py-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <span className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-xl text-[11px] font-black shadow-md">{idx + 1}</span>
                       <div className="flex flex-col">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">État du Quiz</span>
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${sub.quiz && sub.quiz.length >= 4 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-orange-400'}`}></div>
                           <span className="text-[10px] font-black text-gray-700 uppercase">
                             {sub.quiz && sub.quiz.length > 0 ? `${sub.quiz.length}/4 Questions` : 'Pas de Quiz'}
                           </span>
                         </div>
                       </div>
                    </div>
                    <button onClick={() => removeSubject(idx)} className="bg-white p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all shadow-sm border border-gray-200">
                      <span className="text-[10px] font-black uppercase px-2">🗑️ Supprimer</span>
                    </button>
                  </div>

                  <div className="p-6 space-y-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase ml-2 tracking-widest">Titre de la matière</label>
                        <input type="text" placeholder="Ex: La création" value={sub.name} onChange={e => {
                          const subjects = [...editingSession.subjects!];
                          subjects[idx].name = e.target.value;
                          setEditingSession({...editingSession, subjects});
                        }} className="w-full bg-gray-50 text-xs font-black p-3 rounded-2xl border outline-none focus:border-blue-400 shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase ml-2 tracking-widest">Objectif pédagogique</label>
                        <input type="text" placeholder="Pré-requis..." value={sub.prerequisite} onChange={e => {
                          const subjects = [...editingSession.subjects!];
                          subjects[idx].prerequisite = e.target.value;
                          setEditingSession({...editingSession, subjects});
                        }} className="w-full bg-gray-50 font-bold p-3 rounded-2xl border text-xs outline-none focus:border-blue-400 shadow-sm" />
                      </div>
                    </div>
                    
                    <QuillEditor id={`sub-${idx}`} value={sub.content} onChange={(content) => {
                      const subjects = [...editingSession.subjects!];
                      subjects[idx].content = content;
                      setEditingSession({...editingSession, subjects});
                    }} />

                    <div className="flex justify-end pt-2 border-t border-gray-50">
                      <button 
                        onClick={() => handleAiQuiz(idx)} 
                        disabled={loadingStates[idx]} 
                        className={`text-[10px] font-black px-6 py-2.5 rounded-2xl transition-all shadow-md transform active:scale-95 ${loadingStates[idx] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : sub.quiz?.length ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                      >
                        {loadingStates[idx] ? '⚡ GÉNÉRATION IA EN COURS...' : sub.quiz?.length ? '✅ QUIZ GÉNÉRÉ ('+sub.quiz.length+' QCM)' : '📝 GÉNÉRER LE QUIZ PAR IA'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addSubject} className="w-full border-2 border-dashed border-gray-200 p-8 rounded-[2rem] text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 hover:border-blue-300 transition-all">+ Ajouter une nouvelle matière</button>
            </div>

            <div className="p-8 border-t flex justify-end gap-4 bg-gray-50/50">
               <button onClick={() => setEditingSession(null)} className="px-8 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest">Annuler</button>
               <button onClick={handleSave} className="bg-blue-600 text-white px-12 py-4 rounded-[1.5rem] font-black text-[11px] uppercase shadow-2xl hover:bg-blue-700 transition-all transform hover:-translate-y-1">Enregistrer la semaine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
