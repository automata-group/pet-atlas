import React, { useEffect, useState } from 'react';
import { UserPlus, UserMinus, Shield, Search, Loader2 } from 'lucide-react';
import api from '../../utils/api';

interface TeamMember {
  id: number;
  userId: number;
  role: string;
  user: {
    username: string;
    email: string;
  };
}

const ClinicTeam: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [adding, setAdding] = useState(false);

  // Associated primary listing ID managed by this clinic operator
  const [listingId, setListingId] = useState<number | null>(null);

  useEffect(() => {
    fetchListingAndTeam();
  }, []);

  const fetchListingAndTeam = async () => {
    try {
      // Query primary clinic directories and match current active listing for current user
      const listingsRes = await api.get('/directory');
      const userStr = localStorage.getItem('user');
      let user: any = null;
      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
      
      const myListing = listingsRes.data.find((l: any) => l.ownerId == user?.id);
      if (myListing) {
        setListingId(myListing.id);
        const teamRes = await api.get(`/directory/${myListing.id}/team`);
        setTeam(teamRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch team', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!listingId || !newUserId) return;
    setAdding(true);
    try {
      await api.post(`/directory/${listingId}/team`, {
        userId: parseInt(newUserId),
        role: 'Consultant'
      });
      fetchListingAndTeam();
      setNewUserId('');
    } catch (err) {
      alert('Failed to add member. Make sure the User ID is correct.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!listingId) return;
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.post(`/directory/${listingId}/team/remove`, { userId });
      fetchListingAndTeam();
    } catch (err) {
      alert('Failed to remove member.');
    }
  };

  return (
    <div className="p-10 max-w-6xl w-full mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-slate-400">Manage your clinic's consultants and responders</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card p-4 flex items-center gap-4 border-[var(--primary)]/30 rounded-2xl">
            <Shield className="text-[var(--primary)]" size={24} />
            <div>
              <div className="text-xs text-slate-500">Official Clinic Status</div>
              <div className="text-sm font-bold text-[var(--primary)]">VERIFIED</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6">Add Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">User ID to Add</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="number"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Enter User ID"
                  />
                </div>
              </div>
              <button
                onClick={handleAddMember}
                disabled={adding || !newUserId}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {adding ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Add to Team
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="glass-card p-8 min-h-[400px]">
            <h3 className="text-xl font-bold text-white mb-6">Current Team Members</h3>
            {loading ? (
              <div className="text-center py-20 text-slate-500">Loading team...</div>
            ) : team.length === 0 ? (
              <div className="text-center py-20 text-slate-500">No team members added yet.</div>
            ) : (
              <div className="space-y-4">
                {team.map((member) => (
                  <div key={member.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)] font-bold border border-[var(--primary)]/20">
                        {(member.user?.username?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-bold">{member.user.username}</div>
                        <div className="text-xs text-slate-500">{member.user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs px-3 py-1 bg-slate-700 rounded-full text-slate-300 font-medium">
                        {member.role}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <UserMinus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicTeam;
