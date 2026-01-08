
import React, { useState, useEffect, useRef } from 'react';
import { ClubType, Session, Subject, ClassLevel } from '../../types';
import { generateSessionContent, generateQuizForSubject } from '../../services/geminiService';

declare global {
  interface Window {
    EditorJS: any;
    Header: any;
    List: any;
    Table: any;
    ImageTool: any;
  }
}

const BlockEditor: React.FC<{ value: string; onChange: (data: string) => void; id: string }> = ({ value, onChange, id }) => {
  const editorRef = useRef<any>(null);
  const containerId = `editorjs-${id}`;

  useEffect(() => {
    if (!editorRef.current && window.EditorJS) {
      let initialData = { blocks: [] };
      try {
        if (value && value.startsWith('{')) {
          initialData = JSON.parse(value);
        } else if (value) {
          initialData = { blocks: [{ type: 'paragraph', data: { text: value } }] };
        }
      } catch (e) {
        console.error("EditorJS parse error", e);
      }

      const editor = new window.EditorJS({
        holder: containerId,
        tools: {
          header: window.Header,
          list: window.List,
          table: window.Table,
        },
        data: initialData,
        onChange: async () => {
          const savedData = await editor.save();
          onChange(JSON.stringify(savedData));
        },
        placeholder: 'Cliquez ici pour commencer à écrire le cours par blocs...'
      });
      editorRef.current = editor;
    }
  }, []);

  return (
    <div className="editorjs-wrapper shadow-inner border border-gray-100 mt-2">
      <div id={containerId}></div>
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

  const handleAiContent = async (idx: number) => {
    const sub = editingSession?.subjects?.[idx];
    if (!sub?.name) return;
    setLoadingStates(prev => ({ ...prev, [`${idx}-content`]: 'content' }));
    const generated = await generateSessionContent(`Matière`, sub.name, sub.prerequisite);
    const subjects = [...(editingSession!.subjects!)];
    const editorData = { blocks: [{ type: 'paragraph', data: { text: generated } }] };
    subjects[idx] = { ...subjects[idx], content: JSON.stringify(editorData) };
    setEditingSession({ ...editingSession, subjects });
    setLoadingStates(prev => ({ ...prev, [`${idx}-content`]: null }));
  };

  const handleAiQuiz = async (idx: number) => {
    const sub = editingSession?.subjects?.[idx];
    if (!sub?.name || !sub?.content) return alert("Veuillez d'abord générer ou écrire le contenu du cours.");
    setLoadingStates(prev => ({ ...prev, [`${idx}-quiz`]: 'quiz' }));
    const generatedQuiz = await generateQuizForSubject(sub.name, sub.content);
    const subjects = [...(editingSession!.subjects!)];
    subjects[idx] = { ...subjects[idx], quiz: generatedQuiz };
    setEditingSession({ ...editingSession, subjects });
    setLoadingStates(prev => ({ ...prev, [`${idx}-quiz`]: null }));
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex gap-2">
          {classes.filter(c => c.club === club).map(cls => (
            <button key={cls.id} onClick={() => setSelectedClass(cls.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${selectedClass === cls.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white'}`}>
              {cls.name}
            </button>
          ))}
        </div>
        <button onClick={() => setEditingSession({ classId: selectedClass, subjects: [], availabilityDate: new Date().toISOString().split('T')[0] })} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-green-700 transition">
          + Nouvelle Semaine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sessions.filter(s => s.classId === selectedClass).map(session => (
          <div key={session.id} onClick={() => setEditingSession(session)} className="bg-white rounded-[2rem] shadow-md p-8 border-b-8 border-yellow-500 cursor-pointer hover:shadow-2xl transition transform hover:-translate-y-2">
            <h3 className="text-2xl font-black text-gray-900 mb-4">Semaine {session.number}</h3>
            <div className="space-y-3">
              {session.subjects.map((sub, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-600">{sub.name}</span>
                  {sub.quiz && sub.quiz.length > 0 && <span className="text-[8px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-black">QUIZ OK</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingSession && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[150]">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            <div className="p-10 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-3xl font-black text-gray-900 uppercase">Semaine {editingSession.number || "Nouveau"}</h2>
              <button onClick={() => setEditingSession(null)} className="text-gray-300 hover:text-red-500 text-3xl font-light">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Date de libération</p>
                  <input type="date" value={editingSession.availabilityDate} onChange={e => setEditingSession({...editingSession, availabilityDate: e.target.value})} className="bg-transparent font-black text-blue-900 outline-none" />
                </div>
                <p className="text-[10px] font-bold text-blue-400 italic">La séance sera visible par les élèves à cette date.</p>
              </div>

              {editingSession.subjects?.map((sub, idx) => (
                <div key={sub.id} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 space-y-8 relative">
                  <div className="grid grid-cols-2 gap-8">
                    <input type="text" placeholder="Nom de la matière" value={sub.name} onChange={e => {
                      const subjects = [...editingSession.subjects!];
                      subjects[idx].name = e.target.value;
                      setEditingSession({...editingSession, subjects});
                    }} className="w-full bg-gray-50 text-xl font-black p-5 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-400" />
                    <input type="text" placeholder="Pre-requis" value={sub.prerequisite} onChange={e => {
                      const subjects = [...editingSession.subjects!];
                      subjects[idx].prerequisite = e.target.value;
                      setEditingSession({...editingSession, subjects});
                    }} className="w-full bg-gray-50 font-bold p-5 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-400" />
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contenu (Editor.js)</p>
                      <button onClick={() => handleAiContent(idx)} disabled={!!loadingStates[`${idx}-content`]} className="text-[9px] bg-indigo-50 text-indigo-600 font-black px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition">
                        {loadingStates[`${idx}-content`] ? 'Génération...' : '✨ Générer Cours'}
                      </button>
                    </div>
                    <button onClick={() => handleAiQuiz(idx)} disabled={!!loadingStates[`${idx}-quiz`]} className={`text-[9px] font-black px-4 py-2 rounded-xl border transition ${sub.quiz ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}>
                      {loadingStates[`${idx}-quiz`] ? 'Génération...' : sub.quiz ? '✅ Quiz Généré' : '📝 Générer Quiz'}
                    </button>
                  </div>

                  <BlockEditor id={`${sub.id}-${idx}`} value={sub.content} onChange={(val) => {
                    const subjects = [...editingSession.subjects!];
                    subjects[idx].content = val;
                    setEditingSession({...editingSession, subjects});
                  }} />
                </div>
              ))}
              <button onClick={addSubject} className="w-full border-4 border-dashed border-gray-100 p-6 rounded-[2.5rem] text-gray-300 font-black uppercase tracking-widest hover:border-blue-200 hover:text-blue-300 transition">+ Ajouter une matière</button>
            </div>

            <div className="p-10 border-t flex justify-end gap-4">
               <button onClick={handleSave} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase shadow-2xl hover:bg-blue-700 transition">Enregistrer Semaine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
