import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/Modal';

interface Chat {
  id: string; name: string; type: string; memberCount: number; status?: string;
  lastMessage?: { content: string; createdAt: string; sender?: { username: string } };
}

interface Message {
  id: string; content: string; type: string; senderId: string; createdAt: string;
  sender?: { username: string };
}

const ChatsPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filtered, setFiltered] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  // States for sending messages and creating new channels
  const [newMsg, setNewMsg] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', type: 'announcement' as 'announcement' | 'community', description: '' });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => { fetchChats(); }, []);

  const fetchChats = async () => {
    try {
      const res = await api.get('/chats/admin/all');
      setChats(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let res = chats;
    if (search) res = res.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== 'all') res = res.filter(c => c.type === typeFilter);
    setFiltered(res);
  }, [chats, search, typeFilter]);

  const openChat = async (chat: Chat) => {
    setSelectedChat(chat);
    setMsgLoading(true);
    try {
      const res = await api.get(`/chats/${chat.id}/messages?limit=30`);
      setMessages(res.data || []);
    } catch { setMessages([]); }
    finally { setMsgLoading(false); }
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMsg.trim()) return;
    setSendLoading(true);
    try {
      const res = await api.post(`/chats/${selectedChat.id}/messages`, {
        content: newMsg.trim(),
        type: 'Text',
      });
      setMessages(prev => [res.data, ...prev]);
      setNewMsg('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendLoading(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setCreateLoading(true);
    try {
      await api.post('/chats/group', {
        name: createForm.name.trim(),
        type: createForm.type,
        description: createForm.description.trim(),
      });
      setShowModal(false);
      setCreateForm({ name: '', type: 'announcement', description: '' });
      fetchChats();
    } catch (err) {
      console.error('Failed to create channel:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-gutter">
      <div>
        <h1 className="font-h1 text-h1 text-on-background">Medical Consultations</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Monitor and audit real-time patient-vet communication channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        {/* Room List */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[700px]">
          <div className="p-md border-b border-outline-variant space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary transition-all" 
                  placeholder="Search rooms..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-primary text-on-primary px-3 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center hover:bg-primary-container transition-all"
                title="Create New Channel"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <select 
              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">All Channels</option>
              <option value="vet_consult">Vet Consults</option>
              <option value="community">Community Groups</option>
              <option value="announcement">Announcement Channels</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-16 w-full rounded-lg" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-outline">No rooms found.</div>
            ) : (
              <ul className="divide-y divide-outline-variant">
                {filtered.map(chat => (
                  <li 
                    key={chat.id} 
                    onClick={() => openChat(chat)}
                    className={`p-4 hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-3 border-l-4 ${selectedChat?.id === chat.id ? 'bg-surface-container border-secondary' : 'border-transparent'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      chat.type === 'vet_consult' 
                        ? 'bg-primary-container text-on-primary-container' 
                        : chat.type === 'announcement'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                          : 'bg-tertiary-container text-on-tertiary-container'
                    }`}>
                      <span className="material-symbols-outlined">
                        {chat.type === 'vet_consult' 
                          ? 'medical_services' 
                          : chat.type === 'announcement'
                            ? 'campaign'
                            : 'groups'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-medium text-sm truncate pr-2">{chat.name}</span>
                        <span className="text-[10px] text-outline whitespace-nowrap">{chat.memberCount} members</span>
                      </div>
                      <p className="text-xs text-outline truncate">{chat.lastMessage?.content || 'No messages'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Message Panel */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[700px] overflow-hidden">
          {selectedChat ? (
            <>
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    selectedChat.type === 'vet_consult' 
                      ? 'bg-primary' 
                      : selectedChat.type === 'announcement'
                        ? 'bg-orange-500'
                        : 'bg-tertiary'
                  }`}>
                    <span className="material-symbols-outlined">
                      {selectedChat.type === 'vet_consult' 
                        ? 'medical_services' 
                        : selectedChat.type === 'announcement'
                          ? 'campaign'
                          : 'groups'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-bold text-on-background">{selectedChat.name}</h2>
                    <p className="text-xs text-outline uppercase font-semibold tracking-wider">{selectedChat.type.replace('_', ' ')} · Live Audit</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-surface-variant rounded-full text-outline transition-colors"><span className="material-symbols-outlined">info</span></button>
                  <button className="p-2 hover:bg-surface-variant rounded-full text-outline transition-colors"><span className="material-symbols-outlined">archive</span></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50">
                {msgLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-outline">
                    <Loader2 size={24} className="animate-spin mb-2" />
                    <p className="text-sm">Fetching secure logs...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-30">
                    <span className="material-symbols-outlined text-6xl mb-2">history</span>
                    <p>No communication records found</p>
                  </div>
                ) : (
                  [...messages].reverse().map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === 'system' ? 'justify-center' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-outline">
                        {(msg.sender?.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1 max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-on-surface-variant">{msg.sender?.username || 'User'}</span>
                          <span className="text-[10px] text-outline">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="bg-surface-container border border-outline-variant p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-on-background">
                          {msg.type === 'Photo' && <div className="mb-2 p-2 bg-black/5 rounded-lg border border-dashed border-outline text-[10px] text-center">📎 Image Attached</div>}
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Area */}
              <div className="p-md border-t border-outline-variant bg-surface-container-low">
                {selectedChat.status === 'archived' ? (
                  <div className="text-center p-2 text-sm font-semibold text-outline">
                    🚫 This consultation has been closed and archived.
                  </div>
                ) : (
                  <form onSubmit={sendMsg} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm text-on-background outline-none focus:ring-2 focus:ring-secondary"
                      placeholder={selectedChat.type === 'announcement' ? "Post a new announcement..." : "Type a message..."}
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      disabled={sendLoading}
                    />
                    <button
                      type="submit"
                      disabled={sendLoading || !newMsg.trim()}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {sendLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-outline opacity-40">
              <span className="material-symbols-outlined text-8xl mb-4">clinical_notes</span>
              <p className="font-h3 text-h3">Select a communication channel</p>
              <p className="text-sm mt-1">Audit active vet-patient dialogues in real-time</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Channel"
      >
        <form onSubmit={handleCreateChannel} className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface">Channel Name</label>
            <input 
              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm text-on-background outline-none focus:ring-2 focus:ring-primary" 
              placeholder="e.g. general-announcements" 
              required
              value={createForm.name} 
              onChange={e => setCreateForm({ ...createForm, name: e.target.value })} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface">Channel Type</label>
            <select 
              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
              value={createForm.type} 
              onChange={e => setCreateForm({ ...createForm, type: e.target.value as any })}
            >
              <option value="announcement">Announcement Channel</option>
              <option value="community">Community Group</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface">Description (Optional)</label>
            <textarea 
              className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm text-on-background outline-none focus:ring-2 focus:ring-primary" 
              placeholder="What is this channel about?" 
              rows={3}
              value={createForm.description} 
              onChange={e => setCreateForm({ ...createForm, description: e.target.value })} 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              className="flex-1 py-2.5 rounded-lg font-bold text-sm text-outline hover:bg-surface-variant transition-all" 
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2" 
              disabled={createLoading}
            >
              {createLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChatsPage;
