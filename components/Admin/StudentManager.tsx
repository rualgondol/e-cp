
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

  // Calculer les élèves ayant des messages non lus
  const studentsWithUnread = useMemo(() => {
    return new Set(messages.filter(m => m.receiverId === 'admin' && !m.isRead).map(m => m.senderId));
  }, [messages]);

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
    fullName: '', birthDate: '', address: '', motherName: '', fatherName: '',
    emergencyContacts: [{ name: '', phone: '', relationship: '' }, { name: '', phone: '', relationship: '' }],
    diseases: [], allergies: [], medications: []
  });

  const handleAddSubmit = () => {
    if (!newStudentData.fullName || !newStudentData.birthDate) return;
    const { age, classId } = calculateAgeAndClass(newStudentData.birthDate);
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: newStudentData.fullName,
      birthDate: newStudentData.birthDate,
      age, classId,
      photo: newStudentData.photo,
      address: newStudentData.address || '',
      motherName: newStudentData.motherName || '',
      fatherName: newStudentData.fatherName || '',
      emergencyContacts: newStudentData.emergencyContacts as EmergencyContact[] || [{ name: '', phone: '', relationship: '' }, { name: '', phone: '', relationship: '' }],
      diseases: newStudentData.diseases || [],
      allergies: newStudentData.allergies || [],
      medications: newStudentData.medications || [],
      passwordChanged: false,
      temporaryPassword: 'MJA' + Math.floor(1000 + Math.random() * 9000)
    };
    setStudents(prev => [...prev, student]);
    setIsAdding(false);
  };

  const handleEditSubmit = () => {
    if (!editingStudent) return;
    const { age, classId } = calculateAgeAndClass(editingStudent.birthDate);
    const updatedStudent: Student = {
      ...editingStudent,
      age,
      classId
    };
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setEditingStudent(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-220px)] overflow-hidden">
      {/* Sidebar: Liste des élèves */}
      <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 overflow-hidden h-[500px] lg:h-auto">
        <div className="p-4 bg-gray-50 border-b">
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Sélecteur de Classe</label>
          <div className="flex flex-wrap gap-2">
            {filteredClasses.map(cls => (
              <button 
                key={cls.id}
                onClick={() => { setSelectedClassId(cls.id); setSelectedStudentId(null); }}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border flex items-center gap-1 ${selectedClassId === cls.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                {renderClassIcon(cls.icon)} {cls.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-widest">Élèves ({classStudents.length})</h3>
          <button onClick={() => setIsAdding(true)} className="bg-green-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl hover:bg-green-700 transition shadow-lg">+ INSCRIRE</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-gray-100">
            {classStudents.map(s => (
              <div 
                key={s.id} 
                onClick={() => {
                   setSelectedStudentId(s.id);
                   if (window.innerWidth < 1024) {
                      document.getElementById('profile-view')?.scrollIntoView({ behavior: 'smooth' });
                   }
                }}
                className={`p-3 cursor-pointer transition-all flex justify-between items-center group border-l-4 ${selectedStudentId === s.id ? 'bg-blue-50/50 border-blue-600' : 'hover:bg-gray-50 border-transparent'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    {s.photo ? (
                      <img src={s.photo} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-[9px] text-gray-400">
                        {s.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    {studentsWithUnread.has(s.id) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <div className="truncate pr-2">
                    <p className={`font-bold text-[12px] flex items-center gap-2 ${selectedStudentId === s.id ? 'text-blue-900' : 'text-gray-800'}`}>
                      {s.fullName}
                      {studentsWithUnread.has(s.id) && <span className="text-[10px] animate-bounce">💬</span>}
                    </p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">{s.age} ans</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100">
                  <button onClick={(e) => { e.stopPropagation(); setEditingStudent(s); }} className="p-1.5 bg-gray-100 rounded-lg hover:bg-blue-100 text-blue-600 transition text-xs">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); setStudentToDelete(s); }} className="p-1.5 bg-gray-100 rounded-lg hover:bg-red-100 text-red-600 transition text-xs">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Column: Carte de profil complète */}
      <div id="profile-view" className="lg:col-span-8 overflow-y-auto custom-scrollbar bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-200">
        {selectedStudent ? (
          <div className="p-6 md:p-10 space-y-8 animate-fade-in">
            {/* Header Profil */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start border-b pb-8 border-gray-100">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-gray-50 border-4 border-white shadow-xl overflow-hidden">
                  {selectedStudent.photo ? (
                    <img src={selectedStudent.photo} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">👤</div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter mb-2">{selectedStudent.fullName}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Né(e) le</span>
                    <span className="font-bold text-gray-800">{new Date(selectedStudent.birthDate).toLocaleDateString()} ({selectedStudent.age} ans)</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Classe</span>
                    <span className="font-bold text-blue-600 uppercase flex items-center gap-1">
                      {renderClassIcon(classes.find(c => c.id === selectedStudent.classId)?.icon)}
                      {classes.find(c => c.id === selectedStudent.classId)?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section className="space-y-3">
                  <h4 className="font-black text-[9px] text-gray-400 uppercase tracking-widest">👨‍👩‍👦 Parents</h4>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Mère</span>
                      <span className="font-black text-gray-800 text-xs">{selectedStudent.motherName || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Père</span>
                      <span className="font-black text-gray-800 text-xs">{selectedStudent.fatherName || "—"}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="font-black text-[9px] text-red-600 uppercase tracking-widest">🚨 Urgence</h4>
                  {selectedStudent.emergencyContacts?.map((contact, idx) => (
                    <div key={idx} className="bg-red-50/50 p-3 rounded-xl border border-red-100 flex justify-between items-center">
                      <div className="min-w-0 pr-2">
                        <p className="text-[8px] font-black text-red-400 uppercase">{contact.relationship || `Contact ${idx + 1}`}</p>
                        <p className="font-black text-gray-900 text-xs truncate">{contact.name || "N/A"}</p>
                      </div>
                      <a href={`tel:${contact.phone}`} className="bg-white px-3 py-1.5 rounded-lg border border-red-100 text-red-600 shadow-sm text-xs font-black">
                        {contact.phone || "--"}
                      </a>
                    </div>
                  ))}
                </section>
              </div>

              <div className="space-y-6">
                <h4 className="font-black text-[9px] text-red-500 uppercase tracking-widest">🚑 Alertes Médicales</h4>
                <div className="space-y-3">
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-[8px] font-black text-red-400 uppercase mb-2">Maladies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.diseases.length > 0 ? selectedStudent.diseases.map((d, i) => (
                        <span key={i} className="bg-white text-red-600 px-2 py-0.5 rounded-md text-[10px] font-black border border-red-100">{d}</span>
                      )) : <p className="text-[10px] text-red-300 italic">Aucune</p>}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-[8px] font-black text-orange-400 uppercase mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.allergies.length > 0 ? selectedStudent.allergies.map((a, i) => (
                        <span key={i} className="bg-white text-orange-600 px-2 py-0.5 rounded-md text-[10px] font-black border border-orange-100">{a}</span>
                      )) : <p className="text-[10px] text-orange-300 italic">Aucune</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 p-10 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">👤</div>
            <p className="text-xs font-medium opacity-60">Sélectionnez un élève pour voir sa fiche</p>
          </div>
        )}
      </div>

      {/* MODALE Ajout / Edition */}
      {(isAdding || editingStudent) && (
        <div className="fixed inset-0 bg-blue-900/60 flex items-center justify-center p-2 md:p-4 z-[200] backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl animate-scale-in">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{isAdding ? "Inscription" : "Modification"}</h2>
              <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="text-gray-300 text-2xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Inputs identification */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-blue-600 tracking-widest border-b pb-1 block">1. Identité</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 relative group overflow-hidden flex-shrink-0">
                       {(editingStudent?.photo || newStudentData.photo) ? (
                         <img src={editingStudent?.photo || newStudentData.photo} className="w-full h-full object-cover" alt="" />
                       ) : <span className="absolute inset-0 flex items-center justify-center text-xl opacity-20">📸</span>}
                       <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handlePhotoUpload(e, !!editingStudent)} />
                    </div>
                    <input 
                      type="text" placeholder="Nom Complet"
                      value={editingStudent ? editingStudent.fullName : newStudentData.fullName}
                      onChange={e => editingStudent ? setEditingStudent({...editingStudent, fullName: e.target.value}) : setNewStudentData({...newStudentData, fullName: e.target.value})}
                      className="flex-1 border-2 border-gray-100 p-2.5 rounded-xl font-bold text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <input type="date" value={editingStudent ? editingStudent.birthDate : newStudentData.birthDate} onChange={e => editingStudent ? setEditingStudent({...editingStudent, birthDate: e.target.value}) : setNewStudentData({...newStudentData, birthDate: e.target.value})} className="w-full border-2 border-gray-100 p-2.5 rounded-xl text-sm" />
                </div>
                {/* Emergency & medical sections go here with similar responsive styling... */}
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50/50 rounded-b-3xl">
              <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="px-4 py-2 text-gray-400 font-bold uppercase text-[10px]">Annuler</button>
              <button onClick={editingStudent ? handleEditSubmit : handleAddSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
