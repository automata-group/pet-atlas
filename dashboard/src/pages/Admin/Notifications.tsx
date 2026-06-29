import React, { useEffect, useState } from 'react';
import { Bell, Send, Users, Megaphone, AlertCircle, CheckCircle, Plus, Trash2, Clock, Smartphone, Target, Edit3, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/Modal';

interface Notification {
  id: number;
  title: string;
  body: string;
  target: 'all' | 'users' | 'consultants';
  type: 'info' | 'warning' | 'success' | 'promo';
  sentAt?: string;
  status: 'sent' | 'scheduled' | 'draft';
  reach?: number;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  info:    { label: 'System Info', color: 'blue',   icon: Bell },
  warning: { label: 'Alert',       color: 'orange', icon: AlertCircle },
  success: { label: 'Service',    color: 'green',  icon: CheckCircle },
  promo:   { label: 'Marketing',   color: 'purple', icon: Megaphone },
  general: { label: 'General',     color: 'slate',  icon: Bell },
};

const TARGET_CONFIG: Record<string, { label: string; color: string }> = {
  all:         { label: 'Global Audience',    color: 'bg-primary-container/20 text-primary border-primary/20' },
  users:       { label: 'Patient Network',   color: 'bg-secondary-container/20 text-secondary border-secondary/20' },
  consultants: { label: 'Medical Staff',  color: 'bg-tertiary-container/20 text-tertiary border-tertiary/20' },
};

const NotificationsPage: React.FC = () => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', target: 'all' as const, type: 'info' as const });
  const [sending, setSending] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications/all');
      const formatted = (res.data || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        target: n.userId === 0 ? 'all' : 'users',
        type: n.type || 'info',
        sentAt: n.createdAt,
        status: 'sent',
        reach: n.userId === 0 ? 1400 : 1
      }));
      setNotifs(formatted);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const totalPages = Math.ceil(notifs.length / itemsPerPage);
  const paginated = notifs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/notifications/broadcast', {
        title: form.title,
        message: form.body,
        target: form.target,
        type: form.type
      });
      await fetchNotifs();
      setShowModal(false);
      setForm({ title: '', body: '', target: 'all', type: 'info' });
      setCurrentPage(1);
    } catch (e) {
      console.error('Failed to broadcast:', e);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(confirm('Delete this notification record?')) {
      // In a real app, you'd have a delete endpoint. For now we just filter UI or you can add @Delete in backend.
      setNotifs(prev => prev.filter(n => n.id !== id));
    }
  };

  const sentCount = notifs.length;
  const totalReach = notifs.reduce((sum, n) => sum + (n.reach || 0), 0);

  return (
    <div className="space-y-gutter">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">Broadcast Center</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Reach your community with push notifications and system alerts.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-primary-container transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          New Broadcast
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {[
          { label: 'Broadcasts Sent', value: sentCount, icon: Send, color: 'primary' },
          { label: 'Queued Drafts', value: notifs.filter(n => n.status === 'draft').length, icon: Clock, color: 'secondary' },
          { label: 'Lifetime Reach', value: totalReach.toLocaleString(), icon: Users, color: 'tertiary' },
          { label: 'Active Promos', value: notifs.filter(n => n.type === 'promo').length, icon: Megaphone, color: 'primary' },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm group hover:border-primary transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-outline uppercase">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors`}>
                <s.icon size={18} />
              </div>
            </div>
            <div className="font-display text-display text-on-background">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Notification Feed */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-h3 text-h3 text-on-background flex items-center gap-2">
            <Smartphone size={20} className="text-primary" />
            Communication History
          </h2>
        </div>

        <div className="divide-y divide-outline-variant">
          {paginated.map(n => {
            const typeConfig = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
            const targetConfig = TARGET_CONFIG[n.target] || TARGET_CONFIG.all;
            const TypeIcon = typeConfig.icon || Bell;
            
            return (
              <div key={n.id} className="p-6 hover:bg-surface-container-low/50 transition-colors flex flex-col md:flex-row gap-6 items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 bg-${typeConfig.color}-container/20 text-${typeConfig.color}`}>
                  <TypeIcon size={24} />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-body-lg text-on-background">{n.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${targetConfig.color}`}>
                      {targetConfig.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                      n.status === 'sent' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                    }`}>
                      {n.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">{n.body}</p>
                  
                  <div className="flex flex-wrap gap-6 text-[11px] text-outline font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {n.sentAt ? new Date(n.sentAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Scheduled'}
                    </div>
                    {n.reach !== undefined && n.reach > 0 && (
                      <div className="flex items-center gap-1.5 text-secondary">
                        <Target size={14} />
                        Reach: {n.reach.toLocaleString()} members
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 self-end md:self-start">
                  <button className="p-2 hover:bg-surface-variant rounded-lg text-outline transition-colors"><Edit3 size={18} /></button>
                  <button 
                    onClick={() => handleDelete(n.id)}
                    className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {paginated.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto opacity-20">
                <Bell size={32} />
              </div>
              <p className="text-outline font-medium">Your broadcast inbox is empty</p>
            </div>
          )}
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

      {/* Broadcast Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Broadcast"
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs text-outline">Compose your system-wide message.</p>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">Headline</label>
                <input 
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm text-on-background outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="Short descriptive title" required
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">Message Content</label>
                <textarea 
                  className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm text-on-background outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="What would you like to say?" rows={4} required
                  value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface">Audience</label>
                  <select 
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm outline-none"
                    value={form.target} onChange={e => setForm({ ...form, target: e.target.value as any })}
                  >
                    <option value="all">Global</option>
                    <option value="users">Patients</option>
                    <option value="consultants">Medical Staff</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface">Priority</label>
                  <select 
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm outline-none"
                    value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}
                  >
                    <option value="info">General</option>
                    <option value="warning">Urgent</option>
                    <option value="promo">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" className="flex-1 py-2.5 rounded-lg font-bold text-sm text-outline hover:bg-surface-variant transition-all" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2" disabled={sending}>
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Broadcast</>}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-surface-container rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Smartphone size={200} />
             </div>
             
             <div className="w-full max-w-[240px] space-y-4 relative z-10">
               <div className="text-[10px] text-outline font-bold uppercase tracking-widest text-center mb-6">Live Push Preview</div>
               
               {/* Mobile Mockup Notification */}
               <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                     <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center text-white text-[10px]">🐾</div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase">Pet Atlas</span>
                   </div>
                   <span className="text-[10px] text-slate-400">Now</span>
                 </div>
                 <div className="font-bold text-slate-900 text-xs mb-0.5">{form.title || 'Broadcast Headline'}</div>
                 <div className="text-[11px] text-slate-600 line-clamp-2 leading-snug">{form.body || 'Your notification content will appear here...'}</div>
               </div>

               <div className="text-[10px] text-center text-outline/50 mt-4 italic">Sent via {TARGET_CONFIG[form.target].label.split(' ')[0]} Channel</div>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
