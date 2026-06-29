import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  AlertCircle,
  FileText,
  Bookmark
} from 'lucide-react';
import { API_URL } from '../config';

const TeamManagement: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);

  // Add Member State
  const [userIdToAdd, setUserIdToAdd] = useState('');
  const [memberRole, setMemberRole] = useState('Responder');
  const [saving, setSaving] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Partner Listings
      const listingRes = await axios.get(`${API_URL}/directory/my`, { headers });
      
      if (listingRes.data && listingRes.data.length > 0) {
        const activeItem = listingRes.data[0];
        setListing(activeItem);

        // 2. Fetch Team
        const teamRes = await axios.get(`${API_URL}/directory/${activeItem.id}/team`, { headers });
        setTeam(teamRes.data);
      }
    } catch (err) {
      console.error('Failed to load clinic team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTeam();
    }
  }, [user]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) {
      setMessage({ type: 'error', text: 'You must create a directory listing profile first!' });
      return;
    }
    if (!userIdToAdd.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`${API_URL}/directory/${listing.id}/team`, {
        userId: parseInt(userIdToAdd),
        role: memberRole
      }, { headers });

      setMessage({ type: 'success', text: 'Team member associated successfully!' });
      setUserIdToAdd('');
      
      // Reload team list
      const teamRes = await axios.get(`${API_URL}/directory/${listing.id}/team`, { headers });
      setTeam(teamRes.data);
      
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to add team member:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to link user. Verify User ID exists and is a valid consultant.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Are you sure you want to remove this staff member from the clinic roster?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`${API_URL}/directory/${listing.id}/team/remove`, {
        userId
      }, { headers });

      setMessage({ type: 'success', text: 'Staff member removed from clinic directory.' });
      
      // Reload team list
      const teamRes = await axios.get(`${API_URL}/directory/${listing.id}/team`, { headers });
      setTeam(teamRes.data);
      
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to remove team member:', err);
      setMessage({ type: 'error', text: 'Failed to disassociate staff member.' });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1E23] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#008B8B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#9ab0c0] font-semibold text-sm">Retrieving roster associates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0F1E23] text-white overflow-hidden md:pl-[280px] flex flex-col">
      <Sidebar onLogout={handleLogout} />
      <TopBar user={user} />
      <MobileTopBar user={user} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 pt-20 md:pt-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Team Roster</h1>
          <p className="text-xs md:text-sm text-[#9ab0c0] mt-1">Manage associate doctors, primary responders, and consultants registered under your clinic profile.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold border transition-all ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {!listing ? (
          <div className="bg-[#14252c] border border-white/5 rounded-2xl p-12 text-center shadow-lg">
            <Users className="mx-auto text-[#5e7a8e] mb-4" size={48} />
            <h3 className="font-extrabold text-lg text-white mb-2">No Clinic Directory Listing Registered</h3>
            <p className="text-sm text-[#9ab0c0] max-w-md mx-auto mb-6">
              You must register a clinic directory listing first before associating veterinary staff or team members.
            </p>
            <button
              onClick={() => navigate('/listing')}
              className="px-6 py-3 bg-[#008B8B] hover:bg-[#008B8B]/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Configure Listing Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roster Listing */}
            <div className="lg:col-span-2 bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="font-extrabold text-lg border-b border-white/5 pb-3">Roster List</h3>
              
              <div className="divide-y divide-white/5">
                {team.length === 0 ? (
                  <div className="py-12 text-center text-[#5e7a8e] text-sm">
                    No staff or veterinarians assigned to this clinic directory.
                  </div>
                ) : (
                  team.map((member) => (
                    <div key={member.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0F1E23] border border-white/5 flex items-center justify-center text-[#008B8B] font-extrabold uppercase shrink-0">
                          {member.user?.firstName?.substring(0, 2) || 'V'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {member.user?.firstName || 'User'} {member.user?.lastName || ''}
                          </p>
                          <p className="text-xs text-[#9ab0c0] mt-0.5 flex items-center gap-1">
                            <Mail size={12} className="text-[#5e7a8e]" />
                            <span>{member.user?.email || 'No email registered'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#008B8B]/10 text-white border border-[#008B8B]/20">
                          {member.role}
                        </span>
                        
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-2 hover:bg-red-400/5 hover:text-red-400 text-[#5e7a8e] rounded-lg transition-all"
                          title="Remove from roster"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Associate new member panel */}
            <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-lg border-b border-white/5 pb-3">Link Staff Member</h3>
                <p className="text-xs text-[#9ab0c0] mt-2 leading-relaxed">
                  Enter an existing user account's User ID to link them as a veterinarian, specialist, or responder under your clinic profile.
                </p>

                <form onSubmit={handleAddMember} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Associate User ID</label>
                    <input
                      className="block w-full px-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                      type="number"
                      value={userIdToAdd}
                      onChange={(e) => setUserIdToAdd(e.target.value)}
                      placeholder="e.g. 15"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Roster Role Description</label>
                    <select
                      className="block w-full px-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B]"
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                    >
                      <option value="Primary Vet">Primary Veterinarian</option>
                      <option value="Surgeon">Veterinary Surgeon</option>
                      <option value="Specialist">Specialist Partner</option>
                      <option value="Responder">Responder</option>
                      <option value="Assistant">Clinical Assistant</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex justify-center items-center gap-2 py-3 bg-[#008B8B] hover:bg-[#008B8B]/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#008B8B]/10 active:scale-95 disabled:opacity-75"
                  >
                    <UserPlus size={16} />
                    <span>{saving ? 'Linking Account...' : 'Link Account'}</span>
                  </button>
                </form>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex gap-2.5 text-xs text-[#9ab0c0] leading-relaxed">
                <AlertCircle size={20} className="text-[#008B8B] shrink-0 mt-0.5" />
                <span>
                  The user must already hold a valid Consultant/Doctor account status inside the Pet-Atlas database to be successfully resolved.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default TeamManagement;
