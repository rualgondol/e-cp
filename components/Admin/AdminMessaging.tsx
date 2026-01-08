
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
  const [showListOnMobile, setShowListOnMobile] = useState(true);

  // S'auto-sélectionner si on vient d'un autre menu (ex: Progression)
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
      setShowListOnMobile(false);
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

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setShowListOnMobile(false);
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl flex h-[calc(100vh-180px)] md:h-[calc(100vh-250px)] overflow-hidden border border-gray-200">
      {/* Liste des discussions - Cachée sur mobile si un chat est ouvert */}
      <div className={`${showListOnMobile ? 'flex' : 'hidden md:flex'} w-full md:w-80 border-r flex-col bg-gray-50/50`}>
        <div className="p-4 md:p-6 border-b bg-white">
          <h3 className="font-black text-sm md:text-lg text-gray-800 tracking-tight uppercase">Discussions</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversationList.length > 0 ? conversationList.map(item => (
            <div 
              key={item.student.id}
              onClick={() => handleSelectStudent(item.student.id)}
              className={`p-4 border-b cursor-pointer transition flex gap-3 items-center relative ${selectedStudentId === item.student.id ? 'bg-blue-600 text-white' : 'hover:bg-white'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${selectedStudentId === item.student.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                {item.student.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className={`font-bold text-sm truncate ${selectedStudentId === item.student.id ? 'text-white' : 'text-gray-900'}`}>
                    {item.student.fullName}
                  </p>
                  {item.unreadCount > 0 && (
                    <span className="bg-red-500 text-[8px] px-1.5 py-0.5 rounded-full font-black text-white shadow-sm animate-pulse">
                      {item.unreadCount}
                    </span>
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

      {/* Zone de Chat - Affichée sur mobile seulement si showListOnMobile est faux */}
      <div className={`${!showListOnMobile ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white h-full`}>
        {selectedStudent ? (
          <>
            <div className="p-4 md:p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowListOnMobile(true)}
                  className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900"
                >
                  ←
                </button>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[10px] flex-shrink-0">
                   {selectedStudent.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-gray-900 text-sm md:text-base truncate">{selectedStudent.fullName}</h3>
                  <p className="text-[8px] font-bold text-green-500 uppercase">En ligne</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-gray-50/30 custom-scrollbar">
              {currentChat.map(m => (
                <div key={m.id} className={`flex ${m.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl text-xs md:text-sm shadow-sm ${m.senderId === 'admin' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none text-gray-900 font-medium'}`}>
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p className={`text-[8px] md:text-[9px] mt-1 opacity-60 text-right`}>
                      {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 md:p-6 border-t bg-white">
              <div className="flex gap-2 md:gap-4">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Répondre..."
                  className="flex-1 border-2 border-gray-100 rounded-full px-4 md:px-6 py-2 md:py-3 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-xs md:text-sm text-gray-900"
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="bg-blue-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex-shrink-0"
                >
                  🚀
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 text-center">
             <div className="text-6xl mb-4 opacity-10">💬</div>
             <p className="font-bold text-sm">Sélectionnez une discussion pour répondre aux élèves.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessaging;
