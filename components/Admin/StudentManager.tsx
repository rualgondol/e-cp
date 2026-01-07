
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
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  const classStudents = useMemo(() => students.filter(s => s.classId === selectedClassId), [students, selectedClassId]);
  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  // Rendu sécurisé de l'icône de classe
  const renderClassIcon = (icon: string | undefined, className: string = "w-4 h-4 rounded") => {
    if (!icon) return '❓';
    if (icon.length > 5) {
      return <img src={icon} className={className} alt="Icone classe" />;
    }
    return <span>{icon}</span>;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit && editingStudent) {
          setEditingStudent({ ...editingStudent, photo: base64String });
        } else {
          setNewStudentData(prev => ({ ...prev, photo: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAgeAndClass = (birthDate: string) => {
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const targetClass = classes.find(c => c.age === age && c.club === club);
    return { age, classId: targetClass?.id || selectedClassId };
  };

  const [newStudentData, setNewStudentData] = useState<Partial<Student>>({
    fullName: '',
    birthDate: '',
    address: '',
    motherName: '',
    fatherName: '',
    emergencyContacts: [
      { name: '', phone: '', relationship: '' },
      { name: '', phone: '', relationship: '' }
    ],
    diseases: [],
    allergies: [],
    medications: []
  });

  const handleAddSubmit = () => {
    if (!newStudentData.fullName || !newStudentData.birthDate) return;
    const { age, classId } = calculateAgeAndClass(newStudentData.birthDate);
    
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: newStudentData.fullName,
      birthDate: newStudentData.birthDate,
      age,
      classId,
      photo: newStudentData.photo,
      address: newStudentData.address || '',
      motherName: newStudentData.motherName || '',
      fatherName: newStudentData.fatherName || '',
      emergencyContacts: newStudentData.emergencyContacts as EmergencyContact[] || [
        { name: '', phone: '', relationship: '' },
        { name: '', phone: '', relationship: '' }
      ],
      diseases: newStudentData.diseases || [],
      allergies: newStudentData.allergies || [],
      medications: newStudentData.medications || [],
      passwordChanged: false,
      temporaryPassword: 'MJA' + Math.floor(1000 + Math.random() * 9000)
    };
    
    setStudents(prev => [...prev, student]);
    setIsAdding(false);
    setNewStudentData({ 
      fullName: '', birthDate: '', address: '', motherName: '', fatherName: '', 
      emergencyContacts: [{ name: '', phone: '', relationship: '' }, { name: '', phone: '', relationship: '' }],
      diseases: [], allergies: [], medications: [] 
    });
  };

  const handleEditSubmit = () => {
    if (!editingStudent) return;
    const { age, classId } = calculateAgeAndClass(editingStudent.birthDate);
    const updated = { ...editingStudent, age, classId };
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingStudent(null);
  };

  const handleDeleteConfirm = () => {
    if (!studentToDelete) return;
    setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
    if (selectedStudentId === studentToDelete.id) setSelectedStudentId(null);
    setStudentToDelete(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-220px)] overflow-hidden">
      {/* Sidebar: Liste des élèves */}
      <div className="lg:col-span-4 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-5 bg-gray-50 border-b">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sélecteur de Classe</label>
          <div className="flex flex-wrap gap-2">
            {filteredClasses.map(cls => (
              <button 
                key={cls.id}
                onClick={() => { setSelectedClassId(cls.id); setSelectedStudentId(null); }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border flex items-center gap-1 ${selectedClassId === cls.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                {renderClassIcon(cls.icon)} {cls.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest">Élèves ({classStudents.length})</h3>
          <button onClick={() => setIsAdding(true)} className="bg-green-600 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-green-700 transition shadow-lg">+ INSCRIRE</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-gray-100">
            {classStudents.map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelectedStudentId(s.id)}
                className={`p-4 cursor-pointer transition-all flex justify-between items-center group border-l-4 ${selectedStudentId === s.id ? 'bg-blue-50/50 border-blue-600' : 'hover:bg-gray-50 border-transparent'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {s.photo ? (
                    <img src={s.photo} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-[10px] text-gray-400">
                      {s.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className="truncate pr-2">
                    <p className={`font-bold text-[13px] ${selectedStudentId === s.id ? 'text-blue-900' : 'text-gray-800'}`}>{s.fullName}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{s.age} ans</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setEditingStudent(s); }} className="p-2 bg-gray-100 rounded-lg hover:bg-blue-100 text-blue-600 transition">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); setStudentToDelete(s); }} className="p-2 bg-gray-100 rounded-lg hover:bg-red-100 text-red-600 transition">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Column: Carte de profil complète */}
      <div className="lg:col-span-8 overflow-y-auto custom-scrollbar bg-white rounded-3xl shadow-xl border border-gray-200">
        {selectedStudent ? (
          <div className="p-10 space-y-8 animate-fade-in">
            {/* Header Profil */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b pb-10 border-gray-100">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-gray-50 border-4 border-white shadow-2xl overflow-hidden">
                  {selectedStudent.photo ? (
                    <img src={selectedStudent.photo} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">👤</div>
                  )}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-xl flex items-center gap-1">
                  {renderClassIcon(classes.find(c => c.id === selectedStudent.classId)?.icon, "w-4 h-4 rounded-sm object-cover")} 
                  <span>{classes.find(c => c.id === selectedStudent.classId)?.name}</span>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">{selectedStudent.fullName}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Né(e) le</span>
                    <span className="font-bold text-gray-800">{new Date(selectedStudent.birthDate).toLocaleDateString()} ({selectedStudent.age} ans)</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100 hidden md:block"></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Adresse complète</span>
                    <span className="font-bold text-gray-800">{selectedStudent.address || "Non renseignée"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Infos Parentales & Urgence */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    👨‍👩‍👦 Responsables Légaux
                  </h4>
                  <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 space-y-3 shadow-inner">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Mère</span>
                      <span className="font-black text-gray-800 text-sm">{selectedStudent.motherName || "Non renseigné"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Père</span>
                      <span className="font-black text-gray-800 text-sm">{selectedStudent.fatherName || "Non renseigné"}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="font-black text-[11px] text-red-600 uppercase tracking-widest flex items-center gap-2">
                    🚨 Contacts d'Urgence
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedStudent.emergencyContacts?.map((contact, idx) => (
                      <div key={idx} className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-red-400 uppercase mb-1">{contact.relationship || `Contact ${idx + 1}`}</p>
                          <p className="font-black text-gray-900 text-sm truncate">{contact.name || "N/A"}</p>
                        </div>
                        <a href={`tel:${contact.phone}`} className="bg-white p-2.5 rounded-xl border border-red-100 text-red-600 shadow-sm hover:bg-red-600 hover:text-white transition-all text-sm">
                          📞 {contact.phone || "--"}
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Infos Médicales */}
              <div className="space-y-6">
                <h4 className="font-black text-[11px] text-red-500 uppercase tracking-widest flex items-center gap-2">
                  🚑 Dossier Médical & Alertes
                </h4>
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-3xl p-6 border border-red-100 shadow-inner">
                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3">Maladies & Affections</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.diseases.length > 0 ? selectedStudent.diseases.map((d, i) => (
                        <span key={i} className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-black border border-red-200">{d}</span>
                      )) : <p className="text-xs text-red-300 italic">Aucune maladie signalée</p>}
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 shadow-inner">
                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-3">Allergies connues</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.allergies.length > 0 ? selectedStudent.allergies.map((a, i) => (
                        <span key={i} className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-black border border-orange-200">{a}</span>
                      )) : <p className="text-xs text-orange-300 italic">Aucune allergie signalée</p>}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-3xl p-6 border border-green-100 shadow-inner">
                    <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-3">Traitements réguliers</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.medications.length > 0 ? selectedStudent.medications.map((m, i) => (
                        <span key={i} className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-black border border-green-200">{m}</span>
                      )) : <p className="text-xs text-green-300 italic">Aucun traitement régulier</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 p-20 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">📄</div>
            <h3 className="font-black text-xl text-gray-400 tracking-tighter uppercase mb-2">Dossier Élève</h3>
            <p className="text-sm max-w-xs leading-relaxed opacity-60 font-medium">Sélectionnez un élève dans la liste pour consulter sa fiche complète.</p>
          </div>
        )}
      </div>

      {/* MODALE: Ajout / Edition (Formulaire complet) */}
      {(isAdding || editingStudent) && (
        <div className="fixed inset-0 bg-blue-900/40 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl p-10 shadow-2xl border border-white/20 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                {isAdding ? "Nouvelle Inscription" : "Modifier le Dossier"}
              </h2>
              <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="text-gray-300 hover:text-red-500 text-2xl">✕</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Section 1: Identité & Parents */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">1. Identité & Parents</h4>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center relative group cursor-pointer border-2 border-dashed border-gray-300 overflow-hidden">
                    {(editingStudent?.photo || newStudentData.photo) ? (
                      <img src={editingStudent?.photo || newStudentData.photo} className="w-full h-full object-cover" alt="" />
                    ) : <span className="text-xl opacity-30">📸</span>}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handlePhotoUpload(e, !!editingStudent)} />
                  </div>
                  <input 
                    type="text" placeholder="Nom Complet"
                    value={editingStudent ? editingStudent.fullName : newStudentData.fullName}
                    onChange={e => editingStudent ? setEditingStudent({...editingStudent, fullName: e.target.value}) : setNewStudentData({...newStudentData, fullName: e.target.value})}
                    className="flex-1 border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-4">
                   <input type="date" value={editingStudent ? editingStudent.birthDate : newStudentData.birthDate} onChange={e => editingStudent ? setEditingStudent({...editingStudent, birthDate: e.target.value}) : setNewStudentData({...newStudentData, birthDate: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm" />
                   <textarea placeholder="Adresse" value={editingStudent ? editingStudent.address : newStudentData.address} onChange={e => editingStudent ? setEditingStudent({...editingStudent, address: e.target.value}) : setNewStudentData({...newStudentData, address: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl h-16 text-sm" />
                   <div className="grid grid-cols-2 gap-3">
                     <input type="text" placeholder="Mère" value={editingStudent ? editingStudent.motherName : newStudentData.motherName} onChange={e => editingStudent ? setEditingStudent({...editingStudent, motherName: e.target.value}) : setNewStudentData({...newStudentData, motherName: e.target.value})} className="border-2 border-gray-100 p-2 rounded-xl text-xs" />
                     <input type="text" placeholder="Père" value={editingStudent ? editingStudent.fatherName : newStudentData.fatherName} onChange={e => editingStudent ? setEditingStudent({...editingStudent, fatherName: e.target.value}) : setNewStudentData({...newStudentData, fatherName: e.target.value})} className="border-2 border-gray-100 p-2 rounded-xl text-xs" />
                   </div>
                </div>
              </div>

              {/* Section 2: Contacts d'Urgence */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest border-b pb-2">2. Urgence (2 obligatoires)</h4>
                {[0, 1].map((idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Contact #{idx + 1}</p>
                    <input 
                      type="text" placeholder="Nom complet"
                      value={editingStudent ? editingStudent.emergencyContacts[idx]?.name : newStudentData.emergencyContacts![idx]?.name}
                      onChange={e => {
                        const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                        contacts[idx] = { ...contacts[idx], name: e.target.value };
                        editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                      }}
                      className="w-full border-2 border-white p-2 rounded-lg text-xs font-bold outline-none focus:border-red-200"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="tel" placeholder="Téléphone"
                        value={editingStudent ? editingStudent.emergencyContacts[idx]?.phone : newStudentData.emergencyContacts![idx]?.phone}
                        onChange={e => {
                          const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                          contacts[idx] = { ...contacts[idx], phone: e.target.value };
                          editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                        }}
                        className="border-2 border-white p-2 rounded-lg text-xs"
                      />
                      <input 
                        type="text" placeholder="Relation (ex: Oncle)"
                        value={editingStudent ? editingStudent.emergencyContacts[idx]?.relationship : newStudentData.emergencyContacts![idx]?.relationship}
                        onChange={e => {
                          const contacts = [...(editingStudent ? editingStudent.emergencyContacts : newStudentData.emergencyContacts!)];
                          contacts[idx] = { ...contacts[idx], relationship: e.target.value };
                          editingStudent ? setEditingStudent({...editingStudent, emergencyContacts: contacts}) : setNewStudentData({...newStudentData, emergencyContacts: contacts});
                        }}
                        className="border-2 border-white p-2 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 3: Médical */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b pb-2">3. Médical</h4>
                {['diseases', 'allergies', 'medications'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {field === 'diseases' ? 'Maladies' : field === 'allergies' ? 'Allergies' : 'Médicaments'}
                    </label>
                    <input 
                      type="text" placeholder="Entrée pour ajouter..."
                      className="w-full border-2 border-gray-100 p-2 rounded-lg text-[10px]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          const current = (editingStudent ? editingStudent[field as keyof Student] : newStudentData[field as keyof Student]) as string[];
                          const updated = [...current, e.currentTarget.value];
                          editingStudent ? setEditingStudent({...editingStudent, [field]: updated}) : setNewStudentData({...newStudentData, [field]: updated});
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {((editingStudent ? editingStudent[field as keyof Student] : newStudentData[field as keyof Student]) as string[]).map((item, i) => (
                        <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                          {item} <button onClick={() => {
                             const current = (editingStudent ? editingStudent[field as keyof Student] : newStudentData[field as keyof Student]) as string[];
                             const updated = current.filter((_, idx) => idx !== i);
                             editingStudent ? setEditingStudent({...editingStudent, [field]: updated}) : setNewStudentData({...newStudentData, [field]: updated});
                          }} className="text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4 border-t pt-8">
              <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="px-6 py-2 text-gray-400 font-bold uppercase text-xs">Annuler</button>
              <button 
                onClick={editingStudent ? handleEditSubmit : handleAddSubmit}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition"
              >
                {isAdding ? "Finaliser Inscription" : "Valider Modifications"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suppression Modale */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-red-900/40 flex items-center justify-center p-4 z-[300] backdrop-blur-lg">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl text-center border-4 border-red-500 animate-bounce-in">
            <h2 className="text-2xl font-black text-red-600 mb-4 uppercase">Attention</h2>
            <p className="text-gray-500 text-sm mb-8">Supprimer définitivement <b>{studentToDelete.fullName}</b> ?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDeleteConfirm} className="bg-red-600 text-white p-4 rounded-2xl font-black hover:bg-red-700 shadow-xl transition">Confirmer</button>
              <button onClick={() => setStudentToDelete(null)} className="p-3 text-gray-400 font-bold uppercase text-xs">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
