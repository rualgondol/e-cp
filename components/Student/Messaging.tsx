
import React, { useState, useMemo, useEffect } from 'react';
import { Message } from '../../types';

interface MessagingProps {
  studentId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  theme: any;
}

const Messaging: React.FC<MessagingProps> = ({ studentId, messages, setMessages, theme }) => {
  const [replyText, setReplyText] = useState('');

  // Marquer comme lu à l'affichage
  useEffect(() => {
    setMessages(prev => prev.map(m => 
      (m.receiverId === studentId && !m.isRead) ? { ...m, isRead: true } : m
    ));
  }, [studentId, setMessages]);

  const myMessages = useMemo(() => 
    messages.filter(m => m.receiverId === studentId || m.senderId === studentId)
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  , [messages, studentId]);

  const handleSend = () => {
    if (!replyText) return;
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: studentId,
      receiverId: 'admin',
      content: replyText,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, msg]);
    setReplyText('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl flex flex-col h-[70vh] border animate-fade-in overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-black text-xl text-gray-800 tracking-tight">Messagerie Directe</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Échange avec ton instructeur</p>
        </div>
        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Connecté"></span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {myMessages.length > 0 ? myMessages.map(m => (
          <div key={m.id} className={`flex ${m.senderId === studentId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm ${m.senderId === studentId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none text-gray-700'}`}>
              <p>{m.content}</p>
              <p className={`text-[10px] mt-1 opacity-60 text-right`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
             <div className="text-5xl mb-4 opacity-20">💬</div>
             <p className="font-bold">Pose une question à ton instructeur ici !</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-white">
        <div className="flex gap-4">
          <input 
            type="text" 
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Tape ton message ici..."
            className="flex-1 border-2 border-gray-100 rounded-full px-6 py-3 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-sm"
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-90"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            ✈️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
