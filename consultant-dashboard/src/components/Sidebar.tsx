import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Clock, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Stethoscope,
  Plus
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bg-white fixed left-0 top-0 h-full w-[280px] border-r border-outline-variant flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-outline-variant">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Stethoscope className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-blue-900 tracking-tighter leading-tight">Pet-Atlas Pro</h1>
          <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mt-1">Provider Dashboard</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        <Link to="/overview" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/overview' ? 'bg-blue-50 text-primary border-l-4 border-primary font-bold' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent font-semibold'}`}>
          <LayoutDashboard size={20} />
          <span className="text-sm">Overview</span>
        </Link>
        <Link to="/hub" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/hub' ? 'bg-blue-50 text-primary border-l-4 border-primary font-bold' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent font-semibold'}`}>
          <MessageSquare size={20} />
          <span className="text-sm">Consultations</span>
        </Link>
        <Link to="/settings" className={`flex items-center px-6 py-3 gap-4 transition-colors ${path === '/settings' ? 'bg-blue-50 text-primary border-l-4 border-primary font-bold' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent font-semibold'}`}>
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </Link>
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto border-t border-outline-variant py-2 flex flex-col gap-1">
        <a href="#" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-50 transition-colors gap-4 border-l-4 border-transparent font-semibold">
          <HelpCircle size={20} />
          <span className="text-sm">Help Support</span>
        </a>
        <button onClick={onLogout} className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-50 transition-colors gap-4 w-full text-left border-l-4 border-transparent font-semibold">
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
