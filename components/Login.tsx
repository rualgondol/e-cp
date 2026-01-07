
import React, { useState } from 'react';
import { Student } from '../types';

interface LoginProps {
  onLogin: (type: 'admin' | 'student', id: string) => void;
  students: Student[];
  dbStatus: 'loading' | 'connected' | 'error';
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, students, dbStatus, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isConnected = dbStatus === 'connected';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // On permet la connexion même si non connecté au cloud (mode démo/local)
    
    if (username === 'admin' && password === 'admin') {
      onLogin('admin', 'admin');
    } else {
      const student = students.find(s => s.fullName.toLowerCase() === username.toLowerCase());
      if (student) {
        onLogin('student', student.id);
      } else {
        setError('Identifiants incorrects');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#004225] p-6 relative font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border-t-8 border-yellow-500 relative overflow-hidden animate-scale-in">
        
        {/* Indicateur de Statut Cloud */}
        <div className="absolute top-8 right-8 flex flex-col items-end gap-1 z-10">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                <span className={`text-[7px] font-black uppercase tracking-widest ${isConnected ? 'text-blue-600' : dbStatus === 'loading' ? 'text-gray-400' : 'text-red-500'}`}>
                    {isConnected ? 'Cloud Connecté' : dbStatus === 'loading' ? 'Connexion...' : 'Mode Local (Offline)'}
                </span>
                <div 
                    className={`w-2.5 h-2.5 rounded-full shadow-lg transition-all duration-700 ${
                        isConnected ? 'bg-blue-500 animate-pulse shadow-blue-200' : 
                        dbStatus === 'loading' ? 'bg-gray-300 animate-bounce' : 
                        'bg-red-500 shadow-red-200 animate-ping'
                    }`}
                />
            </div>
        </div>

        <div className="text-center mb-10">
          <div className="w-28 h-28 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-100 group overflow-hidden p-3">
             {/* Logo SVG: Table et Chaise en bois et cordes (Astuce Scout) */}
             <svg viewBox="0 0 100 100" className="w-full h-full group-hover:rotate-3 transition-transform duration-500">
                <rect x="20" y="45" width="60" height="5" rx="1" fill="#5D4037" />
                <rect x="25" y="48" width="4" height="35" rx="1" fill="#795548" />
                <rect x="71" y="48" width="4" height="35" rx="1" fill="#795548" />
                <rect x="40" y="60" width="20" height="3" rx="0.5" fill="#8D6E63" />
                <rect x="42" y="63" width="2.5" height="20" rx="0.5" fill="#A1887F" />
                <rect x="55.5" y="63" width="2.5" height="20" rx="0.5" fill="#A1887F" />
                <rect x="42" y="48" width="2.5" height="12" rx="0.5" fill="#A1887F" />
                <rect x="55.5" y="48" width="2.5" height="12" rx="0.5" fill="#A1887F" />
                <rect x="42" y="52" width="16" height="3" rx="0.5" fill="#8D6E63" />
                <circle cx="27" cy="48" r="2.5" fill="none" stroke="#D7CCC8" strokeWidth="1.5" strokeDasharray="1,1" />
                <circle cx="73" cy="48" r="2.5" fill="none" stroke="#D7CCC8" strokeWidth="1.5" strokeDasharray="1,1" />
                <circle cx="43.2" cy="61" r="1.5" fill="none" stroke="#EFEBE9" strokeWidth="1" />
                <circle cx="56.7" cy="61" r="1.5" fill="none" stroke="#EFEBE9" strokeWidth="1" />
                <ellipse cx="50" cy="85" rx="35" ry="3" fill="#000000" opacity="0.05" />
             </svg>
          </div>
          <h1 className="text-3xl font-black text-[#004225] tracking-tighter uppercase leading-none">e-CP MJA</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.02em] mt-4 leading-tight">
             Classe progressive des clubs junior de la MJA
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="transition-all duration-500">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Identifiant (Nom complet)</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all shadow-inner placeholder:text-gray-300 text-sm" 
              placeholder="Ex: Jean Dupont"
            />
          </div>
          
          <div className="transition-all duration-500">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all shadow-inner placeholder:text-gray-300 text-sm" 
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-600 text-[10px] font-black text-center uppercase tracking-widest bg-red-50 p-2 rounded-lg animate-shake">{error}</p>}
          
          <div className="relative pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-2xl transition-all relative overflow-hidden group bg-[#004225] hover:bg-[#005530] hover:scale-[1.02] active:scale-95`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                    <>
                        <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-white rounded-full animate-spin"/> 
                        <span>Vérification...</span>
                    </>
                ) : (
                    <>🚀 Accéder au Portail</>
                )}
              </div>
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
            <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.2em] leading-relaxed">
               PLATEFORME e-CP MJA • Kuvasz Fidèle
            </p>
        </div>
      </div>
      
      <footer className="mt-12 text-center px-6">
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.1em] leading-relaxed max-w-sm">
             Copyright © 2026 e-CP MJA - Tous droits réservés. <br/>
             Système de Classe Progressive JA. - by Kuvasz Fidèle
          </p>
      </footer>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
