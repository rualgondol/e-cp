
import React, { useState } from 'react';
import { ClubType, Student, ClassLevel, Session, Progress, Instructor } from '../../types';
import { saveSupabaseConfig, db } from '../../services/supabaseService';

interface DocumentationProps {
  club: ClubType;
  students: Student[];
  classes: ClassLevel[];
  sessions: Session[];
  progress: Progress[];
  instructors: Instructor[];
  dbStatus: 'loading' | 'connected' | 'error';
}

const Documentation: React.FC<DocumentationProps> = ({ club, students, classes, sessions, progress, instructors, dbStatus }) => {
  const [activeDocTab, setActiveDocTab] = useState<'system' | 'config' | 'deploy' | 'cheat'>('system');
  
  const [url, setUrl] = useState(localStorage.getItem('MJA_SUPABASE_URL') || '');
  const [key, setKey] = useState(localStorage.getItem('MJA_SUPABASE_ANON_KEY') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('MJA_GEMINI_API_KEY') || '');
  const [saveMsg, setSaveMsg] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) saveSupabaseConfig(url, key);
    if (geminiKey) localStorage.setItem('MJA_GEMINI_API_KEY', geminiKey);

    setSaveMsg('✅ Configuration locale mise à jour !');
    setTimeout(() => {
      setSaveMsg('');
      if (url && key) window.location.reload();
    }, 1500);
  };

  const handleFullSync = async () => {
    if (dbStatus !== 'connected') {
      alert("Veuillez d'abord connecter votre base de données Supabase.");
      return;
    }
    if (!confirm("Voulez-vous migrer vos données vers le Cloud ?")) return;

    setSyncLoading(true);
    try {
      await db.syncClasses(classes);
      await db.syncInstructors(instructors);
      await db.syncStudents(students);
      await db.syncSessions(sessions);
      await db.syncProgress(progress);
      setSaveMsg('🚀 Migration Cloud réussie !');
    } catch (err) {
      alert("Erreur de migration.");
    } finally {
      setSyncLoading(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden h-[calc(100vh-220px)] flex flex-col">
      <div className="bg-gray-50 p-4 border-b flex gap-2 overflow-x-auto">
        {[
          { id: 'system', label: 'Architecture', icon: '🏛️' },
          { id: 'config', label: 'Migration', icon: '💾' },
          { id: 'deploy', label: 'Déploiement Vercel', icon: '🚀' },
          { id: 'cheat', label: 'Sécurité', icon: '🛡️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveDocTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 flex-shrink-0 ${activeDocTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-100'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-sans">
        {activeDocTab === 'deploy' && (
          <div className="max-w-3xl space-y-10 animate-fade-in">
             <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -top-20 text-[15rem] opacity-10">🚀</div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Connexion Permanente sur Vercel</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">
                  Pour que vos élèves se connectent automatiquement, vous devez renommer vos variables avec le préfixe <strong>VITE_</strong> dans le tableau de bord Vercel.
                </p>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Procédure Correcte :</p>
                   <ol className="text-xs space-y-3 font-bold">
                      <li>1. Allez sur Vercel.com et ouvrez votre projet.</li>
                      <li>2. Allez dans <strong>Settings</strong> puis <strong>Environment Variables</strong>.</li>
                      <li>3. Ajoutez <code className="bg-white/20 px-2 py-0.5 rounded">VITE_SUPABASE_URL</code> avec votre URL.</li>
                      <li>4. Ajoutez <code className="bg-white/20 px-2 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> avec votre Clé Anon.</li>
                      <li>5. <strong>IMPORTANT :</strong> Relancez un déploiement pour appliquer les changements.</li>
                   </ol>
                </div>
             </div>
          </div>
        )}

        {activeDocTab === 'config' && (
          <div className="max-w-xl space-y-8 animate-fade-in">
            <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase border-l-4 border-blue-600 pl-4">Configuration Manuelle</h3>
            <form onSubmit={handleSaveConfig} className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 space-y-6 shadow-inner">
                 <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">⚙️ Configuration Locale</h4>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">URL du Projet</label>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full border-2 border-gray-100 p-4 rounded-2xl font-mono text-xs focus:border-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Clé API (anon)</label>
                    <textarea value={key} onChange={e => setKey(e.target.value)} placeholder="eyJ..." className="w-full border-2 border-gray-100 p-4 rounded-2xl font-mono text-xs h-20 focus:border-blue-500 outline-none" />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Sauvegarder dans ce navigateur</button>
              </div>
              
              {saveMsg && <p className="text-green-600 font-bold text-center text-xs">{saveMsg}</p>}

              <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 space-y-4">
                  <button type="button" onClick={handleFullSync} disabled={syncLoading || dbStatus !== 'connected'} className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-[11px] uppercase shadow-xl disabled:opacity-30">
                    {syncLoading ? '🚀 Synchronisation...' : '⬆️ Envoyer vers Supabase'}
                  </button>
               </div>
            </form>
          </div>
        )}

        {activeDocTab === 'system' && (
          <div className="max-w-4xl space-y-8 animate-fade-in text-center py-10">
            <div className="text-6xl mb-6">🌩️</div>
            <h3 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Cloud Native</h3>
            <p className="max-w-2xl mx-auto text-gray-500 font-medium leading-relaxed">
               Le système e-CP MJA utilise Supabase pour stocker les données de 140 élèves. 
               Une fois que vos variables <strong>VITE_</strong> sont configurées sur Vercel, 
               tout le monde accède à la même base de données instantanément.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation;
