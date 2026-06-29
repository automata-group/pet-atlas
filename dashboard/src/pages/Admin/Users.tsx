import React, { useEffect, useState } from 'react';
import { Loader2, Shield, UserX, ToggleLeft, ToggleRight, Sparkles, Check, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

interface UserItem {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
  city?: string;
  mobileNumber?: string;
  availabilityStatus?: string;
  createdAt?: string;
  subscription?: {
    status: string;
    planId?: number;
  };
}

const ROLE_MAP: Record<number, { label: string; color: string; icon: string }> = {
  1: { label: 'Admin',      color: 'bg-red-500/10 text-red-400 border border-red-500/20', icon: 'shield' },
  2: { label: 'Consultant', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', icon: 'medical_services' },
  3: { label: 'Manager',    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', icon: 'settings_account_box' },
  4: { label: 'Vet',        color: 'bg-green-500/10 text-green-400 border border-green-500/20', icon: 'stethoscope' },
  5: { label: 'Client',     color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20', icon: 'person' },
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [filtered, setFiltered] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Action states
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/admin/users');
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
      showToast('Failed to retrieve system users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let res = users;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(u => 
        u.username?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q) || 
        `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') res = res.filter(u => u.roleId === parseInt(roleFilter));
    setFiltered(res);
    setCurrentPage(1);
  }, [users, search, roleFilter]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleSubscription = async (user: UserItem) => {
    setActionLoading(true);
    const isActive = user.subscription?.status === 'active';
    try {
      if (isActive) {
        // Revoke / Cancel
        await api.post('/subscriptions/admin/force-cancel', { userId: user.id });
        showToast(`Successfully revoked premium access for ${user.username}`, 'success');
      } else {
        // Direct Add / Activate with 0 Payment
        await api.post('/subscriptions/admin/force-activate', { userId: user.id, planId: 2 });
        showToast(`Successfully granted free premium access to ${user.username}`, 'success');
      }
      setSelectedUser(null);
      await fetchUsers();
    } catch (e: any) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to update subscription status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.delete(`/auth/admin/users/${selectedUser.id}`);
      showToast(`Successfully removed user ${selectedUser.username} from the community`, 'success');
      setSelectedUser(null);
      setShowConfirmDelete(false);
      await fetchUsers();
    } catch (e: any) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to delete user account', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-gutter relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' 
            ? 'bg-teal-950/80 backdrop-blur-md border-teal-500/30 text-teal-200' 
            : 'bg-red-950/80 backdrop-blur-md border-red-500/30 text-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-teal-400' : 'bg-red-400'}`} />
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">User & Community Roster</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Manage system access, directly award premium access (0-payment bypass), or ban/remove members.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-background focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none" 
              placeholder="Search by name, email or username..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="w-full sm:w-48 px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-secondary"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="1">Admin</option>
            <option value="2">Consultant</option>
            <option value="3">Manager</option>
            <option value="4">Vet</option>
            <option value="5">Client</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-label-md text-label-md text-outline uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Community access</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="skeleton h-8 w-full rounded" /></td></tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-outline">No records found matching filters.</td></tr>
              ) : paginated.map(user => {
                const role = ROLE_MAP[user.roleId] || ROLE_MAP[5];
                const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
                const isSubscribed = user.subscription?.status === 'active';
                return (
                  <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                          {(fullName?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-on-background flex items-center gap-1.5">
                            {fullName}
                            {user.roleId === 1 && <Shield className="w-3.5 h-3.5 text-red-400" />}
                          </div>
                          <div className="text-xs text-outline">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md font-label-sm text-label-sm flex items-center gap-1 w-fit ${role.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{role.icon}</span>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.availabilityStatus === 'Online' ? 'bg-secondary animate-pulse' : 'bg-outline'}`} />
                        <span className="text-on-surface-variant font-medium">{user.availabilityStatus || 'Offline'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isSubscribed ? (
                        <span className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-outline-variant/35 border border-outline-variant/30 text-outline px-2.5 py-1 rounded-full text-xs font-medium">
                          Non-Subscriber
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.city || '—'}</td>
                    <td className="px-6 py-4 text-outline">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="bg-surface-container-high hover:bg-outline-variant/50 text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                      >
                        Options
                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-md border-t border-outline-variant bg-surface-container-low flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg font-label-md text-label-md transition-all ${
                  currentPage === p 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                    : 'text-outline hover:bg-surface-container-highest'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Glassmorphic User Options Dialog Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0F1E23] border border-outline-variant rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-[#15272D]">
              <div>
                <h3 className="font-h3 text-lg text-white font-bold">User Actions</h3>
                <p className="text-xs text-outline mt-0.5">{selectedUser.username} ({selectedUser.email})</p>
              </div>
              <button 
                onClick={() => { setSelectedUser(null); setShowConfirmDelete(false); }}
                className="text-outline hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-variant"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              {!showConfirmDelete ? (
                <>
                  <div className="bg-surface-container-lowest/50 border border-outline-variant rounded-xl p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Direct Subscription Bypass</h4>
                      <p className="text-xs text-outline mt-1 leading-relaxed">
                        Add or remove this member's premium community access instantly without requiring credit card details or generating WooCommerce payments.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => handleToggleSubscription(selectedUser)}
                      disabled={actionLoading}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                        selectedUser.subscription?.status === 'active'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          : 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20'
                      }`}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : selectedUser.subscription?.status === 'active' ? (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Revoke Premium Access
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Grant Free Premium Access
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowConfirmDelete(true)}
                      disabled={actionLoading}
                      className="w-full py-3 px-4 bg-outline-variant/20 hover:bg-red-950/45 text-red-400 border border-red-500/10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove from Community
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Permanently Remove Member?</h4>
                      <p className="text-xs text-red-300 mt-1 leading-relaxed">
                        This actions will soft-delete their user record and permanently revoke community chat privileges, active listings, and consultations. This cannot be undone easily.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 border border-outline-variant rounded-xl text-xs font-bold text-outline hover:text-white hover:bg-surface-variant transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveUser}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/25 transition-all"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          Confirm Removal
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
