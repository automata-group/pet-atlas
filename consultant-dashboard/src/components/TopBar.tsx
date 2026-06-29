import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, History, User as UserIcon, ChevronDown } from 'lucide-react';

interface TopBarProps {
  user: {
    firstName?: string;
    availabilityStatus?: string;
  };
}

const TopBar: React.FC<TopBarProps> = ({ user: initialUser }) => {
  const [status, setStatus] = useState(initialUser.availabilityStatus || 'Online');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:3000/profile/status', { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(newStatus);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.availabilityStatus = newStatus;
      localStorage.setItem('user', JSON.stringify(storedUser));
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const statusColors: Record<string, string> = {
    'Online': 'text-green-600',
    'Offline': 'text-slate-400',
    'Busy': 'text-red-500'
  };

  const statusIndicators: Record<string, string> = {
    'Online': 'bg-green-500',
    'Offline': 'bg-slate-300',
    'Busy': 'bg-red-500'
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white/80 backdrop-blur-md h-16 border-b border-outline-variant flex items-center justify-between px-8 shrink-0 z-40 transition-all">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients, messages, or IDs..." 
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-surface-container relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-outline-variant rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
              <div className="px-4 py-2 border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-bold text-sm">Notifications</h3>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{unreadCount} New</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`px-4 py-3 border-b border-outline-variant/50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      <p className={`text-xs font-bold ${!n.isRead ? 'text-primary' : 'text-slate-700'}`}>{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <button className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-surface-container">
            <History size={20} />
          </button>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant"></div>
        <div className="relative flex items-center gap-3 cursor-pointer group" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Dr. {initialUser.firstName || 'User'}</p>
            <div className="flex items-center justify-end gap-1.5">
              <span className={`w-2 h-2 rounded-full ${statusIndicators[status]}`}></span>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${statusColors[status]}`}>{status}</p>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant">
            <UserIcon size={20} className="text-slate-400" />
          </div>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-outline-variant rounded-xl shadow-lg py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
              {['Online', 'Offline', 'Busy'].map((s) => (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(s);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${status === s ? 'font-bold text-primary bg-blue-50/50' : 'text-slate-600'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusIndicators[s]}`}></span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
