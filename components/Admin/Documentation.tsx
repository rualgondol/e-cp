
import React, { useState } from 'react';
import { ClubType, Student, ClassLevel, Session, Progress, Instructor } from '../../types';

interface DocumentationProps {
  club: ClubType;
  students: Student[];
  classes: ClassLevel[];
  sessions: Session[];
  progress: Progress[];
  instructors: Instructor[];
  dbStatus: 'loading' | 'connected' | 'error';
  onManualSync: () => void;
}

const Documentation: React.FC<DocumentationProps> = ({ club, students, classes, sessions, progress, instructors, dbStatus, onManualSync }) => {
  const [activeDocTab, setActiveDocTab] = useState<'system' | 'hosting' | 'cheat'>('system');

  const fullSqlScript = `
-- STRUCTURE DE BASE e-CP MJA
CREATE TABLE IF NOT EXISTS classes (id TEXT PRIMARY KEY, name TEXT NOT NULL, age INTEGER, club TEXT NOT NULL, icon TEXT);
CREATE TABLE IF NOT EXISTS instructors (id TEXT PRIMARY KEY, "fullName" TEXT NOT NULL, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'AVENTURIERS');
CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, "fullName" TEXT NOT NULL, "birthDate" DATE, age INTEGER, "classId" TEXT REFERENCES classes(id), photo TEXT, address TEXT, "motherName" TEXT, "fatherName" TEXT, "emergencyContacts" JSONB DEFAULT '[]', diseases TEXT[] DEFAULT '{}', allergies TEXT[] DEFAULT '{}', medications TEXT[] DEFAULT '{}', "passwordChanged" BOOLEAN DEFAULT false, "temporaryPassword" TEXT);
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, club TEXT NOT NULL, "classId" TEXT REFERENCES classes(id), number INTEGER, subjects JSONB DEFAULT '[]', "availabilityDate" DATE);
CREATE TABLE IF NOT EXISTS progress (id BIGSERIAL PRIMARY KEY, "studentId" TEXT REFERENCES students(id) ON DELETE CASCADE, "sessionId" TEXT REFERENCES sessions(id) ON DELETE CASCADE, score INTEGER, completed BOOLEAN DEFAULT false, "completedSubjects" TEXT[] DEFAULT '{}', "completionDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE("studentId", "sessionId"));
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, "senderId" TEXT NOT NULL, "receiverId" TEXT NOT NULL, content TEXT NOT NULL, timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "isRead" BOOLEAN DEFAULT false);
`;

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden h-[calc(100vh-220px)] flex flex-col">
      <div className="bg-gray-50/50 p-6 border-b flex justify-between items-center">
        <div className="flex gap-4">
          {['system', 'hosting', 'cheat'].map(t => (
            <button key={t} onClick={() => setActiveDocTab(t as any)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeDocTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>
              {t === 'system' ? 'Architecture' : t === 'hosting' ? 'Déploiement' : 'Aide-mémoire'}
            </button>
          ))}
        </div>
        <button onClick={onManualSync} className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl">🔄 Synchronisation Manuelle</button>
      </div>

      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        {activeDocTab === 'system' && (
          <div className="max-w-4xl space-y-12 animate-fade-in">
             <section className="space-y-4">
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Architecture & Technologies</h3>
                <p className="text-gray-500 leading-relaxed font-medium">L'application est une Single Page Application (SPA) bâtie sur une architecture moderne Cloud-Native.</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Frontend</p>
                      <ul className="text-xs font-bold text-gray-700 space-y-1">
                         <li>• React 19 (Hooks & Context)</li>
                         <li>• Tailwind CSS (Design System)</li>
                         <li>• Editor.js (Édition structurée)</li>
                      </ul>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-green-600 uppercase mb-2">Backend & IA</p>
                      <ul className="text-xs font-bold text-gray-700 space-y-1">
                         <li>• Supabase (DB PostgreSQL Realtime)</li>
                         <li>• Gemini Pro (Génération de cours)</li>
                         <li>• Vercel (Hébergement Serverless)</li>
                      </ul>
                   </div>
                </div>
             </section>

             <section className="space-y-4">
                <h4 className="text-xl font-black text-gray-800 uppercase">Script SQL (Tables)</h4>
                <div className="bg-gray-900 p-6 rounded-3xl text-green-400 font-mono text-[9px] overflow-x-auto whitespace-pre-wrap">
                   {fullSqlScript}
                </div>
             </section>
          </div>
        )}

        {activeDocTab === 'cheat' && (
          <div className="space-y-8 animate-fade-in">
             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Aide-mémoire Accès Jeunes</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {students.sort((a,b) => a.fullName.localeCompare(b.fullName)).map(s => (
                  <div key={s.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex justify-between items-center">
                     <div>
                        <p className="font-black text-gray-900 text-sm">{s.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{classes.find(c => c.id === s.classId)?.name}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase">MDP Temporaire</p>
                        <p className="font-mono text-xs bg-white px-2 py-1 rounded-lg border">{s.temporaryPassword || "Modifié"}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeDocTab === 'hosting' && (
          <div className="max-w-2xl space-y-8 animate-fade-in">
             <h3 className="text-2xl font-black text-gray-900 uppercase">Guide d'Hébergement</h3>
             <div className="space-y-6">
                <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 space-y-4">
                   <p className="text-blue-900 font-bold text-sm">Hébergement Vercel (Gratuit) :</p>
                   <ol className="text-xs text-blue-800 font-medium space-y-2">
                      <li>1. Connectez votre compte GitHub à Vercel.</li>
                      <li>2. Importez le dépôt du projet.</li>
                      <li>3. Configurez les variables <code className="bg-white/50 px-1">VITE_SUPABASE_URL</code> et <code className="bg-white/50 px-1">VITE_SUPABASE_ANON_KEY</code>.</li>
                      <li>4. Déployez.</li>
                   </ol>
                </div>
                <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 space-y-4">
                   <p className="text-orange-900 font-bold text-sm">Base de données Supabase :</p>
                   <p className="text-xs text-orange-800 font-medium">Créez un projet Supabase gratuit, allez dans l'onglet SQL Editor, et collez le script fourni dans l'onglet Architecture pour initialiser les tables.</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation;
