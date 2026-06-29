import React from 'react';
import { User, MessageSquare, Filter } from 'lucide-react';

interface ChatListProps {
  chats: any[];
  selectedChat: any;
  onSelectChat: (chat: any) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onSelectChat }) => {
  return (
    <aside className="w-[320px] shrink-0 flex flex-col bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
      <div className="p-4 border-b border-outline-variant bg-slate-50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Active Requests</h2>
        <button className="text-slate-500 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
          <Filter size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">No active consultations</p>
          </div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`p-4 border-b border-outline-variant cursor-pointer transition-all border-l-4 ${selectedChat?.id === chat.id ? 'bg-blue-50 border-l-primary' : 'bg-white border-l-transparent hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-outline-variant shrink-0">
                    <User size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{chat.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In Progress</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-2">
                {chat.lastMessage?.content || 'New consultation request'}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default ChatList;
