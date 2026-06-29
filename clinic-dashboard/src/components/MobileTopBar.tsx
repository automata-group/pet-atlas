import React from 'react';
import { Bell } from 'lucide-react';

interface MobileTopBarProps {
  user: any;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ user }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-14 bg-[#14252c] border-b border-white/5 md:hidden">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#008B8B] flex items-center justify-center shrink-0 shadow-md shadow-[#008B8B]/10 overflow-hidden">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Clinic Atlas</span>
      </div>
      <button className="p-2 hover:bg-white/5 rounded-full text-[#9ab0c0] transition-all">
        <Bell size={24} />
      </button>
    </header>
  );
};

export default MobileTopBar;
