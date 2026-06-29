import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      {/* Background Decorative Blurs */}
      <div className="glass-effect" style={{ top: '-10%', right: '-10%' }} />
      <div className="glass-effect" style={{ bottom: '-10%', left: '-10%' }} />

      <div className="unauthorized-card">
        {/* Status Badge */}
        <div className="status-badge">
          <span className="pulse-dot" style={{ width: 8, height: 8, background: '#FF4747', borderRadius: '50%' }} />
          Security Access Denied
        </div>

        {/* Icon Section */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'rgba(255, 71, 71, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid rgba(255, 71, 71, 0.2)'
          }}>
            <ShieldAlert size={40} className="error-text" />
          </div>
        </div>

        {/* Text Content */}
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Unauthorized Access</h1>
        <p style={{ color: '#8E959C', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
          Your account permissions are insufficient to access this professional portal. 
          The Pet-Atlas Consultant Dashboard is reserved for authorized veterinary staff and administrators.
        </p>

        {/* Actions */}
        <button className="btn-secondary" onClick={() => navigate('/login')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <ArrowLeft size={18} />
            Back to Secure Login
          </div>
        </button>

        {/* Footer Meta */}
        <div style={{ marginTop: 48, fontSize: 11, color: '#52585F', fontWeight: 600, letterSpacing: 1 }}>
          PET-ATLAS SECURITY PROTOCOL v4.2.0 • REF_ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
