
import React, { useState } from 'react';
import { ClubType, Student, ClassLevel, Session, Progress, Instructor } from '../../types';
import { THEMES } from '../../constants';

interface DocumentationProps {
  club: ClubType;
  students: Student[];
  classes: ClassLevel[];
  sessions: Session[];
  progress: Progress[];
  instructors: Instructor[];
  dbStatus: 'loading' | 'connected' | 'error';
  onManualSync: () => void;
  clubLogos: Record<ClubType, string>;
  setClubLogos: React.Dispatch<React.SetStateAction<Record<ClubType, string>>>;
}

const Documentation: React.FC<DocumentationProps> = ({ club, students, classes, sessions, progress, instructors, dbStatus, onManualSync, clubLogos, setClubLogos }) => {
  const [activeDocTab, setActiveDocTab] = useState<'system' | 'hosting' | 'cheat' | 'settings'>('system');

  const fullSqlScript = `
-- STRUCTURE DE BASE e-CP MJA
CREATE TABLE IF NOT EXISTS classes (id TEXT PRIMARY KEY, name TEXT NOT NULL, age INTEGER, club TEXT NOT NULL, icon TEXT);
CREATE TABLE IF NOT EXISTS instructors (id TEXT PRIMARY KEY, "fullName" TEXT NOT NULL, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'AVENTURIERS');
CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, "fullName" TEXT NOT NULL, "birthDate" DATE, age INTEGER, "classId" TEXT REFERENCES classes(id), photo TEXT, address TEXT, "motherName" TEXT, "fatherName" TEXT, "emergencyContacts" JSONB DEFAULT '[]', diseases TEXT[] DEFAULT '{}', allergies TEXT[] DEFAULT '{}', medications TEXT[] DEFAULT '{}', "passwordChanged" BOOLEAN DEFAULT false, "temporaryPassword" TEXT);
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, club TEXT NOT NULL, "classId" TEXT REFERENCES classes(id), number INTEGER, subjects JSONB DEFAULT '[]', "availabilityDate" DATE);
CREATE TABLE IF NOT EXISTS progress (id BIGSERIAL PRIMARY KEY, "studentId" TEXT REFERENCES students(id) ON DELETE CASCADE, "sessionId" TEXT REFERENCES sessions(id) ON DELETE CASCADE, score INTEGER, completed BOOLEAN DEFAULT false, "completedSubjects" TEXT[] DEFAULT '{}', "completionDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE("studentId", "sessionId"));
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, "senderId" TEXT NOT NULL, "receiverId" TEXT NOT NULL, content TEXT NOT NULL, timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "isRead" BOOLEAN DEFAULT false);
CREATE TABLE IF NOT EXISTS club_config (id TEXT PRIMARY KEY, logo TEXT, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- MISE À JOUR ICONES LONGUES
ALTER TABLE classes ALTER COLUMN icon TYPE TEXT;
`;

  const handleLogoUpload = (targetClub: ClubType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClubLogos(prev => ({ ...prev, [targetClub]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogos = () => {
    if (confirm("Réinitialiser les logos par défaut ?")) {
      setClubLogos({
        [ClubType.AVENTURIERS]: THEMES[ClubType.AVENTURIERS].logo,
        [ClubType.EXPLORATEURS]: THEMES[ClubType.EXPLORATEURS].logo
      });
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden h-[calc(100vh-220px)] flex flex-col">
      <div className="bg-gray-50/50 p-6 border-b flex justify-between items-center overflow-x-auto">
        <div className="flex gap-2 md:gap-4 shrink-0">
          {[
            { id: 'system', label: 'Architecture' },
            { id: 'hosting', label: 'Déploiement' },
            { id: 'cheat', label: 'Codes Jeunes' },
            { id: 'settings', label: 'Logos Club' }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveDocTab(t.id as any)} 
              className={`px-4 md:px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeDocTab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onManualSync} className="hidden sm:block bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl shrink-0">🔄 Synchronisation</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        {activeDocTab === 'settings' && (
          <div className="max-w-4xl space-y-12 animate-fade-in">
             <div className="space-y-4">
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Personnalisation des Clubs</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Téléchargez ici les logos officiels de votre fédération pour chaque club. Ces images apparaîtront dans les menus et portails.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Aventuriers Logo Config */}
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6 flex flex-col items-center text-center">
                   <p className="text-[10px] font-black text-[#002366] uppercase tracking-widest">Logo Aventuriers</p>
                   <div className="w-32 h-32 bg-white rounded-3xl border shadow-inner flex items-center justify-center overflow-hidden p-4">
                      <img src={clubLogos[ClubType.AVENTURIERS]} className="w-full h-full object-contain" alt="Aventuriers" />
                   </div>
                   <div className="w-full">
                      <label className="w-full block bg-white border-2 border-dashed border-gray-300 p-4 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                         <span className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 uppercase">Changer l'image</span>
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(ClubType.AVENTURIERS, e)} />
                      </label>
                   </div>
                </div>

                {/* Explorateurs Logo Config */}
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6 flex flex-col items-center text-center">
                   <p className="text-[10px] font-black text-[#004225] uppercase tracking-widest">Logo Explorateurs</p>
                   <div className="w-32 h-32 bg-white rounded-3xl border shadow-inner flex items-center justify-center overflow-hidden p-4">
                      <img src={clubLogos[ClubType.EXPLORATEURS]} className="w-full h-full object-contain" alt="Explorateurs" />
                   </div>
                   <div className="w-full">
                      <label className="w-full block bg-white border-2 border-dashed border-gray-300 p-4 rounded-2xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group">
                         <span className="text-[10px] font-black text-gray-400 group-hover:text-green-600 uppercase">Changer l'image</span>
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(ClubType.EXPLORATEURS, e)} />
                      </label>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t flex justify-center">
                <button onClick={resetLogos} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Réinitialiser les logos par défaut</button>
             </div>
          </div>
        )}

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
                         <li>• Quill 2.0 (Édition structurée)</li>
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
