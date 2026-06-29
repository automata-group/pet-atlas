import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F1E23] p-6 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] height-[300px] bg-[#008B8B]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] height-[300px] bg-[#008B8B]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-[500px] bg-[#14252c] border border-white/5 rounded-3xl p-12 text-center shadow-2xl relative z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          Security Access Denied
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <ShieldAlert size={40} className="text-red-400" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-extrabold text-white mb-4">Partner Clearance Required</h1>
        <p className="text-sm text-[#9ab0c0] leading-relaxed mb-10">
          Your current account permissions are insufficient to access this business portal. 
          The Pet-Atlas Clinic & Shop Portal is reserved strictly for authenticated listing owners and supervisors.
        </p>

        {/* Actions */}
        <button 
          className="w-full py-3.5 px-6 bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-all rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Secure Partner Login</span>
        </button>

        {/* Footer Meta */}
        <div className="mt-12 text-[10px] text-[#5e7a8e] font-semibold tracking-widest uppercase">
          PET-ATLAS SECURITY PROTOCOL v4.2.0 • ERROR_CODE: 403_PARTNER
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
