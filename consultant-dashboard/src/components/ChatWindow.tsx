import React from 'react';
import { User, MessageSquare, Paperclip, Image as ImageIcon, Mic, Send, CheckCheck } from 'lucide-react';

interface ChatWindowProps {
  selectedChat: any;
  messages: any[];
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  userId: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  selectedChat, 
  messages, 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  scrollRef,
  userId
}) => {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border border-outline-variant shadow-sm mb-6">
          <MessageSquare size={40} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-on-surface mb-2">Select a consultation</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Choose a patient from the list on the left to start providing clinical assistance.
        </p>
      </div>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
      {/* Chat Header */}
      <header className="p-4 border-b border-outline-variant bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-outline-variant">
            <User size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              {selectedChat.name}
              <span className="text-xs font-normal text-slate-400 ml-3">ID: #{selectedChat.id}</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-outline-variant text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                Patient Record Active
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 animate-pulse uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Live - Syncing
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-slate-50 text-xs font-bold text-on-surface transition-all">View Records</button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-surface-tint text-xs font-bold transition-all">End Consult</button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/30">
        <div className="flex justify-center">
          <span className="px-4 py-1 rounded-full bg-white border border-outline-variant text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
            Consultation started
          </span>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-white border border-outline-variant flex items-center justify-center shrink-0 mt-1">
                  {isMe ? <User size={16} className="text-primary" /> : <User size={16} className="text-slate-400" />}
                </div>
                <div className={`flex flex-col gap-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-outline-variant text-primary rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <span className="ml-1 text-green-500">● Delivered</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-outline-variant bg-white shrink-0">
        <div className="relative rounded-xl border border-outline-variant bg-slate-50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            className="w-full bg-transparent border-none resize-none p-4 text-sm text-on-surface focus:ring-0 placeholder:text-slate-400" 
            placeholder="Type clinical advice or response here..." 
            rows={2}
          ></textarea>
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-1">
              <button className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-white transition-all">
                <Paperclip size={20} />
              </button>
              <button className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-white transition-all">
                <ImageIcon size={20} />
              </button>
              <button className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-white transition-all">
                <Mic size={20} />
              </button>
            </div>
            <button 
              onClick={() => onSendMessage()}
              className="bg-primary hover:bg-surface-tint text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              Send <Send size={14} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center px-1">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
            <CheckCheck size={12} className="text-green-500" /> Secure HIPAA Compliant Channel
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter to send</span>
        </div>
      </div>
    </section>
  );
};

export default ChatWindow;
