
import React, { useState, useMemo } from 'react';
import { ClubType, Student, Progress, Message, ClassLevel, EmergencyContact } from '../../types';

const TagInput: React.FC<{ tags: string[]; onChange: (tags: string[]) => void; placeholder: string; colorClass: string }> = ({ tags, onChange, placeholder, colorClass }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className={`flex flex-wrap gap-1.5 p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl min-h-[50px] transition-all focus-within:border-blue-200`}>
        {tags.map((tag, i) => (
          <span key={i} className={`${colorClass} text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-sm animate-scale-in`}>
            {tag}
            <button onClick={() => removeTag(i)} className="hover:text-black/50 transition-colors">✕</button>
          </span>
        ))}
        <input 
          type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Ajouter..."}
          className="bg-transparent border-none outline-none text-xs font-bold flex-1 min-w-[140px] px-2"
        />
      </div>
      <p className="text-[8px] text-gray-400 font-bold uppercase ml-2 tracking-widest">Appuyez sur "Entrée" pour valider un élément</p>
    </div>
  );
};

interface StudentManagerProps {
  club: ClubType;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: ClassLevel[];
  progress: Progress[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const StudentManager: React.FC<StudentManagerProps> = ({ club, students, setStudents, classes, progress, messages, setMessages }) => {
  const filteredClasses = useMemo(() => classes.filter(c => c.club === club), [classes, club]);
  const [selectedClassId, setSelectedClassId] = useState<string>(filteredClasses[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const classStudents = useMemo(() => students.filter(s => s.classId === selectedClassId), [students, selectedClassId]);
  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  const studentsWithUnread = useMemo(() => 
    new Set(messages.filter(m => m.receiverId === 'admin' && !m.isRead).map(m => m.senderId))
  , [messages]);

  const [newStudentData, setNewStudentData] = useState<Partial<Student>>({
    fullName: '', birthDate: '', address: '', motherName: '', fatherName: '',
    emergencyContacts: [{ name: '', phone: '', relationship: '' }, { name: '', phone: '', relationship: '' }],
    diseases: [], allergies: [], medications: [], temporaryPassword: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit && editingStudent) setEditingStudent({ ...editingStudent, photo: base64String });
        else setNewStudentData(prev => ({ ...prev, photo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPassword = (studentId: string) => {
    const newTemp = 'MJA-' + Math.floor(1000 + Math.random() * 9000);
    if (editingStudent && editingStudent.id === studentId) {
      setEditingStudent({ ...editingStudent, passwordChanged: false, temporaryPassword: newTemp, password: "" });
    } else {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, passwordChanged: false, temporaryPassword: newTemp, password: "" } : s));
    }
    alert("Nouveau code temporaire : " + newTemp);
  };

  const handleAddSubmit = () => {
    if (!newStudentData.fullName || !newStudentData.birthDate) return;
    const birthYear = new Date(newStudentData.birthDate).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: newStudentData.fullName,
      birthDate: newStudentData.birthDate,
      age,
      classId: selectedClassId,
      photo: newStudentData.photo,
      address: newStudentData.address || '',
      motherName: newStudentData.motherName || '',
      fatherName: newStudentData.fatherName || '',
      emergencyContacts: newStudentData.emergencyContacts as EmergencyContact[] || [],
      diseases: newStudentData.diseases || [],
      allergies: newStudentData.allergies || [],
      medications: newStudentData.medications || [],
      passwordChanged: false,
      temporaryPassword: newStudentData.temporaryPassword || ('MJA-' + Math.floor(1000 + Math.random() * 9000))
    };
    setStudents(prev => [...prev, student]);
    setIsAdding(false);
    setNewStudentData({ fullName: '', birthDate: '', address: '', motherName: '', fatherName: '', emergencyContacts: [{ name: '', phone: '', relationship: '' }, { name: '', phone: '', relationship: '' }], diseases: [], allergies: [], medications: [] });
  };

  const handleEditSubmit = () => {
    if (!editingStudent) return;
    const birthYear = new Date(editingStudent.birthDate).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...editingStudent, age } : s));
    setEditingStudent(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-220px)] overflow-hidden">
      <div className="lg:col-span-4 flex flex-col bg-white rounded-[2rem] shadow-lg border border-gray-200 overflow-hidden h-[500px] lg:h-auto">
        <div className="p-4 bg-gray-50 border-b">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Classe</label>
          <div className="flex flex-wrap gap-2">
            {filteredClasses.map(cls => (
              <button 
                key={cls.id} 
                onClick={() => { setSelectedClassId(cls.id); setSelectedStudentId(null); }} 
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border flex items-center gap-2 ${selectedClassId === cls.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                <span className="w-5 h-5 flex items-center justify-center overflow-hidden rounded bg-white/10">
                   {cls.icon && cls.icon.length > 5 ? (
                     <img src={cls.icon} className="w-full h-full object-contain" alt="" />
                   ) : (
                     <span>{cls.icon || '⛺'}</span>
                   )}
                </span>
                {cls.name}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-widest">Inscrits ({classStudents.length})</h3>
          <button onClick={() => setIsAdding(true)} className="bg-green-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg hover:bg-green-700 transition-all">+ INSCRIRE</button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {classStudents.map(s => (
            <div key={s.id} onClick={() => setSelectedStudentId(s.id)} className={`p-4 cursor-pointer rounded-2xl transition-all flex justify-between items-center border ${selectedStudentId === s.id ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'hover:bg-gray-50 border-transparent'}`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative">
                  {s.photo ? <img src={s.photo} className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-md" alt="" /> : <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-[11px] text-gray-400 border border-gray-200">{s.fullName.split(' ').map(n => n[0]).join('')}</div>}
                  {studentsWithUnread.has(s.id) && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>}
                </div>
                <div className="truncate">
                  <p className="font-black text-[13px] text-gray-900 tracking-tight">{s.fullName}</p>
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{s.age} ans • {s.passwordChanged ? "Accès perso" : "Code temp."}</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setEditingStudent(s); }} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-blue-100 text-blue-600 transition text-xs">✏️</button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 overflow-y-auto custom-scrollbar bg-white rounded-[2rem] shadow-lg border border-gray-200">
        {selectedStudent ? (
          <div className="p-6 md:p-12 space-y-12 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start border-b pb-12 border-gray-100">
              <div className="w-40 h-40 rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-2xl overflow-hidden flex-shrink-0 group relative">
                {selectedStudent.photo ? <img src={selectedStudent.photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">👤</div>}
              </div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                   <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">{selectedStudent.fullName}</h2>
                   <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Dossier Numérique e-CP MJA</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-8">
                  <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Naissance</span><span className="font-bold text-gray-800 text-sm">{new Date(selectedStudent.birthDate).toLocaleDateString()}</span></div>
                  <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Adresse</span><span className="font-bold text-gray-800 text-sm truncate max-w-[220px]">{selectedStudent.address || "Non renseignée"}</span></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Code Accès</span>
                    <div className="flex items-center gap-3">
                       <span className={`font-mono text-[11px] px-3 py-1 rounded-xl border shadow-sm ${selectedStudent.passwordChanged ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                         {selectedStudent.passwordChanged ? "MODIFIÉ" : (selectedStudent.temporaryPassword || "—")}
                       </span>
                       <button onClick={() => handleResetPassword(selectedStudent.id)} className="text-[9px] font-black text-red-500 uppercase underline decoration-2 underline-offset-4 tracking-widest hover:text-red-700 transition-colors">Réinitialiser</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-10">
                <section className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">👨‍👩‍👦 Parents</h4>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm"><span className="text-[10px] font-black text-gray-400 uppercase">Mère</span><span className="font-black text-gray-800 text-sm">{selectedStudent.motherName || "—"}</span></div>
                    <div className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm"><span className="text-[10px] font-black text-gray-400 uppercase">Père</span><span className="font-black text-gray-800 text-sm">{selectedStudent.fatherName || "—"}</span></div>
                  </div>
                </section>
                <section className="bg-red-50/20 p-6 rounded-3xl border border-red-100">
                  <h4 className="font-black text-[11px] text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">🚨 Urgence</h4>
                  {selectedStudent.emergencyContacts.map((c, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-red-100 flex justify-between items-center mb-4 shadow-sm hover:shadow-md transition-shadow">
                      <div><p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">{c.relationship || 'Contact'}</p><p className="font-black text-gray-900 text-sm">{c.name || 'Inconnu'}</p></div>
                      <a href={`tel:${c.phone}`} className="bg-red-600 px-4 py-2 rounded-2xl text-white font-black text-[11px] shadow-lg shadow-red-200">{c.phone || '—'}</a>
                    </div>
                  ))}
                </section>
              </div>
              <div className="space-y-8 bg-blue-50/20 p-6 rounded-3xl border border-blue-100">
                <h4 className="font-black text-[11px] text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">🚑 Alertes Médicales</h4>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">Maladies connues</p>
                    <div className="flex flex-wrap gap-2">{selectedStudent.diseases.length > 0 ? selectedStudent.diseases.map((d, i) => <span key={i} className="bg-red-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm">{d}</span>) : <p className="text-xs text-gray-400 font-bold italic ml-2">Aucune déclarée</p>}</div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest ml-1">Allergies</p>
                    <div className="flex flex-wrap gap-2">{selectedStudent.allergies.length > 0 ? selectedStudent.allergies.map((a, i) => <span key={i} className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm">{a}</span>) : <p className="text-xs text-gray-400 font-bold italic ml-2">Aucune déclarée</p>}</div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Médicaments habituels</p>
                    <div className="flex flex-wrap gap-2">{selectedStudent.medications.length > 0 ? selectedStudent.medications.map((m, i) => <span key={i} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm">{m}</span>) : <p className="text-xs text-gray-400 font-bold italic ml-2">Aucun traitement déclarée</p>}</div>
                  </div>
                </div>
                <div className="mt-10 p-5 bg-yellow-50 rounded-[1.5rem] border border-yellow-200 flex gap-4 items-center">
                   <div className="text-2xl">⚡</div>
                   <p className="text-[9px] text-yellow-800 font-black uppercase tracking-widest leading-normal">Informations vitales pour la sécurité lors des sorties.</p>
                </div>
              </div>
            </div>
          </div>
        ) : <div className="h-full flex flex-col items-center justify-center text-gray-300 p-10 text-center"><div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">👤</div><p className="text-xs font-black uppercase tracking-[0.3em] opacity-50">Gestionnaire des dossiers jeunes</p></div>}
      </div>

      {(isAdding || editingStudent) && (
        <div className="fixed inset-0 bg-blue-900/60 flex items-center justify-center p-2 md:p-4 z-[200] backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">{isAdding ? "Nouvelle Inscription" : "Dossier Complet"}</h2>
              <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="bg-gray-100 p-3 rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* 1. IDENTIFICATION */}
                <div className="space-y-8">
                  <label className="text-[11px] font-black uppercase text-blue-600 tracking-widest border-b-2 border-blue-50 pb-3 block">1. Identification</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gray-100 relative group overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-300 shadow-inner">
                      {(editingStudent?.photo || newStudentData.photo) && <img src={editingStudent?.photo || newStudentData.photo} className="w-full h-full object-cover" alt="" />}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handlePhotoUpload(e, !!editingStudent)} />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                         <span className="text-white text-[9px] font-black uppercase text-center p-2">Upload Photo</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                       <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Nom & Prénom</label>
                        <input type="text" placeholder="Ex: Jean Dupont" value={editingStudent ? editingStudent.fullName : newStudentData.fullName} onChange={e => editingStudent ? setEditingStudent({...editingStudent, fullName: e.target.value}) : setNewStudentData({...newStudentData, fullName: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-2xl font-black text-sm outline-none focus:border-blue-400 shadow-sm" />
                       </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Date de naissance</label>
                      <input type="date" value={editingStudent ? editingStudent.birthDate : newStudentData.birthDate} onChange={e => editingStudent ? setEditingStudent({...editingStudent, birthDate: e.target.value}) : setNewStudentData({...newStudentData, birthDate: e.target.value})} className="w-full border-2 border-gray-100 p-3.5 rounded-2xl text-sm font-black focus:border-blue-300" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Code d'Accès</label>
                      <div className="flex gap-3">
                         <input 
                           type="text" 
                           disabled={!!editingStudent?.passwordChanged}
                           value={editingStudent ? (editingStudent.passwordChanged ? "Défini (Verrouillé)" : (editingStudent.temporaryPassword || "")) : newStudentData.temporaryPassword} 
                           onChange={e => editingStudent ? setEditingStudent({...editingStudent, temporaryPassword: e.target.value}) : setNewStudentData({...newStudentData, temporaryPassword: e.target.value})} 
                           className="flex-1 border-2 border-gray-100 p-3.5 rounded-2xl text-[11px] font-black uppercase bg-gray-50 disabled:text-green-600 disabled:bg-green-50/50" 
                           placeholder="Ex: MJA-2024" 
                         />
                         {editingStudent?.passwordChanged && (
                           <button onClick={() => handleResetPassword(editingStudent.id)} className="bg-red-50 text-red-600 px-4 rounded-2xl text-[9px] font-black uppercase border border-red-100 shadow-sm active:scale-95 transition-all">Reset</button>
                         )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Adresse physique</label>
                      <textarea value={editingStudent ? editingStudent.address : newStudentData.address} onChange={e => editingStudent ? setEditingStudent({...editingStudent, address: e.target.value}) : setNewStudentData({...newStudentData, address: e.target.value})} className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-black h-28 outline-none focus:border-blue-400 shadow-sm" placeholder="Rue, Ville..." />
                    </div>
                  </div>
                </div>

                {/* 2. PARENTS & URGENCE */}
                <div className="space-y-8">
                  <label className="text-[11px] font-black uppercase text-orange-600 tracking-widest border-b-2 border-orange-50 pb-3 block">2. Parents & Urgence</label>
                  <div className="grid grid-cols-1 gap-4">
                    <input type="text" placeholder="Nom de la Mère" value={editingStudent ? editingStudent.motherName : newStudentData.motherName} onChange={e => editingStudent ? setEditingStudent({...editingStudent, motherName: e.target.value}) : setNewStudentData({...newStudentData, motherName: e.target.value})} className="border-2 border-gray-100 p-3.5 rounded-2xl text-xs font-black shadow-sm" />
                    <input type="text" placeholder="Nom du Père" value={editingStudent ? editingStudent.fatherName : newStudentData.fatherName} onChange={e => editingStudent ? setEditingStudent({...editingStudent, fatherName: e.target.value}) : setNewStudentData({...newStudentData, fatherName: e.target.value})} className="border-2 border-gray-100 p-3.5 rounded-2xl text-xs font-black shadow-sm" />
                  </div>
                  {[0, 1].map(i => (
                    <div key={i} className="p-6 bg-gray-50 rounded-[2rem] space-y-4 border border-gray-200 shadow-inner">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">Contact d'urgence #{i+1}</p>
                      <input type="text" placeholder="Nom complet" value={editingStudent ? editingStudent.emergencyContacts[i]?.name : newStudentData.emergencyContacts?.[i]?.name} onChange={e => {
                        const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                        contacts[i] = { ...contacts[i], name: e.target.value };
                        editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                      }} className="w-full p-3 text-[11px] font-black rounded-2xl border-gray-200 border bg-white shadow-sm" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Lien (ex: Oncle)" value={editingStudent ? editingStudent.emergencyContacts[i]?.relationship : newStudentData.emergencyContacts?.[i]?.relationship} onChange={e => {
                          const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                          contacts[i] = { ...contacts[i], relationship: e.target.value };
                          editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                        }} className="p-3 text-[10px] font-black rounded-2xl border border-gray-200 bg-white" />
                        <input type="text" placeholder="Téléphone" value={editingStudent ? editingStudent.emergencyContacts[i]?.phone : newStudentData.emergencyContacts?.[i]?.phone} onChange={e => {
                          const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                          contacts[i] = { ...contacts[i], phone: e.target.value };
                          editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                        }} className="p-3 text-[10px] font-black rounded-2xl border border-gray-200 bg-white" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. MEDICAL (Tags system) */}
                <div className="space-y-8">
                  <label className="text-[11px] font-black uppercase text-red-600 tracking-widest border-b-2 border-red-50 pb-3 block">3. Santé (Tapez + Entrée)</label>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-2">Maladies connues</label>
                      <TagInput 
                        tags={editingStudent ? editingStudent.diseases : newStudentData.diseases || []} 
                        onChange={tags => editingStudent ? setEditingStudent({...editingStudent, diseases: tags}) : setNewStudentData({...newStudentData, diseases: tags})} 
                        placeholder="Ex: Asthme..." 
                        colorClass="bg-red-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest ml-2">Allergies déclarées</label>
                      <TagInput 
                        tags={editingStudent ? editingStudent.allergies : newStudentData.allergies || []} 
                        onChange={tags => editingStudent ? setEditingStudent({...editingStudent, allergies: tags}) : setNewStudentData({...newStudentData, allergies: tags})} 
                        placeholder="Ex: Arachides..." 
                        colorClass="bg-orange-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-2">Traitements / Médicaments</label>
                      <TagInput 
                        tags={editingStudent ? editingStudent.medications : newStudentData.medications || []} 
                        onChange={tags => editingStudent ? setEditingStudent({...editingStudent, medications: tags}) : setNewStudentData({...newStudentData, medications: tags})} 
                        placeholder="Ex: Ventoline..." 
                        colorClass="bg-indigo-600" 
                      />
                    </div>
                  </div>
                  <div className="mt-12 p-6 bg-yellow-50 rounded-[2rem] border border-yellow-100 flex gap-4 items-start shadow-sm">
                    <span className="text-2xl mt-1">⚠️</span>
                    <p className="text-[10px] text-yellow-800 font-black leading-relaxed uppercase tracking-widest">
                      Soyez vigilant lors de la saisie médicale. Ces informations sont cruciales pour l'instructeur.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t flex justify-end gap-5 bg-gray-50/80 sticky bottom-0 z-20 shadow-inner">
              <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="px-8 py-3 text-gray-400 font-black uppercase text-[10px] tracking-[0.3em] hover:text-gray-600 transition-colors">Abandonner</button>
              <button onClick={editingStudent ? handleEditSubmit : handleAddSubmit} className="bg-blue-600 text-white px-12 py-4 rounded-[1.5rem] font-black text-xs uppercase shadow-2xl hover:bg-blue-700 transition-all transform active:scale-95">Valider le Dossier Jeune</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
