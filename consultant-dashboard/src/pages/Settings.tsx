import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { User, Shield, Bell, CheckCircle, Globe, Phone, Mail, Award, Clock, Plus } from 'lucide-react';
import { API_URL } from '../config';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [profile, setProfile] = useState<any>(localUser);
  const [status, setStatus] = useState<string>(localUser.availabilityStatus || 'Offline');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const serverData = response.data.profile || {};
      const serverUser = serverData.user || {};
      
      const fullNameParts = (serverData.fullName || serverUser.username || '').split(' ');
      
      const mergedProfile = {
        ...localUser,
        ...serverUser,
        firstName: fullNameParts[0] || '',
        lastName: fullNameParts.slice(1).join(' ') || '',
        bio: serverData.notes || '',
        phone: serverData.mobileNumber || '',
      };
      
      setProfile(mergedProfile);
      setStatus(serverUser.availabilityStatus || 'Offline');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(localUser);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/profile/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(newStatus);
      
      // Update local storage
      const updatedUser = { ...localUser, availabilityStatus: newStatus };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        phone: profile.phone,
      };
      await axios.put(`${API_URL}/profile`, updateData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Update local storage
      const updatedUser = { ...localUser, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Profile saved successfully!');
    } catch (e) {
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statusOptions = [
    { label: 'Online', value: 'Online', color: '#10B981', bg: '#ECFDF5' },
    { label: 'Busy', value: 'Busy', color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Offline', value: 'Offline', color: '#64748B', bg: '#F1F5F9' },
  ];

  return (
    <div className="flex w-full h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden">
      <div className="hidden md:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col md:ml-[280px]">
        <MobileTopBar user={profile} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 mt-1">Manage your professional presence and availability.</p>
              </div>
              <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleUpdateStatus(opt.value)}
                    style={{ 
                      background: status === opt.value ? opt.bg : 'transparent',
                      color: status === opt.value ? opt.color : '#64748B',
                      borderColor: status === opt.value ? opt.color + '33' : 'transparent'
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2"
                  >
                    <span style={{ background: opt.color }} className="w-2 h-2 rounded-full" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
              {/* Professional Identity Card */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-3xl bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      <User size={48} className="text-slate-300" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-slate-500 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                      <Award size={14} className="text-primary" />
                      Consultant Professional Account
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-100">
                        Verified Expert
                      </span>
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-100">
                        WP Sync Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={profile.firstName || ''}
                          onChange={e => setProfile({...profile, firstName: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={profile.lastName || ''}
                          onChange={e => setProfile({...profile, lastName: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          value={profile.email || ''}
                          readOnly
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed outline-none text-sm font-semibold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="tel" 
                          value={profile.phone || ''}
                          onChange={e => setProfile({...profile, phone: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-semibold"
                          placeholder="+20 1XX XXX XXXX"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Biography</label>
                      <textarea 
                        rows={4}
                        value={profile.bio || ''}
                        onChange={e => setProfile({...profile, bio: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-semibold leading-relaxed"
                        placeholder="Detail your clinical experience and specialties..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <Shield size={16} className="text-primary" />
                      Encrypted Professional Connection
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <button 
                        onClick={fetchProfile}
                        className="flex-1 md:flex-none px-8 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 text-sm"
                      >
                        Reset
                      </button>
                      <button 
                        disabled={saving}
                        onClick={handleSaveProfile}
                        className="flex-1 md:flex-none px-10 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 text-sm"
                      >
                        {saving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security & System Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">System Language</h3>
                    <p className="text-xs text-slate-500 mt-0.5">English (Professional Edition)</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Session Security</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Automatic timeout active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Settings;
