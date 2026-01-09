
import React, { useState } from 'react';
import { ClubType, ClassLevel } from '../../types';
import { db } from '../../services/supabaseService';

interface ClassManagerProps {
  club: ClubType;
  classes: ClassLevel[];
  setClasses: React.Dispatch<React.SetStateAction<ClassLevel[]>>;
}

const ClassManager: React.FC<ClassManagerProps> = ({ club, classes, setClasses }) => {
  const [editingClass, setEditingClass] = useState<ClassLevel | null>(null);
  const [syncToAll, setSyncToAll] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSave = async () => {
    if (!editingClass) return;
    setIsSyncing(true);

    try {
      if (syncToAll && editingClass.icon) {
        // Mise à jour SQL de toutes les classes du club
        await db.updateAllClassIcons(club, editingClass.icon);
        // Mise à jour locale de l'état
        setClasses(prev => prev.map(c => c.club === club ? { ...c, icon: editingClass.icon } : c));
        alert(`Icône synchronisée pour toutes les classes du club ${club} !`);
      } else {
        // Mise à jour SQL d'une seule classe
        await db.updateClassSingle(editingClass);
        // Mise à jour locale
        setClasses(prev => prev.map(c => c.id === editingClass.id ? editingClass : c));
      }
    } catch (e) {
      alert("Erreur de synchronisation SQL");
    } finally {
      setIsSyncing(false);
      setEditingClass(null);
      setSyncToAll(false);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingClass) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingClass({ ...editingClass, icon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.filter(c => c.club === club).map(cls => (
          <div key={cls.id} className="border p-6 rounded-2xl flex items-center gap-6 hover:shadow-md transition bg-gray-50/50">
            <div className="w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {cls.icon && cls.icon.length > 5 ? (
                <img src={cls.icon} className="w-full h-full object-contain p-2" alt={cls.name}/>
              ) : (
                <span className="text-4xl">{cls.icon || '❓'}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg text-gray-900">{cls.name}</h3>
              <p className="text-sm font-bold text-gray-500 uppercase">{cls.age} ans</p>
              <button 
                onClick={() => { setSyncToAll(false); setEditingClass(cls); }}
                className="mt-2 text-blue-600 text-[10px] font-black hover:underline uppercase tracking-widest"
              >
                MODIFIER INFOS
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-black mb-8 text-gray-900 tracking-tight uppercase">Réglages de Classe</h2>
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom de la classe</label>
                <input 
                  type="text" 
                  value={editingClass.name}
                  onChange={e => setEditingClass({...editingClass, name: e.target.value})}
                  className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-gray-900 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Icône (Emoji)</label>
                    <input 
                    type="text" 
                    value={editingClass.icon && editingClass.icon.length < 5 ? editingClass.icon : ''}
                    onChange={e => setEditingClass({...editingClass, icon: e.target.value})}
                    className="w-full border-2 border-gray-100 p-3 rounded-xl text-2xl text-center"
                    placeholder="🐾"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ou Image (Logo)</label>
                    <div className="relative h-full">
                        <input type="file" accept="image/*" onChange={handleIconUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 h-full flex items-center justify-center text-xs font-bold text-gray-400">
                           {editingClass.icon && editingClass.icon.length > 5 ? "✅ Photo" : "📁 Upload"}
                        </div>
                    </div>
                </div>
              </div>

              {/* Option de synchronisation globale */}
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                 <input 
                  type="checkbox" 
                  id="syncAll" 
                  checked={syncToAll} 
                  onChange={e => setSyncToAll(e.target.checked)} 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                 />
                 <label htmlFor="syncAll" className="text-[10px] font-black text-blue-900 uppercase leading-tight cursor-pointer">
                    Appliquer ce logo à TOUTES les classes du club {club}
                 </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setEditingClass(null)} className="px-6 py-2 text-gray-400 font-bold uppercase text-xs">Annuler</button>
              <button 
                onClick={handleSave}
                disabled={isSyncing}
                className={`bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition flex items-center gap-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSyncing ? 'Synchronisation...' : 'Enregistrer SQL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
