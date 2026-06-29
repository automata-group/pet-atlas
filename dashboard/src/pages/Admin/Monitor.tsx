import React, { useEffect, useState } from 'react';
import { Shield, MessageSquare, Users, Activity, ChevronRight, Clock, LogIn, LogOut, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

interface Chat {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  lastMessage?: {
    content: string;
    createdAt: string;
    sender?: { username: string };
  };
}

interface SessionLog {
  id: string;
  userId: number;
  deviceInfo?: string;
  ipAddress?: string;
  lastActiveAt: string;
  isActive: boolean;
  createdAt: string;
  user?: {
    username: string;
    email: string;
    roleId: number;
  };
}

const ROLE_LABELS: Record<number, string> = {
  1: 'Admin',
  2: 'Consultant',
  3: 'Manager',
  4: 'Vet',
  5: 'Client',
};

const AdminMonitor: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'timing'>('chats');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chatsRes, sessionsRes] = await Promise.allSettled([
        api.get('/chats/admin/all'),
        api.get('/auth/admin/sessions'),
      ]);
      
      if (chatsRes.status === 'fulfilled') setChats(chatsRes.value.data || []);
      if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value.data || []);
    } catch (err) {
      console.error('Failed to fetch system data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const activeVetsCount = sessions.filter(s => s.isActive && (s.user?.roleId === 2 || s.user?.roleId === 4)).length;

  return (
    <div className="space-y-gutter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-sm">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">System Supervision</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Monitor real-time communication channels and track staff activity timings.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-primary-container transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Live Feeds
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-outline-variant gap-6">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`pb-3 font-label-md text-label-md transition-all border-b-2 px-1 flex items-center gap-2 ${
            activeTab === 'chats' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-outline hover:text-on-background'
          }`}
        >
          <MessageSquare size={16} />
          Live Communication ({chats.length})
        </button>
        <button 
          onClick={() => setActiveTab('timing')}
          className={`pb-3 font-label-md text-label-md transition-all border-b-2 px-1 flex items-center gap-2 ${
            activeTab === 'timing' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-outline hover:text-on-background'
          }`}
        >
          <Clock size={16} />
          Staff Timing & Sessions ({activeVetsCount} Active)
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="mt-md">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3 text-outline">
            <span className="material-symbols-outlined animate-spin text-[36px] text-primary">sync</span>
            <div className="font-body-md text-body-md">Synchronizing platform records...</div>
          </div>
        ) : activeTab === 'chats' ? (
          /* LIVE CHATS LISTING */
          <div className="grid grid-cols-1 gap-4">
            {chats.length === 0 ? (
              <div className="text-center p-20 bg-surface-container-lowest border border-outline-variant rounded-xl text-outline font-body-md text-body-md">
                No active consultation chats found on the platform.
              </div>
            ) : (
              chats.map((chat) => (
                <div 
                  key={chat.id} 
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-primary-fixed-dim transition-colors gap-4"
                >
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant">
                      {chat.type === 'vet_consult' ? (
                        <Shield size={24} />
                      ) : (
                        <Users size={24} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-xs flex-wrap">
                        <h3 className="font-h3 text-h3 text-on-background">{chat.name}</h3>
                        <span className={`text-[10px] px-xs py-0.5 rounded font-bold uppercase ${
                          chat.type === 'vet_consult' ? 'bg-primary-container text-primary' : 'bg-secondary-container text-secondary'
                        }`}>
                          {chat.type === 'vet_consult' ? 'Consultation' : 'Community'}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-xs">
                        <span className="font-bold text-primary">
                          {chat.lastMessage?.sender?.username ? `${chat.lastMessage.sender.username}: ` : ''}
                        </span>
                        {chat.lastMessage?.content || 'No messages dispatched.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-lg self-stretch sm:self-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-outline-variant">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-outline font-bold uppercase tracking-wider"> Roster</div>
                      <div className="font-body-sm text-body-sm text-on-background">{chat.memberCount} Participants</div>
                    </div>
                    <button className="p-3 bg-surface-container-highest text-primary rounded-xl hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* STAFF TIMING LOGS */
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low font-label-md text-label-md text-outline uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Logged In</th>
                    <th className="px-6 py-4">Last Activity</th>
                    <th className="px-6 py-4">Device Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-outline">
                        No recent staff login timing sessions recorded.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => {
                      const user = session.user;
                      const username = user?.username || 'System User';
                      const email = user?.email || '—';
                      const roleLabel = user ? ROLE_LABELS[user.roleId] : 'Client';
                      const isVetOrConsultant = user && (user.roleId === 2 || user.roleId === 4);

                      return (
                        <tr 
                          key={session.id} 
                          className={`hover:bg-surface-container-low/50 transition-colors ${
                            isVetOrConsultant ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="px-6 py-4 font-medium text-on-background">
                            <div>
                              <div className="font-bold">{username}</div>
                              <div className="text-xs text-outline">{email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${
                              user?.roleId === 1 ? 'bg-red-100 text-red-700' :
                              user?.roleId === 2 ? 'bg-blue-100 text-blue-700' :
                              user?.roleId === 4 ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {roleLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {session.isActive ? (
                              <span className="flex items-center gap-1 text-secondary font-bold">
                                <CheckCircle size={14} className="animate-pulse" />
                                Active Now
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-outline">
                                <LogOut size={14} />
                                Terminated
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {new Date(session.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {new Date(session.lastActiveAt).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 text-xs text-outline truncate max-w-xs">
                            {session.deviceInfo || 'Generic Web/Mobile Client'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMonitor;
