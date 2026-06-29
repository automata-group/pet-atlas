import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { User, Shield, Key, Mail, Globe, Clock, Save, Lock, AlertTriangle } from 'lucide-react';
import { API_URL } from '../config';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [profile, setProfile] = useState<any>(localUser);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password reset state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

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
        firstName: fullNameParts[0] || serverUser.firstName || '',
        lastName: fullNameParts.slice(1).join(' ') || serverUser.lastName || '',
        bio: serverData.notes || '',
        phone: serverData.mobileNumber || '',
      };
      
      setProfile(mergedProfile);
      localStorage.setItem('user', JSON.stringify(mergedProfile));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(localUser);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
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
      
      const updatedUser = { ...localUser, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage({ type: 'success', text: 'Partner profile saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to update partner profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setUpdatingPassword(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      // WP user password change proxy endpoint or custom user update
      await axios.patch(`${API_URL}/profile/password`, {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Secure credentials rotated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not verify current password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen bg-[#0F1E23] text-white overflow-hidden md:pl-[280px] flex flex-col">
      <Sidebar onLogout={handleLogout} />
      <TopBar user={profile} />
      <MobileTopBar user={profile} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 pt-20 md:pt-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Account Settings</h1>
          <p className="text-xs md:text-sm text-[#9ab0c0] mt-1">Manage credentials, contact synchronization, and portal security.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold border transition-all ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg space-y-5">
              <h3 className="font-extrabold text-lg border-b border-white/5 pb-3">Partner Identity</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">First Name</label>
                  <input
                    className="block w-full px-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                    type="text"
                    value={profile.firstName || ''}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Last Name</label>
                  <input
                    className="block w-full px-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                    type="text"
                    value={profile.lastName || ''}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Email Address</label>
                  <input
                    className="block w-full px-4 py-3 bg-[#0F1E23]/50 border border-white/5 rounded-xl text-sm text-[#5e7a8e] cursor-not-allowed outline-none"
                    type="email"
                    value={profile.email || ''}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Mobile Number</label>
                  <input
                    className="block w-full px-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Short Bio</label>
                <textarea
                  rows={3}
                  className="block w-full px-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all leading-relaxed"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us a little about your role..."
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5 gap-4">
                <div className="flex items-center gap-1.5 text-xs text-[#5e7a8e]">
                  <Shield size={14} className="text-[#008B8B]" />
                  <span>WP Synced Secure Partner Node</span>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#008B8B] hover:bg-[#008B8B]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#008B8B]/10"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Security rotation & Metadata */}
          <div className="space-y-6">
            {/* Credentials Rotation */}
            <form onSubmit={handleUpdatePassword} className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="font-extrabold text-lg border-b border-white/5 pb-3">Rotate Credentials</h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Current Password</label>
                <input
                  className="block w-full px-4 py-2.5 bg-[#0F1E23] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-[#008B8B]"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">New Password</label>
                <input
                  className="block w-full px-4 py-2.5 bg-[#0F1E23] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-[#008B8B]"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Confirm Password</label>
                <input
                  className="block w-full px-4 py-2.5 bg-[#0F1E23] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-[#008B8B]"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2.5 bg-[#0F1E23] hover:bg-[#0F1E23]/90 text-white border border-white/5 hover:border-[#008B8B]/40 rounded-xl text-xs font-bold transition-all"
              >
                {updatingPassword ? 'Validating...' : 'Rotate Password'}
              </button>
            </form>

            {/* General Metadata Info */}
            <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="font-extrabold text-sm text-[#008B8B] uppercase tracking-wider">System Metadata</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#5e7a8e]">System Language</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Globe size={12} className="text-[#008B8B]" />
                    English (US)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5e7a8e]">System Version</span>
                  <span className="font-bold text-white">v4.2.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5e7a8e]">Partner Handshake</span>
                  <span className="font-bold text-green-400 flex items-center gap-1">
                    <Lock size={12} />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Settings;
