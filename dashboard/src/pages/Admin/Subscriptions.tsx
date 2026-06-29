import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, Users, TrendingUp, Star, Zap, Crown, X, Plus, Calendar, Filter, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../utils/api';

interface Plan {
  id: number;
  name: string;
  price: number;
  period: string;
  features: string[];
  color: string;
  subscribers: number;
  icon: any;
}

interface Subscriber {
  id: number;
  username: string;
  email: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
}

const PLANS: Plan[] = [
  { id: 1, name: 'Basic', price: 0, period: 'Free', features: ['3 consultations/month', 'Directory access', 'Community chat'], color: 'slate', subscribers: 0, icon: Star },
  { id: 2, name: 'Pro', price: 49, period: 'month', features: ['Unlimited consultations', 'Priority support', 'Voice messages', 'File sharing'], color: 'primary', subscribers: 0, icon: Zap },
  { id: 3, name: 'Premium', price: 149, period: 'month', features: ['Everything in Pro', 'Dedicated vet', 'Emergency response', 'Health reports'], color: 'secondary', subscribers: 0, icon: Crown },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700 border-green-200' },
  expired:   { label: 'Expired',   color: 'bg-orange-100 text-orange-700 border-orange-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
};

const SubscriptionsPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, activePaid: 0, totalSubscribers: 0, tierDistribution: { basic: 0, pro: 0, premium: 0 } });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsRes, statsRes] = await Promise.all([
          api.get('/subscriptions/all'),
          api.get('/subscriptions/admin/stats')
        ]);
        
        const formattedSubs = (subsRes.data || []).map((s: any) => ({
          id: s.id,
          username: s.user?.username || 'Unknown',
          email: s.user?.email || 'N/A',
          plan: s.planId === 3 ? 'Premium' : s.planId === 2 ? 'Pro' : 'Basic',
          startDate: new Date(s.currentPeriodStart).toLocaleDateString(),
          endDate: new Date(s.currentPeriodEnd).toLocaleDateString(),
          status: s.status
        }));
        
        setSubscribers(formattedSubs);
        setStats(statsRes.data);
      } catch (e) {
        console.error('Failed to fetch subscription data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const filtered = statusFilter === 'all' ? subscribers : subscribers.filter(s => s.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalUsers = stats.totalSubscribers || 1; // avoid div by 0
  const revenue = stats.totalRevenue;

  return (
    <div className="space-y-gutter">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">Revenue Hub</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Monitor membership tiers, renewals, and platform monetization.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface-container-highest text-on-surface px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-outline-variant transition-colors border border-outline-variant">
            <Filter size={16} />
            Reports
          </button>
          <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-primary-container transition-all shadow-lg shadow-primary/20">
            <CreditCard size={16} />
            Billing Settings
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {[
          { label: 'Total Members', value: totalUsers.toLocaleString(), icon: Users, color: 'primary' },
          { label: 'Recurring Revenue', value: `$${revenue.toLocaleString()}`, icon: TrendingUp, color: 'secondary' },
          { label: 'Paid Subscriptions', value: (340 + 87).toString(), icon: CreditCard, color: 'tertiary' },
          { label: 'Elite Tier', value: '87', icon: Crown, color: 'secondary' },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-outline uppercase">{s.label}</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <s.icon size={18} />
              </div>
            </div>
            <div className="font-display text-display text-on-background">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Plans Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const planSubscribers = plan.name === 'Premium' ? stats.tierDistribution.premium : plan.name === 'Pro' ? stats.tierDistribution.pro : stats.tierDistribution.basic;
          const pct = Math.round((planSubscribers / totalUsers) * 100);
          return (
            <div key={plan.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-${plan.color}-container/20 flex items-center justify-center text-${plan.color}`}>
                  <Icon size={24} />
                </div>
                <div className="text-right">
                  <div className="font-display text-h2 text-on-background">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </div>
                  {plan.price > 0 && <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Per {plan.period}</div>}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-h3 text-h3 text-on-background">{plan.name} Tier</h3>
                <p className="text-sm text-outline mt-1">{planSubscribers.toLocaleString()} active members</p>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-[11px] font-bold text-outline uppercase">
                  <span>Market Share</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 bg-${plan.color}`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-label-sm text-label-sm text-on-background uppercase tracking-widest mb-4">Core Benefits</div>
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <div className={`w-5 h-5 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary`}>
                      <CheckCircle size={12} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-3 border border-outline-variant rounded-xl font-label-md text-label-md text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 group">
                Review Tier Data
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Subscriber Management Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <div>
            <h2 className="font-h3 text-h3 text-on-background">Membership Audit</h2>
            <p className="text-xs text-outline mt-0.5">Real-time status of professional and patient subscriptions.</p>
          </div>
          <select 
            className="px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-secondary"
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Membership Status</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-label-md text-label-md text-outline uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Subscriber</th>
                <th className="px-6 py-4">Current Tier</th>
                <th className="px-6 py-4">Lifecycle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {paginated.map(sub => {
                const config = STATUS_CONFIG[sub.status];
                return (
                  <tr key={sub.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold">
                          {(sub.username?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-on-background">{sub.username}</div>
                          <div className="text-xs text-outline">{sub.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-md font-bold text-[10px] uppercase flex items-center gap-1.5 w-fit ${
                        sub.plan === 'Premium' ? 'bg-secondary-container/30 text-secondary border border-secondary/20' : 'bg-primary-container/30 text-primary border border-primary/20'
                      }`}>
                        {sub.plan === 'Premium' ? <Crown size={12} /> : <Zap size={12} />}
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                          <Calendar size={14} className="text-outline" />
                          Ends: {sub.endDate}
                        </div>
                        <div className="text-[10px] text-outline uppercase font-bold tracking-tighter">Started: {sub.startDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full border font-label-md text-[10px] uppercase font-bold w-fit block text-center ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-variant rounded-lg text-outline transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
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
    </div>
  );
};

export default SubscriptionsPage;
