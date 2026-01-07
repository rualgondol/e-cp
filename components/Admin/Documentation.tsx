
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
  
  // États pour Supabase
  const [url, setUrl] = useState(localStorage.getItem('MJA_SUPABASE_URL') || '');
  const [key, setKey] = useState(localStorage.getItem('MJA_SUPABASE_ANON_KEY') || '');
  
  // État pour Gemini
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('MJA_GEMINI_API_KEY') || '');
  
  const [saveMsg, setSaveMsg] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) saveSupabaseConfig(url, key);
    if (geminiKey) localStorage.setItem('MJA_GEMINI_API_KEY', geminiKey);

    setSaveMsg('✅ Configuration mise à jour avec succès !');
    setTimeout(() => {
      setSaveMsg('');
      if (url && key) window.location.reload();
    }, 1500);
  };

  const handleFullSync = async () => {
    if (dbStatus !== 'connected') {
      alert("Veuillez d'abord connecter et enregistrer votre base de données Supabase.");
      return;
    }

    if (!confirm("Voulez-vous envoyer toutes les données actuelles (élèves, séances, classes) vers Supabase ? Cela mettra à jour votre base de données cloud.")) return;

    setSyncLoading(true);
    try {
      // Synchronisation séquentielle pour éviter les erreurs de clés étrangères
      await db.syncClasses(classes);
      await db.syncInstructors(instructors);
      await db.syncStudents(students);
      await db.syncSessions(sessions);
      await db.syncProgress(progress);
      
      setSaveMsg('🚀 Synchronisation Cloud réussie !');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la synchronisation : " + (err instanceof Error ? err.message : "Inconnue"));
    } finally {
      setSyncLoading(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const fullSqlScript = `-- 1. Table des Classes
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  club TEXT NOT NULL,
  icon TEXT
);

-- 2. Table des Instructeurs
CREATE TABLE instructors (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'AVENTURIERS'
);

-- 3. Table des Élèves
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "birthDate" DATE,
  age INTEGER,
  "classId" TEXT REFERENCES classes(id),
  photo TEXT,
  address TEXT,
  "motherName" TEXT,
  "fatherName" TEXT,
  "emergencyContacts" JSONB DEFAULT '[]',
  diseases TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  "passwordChanged" BOOLEAN DEFAULT false,
  "temporaryPassword" TEXT
);

-- 4. Table des Séances
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  club TEXT NOT NULL,
  "classId" TEXT REFERENCES classes(id),
  number INTEGER,
  subjects JSONB DEFAULT '[]',
  "availabilityDate" DATE
);

-- 5. Table de Progression
CREATE TABLE progress (
  id BIGSERIAL PRIMARY KEY,
  "studentId" TEXT REFERENCES students(id) ON DELETE CASCADE,
  "sessionId" TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  score INTEGER,
  completed BOOLEAN DEFAULT false,
  "completedSubjects" TEXT[] DEFAULT '{}',
  "completionDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table des Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "isRead" BOOLEAN DEFAULT false
);

-- Insertion des classes de base
INSERT INTO classes (id, name, age, club, icon) VALUES
('av1', 'Petit Agneau', 4, 'AVENTURIERS', '🐑'),
('av2', 'Castor Enthousiaste', 5, 'AVENTURIERS', '🦫'),
('av3', 'Abeille Active', 6, 'AVENTURIERS', '🐝'),
('av4', 'Rayon de Soleil', 7, 'AVENTURIERS', '☀️'),
('av5', 'Constructeur', 8, 'AVENTURIERS', '🛠️'),
('av6', 'Main Utile', 9, 'AVENTURIERS', '✋'),
('ex1', 'Ami', 10, 'EXPLORATEURS', '🤝'),
('ex2', 'Compagnon', 11, 'EXPLORATEURS', '🧭'),
('ex3', 'Explorateur', 12, 'EXPLORATEURS', '⛺'),
('ex4', 'Pionnier', 13, 'EXPLORATEURS', '🔥'),
('ex5', 'Voyageur', 14, 'EXPLORATEURS', '🗺️'),
('ex6', 'Guide', 15, 'EXPLORATEURS', '🌟');
`;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden h-[calc(100vh-220px)] flex flex-col">
      <div className="bg-gray-50 p-4 border-b flex gap-2 overflow-x-auto">
        {[
          { id: 'system', label: 'Structure', icon: '📂' },
          { id: 'config', label: 'Configuration Cloud', icon: '☁️' },
          { id: 'deploy', label: 'Script SQL Complet', icon: '⚡' },
          { id: 'cheat', label: 'Identifiants', icon: '🔑' },
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

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {activeDocTab === 'config' && (
          <div className="max-w-xl space-y-8 animate-fade-in">
            <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase border-l-4 border-blue-600 pl-4">Services Cloud & IA</h3>
            
            <form onSubmit={handleSaveConfig} className="space-y-8">
              {/* Section Supabase */}
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 space-y-6 shadow-inner relative">
                 <div className="absolute top-8 right-8 flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${dbStatus === 'connected' ? 'text-green-600' : 'text-red-500'}`}>
                        {dbStatus === 'connected' ? 'Connecté' : 'Erreur'}
                    </span>
                    <div className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                 </div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🗄️</span>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Base de données Supabase</h4>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">URL du Projet</label>
                    <input 
                      type="text" value={url} onChange={e => setUrl(e.target.value)}
                      placeholder="https://votre-projet.supabase.co"
                      className="w-full border-2 border-gray-100 p-4 rounded-2xl font-mono text-xs focus:border-blue-500 outline-none shadow-sm"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Clé API Publique (anon key)</label>
                    <textarea 
                      value={key} onChange={e => setKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full border-2 border-gray-100 p-4 rounded-2xl font-mono text-xs h-24 focus:border-blue-500 outline-none shadow-sm"
                    />
                 </div>
              </div>

              {/* Section Gemini */}
              <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6 shadow-inner relative">
                 <div className="absolute top-8 right-8 flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${geminiKey ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {geminiKey ? 'Clé Active' : 'Manquante'}
                    </span>
                    <div className={`w-2.5 h-2.5 rounded-full ${geminiKey ? 'bg-indigo-500 animate-pulse' : 'bg-gray-300'}`} />
                 </div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">✨</span>
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Intelligence Artificielle (Gemini)</h4>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2 ml-2">Clé API Google Gemini</label>
                    <input 
                      type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full border-2 border-indigo-100 p-4 rounded-2xl font-mono text-xs focus:border-indigo-500 outline-none shadow-sm"
                    />
                 </div>
              </div>

               {saveMsg && (
                 <p className="text-[10px] font-black text-center uppercase p-3 rounded-xl text-green-600 bg-green-50 animate-pulse">
                   {saveMsg}
                 </p>
               )}
               
               <div className="flex flex-col gap-4">
                  <button type="submit" className="w-full bg-[#004225] text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all">
                      ⚡ Enregistrer la configuration
                  </button>

                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 space-y-4">
                     <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Outil de Migration</p>
                     <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Si votre base de données est vide, cliquez sur le bouton ci-dessous pour envoyer vos données actuelles vers Supabase.
                     </p>
                     <button 
                        type="button"
                        onClick={handleFullSync}
                        disabled={syncLoading || dbStatus !== 'connected'}
                        className="w-full bg-amber-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-amber-600 disabled:opacity-50"
                     >
                        {syncLoading ? '🚀 Synchronisation en cours...' : '⬆️ Pousser les données vers le Cloud'}
                     </button>
                  </div>
               </div>
            </form>
          </div>
        )}

        {activeDocTab === 'system' && (
          <div className="max-w-4xl space-y-8 animate-fade-in">
            <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase border-l-4 border-blue-600 pl-4">Architecture e-CP MJA</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-sm">
                    <h4 className="font-black text-blue-900 text-xs uppercase mb-3 tracking-widest">🌐 Centralisation</h4>
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                        Toutes les données sont synchronisées en temps réel. Un changement effectué par un instructeur est immédiatement visible par l'élève.
                    </p>
                </div>
                <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100 shadow-sm">
                    <h4 className="font-black text-green-900 text-xs uppercase mb-3 tracking-widest">👤 Multi-Instructeurs</h4>
                    <p className="text-xs text-green-700 leading-relaxed font-medium">
                        Créez des accès spécifiques pour les chefs de club. L'instructeur Aventuriers ne peut pas interférer avec les Explorateurs.
                    </p>
                </div>
            </div>
          </div>
        )}

        {activeDocTab === 'deploy' && (
          <div className="max-w-4xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-800 uppercase border-l-4 border-blue-600 pl-4">Script d'Installation SQL</h3>
                <button 
                  onClick={() => { navigator.clipboard.writeText(fullSqlScript); alert('Copié !'); }}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-gray-200"
                >
                    📋 COPIER LE SCRIPT
                </button>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {"Allez dans votre tableau de bord Supabase > SQL Editor > New Query, collez ce script et cliquez sur Run."}
            </p>
            <div className="bg-gray-900 text-green-400 p-8 rounded-3xl font-mono text-[11px] overflow-x-auto shadow-2xl border-4 border-gray-800">
              <pre className="leading-relaxed">{fullSqlScript}</pre>
            </div>
          </div>
        )}

        {activeDocTab === 'cheat' && (
          <div className="max-w-xl mx-auto py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">🔑</div>
            <h3 className="text-xl font-black text-gray-800 uppercase">Gestion des Accès</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Utilisez l'onglet <b>Utilisateurs</b> du menu principal (Sidebar) pour :
            </p>
            <ul className="text-left text-xs space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100 font-bold text-gray-600">
                <li>• Changer le mot de passe de l'administrateur principal</li>
                <li>• Créer des comptes pour les instructeurs de club</li>
                <li>• Supprimer des accès obsolètes</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation;
