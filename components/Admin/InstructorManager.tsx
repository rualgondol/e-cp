
import React, { useState } from 'react';
import { Instructor, InstructorRole } from '../../types';

interface InstructorManagerProps {
  instructors: Instructor[];
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
}

const InstructorManager: React.FC<InstructorManagerProps> = ({ instructors, setInstructors }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIns, setEditingIns] = useState<Instructor | null>(null);
  const [formData, setFormData] = useState<Partial<Instructor>>({
    fullName: '',
    username: '',
    password: '',
    role: 'AVENTURIERS'
  });

  const handleSave = () => {
    if (!formData.username || !formData.password || !formData.fullName) return;

    if (editingIns) {
      setInstructors(prev => prev.map(ins => ins.id === editingIns.id ? { ...editingIns, ...formData } as Instructor : ins));
    } else {
      const newIns: Instructor = {
        id: 'ins-' + Math.random().toString(36).substr(2, 9),
        fullName: formData.fullName!,
        username: formData.username!,
        password: formData.password!,
        role: formData.role as InstructorRole
      };
      setInstructors(prev => [...prev, newIns]);
    }
    setIsAdding(false);
    setEditingIns(null);
    setFormData({ fullName: '', username: '', password: '', role: 'AVENTURIERS' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Instructeurs & Staff</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Gérer les comptes d'accès</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all"
        >
          + NOUVEL INSTRUCTEUR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors.map(ins => (
          <div key={ins.id} className="bg-white p-6 rounded-3xl shadow-md border-t-4 border-blue-500 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${ins.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                  {ins.role}
                </span>
                <button onClick={() => { setEditingIns(ins); setFormData(ins); setIsAdding(true); }} className="text-xs opacity-30 hover:opacity-100">✏️</button>
              </div>
              <h4 className="font-black text-gray-900">{ins.fullName}</h4>
              <p className="text-xs text-gray-400 font-bold font-mono mt-1">@{ins.username}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] text-gray-300 font-mono">PWD: ••••••••</span>
              {ins.role !== 'ADMIN' && (
                <button 
                  onClick={() => setInstructors(prev => prev.filter(i => i.id !== ins.id))}
                  className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tighter">
              {editingIns ? "Modifier Instructeur" : "Nouvel Instructeur"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nom complet</label>
                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Identifiant</label>
                  <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mot de passe</label>
                  <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Rôle / Accès</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as InstructorRole})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none">
                  <option value="AVENTURIERS">Aventuriers (Bleu)</option>
                  <option value="EXPLORATEURS">Explorateurs (Vert)</option>
                  <option value="ADMIN">Administrateur Total</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-6 border-t">
              <button onClick={() => { setIsAdding(false); setEditingIns(null); }} className="text-[10px] font-black text-gray-400 uppercase">Annuler</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorManager;
