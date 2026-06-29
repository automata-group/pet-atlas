import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Calendar, 
  MessageSquare,
  Settings, 
  HelpCircle, 
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bg-[#14252c] fixed left-0 top-0 h-full w-[280px] border-r border-white/5 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-[#008B8B] flex items-center justify-center shrink-0 shadow-lg shadow-[#008B8B]/20">
          <Store className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tighter leading-tight">Clinic Atlas</h1>
          <p className="text-[#9ab0c0] text-[11px] font-semibold uppercase tracking-wider mt-1">Clinic & Shop Owner</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        <Link to="/overview" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/overview' ? 'bg-[#008B8B]/10 text-white border-l-4 border-[#008B8B] font-bold' : 'text-[#9ab0c0] hover:bg-white/5 border-l-4 border-transparent font-semibold'}`}>
          <LayoutDashboard size={20} />
          <span className="text-sm">Overview</span>
        </Link>
        <Link to="/listing" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/listing' ? 'bg-[#008B8B]/10 text-white border-l-4 border-[#008B8B] font-bold' : 'text-[#9ab0c0] hover:bg-white/5 border-l-4 border-transparent font-semibold'}`}>
          <Store size={20} />
          <span className="text-sm">Listing Profile</span>
        </Link>
        <Link to="/team" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/team' ? 'bg-[#008B8B]/10 text-white border-l-4 border-[#008B8B] font-bold' : 'text-[#9ab0c0] hover:bg-white/5 border-l-4 border-transparent font-semibold'}`}>
          <Users size={20} />
          <span className="text-sm">Team Roster</span>
        </Link>
        <Link to="/bookings" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/bookings' ? 'bg-[#008B8B]/10 text-white border-l-4 border-[#008B8B] font-bold' : 'text-[#9ab0c0] hover:bg-white/5 border-l-4 border-transparent font-semibold'}`}>
          <Calendar size={20} />
          <span className="text-sm">Bookings</span>
        </Link>
        <Link to="/chat" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/chat' ? 'bg-[#008B8B]/10 text-white border-l-4 border-[#008B8B] font-bold' : 'text-[#9ab0c0] hover:bg-white/5 border-l-4 border-transparent font-semibold'}`}>
          <MessageSquare size={20} />
          <span className="text-sm">Direct Messages</span>
        </Link>
        <Link to="/settings" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/settings' ? 'bg-[#008B8B]/10 text-white border-l-4 border-[#008B8B] font-bold' : 'text-[#9ab0c0] hover:bg-white/5 border-l-4 border-transparent font-semibold'}`}>
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </Link>
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto border-t border-white/5 py-2 flex flex-col gap-1">
        <a href="#" className="flex items-center px-6 py-3 text-[#9ab0c0] hover:bg-white/5 transition-colors gap-4 border-l-4 border-transparent font-semibold">
          <HelpCircle size={20} />
          <span className="text-sm">Help & Support</span>
        </a>
        <button onClick={onLogout} className="flex items-center px-6 py-3 text-red-400 hover:bg-white/5 transition-colors gap-4 w-full text-left border-l-4 border-transparent font-semibold">
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
