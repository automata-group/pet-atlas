import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { Search, ChevronLeft, User, Clock, CheckCircle, AlertCircle, Send, MessageSquare, CheckCheck, Loader2 } from 'lucide-react';
import { API_URL, SOCKET_URL } from '../config';

const ChatHub: React.FC = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [filter, setFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all');
  const [sendError, setSendError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [seenMessages, setSeenMessages] = useState<Record<string, Date>>({});
  const [loadingChats, setLoadingChats] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const selectedChatRef = useRef<any>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    fetchChats(true);
  }, [statusFilter]);

  useEffect(() => {
    const interval = setInterval(() => fetchChats(false), 5000); // Poll every 5s for robust updates
    
    // Initialize real-time WebSocket connection
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('newMessage', (message: any) => {
      const currentId = selectedChatRef.current?.id;
      const msgChatId = message.chatId || message.groupId;

      if (currentId && String(msgChatId) === String(currentId)) {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id || String(m.id) === String(message.id))) return prev;
          return [...prev, message].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
      fetchChats(false);
    });

    socket.on('userTyping', (data: any) => {
      if (String(data.userId) === String(user.id)) return;
      setTypingUsers(prev => ({ ...prev, [data.userId]: data.isTyping }));
    });

    socket.on('messageSeen', (data: any) => {
      setSeenMessages(prev => ({ ...prev, [data.messageId]: new Date(data.seenAt) }));
    });

    return () => { 
      clearInterval(interval);
      socket.disconnect(); 
    };
  }, []);

  // Sync selectedChat with latest updates (e.g., claimedBy, status, lastMessage)
  useEffect(() => {
    if (selectedChat && chats.length > 0) {
      const updatedChat = chats.find(c => c.id === selectedChat.id);
      if (updatedChat) {
        if (updatedChat.claimedBy !== selectedChat.claimedBy || 
            updatedChat.status !== selectedChat.status ||
            updatedChat.lastMessage?.id !== selectedChat.lastMessage?.id) {
          setSelectedChat(updatedChat);
        }
      }
    }
  }, [chats]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      if (window.innerWidth < 768) setMobileView('chat');

      // Join standard chat room gateway
      if (socketRef.current) {
        socketRef.current.emit('joinRoom', { chatId: selectedChat.id.toString() });
      }

      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leaveRoom', { chatId: selectedChat.id.toString() });
        }
      };
    } else {
      setMobileView('list');
      setTypingUsers({});
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-seen unread messages
    if (socketRef.current && messages.length > 0) {
      const currentUserId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
      const unseenMessages = messages.filter(msg => 
        String(msg.senderId) !== String(currentUserId) && !seenMessages[msg.id]
      );

      unseenMessages.forEach((msg: any) => {
        socketRef.current?.emit('messageSeen', {
          chatId: String(msg.chatId || msg.groupId || selectedChat?.id),
          messageId: String(msg.id),
          userId: String(currentUserId),
        });
      });
    }
  }, [messages]);

  const fetchChats = async (showLoading = false) => {
    if (showLoading) setLoadingChats(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chats/my?archived=${statusFilter === 'archived'}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch (err) {
      console.error('Failed to fetch chats');
    } finally {
      if (showLoading) setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedMessages = response.data.sort((a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(fetchedMessages);
      
      if (socketRef.current && fetchedMessages.length > 0) {
        const currentUserId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
        fetchedMessages.forEach((msg: any) => {
          if (String(msg.senderId) !== String(currentUserId)) {
            socketRef.current?.emit('messageSeen', {
              chatId: String(chatId),
              messageId: String(msg.id),
              userId: String(currentUserId),
            });
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    setSendError('');

    try {
      if (socketRef.current) {
        socketRef.current.emit('typing', {
          chatId: selectedChat.id.toString(),
          isTyping: false,
          username: user.display_name || user.username || 'Clinic',
          userId: user.id.toString()
        });
      }

      const token = localStorage.getItem('token');
      const msgContent = newMessage;
      setNewMessage('');
      await axios.post(`${API_URL}/chats/${selectedChat.id}/messages`, {
        content: msgContent, type: 'Text'
      }, { headers: { Authorization: `Bearer ${token}` } });

      fetchMessages(selectedChat.id);
      fetchChats(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send message';
      setSendError(msg);
    }
  };

  const handleArchiveChat = async () => {
    if (!selectedChat) return;
    if (!window.confirm('هل أنت متأكد من إنهاء جلسة الاستشارة هذه وأرشفتها؟')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/chats/${selectedChat.id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedChat(null);
      fetchChats(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to end consultation');
    }
  };

  const handleInputChange = (val: string) => {
    setNewMessage(val);
    setSendError('');
    if (socketRef.current && selectedChat) {
      socketRef.current.emit('typing', {
        chatId: selectedChat.id.toString(),
        isTyping: val.trim().length > 0,
        username: user.display_name || user.username || 'Clinic',
        userId: user.id.toString()
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredChats = chats.filter(chat => {
    if (chat.type !== 'vet_consult') return true;
    if (filter === 'claimed') return !!chat.claimedBy;
    if (filter === 'unclaimed') return !chat.claimedBy;
    return true;
  });

  const getClaimBadge = (chat: any) => {
    if (chat.type !== 'vet_consult') return null;
    if (!chat.claimedBy) {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          padding: '3px 9px', borderRadius: 100,
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5
        }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" style={{ display: 'inline-block', marginRight: 2 }} />
          Waiting Vet
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(0, 139, 139, 0.1)', color: '#008B8B',
        border: '1px solid rgba(0, 139, 139, 0.2)',
        padding: '3px 9px', borderRadius: 100,
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5
      }}>
        <CheckCircle size={10} />
        Claimed by Vet
      </span>
    );
  };

  const ChatListPanel = () => (
    <div className="glass-panel" style={{
      width: 360, minWidth: 360, height: '100%',
      borderRadius: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ padding: '24px 24px 16px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>Direct Messages</h2>
        <div style={{ display: 'flex', gap: 4, background: '#0F1E23', padding: 4, borderRadius: 12, marginBottom: 16, border: '1px solid var(--border-medium)' }}>
          <button 
            onClick={() => setStatusFilter('active')}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', background: statusFilter === 'active' ? 'var(--pa-teal)' : 'transparent',
              color: statusFilter === 'active' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >Active</button>
          <button 
            onClick={() => setStatusFilter('archived')}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', background: statusFilter === 'archived' ? 'var(--pa-teal)' : 'transparent',
              color: statusFilter === 'archived' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >Archived</button>
        </div>
        
        {statusFilter === 'active' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {[
              { key: 'all', label: 'All DMs' },
              { key: 'unclaimed', label: 'Unclaimed' },
              { key: 'claimed', label: 'In Progress' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key as any)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', border: '1px solid var(--border-medium)', transition: 'all 0.2s',
                background: filter === tab.key ? 'rgba(0, 139, 139, 0.2)' : 'rgba(15, 30, 35, 0.6)',
                color: filter === tab.key ? '#008B8B' : 'var(--text-secondary)',
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }}>
        {loadingChats ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 className="animate-spin text-[#008B8B]" size={28} />
          </div>
        ) : filteredChats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
            <Clock size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No messages found</p>
          </div>
        ) : filteredChats.map(chat => {
          const isSelected = selectedChat?.id === chat.id;
          return (
            <div key={chat.id} onClick={() => setSelectedChat(chat)} style={{
              padding: '16px', borderRadius: 16, marginBottom: 8, cursor: 'pointer',
              background: isSelected ? 'rgba(0, 139, 139, 0.15)' : 'transparent',
              border: `1px solid ${isSelected ? '#008B8B' : 'var(--border-light)'}`,
              transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.group_name || chat.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {chat.lastMessage?.content || 'Started a new consultation'}
              </p>
              {getClaimBadge(chat)}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', overflow: 'hidden' }}>
      <div className="hidden md:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col md:ml-[280px]">
        <div className="hidden md:block">
          <TopBar user={user} />
        </div>
        <MobileTopBar user={user} />

        <main className="hidden md:flex" style={{ flex: 1, padding: 24, gap: 24, overflow: 'hidden', zIndex: 10 }}>
          <ChatListPanel />
          
          <div className="glass-panel" style={{
            flex: 1, borderRadius: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            {selectedChat ? (
              <>
                <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(20, 37, 44, 0.8)', zIndex: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedChat.group_name || selectedChat.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      {getClaimBadge(selectedChat)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {selectedChat.status !== 'archived' && (
                      <button 
                        onClick={handleArchiveChat}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12,
                          background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                      >
                        <CheckCircle size={16} />
                        End Session
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'rgba(15, 30, 35, 0.4)' }}>
                  {messages.map((msg, idx) => {
                    const isMe = String(msg.senderId) === String(user.id);
                    const showAvatar = idx === 0 || messages[idx-1].senderId !== msg.senderId;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                        {!isMe && showAvatar && (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0, 139, 139, 0.2)', border: '1px solid rgba(0, 139, 139, 0.3)', marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="#008B8B" />
                          </div>
                        )}
                        {!isMe && !showAvatar && <div style={{ width: 44 }} />}
                        <div style={{
                          maxWidth: '65%', padding: '12px 18px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                          background: isMe ? 'var(--pa-teal)' : 'rgba(20, 37, 44, 0.8)',
                          color: 'white',
                          fontSize: 14, lineHeight: 1.6,
                          boxShadow: isMe ? '0 4px 12px rgba(0, 139, 139, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)',
                          border: isMe ? 'none' : '1px solid var(--border-medium)'
                        }}>
                          <p>{msg.content}</p>
                          <p style={{ fontSize: 10, opacity: 0.6, marginTop: 6, textAlign: 'right' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && seenMessages[msg.id] && (
                              <CheckCheck size={12} color="#008B8B" style={{ display: 'inline', marginLeft: 4 }} />
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {Object.values(typingUsers).some(isTyping => isTyping) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(20, 37, 44, 0.8)', borderRadius: 20, width: 'fit-content', marginBottom: 16, border: '1px solid var(--border-medium)' }}>
                      <span style={{ display: 'flex', gap: 4 }}>
                        <span className="animate-bounce" style={{ width: 6, height: 6, background: '#008B8B', borderRadius: '50%' }} />
                        <span className="animate-bounce" style={{ width: 6, height: 6, background: '#008B8B', borderRadius: '50%', animationDelay: '0.1s' }} />
                        <span className="animate-bounce" style={{ width: 6, height: 6, background: '#008B8B', borderRadius: '50%', animationDelay: '0.2s' }} />
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Client is typing...</span>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>

                {sendError && (
                  <div style={{ padding: '10px 24px', background: 'rgba(239, 68, 68, 0.1)', borderTop: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertCircle size={16} color="#EF4444" />
                    <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 600 }}>{sendError}</span>
                  </div>
                )}

                <form onSubmit={handleSend} style={{ padding: '20px 24px', borderTop: '1px solid var(--border-medium)', display: 'flex', gap: 14, background: 'rgba(20, 37, 44, 0.8)' }}>
                  <input
                    value={newMessage}
                    onChange={e => handleInputChange(e.target.value)}
                    style={{
                      flex: 1, background: '#0F1E23', border: '1px solid var(--border-medium)',
                      borderRadius: 14, padding: '14px 20px', color: 'white', fontSize: 15, outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--pa-teal)';
                      e.target.style.boxShadow = '0 0 0 4px var(--pa-teal-soft)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-medium)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Type your reply here..."
                  />
                  <button type="submit" style={{
                    background: 'var(--pa-teal)', border: 'none', borderRadius: 14,
                    width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(0, 139, 139, 0.4)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, color: 'var(--text-muted)', background: 'rgba(20, 37, 44, 0.4)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(20, 37, 44, 0.8)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={40} color="#008B8B" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Select a conversation</p>
                  <p style={{ fontSize: 14, marginTop: 4, color: 'var(--text-secondary)' }}>Choose a direct message from the sidebar to open the chat portal</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mobile View */}
        <main className="flex md:hidden" style={{ flex: 1, flexDirection: 'column', paddingTop: 56, paddingBottom: 64, overflow: 'hidden', zIndex: 10 }}>
          {mobileView === 'list' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'var(--bg-main)' }}>
              <div style={{ display: 'flex', gap: 4, background: '#14252c', padding: 4, borderRadius: 12, marginBottom: 16, border: '1px solid var(--border-medium)' }}>
                <button 
                  onClick={() => setStatusFilter('active')}
                  style={{
                    flex: 1, padding: '10px 4px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', background: statusFilter === 'active' ? 'var(--pa-teal)' : 'transparent',
                    color: statusFilter === 'active' ? 'white' : 'var(--text-secondary)'
                  }}
                >Active</button>
                <button 
                  onClick={() => setStatusFilter('archived')}
                  style={{
                    flex: 1, padding: '10px 4px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', background: statusFilter === 'archived' ? 'var(--pa-teal)' : 'transparent',
                    color: statusFilter === 'archived' ? 'white' : 'var(--text-secondary)'
                  }}
                >Archived</button>
              </div>

              {statusFilter === 'active' && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[{key:'all',label:'All'},{key:'unclaimed',label:'Unclaimed'},{key:'claimed',label:'Claimed'}].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key as any)} style={{
                      flex: 1, padding: '10px 4px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', border: '1px solid var(--border-medium)',
                      background: filter === tab.key ? 'rgba(0, 139, 139, 0.2)' : 'rgba(20, 37, 44, 0.6)',
                      color: filter === tab.key ? '#008B8B' : 'var(--text-secondary)'
                    }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {loadingChats ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <Loader2 className="animate-spin text-[#008B8B]" size={28} />
                </div>
              ) : filteredChats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <Clock size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No messages found</p>
                </div>
              ) : filteredChats.map(chat => (
                <div key={chat.id} onClick={() => setSelectedChat(chat)} style={{
                  padding: 16, borderRadius: 18, marginBottom: 12,
                  background: 'rgba(20, 37, 44, 0.6)', border: '1px solid var(--border-medium)', cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{chat.group_name || chat.name}</strong>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {chat.lastMessage?.content || 'New consultation request'}
                  </p>
                  {getClaimBadge(chat)}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-main)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(20, 37, 44, 0.8)', zIndex: 30 }}>
                <button onClick={() => { setSelectedChat(null); setMobileView('list'); }} style={{ background: 'rgba(20, 37, 44, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '50%', padding: 6, cursor: 'pointer', color: 'white' }}>
                  <ChevronLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800 }}>{selectedChat?.group_name || selectedChat?.name}</h3>
                  {getClaimBadge(selectedChat)}
                </div>
                {selectedChat?.status !== 'archived' && (
                  <button 
                    onClick={handleArchiveChat}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', 
                      borderRadius: 10, padding: '6px 10px', fontSize: 11, fontWeight: 700
                    }}
                  >
                    End
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'rgba(15, 30, 35, 0.4)' }}>
                {messages.map(msg => {
                  const isMe = String(msg.senderId) === String(user.id);
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                      <div style={{
                        maxWidth: '80%', padding: '10px 16px', borderRadius: 16, fontSize: 14,
                        background: isMe ? 'var(--pa-teal)' : 'rgba(20, 37, 44, 0.8)', color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: isMe ? 'none' : '1px solid var(--border-medium)'
                      }}>
                        {msg.content}
                        <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && seenMessages[msg.id] && (
                            <CheckCheck size={12} color="#008B8B" style={{ display: 'inline', marginLeft: 4 }} />
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {Object.values(typingUsers).some(isTyping => isTyping) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(20, 37, 44, 0.8)', borderRadius: 16, width: 'fit-content', marginBottom: 12, border: '1px solid var(--border-medium)' }}>
                    <span style={{ display: 'flex', gap: 3 }}>
                      <span className="animate-bounce" style={{ width: 4, height: 4, background: '#008B8B', borderRadius: '50%' }} />
                      <span className="animate-bounce" style={{ width: 4, height: 4, background: '#008B8B', borderRadius: '50%', animationDelay: '0.1s' }} />
                      <span className="animate-bounce" style={{ width: 4, height: 4, background: '#008B8B', borderRadius: '50%', animationDelay: '0.2s' }} />
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Typing...</span>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {sendError && (
                <div style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{sendError}</div>
              )}

              {selectedChat.status === 'archived' ? (
                <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(20, 37, 44, 0.6)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, fontStyle: 'italic', borderTop: '1px solid var(--border-medium)' }}>
                  Consultation Archived
                </div>
              ) : (
                <form onSubmit={handleSend} style={{ padding: 12, borderTop: '1px solid var(--border-medium)', display: 'flex', gap: 8, background: 'rgba(20, 37, 44, 0.8)' }}>
                  <input
                    value={newMessage}
                    onChange={e => handleInputChange(e.target.value)}
                    style={{ flex: 1, background: '#0F1E23', border: '1px solid var(--border-medium)', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, outline: 'none' }}
                    placeholder="Your reply..."
                  />
                  <button type="submit" style={{ background: 'var(--pa-teal)', border: 'none', borderRadius: 12, padding: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          )}
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
};

export default ChatHub;
