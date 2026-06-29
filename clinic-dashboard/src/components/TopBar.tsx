import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, History, User as UserIcon, ChevronDown } from 'lucide-react';
import { API_URL } from '../config';

interface TopBarProps {
  user: {
    firstName?: string;
    email?: string;
  };
}

const TopBar: React.FC<TopBarProps> = ({ user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-[#14252c]/80 backdrop-blur-md h-16 border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-40 transition-all">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab0c0]" size={18} />
          <input 
            type="text" 
            placeholder="Search bookings, reviews, or veterinarians..." 
            className="w-full bg-[#0F1E23]/60 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-[#5e7a8e] focus:outline-none focus:border-[#008B8B] transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-[#9ab0c0] hover:text-white p-2 rounded-full hover:bg-white/5 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#008B8B] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-[#14252c]">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-[#14252c] border border-white/5 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
              <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Notifications</h3>
                <span className="text-[10px] font-bold text-[#008B8B] uppercase tracking-widest">{unreadCount} New</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#5e7a8e] text-xs">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-[#008B8B]/5' : ''}`}
                    >
                      <p className={`text-xs font-bold ${!n.isRead ? 'text-[#008B8B]' : 'text-white'}`}>{n.title}</p>
                      <p className="text-[11px] text-[#9ab0c0] mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-[#5e7a8e] mt-1 uppercase font-bold">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <button className="text-[#9ab0c0] hover:text-white p-2 rounded-full hover:bg-white/5">
            <History size={20} />
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-white/5"></div>
        
        <div className="relative flex items-center gap-3 cursor-pointer group" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="text-right">
            <p className="text-sm font-bold text-white group-hover:text-[#008B8B] transition-colors">{user.firstName || 'Clinic Owner'}</p>
            <p className="text-[10px] font-medium text-[#9ab0c0] tracking-wide">{user.email || 'owner@clinic.com'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#0F1E23] flex items-center justify-center overflow-hidden border border-white/5">
            <UserIcon size={20} className="text-[#9ab0c0]" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
