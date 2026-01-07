
import React, { useState, useEffect, useRef } from 'react';
import { ClubType, Session, Subject, ClassLevel, QuizQuestion } from '../../types';
import { generateSessionContent, generateQuizForSubject } from '../../services/geminiService';

declare global {
  interface Window {
    Quill: any;
  }
}

const QuillEditorWrapper: React.FC<{ value: string; onChange: (data: string) => void; id: string }> = ({ value, onChange, id }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current && window.Quill) {
      // Configuration exhaustive de la barre d'outils pour Quill 2.0
      const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }], 
        ['bold', 'italic', 'underline', 'strike'],        
        [{ 'color': [] }, { 'background': [] }],          
        [{ 'script': 'sub'}, { 'script': 'super' }],      
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          
        [{ 'direction': 'rtl' }],                         
        [{ 'align': [] }],                                
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['table'],                                        
        ['clean']                                         
      ];

      const quill = new window.Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          table: true,
          toolbar: toolbarOptions
        },
        placeholder: 'Rédigez le contenu riche ici (tableaux, vidéos, images, listes de tâches)...'
      });

      quillInstance.current = quill;

      if (value) quill.root.innerHTML = value;

      quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        if (html === '<p><br></p>' && !value) return;
        onChange(html);
      });
    }
  }, []);

  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      quillInstance.current.root.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className="quill-wrapper shadow-inner border border-gray-200 rounded-xl overflow-hidden mt-2">
      <div ref={editorRef} style={{ height: '500px' }}></div>
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
  const [loadingStates, setLoadingStates] = useState<Record<string, 'content' | 'quiz' | null>>({});

  const handleSave = () => {
    if (!editingSession) return;
    if (editingSession.id) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? (editingSession as Session) : s));
    } else {
      const newSession: Session = {
        id: Math.random().toString(36).substr(2, 9),
        club: club,
        classId: selectedClass,
        number: sessions.length + 1,
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

  const handleAiContent = async (idx: number) => {
    const sub = editingSession?.subjects?.[idx];
    if (!sub?.name) return;
    
    setLoadingStates(prev => ({ ...prev, [`${idx}-content`]: 'content' }));
    const generated = await generateSessionContent(`Matière`, sub.name, sub.prerequisite);
    
    const subjects = [...(editingSession!.subjects!)];
    subjects[idx] = { ...subjects[idx], content: generated };
    setEditingSession({ ...editingSession, subjects });
    setLoadingStates(prev => ({ ...prev, [`${idx}-content`]: null }));
  };

  const handleAiQuiz = async (idx: number) => {
    const sub = editingSession?.subjects?.[idx];
    if (!sub?.content) return;

    setLoadingStates(prev => ({ ...prev, [`${idx}-quiz`]: 'quiz' }));
    const quiz = await generateQuizForSubject(sub.name, sub.content);
    
    const subjects = [...(editingSession!.subjects!)];
    subjects[idx] = { ...subjects[idx], quiz };
    setEditingSession({ ...editingSession, subjects });
    setLoadingStates(prev => ({ ...prev, [`${idx}-quiz`]: null }));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {classes.filter(c => c.club === club).map(cls => (
            <button 
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedClass === cls.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
            >
              {cls.icon && cls.icon.length > 5 ? <img src={cls.icon} className="w-4 h-4 inline-block mr-1 rounded" alt=""/> : cls.icon} {cls.name}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setEditingSession({ classId: selectedClass, subjects: [], availabilityDate: new Date().toISOString().split('T')[0] })}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-black shadow-lg"
        >
          + NOUVELLE SEMAINE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.filter(s => s.classId === selectedClass).map(session => (
          <div 
            key={session.id} 
            onClick={() => setEditingSession(session)}
            className="bg-white border-l-8 border-yellow-500 rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex justify-between mb-4">
              <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full font-black uppercase">Semaine {session.number}</span>
              <span className="text-gray-400 text-[10px] font-bold uppercase">{new Date(session.availabilityDate).toLocaleDateString()}</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-4">Semaine {session.number}</h3>
            <div className="space-y-2">
              {session.subjects.map((sub, i) => (
                <div key={i} className="flex flex-col gap-0.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-blue-600">{i+1}.</span> 
                    <span className="font-bold text-gray-800">{sub.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium italic pl-5 truncate">Pre-requis: {sub.prerequisite}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[150]">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Édition Semaine {editingSession.number || sessions.length + 1}</h2>
                <input 
                  type="date" 
                  value={editingSession.availabilityDate || ''}
                  onChange={e => setEditingSession({...editingSession, availabilityDate: e.target.value})}
                  className="mt-2 text-xs font-bold text-blue-600 bg-transparent outline-none"
                />
              </div>
              <button onClick={() => setEditingSession(null)} className="text-gray-300 hover:text-red-500 text-2xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">Matières & Contenus</h3>
                <button onClick={addSubject} className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-2 rounded-xl hover:bg-blue-100">+ AJOUTER BLOC MATIÈRE</button>
              </div>

              {editingSession.subjects?.map((sub, idx) => (
                <div key={sub.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 space-y-6 relative group hover:border-blue-200 transition-colors shadow-sm">
                  <button 
                    onClick={() => {
                      const subjects = editingSession.subjects!.filter((_, i) => i !== idx);
                      setEditingSession({...editingSession, subjects});
                    }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-white border shadow-md rounded-full text-red-500 flex items-center justify-center hover:bg-red-50 transition"
                  >✕</button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nom de la matière</label>
                      <input 
                        type="text" placeholder="Ex: La Création"
                        value={sub.name}
                        onChange={e => {
                          const subjects = [...editingSession.subjects!];
                          subjects[idx].name = e.target.value;
                          setEditingSession({...editingSession, subjects});
                        }}
                        className="w-full bg-gray-50 text-lg font-black text-gray-900 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-blue-400 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Pre-requis</label>
                      <input 
                        type="text" placeholder="Ex: Découvrir les 7 jours de la création"
                        value={sub.prerequisite}
                        onChange={e => {
                          const subjects = [...editingSession.subjects!];
                          subjects[idx].prerequisite = e.target.value;
                          setEditingSession({...editingSession, subjects});
                        }}
                        className="w-full bg-gray-50 text-sm font-bold text-gray-700 border-2 border-gray-100 rounded-xl px-4 py-4 outline-none focus:bg-white focus:border-blue-400 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contenu du cours</label>
                      <button 
                        onClick={() => handleAiContent(idx)}
                        disabled={!!loadingStates[`${idx}-content`]}
                        className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-3 py-1 rounded-lg hover:bg-indigo-100"
                      >
                        {loadingStates[`${idx}-content`] ? 'Génération...' : '✨ IA: Générer Contenu'}
                      </button>
                    </div>
                    <QuillEditorWrapper 
                      id={`${idx}-quill`}
                      value={sub.content}
                      onChange={(val) => {
                        const subjects = [...editingSession.subjects!];
                        subjects[idx].content = val;
                        setEditingSession({...editingSession, subjects});
                      }}
                    />
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-500 uppercase">Quiz :</span>
                      {sub.quiz ? (
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">Prêt (4 questions)</span>
                      ) : (
                        <span className="text-[10px] font-black text-gray-300 bg-gray-50 px-2 py-1 rounded-md">Non généré</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAiQuiz(idx)}
                      disabled={!sub.content || !!loadingStates[`${idx}-quiz`]}
                      className="text-[10px] bg-yellow-50 text-yellow-700 font-black px-3 py-1.5 rounded-xl border border-yellow-200 hover:bg-yellow-100 disabled:opacity-30"
                    >
                      {loadingStates[`${idx}-quiz`] ? 'Génération Quiz...' : '📝 Créer Quiz Ludique'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border-t flex justify-end gap-4 bg-gray-50/50">
               <button onClick={() => setEditingSession(null)} className="px-6 py-2 text-gray-400 font-bold text-xs uppercase">Annuler</button>
               <button onClick={handleSave} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase shadow-xl shadow-blue-100 hover:bg-blue-700 transition">Enregistrer la Semaine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
