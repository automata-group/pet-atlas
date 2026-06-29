import React from 'react';
import { Bell } from 'lucide-react';

interface MobileTopBarProps {
  user: any;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ user }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-14 bg-white border-b border-slate-200 md:hidden">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-outline-variant overflow-hidden">
          <img 
            alt="Consultant Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnlTFVNf0NUAYM28-Cz7wTtIFq1NYuurkvndxEtPItTFrgyagLXPFcIdR0GKkGlqZPf55KUTyTZrnb3SoPycKSLjMSJ1YK8dPkwbNsP2yObr9NneWY81_4DrpLnDeN0XssaomsQr6F_iLBuAW9beJSpDOXrhfysUmgpf8yPiSC777zlj3KFnWpzWFXWT53TeBiKrl2mazCVKut5j3T51t4340825nuw2UF5nFE4iOMLpnJVbN_2U_WYTGAmE-BAyRX6gF6kgsT1Qis" 
          />
        </div>
        <span className="text-lg font-bold text-blue-900 tracking-tight">Clinical Hub</span>
      </div>
      <button className="p-2 hover:bg-slate-50 rounded-full text-blue-800 transition-all">
        <Bell size={24} />
      </button>
    </header>
  );
};

export default MobileTopBar;
