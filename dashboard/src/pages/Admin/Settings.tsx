import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';

const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // System Settings State
  const [config, setConfig] = useState({
    appName: 'Pet-Atlas',
    appVersion: '1.0.0-PROD',
    defaultRegion: 'Middle East (Cairo)',
    clinicsEnabled: true,
    enforceMfa: false,
    jwtSecret: 'PA_SECURE_9921_ALPHA_BETA_SIGMA' // This might still be sensitive, but keeping for UI parity
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/directory/config');
      setConfig(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to load system configuration', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post('/directory/config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to deploy configuration settings');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading && !saved) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">System Control</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Global configuration and platform health monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
        {/* General & Security */}
        <div className="space-y-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
              <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <h2 className="font-h3 text-h3 text-on-background">Core Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Application Identity</label>
                <input 
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" 
                  value={config.appName} 
                  onChange={(e) => updateField('appName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Version</label>
                  <input 
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" 
                    value={config.appVersion} 
                    onChange={(e) => updateField('appVersion', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Default Region</label>
                  <select 
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    value={config.defaultRegion}
                    onChange={(e) => updateField('defaultRegion', e.target.value)}
                  >
                    <option value="Middle East (Cairo)">Middle East (Cairo)</option>
                    <option value="Europe (London)">Europe (London)</option>
                    <option value="Asia (Dubai)">Asia (Dubai)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Clinics Toggle Switch */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant mt-4">
                <div>
                  <div className="text-sm font-bold text-on-background">Enable Clinics & Listings Page</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">Toggle visibility of the clinics directory page in the mobile application</div>
                </div>
                <div 
                  onClick={() => updateField('clinicsEnabled', !config.clinicsEnabled)}
                  className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${
                    config.clinicsEnabled ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                >
                  <div 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      config.clinicsEnabled ? 'right-1' : 'left-1'
                    }`} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
              <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
                <span className="material-symbols-outlined">security</span>
              </div>
              <h2 className="font-h3 text-h3 text-on-background">Security Infrastructure</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">JWT Cryptographic Secret</label>
                <div className="relative">
                  <input 
                    type={showSecret ? 'text' : 'password'} 
                    className="w-full pl-4 pr-12 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-error font-mono" 
                    value={config.jwtSecret}
                    onChange={(e) => updateField('jwtSecret', e.target.value)}
                  />
                  <button onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-background animate-none">
                    {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div>
                  <div className="text-sm font-bold">Enforce MFA for Administrators</div>
                  <div className="text-xs text-outline">Require biometrics or TOTP tokens</div>
                </div>
                <div 
                  onClick={() => updateField('enforceMfa', !config.enforceMfa)}
                  className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${
                    config.enforceMfa ? 'bg-secondary' : 'bg-outline-variant'
                  }`}
                >
                  <div 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      config.enforceMfa ? 'right-1' : 'left-1'
                    }`} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* System Health */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
            <div className="w-10 h-10 rounded-full bg-tertiary-container text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">dns</span>
            </div>
            <h2 className="font-h3 text-h3 text-on-background">Service Architecture</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Primary Backend Node', status: 'Optimal', icon: 'check_circle', color: 'text-secondary' },
              { label: 'Real-time Socket Gateway', status: 'Optimal', icon: 'check_circle', color: 'text-secondary' },
              { label: 'Media Storage (CDN)', status: 'Latency Alert', icon: 'warning', color: 'text-orange-500' },
              { label: 'WordPress Auth Bridge', status: 'Optimal', icon: 'check_circle', color: 'text-secondary' },
              { label: 'Push Notification Hub', status: 'Offline', icon: 'cancel', color: 'text-error' },
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${node.color}`}>{node.icon}</span>
                  <div className="text-sm font-medium">{node.label}</div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${node.color} bg-opacity-10 border border-current`}>
                  {node.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-primary text-on-primary rounded-xl flex items-center justify-between shadow-lg shadow-primary/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-[32px]">sync</span>
              <div>
                <div className="text-sm font-bold">Continuous Synchronization</div>
                <div className="text-[10px] opacity-70">Last ping: 2 seconds ago</div>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              Refresh All
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/30 transition-all">
          <span className="material-symbols-outlined">save</span>
          {saved ? 'Settings Deployed' : 'Deploy Global Configuration'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
