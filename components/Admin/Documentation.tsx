
import React, { useState } from 'react';
import { ClubType, Student, ClassLevel } from '../../types';

interface DocumentationProps {
  club: ClubType;
  students: Student[];
  classes: ClassLevel[];
}

const Documentation: React.FC<DocumentationProps> = ({ club, students, classes }) => {
  const [activeDocTab, setActiveDocTab] = useState<'system' | 'tech' | 'data' | 'deploy' | 'prod' | 'cheat'>('system');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const clubStudents = students.filter(s => classes.find(c => c.id === s.classId)?.club === club);

  const sqlScript = `
-- SCRIPT DE RÉINITIALISATION e-CP MJA
-- À exécuter dans l'éditeur SQL de Supabase pour une connexion parfaite.

-- Suppression propre si nécessaire
-- DROP TABLE IF EXISTS progress, messages, sessions, students, classes CASCADE;

-- 1. Table des Classes
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INT NOT NULL,
  club TEXT NOT NULL,
  icon TEXT
);

-- 2. Table des Étudiants
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "birthDate" TEXT,
  age INT,
  "classId" TEXT REFERENCES classes(id) ON DELETE SET NULL,
  photo TEXT,
  address TEXT,
  "motherName" TEXT,
  "fatherName" TEXT,
  "emergencyContacts" JSONB DEFAULT '[]'::jsonb,
  diseases TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  "passwordChanged" BOOLEAN DEFAULT FALSE,
  "temporaryPassword" TEXT
);

-- 3. Table des Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  club TEXT NOT NULL,
  "classId" TEXT REFERENCES classes(id) ON DELETE CASCADE,
  number INT NOT NULL,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  "availabilityDate" TEXT NOT NULL
);

-- 4. Table de Progression
CREATE TABLE IF NOT EXISTS progress (
  "studentId" TEXT REFERENCES students(id) ON DELETE CASCADE,
  "sessionId" TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  "completedSubjects" TEXT[] DEFAULT '{}',
  "completionDate" TEXT,
  PRIMARY KEY ("studentId", "sessionId")
);

-- 5. Table de Messagerie
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT FALSE
);

-- Insertion des classes de base indispensables
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
('ex6', 'Guide', 15, 'EXPLORATEURS', '🌟')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden h-[calc(100vh-220px)] flex flex-col">
      <div className="bg-gray-50 p-4 border-b flex gap-2 overflow-x-auto custom-scrollbar-h">
        {[
          { id: 'system', label: 'Structure', icon: '📂' },
          { id: 'deploy', label: 'Base de Données', icon: '⚡' },
          { id: 'prod', label: 'Mise en Production', icon: '🚀' },
          { id: 'tech', label: 'Infos Techniques', icon: '⚙️' },
          { id: 'cheat', label: 'Identifiants', icon: '🔑' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveDocTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 flex-shrink-0 ${activeDocTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-100'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
        {activeDocTab === 'system' && (
          <div className="max-w-4xl space-y-8 animate-fade-in">
            <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase border-l-4 border-blue-600 pl-4">Architecture e-CP MJA</h3>
            <p className="text-sm text-gray-500 font-medium">L'application fonctionne avec une synchronisation Cloud via Supabase :</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h4 className="font-black text-blue-900 text-xs uppercase mb-2">Supabase (Backend)</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">Stocke les élèves, les cours et les notes. C'est votre serveur sécurisé.</p>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <h4 className="font-black text-green-900 text-xs uppercase mb-2">Gemini AI</h4>
                    <p className="text-xs text-green-700 leading-relaxed">Génère automatiquement vos cours et vos quiz pour vous faire gagner du temps.</p>
                </div>
            </div>
          </div>
        )}

        {activeDocTab === 'deploy' && (
          <div className="max-w-4xl space-y-12 animate-fade-in">
            <header className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase border-l-4 border-blue-600 pl-4">Configuration SQL</h3>
                  <p className="text-sm text-gray-500 mt-2 font-medium">Script pour initialiser les tables sur Supabase (Respectez les guillemets) :</p>
                </div>
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl ${copyStatus === 'copied' ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                >
                  {copyStatus === 'copied' ? '✅ Script Copié !' : '📋 Copier le Script SQL'}
                </button>
            </header>

            <div className="bg-gray-900 text-green-400 p-8 rounded-2xl font-mono text-[9px] leading-relaxed overflow-x-auto shadow-2xl border border-gray-800">
              <pre>{sqlScript}</pre>
            </div>
          </div>
        )}

        {activeDocTab === 'prod' && (
          <div className="max-w-4xl space-y-12 animate-fade-in pb-20">
            <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase border-l-4 border-blue-600 pl-4">Connexion Vercel + Supabase</h3>
            
            <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-4">
                <div className="text-4xl">🚀</div>
                <h4 className="text-xl font-black uppercase tracking-tight">Vérifiez vos variables d'environnement</h4>
                <p className="text-sm opacity-90 leading-relaxed font-medium">
                    Dans votre projet Vercel, allez dans <b>Settings &gt; Environment Variables</b>. <br/>
                    L'intégration Supabase crée normalement ces variables :
                </p>
                <ul className="bg-white/10 p-4 rounded-2xl border border-white/20 text-xs font-mono space-y-1">
                    <li>NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                    <li>API_KEY (votre clé Gemini)</li>
                </ul>
                <div className="bg-yellow-500 text-white p-4 rounded-2xl text-xs font-bold">
                    ⚠️ IMPORTANT : Après avoir ajouté les variables dans Vercel, vous devez déclencher un nouveau déploiement (Redeploy).
                </div>
            </div>
          </div>
        )}

        {activeDocTab === 'tech' && (
          <div className="max-w-4xl space-y-8 animate-fade-in">
            <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase border-l-4 border-blue-600 pl-4">Diagnostic Technique</h3>
            <div className="bg-gray-900 text-blue-300 p-8 rounded-2xl font-mono text-sm leading-relaxed overflow-x-auto shadow-2xl border border-gray-800">
              <pre>{`
# État de la configuration :
Vercel URL: ${typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
Supabase Config: ${classes.length > 0 ? 'CONNECTÉ ✅' : 'NON CONNECTÉ ❌'}

# Frameworks utilisés :
- React 19 (ESM)
- Supabase SDK ^2.48
- Tailwind CSS
- Gemini 3 Flash AI
              `}</pre>
            </div>
          </div>
        )}

        {activeDocTab === 'cheat' && (
          <div className="max-w-5xl space-y-8 animate-fade-in">
            <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase border-l-4 border-blue-600 pl-4">Identifiants d'accès</h3>
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-blue-800 text-xs mb-6 flex items-center gap-3">
              <span className="text-xl">🔑</span>
              <p className="font-medium">Identifiants par défaut pour le Club {club === ClubType.AVENTURIERS ? 'Aventuriers' : 'Explorateurs'}.</p>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Rôle</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Identifiant</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Mot de Passe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-yellow-50/40">
                    <td className="px-6 py-4 font-black text-yellow-600 text-xs">ADMIN</td>
                    <td className="px-6 py-4 font-mono font-bold text-sm text-gray-900">admin</td>
                    <td className="px-6 py-4 font-mono font-bold text-sm text-gray-900">admin</td>
                  </tr>
                  {clubStudents.length > 0 ? clubStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">
                        {classes.find(c => c.id === s.classId)?.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-gray-800">{s.fullName}</td>
                      <td className="px-6 py-4 font-mono font-bold text-sm text-blue-600">
                        {s.passwordChanged ? "PERSONNALISÉ" : (s.temporaryPassword || 'N/A')}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-xs italic">Aucun élève enregistré. Allez dans l'onglet "Élèves" pour commencer.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation;
