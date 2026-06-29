import React, { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../utils/api';

interface Stats {
  users?: { total: number; admins: number; consultants: number; clients: number };
  chats?: number;
  bookings?: number;
  listings?: number;
  pendingBookings?: number;
  activeConsults?: number;
}

interface Chat {
  id: string; name: string; type: string; memberCount: number; status?: string;
  lastMessage?: { content: string; createdAt: string; sender?: { username: string } };
}

interface Booking {
  id: number; status: string; bookingDate: string; createdAt: string;
  user?: { username: string }; listing?: { name: string };
}

const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, chatsRes, bookingsRes] = await Promise.allSettled([
        api.get('/auth/admin/stats'),
        api.get('/chats/admin/all'),
        api.get('/bookings/admin/all'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (chatsRes.status === 'fulfilled') setChats(chatsRes.value.data || []);
      if (bookingsRes.status === 'fulfilled') setRecentBookings((bookingsRes.value.data || []).slice(0, 5));
    } catch (e) {
      console.error('Stats fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const kpiCards = [
    { label: 'System Health', value: '99.9%', icon: 'vital_signs', color: 'primary', sub: 'Uptime', up: true },
    { label: 'Active Consults', value: stats.activeConsults?.toString() || '0', icon: 'chat', color: 'tertiary', sub: 'Live Rooms', up: true },
    { label: 'Total Bookings', value: stats.bookings?.toString() || '0', icon: 'book_online', color: 'secondary', sub: 'Today', up: false },
  ];

  return (
    <div className="space-y-gutter">
      {/* Header */}
      <div className="flex justify-between items-end pb-sm">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">System Overview</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Real-time clinical metrics and platform health.</p>
        </div>
        <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-primary-container transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm relative overflow-hidden group hover:border-primary-fixed-dim transition-colors">
            <div className="absolute top-0 right-0 p-md opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[64px]" style={{ color: `var(--${card.color})` }}>monitoring</span>
            </div>
            <div className="flex items-center gap-sm mb-md">
              <div className={`w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center`} style={{ color: `var(--${card.color})` }}>
                <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">{card.label}</span>
            </div>
            <div className="font-display text-display text-on-background mb-xs">
              {loading ? <span className="skeleton inline-block w-24 h-10 rounded" /> : card.value}
            </div>
            <div className={`flex items-center gap-xs font-label-sm text-label-sm ${card.up ? 'text-secondary' : 'text-error'}`}>
              <span className="material-symbols-outlined text-[14px]">{card.up ? 'arrow_upward' : 'arrow_downward'}</span>
              <span>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col">
          <div className="p-md border-b border-outline-variant flex justify-between items-center">
            <h2 className="font-h3 text-h3 text-on-background">Consultation Trends</h2>
            <div className="flex gap-sm">
              <span className="px-sm py-xs rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-variant">Day</span>
              <span className="px-sm py-xs rounded bg-primary text-on-primary font-label-sm text-label-sm cursor-pointer shadow-sm">Week</span>
              <span className="px-sm py-xs rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-variant">Month</span>
            </div>
          </div>
          <div className="flex-1 p-md relative chart-grid min-h-[300px] flex items-end">
            <div className="w-full flex justify-between items-end h-64 gap-3 px-sm">
              {[40, 60, 45, 80, 70, 95, 50].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-full rounded-t-sm relative group transition-all duration-300 ${i === 3 ? 'bg-primary' : i === 5 ? 'bg-secondary' : 'bg-surface-variant hover:bg-primary-fixed-dim'}`}
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-background text-surface-container-lowest px-2 py-1 rounded text-[10px] hidden group-hover:block whitespace-nowrap">
                    {Math.round(h * 1.5)} chats
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-md py-sm border-t border-outline-variant flex justify-between text-outline font-label-sm text-label-sm">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
          </div>
        </div>

        {/* Recent Bookings List */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[450px]">
          <div className="p-md border-b border-outline-variant flex justify-between items-center">
            <h2 className="font-h3 text-h3 text-on-background">Recent Bookings</h2>
            <button onClick={() => window.location.href='/admin/bookings'} className="text-primary hover:text-secondary font-label-md text-label-md">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 w-full rounded-lg" />)}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="p-8 text-center text-muted">No recent bookings</div>
            ) : (
              <ul className="divide-y divide-surface-container-low">
                {recentBookings.map((b) => (
                  <li key={b.id} className="p-md hover:bg-surface transition-colors cursor-pointer flex items-start gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-sm">
                      {(b.user?.username?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-body-md text-body-md font-medium text-on-background truncate">{b.user?.username || 'Guest'}</span>
                        <span className="font-label-sm text-label-sm text-outline">
                          {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs mt-xs truncate">
                        <span className="material-symbols-outlined text-[14px]">medical_services</span> 
                        {b.listing?.name || 'Appointment'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
