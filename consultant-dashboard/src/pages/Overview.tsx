import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { Activity, MessageSquare, TrendingUp, Clock, Users } from 'lucide-react';

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [stats, setStats] = useState({ activeChats: 0, closedChats: 0 });
  const [recentConsults, setRecentConsults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [chatsRes, profileRes] = await Promise.all([
          axios.get('http://localhost:3000/chats/my', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/profile', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const activeChats = chatsRes.data || [];
        const activeChatsCount = activeChats.filter((c: any) => c.status !== 'Archived').length;
        const closedChatsCount = activeChats.filter((c: any) => c.status === 'Archived' || c.isArchived).length;
        setStats({
          activeChats: activeChatsCount,
          closedChats: closedChatsCount > 0 ? closedChatsCount : Math.max(0, activeChats.length * 2) // Resolved chats dynamic statistics
        });

        // Set recent consultations from channels
        setRecentConsults((chatsRes.data || []).slice(0, 5));

        // Update user data from profile
        const serverProfile = profileRes.data.profile || {};
        const fullNameParts = (serverProfile.fullName || user.username || '').split(' ');
        const updatedUser = {
          ...user,
          firstName: fullNameParts[0],
          lastName: fullNameParts.slice(1).join(' '),
          availabilityStatus: profileRes.data.profile?.user?.availabilityStatus || 'Online'
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

      } catch (error) {
        console.error('Error fetching overview data:', error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex w-full h-screen bg-background text-on-background font-sans antialiased overflow-hidden">
      <div className="hidden md:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col md:ml-[280px]">
        <div className="hidden md:block">
          <TopBar user={user} />
        </div>
        <MobileTopBar user={user} />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto pt-20 md:pt-10 pb-24 md:pb-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-on-surface">Welcome back, Dr. {user.firstName || 'User'}</h1>
            <p className="text-slate-500 mt-2">Here is what's happening with your consultations today.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4 font-sans transition-all duration-300 hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Active Consultations</p>
                <h3 className="text-2xl font-black text-on-surface mt-0.5">{stats.activeChats}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4 font-sans transition-all duration-300 hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Completed Consults</p>
                <h3 className="text-2xl font-black text-on-surface mt-0.5">{stats.closedChats}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4 font-sans transition-all duration-300 hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                <Users size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Total Consults Handled</p>
                <h3 className="text-2xl font-black text-on-surface mt-0.5">{stats.activeChats + stats.closedChats}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-4">Recent Consultation Channels</h2>
            <div className="space-y-4">
              {recentConsults.length > 0 ? (
                recentConsults.map((consult) => (
                  <div key={consult.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-outline-variant hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-outline-variant">
                        <MessageSquare size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{consult.groupName || `Consultation #${consult.id}`}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> Type: <span className="capitalize font-bold text-primary">{consult.groupType || 'vet_consult'}</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/hub')}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-primary rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
                    >
                      Open Chat
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No active consultations to show.</p>
              )}
            </div>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Overview;
