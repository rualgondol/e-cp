
import React, { useState } from 'react';
import { Student, Instructor } from '../types';
import { saveSupabaseConfig, checkConnection } from '../services/supabaseService';

interface LoginProps {
  onLogin: (type: 'admin' | 'student', id: string, role?: string) => void;
  students: Student[];
  instructors: Instructor[];
  dbStatus: 'loading' | 'connected' | 'error';
  isLoading: boolean;
}

const ScoutLogo = () => (
  <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
    <div className="absolute inset-0 bg-[#004225] rounded-full border-8 border-[#D4AF37] shadow-2xl flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,transparent_20%,#000_100%)]"></div>
      <div className="text-6xl drop-shadow-lg">⛺</div>
    </div>
    <div className="absolute -inset-2 border-[4px] border-dashed border-[#D4AF37]/40 rounded-full animate-[spin_30s_linear_infinite]"></div>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin, students, instructors, dbStatus, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  
  const [url, setUrl] = useState(localStorage.getItem('MJA_SUPABASE_URL') || '');
  const [key, setKey] = useState(localStorage.getItem('MJA_SUPABASE_ANON_KEY') || '');
  const [isTesting, setIsTesting] = useState(false);

  const isConnected = dbStatus === 'connected';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Admin Check
    const instructor = instructors.find(ins => ins.username.toLowerCase() === username.toLowerCase() && ins.password === password);
    if (instructor) {
      onLogin('admin', instructor.id, instructor.role);
      return;
    }

    // Student Check
    const student = students.find(s => {
      const nameMatch = s.fullName.toLowerCase() === username.toLowerCase();
      const pwdMatch = s.password === password || s.temporaryPassword === password;
      return nameMatch && pwdMatch;
    });

    if (student) {
      onLogin('student', student.id);
    } else {
      setError('Identifiants ou mot de passe incorrects');
    }
  };

  const handleSaveEmergencyConfig = async () => {
    setIsTesting(true);
    saveSupabaseConfig(url, key);
    const ok = await checkConnection();
    if (ok) {
      setShowConfig(false);
      window.location.reload();
    } else {
      alert("La connexion a échoué.");
    }
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#004225] p-6 relative font-sans overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-9xl">🌲</div>
        <div className="absolute bottom-10 right-10 text-9xl">🔥</div>
        <div className="absolute top-1/2 right-20 text-8xl">🧭</div>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-md border-t-[12px] border-[#D4AF37] relative overflow-hidden">
        <div className="absolute top-8 right-8 flex flex-col items-end gap-1 z-10">
            <button onClick={() => setShowConfig(!showConfig)} className="bg-white px-3 py-1.5 rounded-full border shadow-sm">
                <span className={`text-[7px] font-black uppercase tracking-widest ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                    {isConnected ? 'Cloud OK' : 'Cloud Off'}
                </span>
            </button>
        </div>

        {showConfig ? (
          <div className="animate-fade-in space-y-6">
             <h2 className="text-xl font-black text-center uppercase">Cloud Config</h2>
             <div className="space-y-4">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL Supabase" className="w-full border-2 border-gray-100 p-3 rounded-xl text-[10px]" />
                <textarea value={key} onChange={e => setKey(e.target.value)} placeholder="Clé Anon" className="w-full border-2 border-gray-100 p-3 rounded-xl text-[8px] h-20" />
                <button onClick={handleSaveEmergencyConfig} className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase">Connecter</button>
             </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <ScoutLogo />
              <h1 className="text-4xl font-black text-[#004225] tracking-tighter uppercase mb-2">e-CP MJA</h1>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-10 leading-tight">
                Classe progressive des clubs juniors MJA
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold text-sm" placeholder="Nom Complet du Jeune" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold text-sm" placeholder="Mot de passe" />
              {error && <p className="text-red-600 text-[10px] font-black text-center uppercase">{error}</p>}
              <button type="submit" className="w-full py-5 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.2em] bg-[#004225] shadow-xl">Se Connecter</button>
            </form>

            <div className="mt-12 text-center border-t pt-8">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Toujours prêt</p>
                <p className="text-[7px] text-gray-300 font-medium italic">Système de Classe Progressive JA</p>
            </div>
          </>
        )}
      </div>

      <footer className="mt-12 text-center text-white/50 text-[10px] font-bold uppercase tracking-widest max-w-lg">
        Copyright © 2026 e-CP MJA - Tous droits réservés. <br/>
        by Kuvasz Fidèle
      </footer>
    </div>
  );
};

export default Login;
