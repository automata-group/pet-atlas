import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/bookings/consultant', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings(); // refresh list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex w-full h-screen bg-background text-on-background font-sans antialiased overflow-hidden">
      <div className="hidden md:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col md:ml-[280px]">
        <MobileTopBar user={user} />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto pt-20 md:pt-10 pb-24 md:pb-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-on-surface">Schedule</h1>
            <p className="text-slate-500 mt-2">Manage your upcoming consultations and bookings.</p>
          </header>

          <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Upcoming Appointments
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading schedule...</div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p>No appointments scheduled.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-outline-variant">
                        <User size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-on-surface">Booking #{booking.id}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><Clock size={16} /> {new Date(booking.bookingDate).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 md:ml-auto">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.status || 'PENDING'}
                      </span>
                      
                      {booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Confirm"
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                      
                      {booking.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => updateStatus(booking.id, 'CANCELLED')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Cancel"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Schedule;
