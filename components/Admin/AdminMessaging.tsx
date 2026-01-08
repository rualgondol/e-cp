
import React, { useState, useMemo, useEffect } from 'react';
import { ClubType, Student, Message } from '../../types';

interface AdminMessagingProps {
  club: ClubType;
  students: Student[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  initialStudentId?: string | null;
}

const AdminMessaging: React.FC<AdminMessagingProps> = ({ club, students, messages, setMessages, initialStudentId }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // S'auto-sélectionner si on vient d'un autre menu (ex: Progression)
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  useEffect(() => {
    if (selectedStudentId) {
      setMessages(prev => prev.map(m => 
        (m.senderId === selectedStudentId && m.receiverId === 'admin') ? { ...m, isRead: true } : m
      ));
    }
  }, [selectedStudentId, setMessages]);

  const conversationList = useMemo(() => {
    // On inclut tous les élèves qui ont au moins un message ou celui spécifié
    const studentIds = Array.from(new Set(messages.map(m => m.senderId === 'admin' ? m.receiverId : m.senderId)));
    if (initialStudentId && !studentIds.includes(initialStudentId)) {
      studentIds.push(initialStudentId);
    }
    
    const chatStudents = students.filter(s => studentIds.includes(s.id));
    
    return chatStudents.map(s => {
      const studentMsgs = messages.filter(m => m.senderId === s.id || m.receiverId === s.id);
      const lastMsg = studentMsgs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const unreadCount = studentMsgs.filter(m => m.receiverId === 'admin' && !m.isRead).length;
      
      return { student: s, lastMsg, unreadCount };
    }).sort((a,b) => {
      if (!a.lastMsg) return 1;
      if (!b.lastMsg) return -1;
      return new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime();
    });
  }, [messages, students, initialStudentId]);

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);
  
  const currentChat = useMemo(() => 
    messages.filter(m => m.senderId === selectedStudentId || m.receiverId === selectedStudentId)
            .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  , [messages, selectedStudentId]);

  const handleSend = () => {
    if (!selectedStudentId || !replyText) return;
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'admin',
      receiverId: selectedStudentId,
      content: replyText,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, msg]);
    setReplyText('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl flex h-[calc(100vh-250px)] overflow-hidden border border-gray-200">
      <div className="w-80 border-r flex flex-col bg-gray-50/50">
        <div className="p-6 border-b bg-white">
          <h3 className="font-black text-lg text-gray-800 tracking-tight uppercase">Discussions</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversationList.length > 0 ? conversationList.map(item => (
            <div 
              key={item.student.id}
              onClick={() => setSelectedStudentId(item.student.id)}
              className={`p-4 border-b cursor-pointer transition flex gap-3 items-center ${selectedStudentId === item.student.id ? 'bg-blue-600 text-white' : 'hover:bg-white'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${selectedStudentId === item.student.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                {item.student.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className={`font-bold text-sm truncate ${selectedStudentId === item.student.id ? 'text-white' : 'text-gray-900'}`}>
                    {item.student.fullName}
                  </p>
                  {item.unreadCount > 0 && selectedStudentId !== item.student.id && (
                    <span className="bg-red-500 text-[8px] px-1.5 py-0.5 rounded-full font-black text-white">{item.unreadCount}</span>
                  )}
                </div>
                {item.lastMsg && (
                  <p className={`text-[10px] truncate ${selectedStudentId === item.student.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {item.lastMsg.content}
                  </p>
                )}
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-400 italic text-sm">
              Aucune conversation active.
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {selectedStudent ? (
          <>
            <div className="p-6 border-b flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[10px]">
                   {selectedStudent.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-black text-gray-900">{selectedStudent.fullName}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50/30">
              {currentChat.map(m => (
                <div key={m.id} className={`flex ${m.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${m.senderId === 'admin' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none text-gray-900 font-medium'}`}>
                    <p>{m.content}</p>
                    <p className={`text-[9px] mt-1 opacity-60 text-right`}>
                      {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t bg-white">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Écrire votre réponse..."
                  className="flex-1 border-2 border-gray-100 rounded-full px-6 py-3 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-sm text-gray-900"
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
                >
                  🚀
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
             <div className="text-6xl mb-4 opacity-10">💬</div>
             <p className="font-bold">Sélectionnez une discussion pour répondre aux élèves.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessaging;
