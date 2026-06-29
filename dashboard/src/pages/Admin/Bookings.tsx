import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../utils/api';

interface Booking {
  id: number; status: string; notes?: string; bookingDate?: string; createdAt: string;
  totalPrice?: number; userId?: number; listingId?: number;
  user?: { username: string; email: string; firstName?: string; lastName?: string };
  listing?: { name: string; type: string; city?: string };
  pet?: { name: string; type: string };
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:   { label: 'Pending',   color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'schedule' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: 'check_circle' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200',   icon: 'task_alt' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200',       icon: 'cancel' },
};

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/bookings/admin/all');
        setBookings(res.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    let res = bookings;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(b => b.user?.username?.toLowerCase().includes(q) || b.listing?.name?.toLowerCase().includes(q) || String(b.id).includes(q));
    }
    if (statusFilter !== 'all') res = res.filter(b => b.status === statusFilter);
    setFiltered(res);
  }, [bookings, search, statusFilter]);

  const handleStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">Service Bookings</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Audit clinical appointments and facility reservations.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-background outline-none focus:ring-2 focus:ring-secondary transition-all" 
              placeholder="Filter by user or facility..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="w-full sm:w-48 px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-secondary"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-label-md text-label-md text-outline uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Identity / Patient</th>
                <th className="px-6 py-4">Facility</th>
                <th className="px-6 py-4">Scheduled Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="skeleton h-12 w-full rounded" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-outline">No records archived.</td></tr>
              ) : filtered.map(b => {
                const s = STATUS_MAP[b.status] || STATUS_MAP.PENDING;
                return (
                  <tr key={b.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">#{b.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary">
                          {(b.user?.username?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-on-background">{b.user?.username || 'Guest'}</div>
                          <div className="text-[10px] text-outline uppercase font-bold tracking-tighter">{b.pet ? `${b.pet.name} (${b.pet.type})` : 'No patient linked'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">hospital</span>
                        <div>
                          <div className="text-on-surface-variant font-medium">{b.listing?.name || 'Unknown Facility'}</div>
                          <div className="text-xs text-outline">{b.listing?.city || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
                        {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full border font-label-md text-[10px] uppercase font-bold flex items-center gap-1 w-fit ${s.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {b.status === 'PENDING' && (
                          <button onClick={() => handleStatus(b.id, 'CONFIRMED')} className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold shadow-sm hover:bg-primary-container transition-all">Confirm</button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button onClick={() => handleStatus(b.id, 'COMPLETED')} className="px-3 py-1.5 bg-secondary text-on-secondary rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all">Complete</button>
                        )}
                        <button className="p-1.5 hover:bg-surface-variant rounded-lg text-outline transition-colors"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
