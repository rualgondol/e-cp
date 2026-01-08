
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
        onChange(quillInstance.current.root.innerHTML);
      });
    }
    
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
        quillInstance.current.root.innerHTML = value || '';
    }
  }, [value, onChange]);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 mt-1 shadow-sm">
      <div ref={editorRef} className="h-[200px] md:h-[250px]" />
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
  const [loadingStates, setLoadingStates] = useState<Record<string, 'quiz' | null>>({});

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
    subjects.push({ id: Math.random().toString(36).substr(2, 5), name: '', prerequisite: '', content: '' });
    setEditingSession({ ...editingSession, subjects });
  };

  const removeSubject = (idx: number) => {
    const subjects = [...(editingSession?.subjects || [])];
    subjects.splice(idx, 1);
    setEditingSession({ ...editingSession, subjects });
  };

  const handleAiQuiz = async (idx: number) => {
    const sub = editingSession?.subjects?.[idx];
    if (!sub?.name || !sub?.content) return alert("Veuillez d'abord écrire le contenu du cours pour générer un quiz.");
    setLoadingStates(prev => ({ ...prev, [`${idx}-quiz`]: 'quiz' }));
    const generatedQuiz = await generateQuizForSubject(sub.name, sub.content);
    const subjects = [...(editingSession!.subjects!)];
    subjects[idx] = { ...subjects[idx], quiz: generatedQuiz };
    setEditingSession({ ...editingSession, subjects });
    setLoadingStates(prev => ({ ...prev, [`${idx}-quiz`]: null }));
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {classes.filter(c => c.club === club).map(cls => (
            <button 
                key={cls.id} 
                onClick={() => setSelectedClass(cls.id)} 
                className={`px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase border transition-all flex items-center gap-2 ${selectedClass === cls.id ? 'bg-blue-600 text-white shadow-md border-blue-600' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500'}`}
            >
              <span className="w-4 h-4 flex items-center justify-center overflow-hidden rounded">
                {cls.icon && cls.icon.length > 5 ? (
                    <img src={cls.icon} className="w-full h-full object-cover" alt="" />
                ) : cls.icon || '⛺'}
              </span>
              {cls.name}
            </button>
          ))}
        </div>
        <button onClick={() => setEditingSession({ classId: selectedClass, subjects: [], availabilityDate: new Date().toISOString().split('T')[0] })} className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-green-700 transition">
          + Nouvelle Semaine
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sessions.filter(s => s.classId === selectedClass).map(session => (
          <div key={session.id} onClick={() => setEditingSession(session)} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
               <h3 className="text-base font-black text-gray-900 tracking-tight uppercase leading-none">Semaine {session.number}</h3>
               <span className="text-[7px] font-bold text-gray-400">{new Date(session.availabilityDate).toLocaleDateString()}</span>
            </div>
            <div className="space-y-2">
              {session.subjects.map((sub, i) => (
                <div key={i} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-gray-800 leading-tight flex-1">{sub.name}</span>
                    {sub.quiz && sub.quiz.length > 0 && <span className="text-[7px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-black ml-2 uppercase">Quiz</span>}
                  </div>
                  <p className="text-[7px] text-gray-400 font-bold italic line-clamp-1">{sub.prerequisite}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingSession && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-[150]">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] w-full max-w-4xl h-[95vh] md:h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in border border-white/20">
            <div className="p-4 md:p-6 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
              <h2 className="text-base md:text-xl font-black text-gray-900 uppercase tracking-tight">Semaine {editingSession.number || ""}</h2>
              <button onClick={() => setEditingSession(null)} className="text-gray-400 hover:text-red-500 text-xl font-light p-2">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar bg-slate-50/30">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Date :</label>
                  <input type="date" value={editingSession.availabilityDate} onChange={e => setEditingSession({...editingSession, availabilityDate: e.target.value})} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-black text-gray-900 outline-none w-full" />
                </div>
                <p className="text-[8px] text-gray-400 font-bold italic text-center sm:text-right">Libération pour les élèves</p>
              </div>

              {editingSession.subjects?.map((sub, idx) => (
                <div key={sub.id} className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 space-y-4 shadow-sm relative group">
                  <button onClick={() => removeSubject(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Matière</label>
                      <input type="text" placeholder="Ex: La Création" value={sub.name} onChange={e => {
                        const subjects = [...editingSession.subjects!];
                        subjects[idx].name = e.target.value;
                        setEditingSession({...editingSession, subjects});
                      }} className="w-full bg-gray-50 text-xs font-black p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-300 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Pré-requis</label>
                      <input type="text" placeholder="Objectif..." value={sub.prerequisite} onChange={e => {
                        const subjects = [...editingSession.subjects!];
                        subjects[idx].prerequisite = e.target.value;
                        setEditingSession({...editingSession, subjects});
                      }} className="w-full bg-gray-50 font-bold p-3 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-300 transition-all" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Rédigez votre cours</label>
                    <QuillEditor id={`sub-${idx}`} value={sub.content} onChange={(content) => {
                      const subjects = [...editingSession.subjects!];
                      subjects[idx].content = content;
                      setEditingSession({...editingSession, subjects});
                    }} />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => handleAiQuiz(idx)} 
                      disabled={!!loadingStates[`${idx}-quiz`]} 
                      className={`flex items-center gap-2 text-[9px] font-black px-3 py-1.5 rounded-lg border transition-all ${sub.quiz && sub.quiz.length > 0 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
                    >
                      {loadingStates[`${idx}-quiz`] ? 'Quiz...' : sub.quiz && sub.quiz.length > 0 ? '✅ Quiz OK' : '📝 Générer Quiz'}
                    </button>
                  </div>
                </div>
              ))}
              
              <button onClick={addSubject} className="w-full border-2 border-dashed border-gray-200 p-3 rounded-xl text-gray-400 font-black uppercase text-[9px] tracking-widest hover:border-blue-200 hover:text-blue-400 hover:bg-white transition-all">
                + Ajouter une matière
              </button>
            </div>

            <div className="p-4 md:p-6 border-t flex justify-end gap-3 bg-gray-50/50">
               <button onClick={() => setEditingSession(null)} className="px-4 py-2 text-gray-400 font-bold uppercase text-[9px] hover:text-gray-600">Annuler</button>
               <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-700 transition">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
