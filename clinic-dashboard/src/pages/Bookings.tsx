import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { 
  Calendar, 
  Check, 
  X, 
  CheckCircle2, 
  Clock, 
  User, 
  Heart,
  Filter,
  DollarSign
} from 'lucide-react';
import { API_URL } from '../config';

const Bookings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
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

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bookings/consultant`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to load clinic bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: `Booking status updated successfully to ${status}!` });
      loadBookings(); // Refresh bookings
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setMessage({ type: 'error', text: 'Could not synchronize status change.' });
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
          <p className="text-[#9ab0c0] font-semibold text-sm">Retrieving schedule registries...</p>
        </div>
      </div>
    );
  }

  // Filtering Logic
  const filteredBookings = filterStatus === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="h-screen w-screen bg-[#0F1E23] text-white overflow-hidden md:pl-[280px] flex flex-col">
      <Sidebar onLogout={handleLogout} />
      <TopBar user={user} />
      <MobileTopBar user={user} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 pt-20 md:pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Clinic Appointments</h1>
            <p className="text-xs md:text-sm text-[#9ab0c0] mt-1">Review scheduled vet consultations, verify patient data, and approve slots.</p>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#14252c] border border-white/5 p-1 rounded-xl shrink-0">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all uppercase tracking-wide ${
                  filterStatus === status 
                    ? 'bg-[#008B8B] text-white shadow-md shadow-[#008B8B]/15' 
                    : 'text-[#9ab0c0] hover:text-white hover:bg-white/5'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold border transition-all ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Bookings Table / Roster */}
        <div className="bg-[#14252c] border border-white/5 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-extrabold text-lg text-white">Appointments Registry ({filteredBookings.length})</h3>
          </div>

          <div className="divide-y divide-white/5">
            {filteredBookings.length === 0 ? (
              <div className="py-16 text-center text-[#5e7a8e] text-sm">
                No bookings matches found in this category.
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div key={b.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:bg-white/[0.01]">
                  {/* Left: Patient and Slot metadata */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0F1E23] border border-white/5 flex items-center justify-center text-[#008B8B] shrink-0 font-extrabold">
                      <User size={20} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-white text-base">{b.user?.firstName || 'Patient Account'}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          b.status === 'CONFIRMED' ? 'bg-[#008B8B]/10 text-[#008B8B] border border-[#008B8B]/20' :
                          b.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          'bg-white/5 text-[#9ab0c0] border border-white/5'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#9ab0c0]">
                        Pet: <span className="text-white font-semibold">{b.pet?.name || 'Not specified'}</span> ({b.pet?.species || 'N/A'})
                      </p>
                      <p className="text-xs text-[#9ab0c0] flex items-center gap-1.5 pt-0.5">
                        <Calendar size={12} className="text-[#008B8B]" />
                        <span className="text-white font-medium">
                          {new Date(b.bookingDate).toLocaleDateString()} at {b.timeSlot || '09:00 AM'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Selection pricing list */}
                  <div className="space-y-1 lg:max-w-xs">
                    <span className="text-[10px] uppercase font-bold text-[#5e7a8e] tracking-widest block">Selected Service Roster</span>
                    <div className="text-xs font-semibold text-[#9ab0c0] line-clamp-2 leading-relaxed">
                      {b.selectedServices && b.selectedServices.length > 0 
                        ? b.selectedServices.map((s: any) => `${s.name} ($${s.price})`).join(', ')
                        : 'General Checkup Consultation'}
                    </div>
                    <div className="text-xs text-[#008B8B] font-extrabold flex items-center gap-1 mt-1">
                      <DollarSign size={12} />
                      <span>Total: ${parseFloat(b.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t border-white/5 pt-4 lg:border-none lg:pt-0">
                    {b.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                          className="flex-1 lg:flex-none px-4 py-2 bg-[#008B8B] hover:bg-[#008B8B]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#008B8B]/10"
                        >
                          <Check size={14} />
                          <span>Approve Slot</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                          className="flex-1 lg:flex-none px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-[#9ab0c0] border border-white/5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        >
                          <X size={14} />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {b.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                          className="flex-1 lg:flex-none px-4 py-2 bg-[#008B8B] hover:bg-[#008B8B]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#008B8B]/10"
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark Completed</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                          className="flex-1 lg:flex-none px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-[#9ab0c0] border border-white/5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        >
                          <X size={14} />
                          <span>Cancel Booking</span>
                        </button>
                      </>
                    )}

                    {['COMPLETED', 'CANCELLED'].includes(b.status) && (
                      <span className="text-[#5e7a8e] text-xs font-semibold select-none py-2 px-3 border border-white/5 bg-[#0F1E23] rounded-lg">
                        Session Concluded
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Bookings;
