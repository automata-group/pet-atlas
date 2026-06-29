import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Calendar } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 pb-safe bg-white border-t border-slate-200 md:hidden">
      <Link to="/overview" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/overview' ? 'text-primary border-t-2 border-primary bg-blue-50/50' : 'text-slate-400'}`}>
        <LayoutDashboard size={24} className={path === '/overview' ? '' : 'opacity-80'} />
        <span className="text-[11px] font-medium mt-1">Dashboard</span>
      </Link>
      <Link to="/hub" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/hub' ? 'text-primary border-t-2 border-primary bg-blue-50/50' : 'text-slate-400'}`}>
        <MessageSquare size={24} className={path === '/hub' ? '' : 'opacity-80'} />
        <span className="text-[11px] font-medium mt-1">Chat</span>
      </Link>
      <Link to="/settings" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/settings' ? 'text-primary border-t-2 border-primary bg-blue-50/50' : 'text-slate-400'}`}>
        <Users size={24} className={path === '/settings' ? '' : 'opacity-80'} />
        <span className="text-[11px] font-medium mt-1">Settings</span>
      </Link>
    </nav>
  );
};

export default MobileBottomNav;
