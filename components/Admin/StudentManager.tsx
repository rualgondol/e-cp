
import React, { useState, useMemo } from 'react';
import { ClubType, Student, Progress, Message, ClassLevel, EmergencyContact } from '../../types';

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
    diseases: [], allergies: [], medications: []
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
      temporaryPassword: 'MJA' + Math.floor(1000 + Math.random() * 9000)
    };
    setStudents(prev => [...prev, student]);
    setIsAdding(false);
    // Reset form
    setNewStudentData({
      fullName: '', birthDate: '', address: '', motherName: '', fatherName: '',
      emergencyContacts: [{ name: '', phone: '', relationship: '' }, { name: '', phone: '', relationship: '' }],
      diseases: [], allergies: [], medications: []
    });
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
      <div className="lg:col-span-4 flex flex-col bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden h-[500px] lg:h-auto">
        <div className="p-4 bg-gray-50 border-b">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Classe</label>
          <div className="flex flex-wrap gap-2">
            {filteredClasses.map(cls => (
              <button key={cls.id} onClick={() => { setSelectedClassId(cls.id); setSelectedStudentId(null); }} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border flex items-center gap-1 ${selectedClassId === cls.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                {cls.icon && cls.icon.length < 5 ? cls.icon : '⛺'} {cls.name}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-widest">Effectif ({classStudents.length})</h3>
          <button onClick={() => setIsAdding(true)} className="bg-green-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-lg hover:bg-green-700">+ INSCRIRE</button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {classStudents.map(s => (
            <div key={s.id} onClick={() => setSelectedStudentId(s.id)} className={`p-3 cursor-pointer transition-all flex justify-between items-center border-l-4 ${selectedStudentId === s.id ? 'bg-blue-50/50 border-blue-600' : 'hover:bg-gray-50 border-transparent'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  {s.photo ? <img src={s.photo} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" alt="" /> : <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-[9px] text-gray-400">{s.fullName.split(' ').map(n => n[0]).join('')}</div>}
                  {studentsWithUnread.has(s.id) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                </div>
                <div className="truncate">
                  <p className="font-bold text-[12px] text-gray-800">{s.fullName}</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase">{s.age} ans</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setEditingStudent(s); }} className="p-1.5 bg-gray-100 rounded-lg hover:bg-blue-100 text-blue-600 transition text-xs">✏️</button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 overflow-y-auto custom-scrollbar bg-white rounded-3xl shadow-lg border border-gray-200">
        {selectedStudent ? (
          <div className="p-6 md:p-10 space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b pb-10 border-gray-100">
              <div className="w-32 h-32 rounded-3xl bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
                {selectedStudent.photo ? <img src={selectedStudent.photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">👤</div>}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">{selectedStudent.fullName}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Naissance</span><span className="font-bold text-gray-800 text-sm">{new Date(selectedStudent.birthDate).toLocaleDateString()}</span></div>
                  <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Adresse</span><span className="font-bold text-gray-800 text-sm truncate max-w-[200px]">{selectedStudent.address || "Non renseignée"}</span></div>
                  <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Code Accès</span><span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded border">{selectedStudent.temporaryPassword || "Défini"}</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <section>
                  <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4">👨‍👩‍👦 Parents</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-2xl border flex justify-between items-center"><span className="text-[9px] font-bold text-gray-400 uppercase">Mère</span><span className="font-black text-gray-800 text-xs">{selectedStudent.motherName || "—"}</span></div>
                    <div className="bg-gray-50 p-3 rounded-2xl border flex justify-between items-center"><span className="text-[9px] font-bold text-gray-400 uppercase">Père</span><span className="font-black text-gray-800 text-xs">{selectedStudent.fatherName || "—"}</span></div>
                  </div>
                </section>
                <section>
                  <h4 className="font-black text-[10px] text-red-600 uppercase tracking-widest mb-4">🚨 Urgence</h4>
                  {selectedStudent.emergencyContacts.map((c, i) => (
                    <div key={i} className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex justify-between items-center mb-3 shadow-sm">
                      <div><p className="text-[8px] font-black text-red-400 uppercase">{c.relationship || 'Contact'}</p><p className="font-black text-gray-900 text-xs">{c.name || 'Inconnu'}</p></div>
                      <a href={`tel:${c.phone}`} className="bg-white px-3 py-1.5 rounded-xl border border-red-100 text-red-600 font-black text-[10px]">{c.phone || '—'}</a>
                    </div>
                  ))}
                </section>
              </div>
              <div className="space-y-6">
                <h4 className="font-black text-[10px] text-red-500 uppercase tracking-widest mb-4">🚑 Alertes Médicales</h4>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-[8px] font-black text-red-400 uppercase mb-2">Maladies</p>
                    <div className="flex flex-wrap gap-1.5">{selectedStudent.diseases.length > 0 ? selectedStudent.diseases.map((d, i) => <span key={i} className="bg-white text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-red-100">{d}</span>) : <p className="text-[10px] text-red-300 italic">Aucune</p>}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-[8px] font-black text-orange-400 uppercase mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-1.5">{selectedStudent.allergies.length > 0 ? selectedStudent.allergies.map((a, i) => <span key={i} className="bg-white text-orange-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-orange-100">{a}</span>) : <p className="text-[10px] text-orange-300 italic">Aucune</p>}</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-[8px] font-black text-blue-400 uppercase mb-2">Médicaments habituels</p>
                    <div className="flex flex-wrap gap-1.5">{selectedStudent.medications.length > 0 ? selectedStudent.medications.map((m, i) => <span key={i} className="bg-white text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-blue-100">{m}</span>) : <p className="text-[10px] text-blue-300 italic">Aucun</p>}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : <div className="h-full flex flex-col items-center justify-center text-gray-300 p-10 text-center"><div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">👤</div><p className="text-xs font-medium uppercase tracking-widest">Dossier des jeunes</p></div>}
      </div>

      {(isAdding || editingStudent) && (
        <div className="fixed inset-0 bg-blue-900/60 flex items-center justify-center p-2 md:p-4 z-[200] backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden">
            <div className="p-6 md:p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">{isAdding ? "Nouvelle Inscription" : "Dossier Médical & Administratif"}</h2>
              <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="text-gray-300 text-3xl hover:text-red-500 transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {/* 1. IDENTIFICATION */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b pb-2 block">1. Identification</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 relative group overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-200">
                      {(editingStudent?.photo || newStudentData.photo) && <img src={editingStudent?.photo || newStudentData.photo} className="w-full h-full object-cover" alt="" />}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handlePhotoUpload(e, !!editingStudent)} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-[9px] font-black uppercase">Changer Photo</span></div>
                    </div>
                    <input type="text" placeholder="Nom et Prénom" value={editingStudent ? editingStudent.fullName : newStudentData.fullName} onChange={e => editingStudent ? setEditingStudent({...editingStudent, fullName: e.target.value}) : setNewStudentData({...newStudentData, fullName: e.target.value})} className="flex-1 border-2 border-gray-100 p-3 rounded-2xl font-bold text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Date de naissance</label>
                    <input type="date" value={editingStudent ? editingStudent.birthDate : newStudentData.birthDate} onChange={e => editingStudent ? setEditingStudent({...editingStudent, birthDate: e.target.value}) : setNewStudentData({...newStudentData, birthDate: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-2xl text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Adresse Domicile</label>
                    <textarea value={editingStudent ? editingStudent.address : newStudentData.address} onChange={e => editingStudent ? setEditingStudent({...editingStudent, address: e.target.value}) : setNewStudentData({...newStudentData, address: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-2xl text-sm font-bold h-24 outline-none focus:border-blue-400" placeholder="Adresse complète..." />
                  </div>
                </div>

                {/* 2. PARENTS & URGENCE */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase text-orange-600 tracking-widest border-b pb-2 block">2. Parents & Urgence</label>
                  <div className="grid grid-cols-1 gap-3">
                    <input type="text" placeholder="Nom complet de la Mère" value={editingStudent ? editingStudent.motherName : newStudentData.motherName} onChange={e => editingStudent ? setEditingStudent({...editingStudent, motherName: e.target.value}) : setNewStudentData({...newStudentData, motherName: e.target.value})} className="border-2 border-gray-100 p-3 rounded-2xl text-xs font-bold" />
                    <input type="text" placeholder="Nom complet du Père" value={editingStudent ? editingStudent.fatherName : newStudentData.fatherName} onChange={e => editingStudent ? setEditingStudent({...editingStudent, fatherName: e.target.value}) : setNewStudentData({...newStudentData, fatherName: e.target.value})} className="border-2 border-gray-100 p-3 rounded-2xl text-xs font-bold" />
                  </div>
                  {[0, 1].map(i => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100 shadow-inner">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Contact d'urgence #{i+1}</p>
                      <input type="text" placeholder="Nom du contact" value={editingStudent ? editingStudent.emergencyContacts[i]?.name : newStudentData.emergencyContacts?.[i]?.name} onChange={e => {
                        const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                        contacts[i] = { ...contacts[i], name: e.target.value };
                        editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                      }} className="w-full p-2 text-xs rounded-xl border-gray-200 border bg-white" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Relation" value={editingStudent ? editingStudent.emergencyContacts[i]?.relationship : newStudentData.emergencyContacts?.[i]?.relationship} onChange={e => {
                          const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                          contacts[i] = { ...contacts[i], relationship: e.target.value };
                          editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                        }} className="p-2 text-[10px] rounded-xl border border-gray-200 bg-white" />
                        <input type="text" placeholder="Téléphone" value={editingStudent ? editingStudent.emergencyContacts[i]?.phone : newStudentData.emergencyContacts?.[i]?.phone} onChange={e => {
                          const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                          contacts[i] = { ...contacts[i], phone: e.target.value };
                          editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                        }} className="p-2 text-[10px] rounded-xl border border-gray-200 bg-white" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. MEDICAL */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2 block">3. Santé (Détails)</label>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-red-400 uppercase ml-1">Maladies (séparer par virgule)</label>
                      <input type="text" placeholder="Ex: Asthme, Diabète..." value={editingStudent ? editingStudent.diseases.join(', ') : newStudentData.diseases?.join(', ')} onChange={e => {
                        const list = e.target.value.split(',').map(s => s.trim()).filter(s => s !== "");
                        editingStudent ? setEditingStudent({...editingStudent, diseases: list}) : setNewStudentData({...newStudentData, diseases: list});
                      }} className="w-full border-2 border-red-50 p-3 rounded-2xl text-xs font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-orange-400 uppercase ml-1">Allergies (séparer par virgule)</label>
                      <input type="text" placeholder="Ex: Arachides, Pénicilline..." value={editingStudent ? editingStudent.allergies.join(', ') : newStudentData.allergies?.join(', ')} onChange={e => {
                        const list = e.target.value.split(',').map(s => s.trim()).filter(s => s !== "");
                        editingStudent ? setEditingStudent({...editingStudent, allergies: list}) : setNewStudentData({...newStudentData, allergies: list});
                      }} className="w-full border-2 border-orange-50 p-3 rounded-2xl text-xs font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-blue-400 uppercase ml-1">Médicaments (séparer par virgule)</label>
                      <input type="text" placeholder="Ex: Ventoline, Insuline..." value={editingStudent ? editingStudent.medications.join(', ') : newStudentData.medications?.join(', ')} onChange={e => {
                        const list = e.target.value.split(',').map(s => s.trim()).filter(s => s !== "");
                        editingStudent ? setEditingStudent({...editingStudent, medications: list}) : setNewStudentData({...newStudentData, medications: list});
                      }} className="w-full border-2 border-blue-50 p-3 rounded-2xl text-xs font-bold" />
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3 items-start shadow-sm">
                    <span className="text-xl">⚠️</span>
                    <p className="text-[9px] text-yellow-700 font-bold leading-tight uppercase tracking-wide">Vérifiez l'exactitude des données de santé. Elles sont cruciales en cas d'intervention médicale.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t flex justify-end gap-4 bg-gray-50/80 sticky bottom-0 z-20">
              <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="px-6 py-2 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">Annuler</button>
              <button onClick={editingStudent ? handleEditSubmit : handleAddSubmit} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-2xl hover:bg-blue-700 transition-all transform active:scale-95">Enregistrer le Dossier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
