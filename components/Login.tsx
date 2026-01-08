
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
      setError('Identifiants incorrects ou non synchronisés');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#004225] p-6 relative font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border-t-8 border-yellow-500 relative overflow-hidden animate-scale-in">
        
        <div className="absolute top-8 right-8 flex flex-col items-end gap-1 z-10">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all ${isConnected ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                <span className={`text-[7px] font-black uppercase tracking-widest ${isConnected ? 'text-blue-600' : 'text-red-500'}`}>
                    {isConnected ? 'Serveur Cloud MJA' : 'Mode Local'}
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-700 ${isConnected ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
            {isLoading && (
              <span className="text-[6px] font-black text-blue-400 uppercase tracking-widest mr-2">Synchronisation...</span>
            )}
        </div>

        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-100">
             <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-3xl font-black text-[#004225] tracking-tighter uppercase leading-none">e-CP MJA</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.02em] mt-4">
             Accès au Portail de Classe Progressive
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Identifiant (Nom Complet)</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all text-sm" 
              placeholder="ex: Jean Dupont"
            />
          </div>
          
          <div className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
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
            className="w-full py-5 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.2em] bg-[#004225] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:scale-100"
          >
            {isLoading ? '🔄 Synchronisation Cloud...' : '🚀 Se Connecter'}
          </button>
        </form>

        <div className="mt-12 text-center">
            <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.2em]">
               Fédération MJA • Système Cloud Sécurisé
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
