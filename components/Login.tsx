
import React, { useState, useEffect } from 'react';
import { Student, Instructor } from '../types';
import { saveSupabaseConfig, checkConnection } from '../services/supabaseService';

interface LoginProps {
  onLogin: (type: 'admin' | 'student', id: string, role?: string) => void;
  students: Student[];
  instructors: Instructor[];
  dbStatus: 'loading' | 'connected' | 'error';
  isLoading: boolean;
}

const WoodLogo = () => (
  <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
    {/* Texture Bois Circulaire */}
    <div className="absolute inset-0 bg-[#5D4037] rounded-full border-8 border-[#3E2723] shadow-2xl flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,transparent_20%,#000_100%)]"></div>
      <div className="text-5xl drop-shadow-lg">🏛️</div>
    </div>
    {/* Corde autour */}
    <div className="absolute -inset-2 border-[6px] border-dashed border-[#D7CCC8] rounded-full opacity-40 animate-[spin_20s_linear_infinite]"></div>
    <div className="absolute -inset-4 border-2 border-[#A1887F] rounded-full opacity-20"></div>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin, students, instructors, dbStatus, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  
  // États pour la config d'urgence
  const [url, setUrl] = useState(localStorage.getItem('MJA_SUPABASE_URL') || '');
  const [key, setKey] = useState(localStorage.getItem('MJA_SUPABASE_ANON_KEY') || '');
  const [isTesting, setIsTesting] = useState(false);

  const isConnected = dbStatus === 'connected';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Vérification instructeurs
    const instructor = instructors.find(ins => ins.username.toLowerCase() === username.toLowerCase() && ins.password === password);
    if (instructor) {
      onLogin('admin', instructor.id, instructor.role);
      return;
    }

    // Vérification élèves
    const student = students.find(s => s.fullName.toLowerCase() === username.toLowerCase());
    if (student) {
      onLogin('student', student.id);
    } else {
      setError('Identifiants incorrects ou non synchronisés avec le cloud');
    }
  };

  const handleSaveEmergencyConfig = async () => {
    setIsTesting(true);
    saveSupabaseConfig(url, key);
    const ok = await checkConnection();
    if (ok) {
      setShowConfig(false);
      window.location.reload(); // Recharger pour appliquer partout
    } else {
      alert("La connexion a échoué. Vérifiez vos clés Supabase.");
    }
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#004225] p-6 relative font-sans overflow-hidden">
      {/* Motifs de fond stylisés (nature) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-9xl">🌲</div>
        <div className="absolute bottom-10 right-10 text-9xl">⛺</div>
        <div className="absolute top-1/2 right-20 text-8xl">🧭</div>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-md border-t-[12px] border-[#D4AF37] relative overflow-hidden animate-scale-in">
        
        <div className="absolute top-8 right-8 flex flex-col items-end gap-1 z-10">
            <button 
                onClick={() => setShowConfig(!showConfig)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all hover:bg-gray-50 active:scale-95 bg-white"
            >
                <span className={`text-[7px] font-black uppercase tracking-widest ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                    {isConnected ? 'Cloud Connecté' : 'Hors Ligne'}
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-700 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            </button>
        </div>

        {showConfig ? (
          <div className="animate-fade-in space-y-6">
             <div className="text-center mb-6">
                <h2 className="text-xl font-black text-gray-800 uppercase">Config Cloud d'urgence</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Collez vos clés Supabase ici pour forcer la connexion</p>
             </div>
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">URL du Projet</label>
                   <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://xyz.supabase.co" className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-[10px] outline-none focus:border-blue-500" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Clé Anon (Public)</label>
                   <textarea value={key} onChange={e => setKey(e.target.value)} placeholder="eyJhbG..." className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-[8px] h-20 outline-none focus:border-blue-500" />
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setShowConfig(false)} className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase bg-gray-100 text-gray-500">Annuler</button>
                   <button onClick={handleSaveEmergencyConfig} disabled={isTesting} className="flex-[2] py-3 rounded-xl text-[10px] font-black uppercase bg-blue-600 text-white shadow-lg">
                      {isTesting ? '⌛ Test...' : 'Sauvegarder & Connecter'}
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <WoodLogo />
              <h1 className="text-4xl font-black text-[#004225] tracking-tighter uppercase leading-none mb-2">e-CP MJA</h1>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-10">
                Système de Classe Progressive
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-4">Nom de l'élève ou Instructeur</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-[#004225] focus:bg-white transition-all text-sm" 
                  placeholder="ex: Jean Dupont"
                />
              </div>
              
              <div className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-4">Mot de passe</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-[#004225] focus:bg-white transition-all text-sm" 
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-red-600 text-[10px] font-black text-center uppercase bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.2em] bg-[#004225] hover:bg-[#00331a] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:scale-100"
              >
                {isLoading ? '⌛ Synchronisation...' : 'Se Connecter'}
              </button>
            </form>

            <div className="mt-12 text-center border-t pt-8">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                  Fédération Adventiste • MJA
                </p>
                <p className="text-[7px] text-gray-300 font-medium italic">
                  Protection des données par chiffrement cloud
                </p>
            </div>
          </>
        )}
      </div>

      <footer className="mt-12 text-center text-white/50 text-[10px] font-bold uppercase tracking-widest animate-fade-in max-w-lg leading-relaxed">
        Copyright © 2026 e-CP MJA - Tous droits réservés. <br/>
        Système de Classe Progressive JA. - by Kuvasz Fidèle
      </footer>
    </div>
  );
};

export default Login;
