
import React, { useState } from 'react';
import { Student, Instructor } from '../types';

interface LoginProps {
  onLogin: (type: 'admin' | 'student', id: string, role?: string) => void;
  students: Student[];
  instructors: Instructor[];
  dbStatus: 'loading' | 'connected' | 'error';
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, students, instructors, dbStatus, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isConnected = dbStatus === 'connected';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification instructeurs
    const instructor = instructors.find(ins => ins.username === username && ins.password === password);
    if (instructor) {
      onLogin('admin', instructor.id, instructor.role);
      return;
    }

    // Vérification élèves
    const student = students.find(s => s.fullName.toLowerCase() === username.toLowerCase());
    if (student) {
      onLogin('student', student.id);
    } else {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#004225] p-6 relative font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border-t-8 border-yellow-500 relative overflow-hidden animate-scale-in">
        
        <div className="absolute top-8 right-8 flex flex-col items-end gap-1 z-10">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                <span className={`text-[7px] font-black uppercase tracking-widest ${isConnected ? 'text-blue-600' : dbStatus === 'loading' ? 'text-gray-400' : 'text-red-500'}`}>
                    {isConnected ? 'Cloud Connecté' : dbStatus === 'loading' ? 'Connexion...' : 'Mode Local'}
                </span>
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${isConnected ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
        </div>

        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-100">
             <svg viewBox="0 0 100 100" className="w-16 h-16">
                <rect x="20" y="45" width="60" height="5" rx="1" fill="#5D4037" />
                <rect x="25" y="48" width="4" height="35" rx="1" fill="#795548" />
                <rect x="71" y="48" width="4" height="35" rx="1" fill="#795548" />
                <circle cx="50" cy="85" r="30" fill="black" opacity="0.05" />
             </svg>
          </div>
          <h1 className="text-3xl font-black text-[#004225] tracking-tighter uppercase leading-none">e-CP MJA</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.02em] mt-4">
             Plateforme de Classe Progressive
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Identifiant</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all text-sm" 
              placeholder="admin ou Nom complet élève"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all text-sm" 
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-600 text-[10px] font-black text-center uppercase bg-red-50 p-2 rounded-lg">{error}</p>}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.2em] bg-[#004225] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            🚀 Accéder au Portail
          </button>
        </form>

        <div className="mt-12 text-center">
            <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.2em]">
               PLATEFORME e-CP MJA • Kuvasz Fidèle
            </p>
        </div>
      </div>
      
      <style>{`
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
