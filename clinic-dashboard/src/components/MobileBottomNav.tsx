import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Calendar, Settings, MessageSquare } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 pb-safe bg-[#14252c] border-t border-white/5 md:hidden">
      <Link to="/overview" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/overview' ? 'text-white border-t-2 border-[#008B8B] bg-[#008B8B]/5' : 'text-[#9ab0c0]'}`}>
        <LayoutDashboard size={22} className={path === '/overview' ? '' : 'opacity-80'} />
        <span className="text-[10px] font-medium mt-1">Dashboard</span>
      </Link>
      <Link to="/listing" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/listing' ? 'text-white border-t-2 border-[#008B8B] bg-[#008B8B]/5' : 'text-[#9ab0c0]'}`}>
        <Store size={22} className={path === '/listing' ? '' : 'opacity-80'} />
        <span className="text-[10px] font-medium mt-1">Profile</span>
      </Link>
      <Link to="/team" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/team' ? 'text-white border-t-2 border-[#008B8B] bg-[#008B8B]/5' : 'text-[#9ab0c0]'}`}>
        <Users size={22} className={path === '/team' ? '' : 'opacity-80'} />
        <span className="text-[10px] font-medium mt-1">Team</span>
      </Link>
      <Link to="/bookings" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/bookings' ? 'text-white border-t-2 border-[#008B8B] bg-[#008B8B]/5' : 'text-[#9ab0c0]'}`}>
        <Calendar size={22} className={path === '/bookings' ? '' : 'opacity-80'} />
        <span className="text-[10px] font-medium mt-1">Bookings</span>
      </Link>
      <Link to="/chat" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/chat' ? 'text-white border-t-2 border-[#008B8B] bg-[#008B8B]/5' : 'text-[#9ab0c0]'}`}>
        <MessageSquare size={22} className={path === '/chat' ? '' : 'opacity-80'} />
        <span className="text-[10px] font-medium mt-1">Chat</span>
      </Link>
      <Link to="/settings" className={`flex flex-col items-center justify-center pt-1 w-full ${path === '/settings' ? 'text-white border-t-2 border-[#008B8B] bg-[#008B8B]/5' : 'text-[#9ab0c0]'}`}>
        <Settings size={22} className={path === '/settings' ? '' : 'opacity-80'} />
        <span className="text-[10px] font-medium mt-1">Settings</span>
      </Link>
    </nav>
  );
};

export default MobileBottomNav;
