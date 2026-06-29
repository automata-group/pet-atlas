import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { 
  Calendar, 
  Users, 
  Star, 
  Clock, 
  Plus, 
  AlertCircle,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import { API_URL } from '../config';

const Overview: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Partner Listings
        const listingRes = await axios.get(`${API_URL}/directory/my`, { headers });
        setListings(listingRes.data);

        // 2. Fetch Partner Bookings
        const bookingRes = await axios.get(`${API_URL}/bookings/consultant`, { headers });
        setBookings(bookingRes.data);

        // 3. Fetch Team roster count if listing exists
        if (listingRes.data.length > 0) {
          const firstListingId = listingRes.data[0].id;
          const teamRes = await axios.get(`${API_URL}/directory/${firstListingId}/team`, { headers });
          setTeamCount(teamRes.data.length);
        }
      } catch (err) {
        console.error('Failed to load dashboard overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[#0F1E23] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#008B8B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#9ab0c0] font-semibold text-sm">Synchronizing clinic data...</p>
        </div>
      </div>
    );
  }

  const activeListing = listings[0] || null;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

  return (
    <div className="h-screen w-screen bg-[#0F1E23] text-white overflow-hidden md:pl-[280px] flex flex-col">
      {/* Sidebar for Desktop */}
      <Sidebar onLogout={handleLogout} />

      {/* TopBar for Desktop / Mobile */}
      <TopBar user={user} />
      <MobileTopBar user={user} />

      {/* Main content scroll container */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 pt-20 md:pt-8 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Welcome back, {user.firstName || 'Partner'}! <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-[#9ab0c0] text-sm mt-1">Here is a quick overview of your clinic listing performance today.</p>
          </div>
          {activeListing && (
            <div className="inline-flex items-center gap-3 bg-[#14252c] border border-white/5 px-4 py-2 rounded-xl text-sm">
              <span className="w-2 h-2 rounded-full bg-[#008B8B]" />
              <span className="font-bold text-[#9ab0c0]">Active:</span>
              <span className="text-white font-medium">{activeListing.title}</span>
            </div>
          )}
        </div>

        {/* Bento Grid KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* KPI 1: Active Booking Requests */}
          <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-[#008B8B]/40 group shadow-lg">
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-[#008B8B]/5 rounded-full blur-xl group-hover:bg-[#008B8B]/10 transition-colors" />
            <div className="flex items-center justify-between">
              <span className="text-[#9ab0c0] text-xs font-bold uppercase tracking-wider">Scheduled Bookings</span>
              <div className="w-9 h-9 rounded-xl bg-[#008B8B]/10 flex items-center justify-center text-[#008B8B]">
                <Calendar size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-white">{bookings.length}</span>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[#9ab0c0]">
                <TrendingUp size={12} className="text-[#008B8B]" />
                <span>Overall requested slots</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Pending Approval */}
          <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-yellow-500/40 group shadow-lg">
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-colors" />
            <div className="flex items-center justify-between">
              <span className="text-[#9ab0c0] text-xs font-bold uppercase tracking-wider">Pending Action</span>
              <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-white">{pendingBookings.length}</span>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-yellow-500 font-semibold">
                <AlertCircle size={12} />
                <span>Require clinic response</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Stars / Ratings */}
          <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-[#008B8B]/40 group shadow-lg">
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-colors" />
            <div className="flex items-center justify-between">
              <span className="text-[#9ab0c0] text-xs font-bold uppercase tracking-wider">Average Rating</span>
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Star size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-white">
                {activeListing ? parseFloat(activeListing.avgStars || 0).toFixed(1) : '5.0'}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-400 font-semibold">
                <Activity size={12} />
                <span>Patient verified rating</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Active Roster */}
          <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-[#008B8B]/40 group shadow-lg">
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between">
              <span className="text-[#9ab0c0] text-xs font-bold uppercase tracking-wider">Active Staff</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-white">{teamCount}</span>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[#9ab0c0]">
                <span>Veterinarians & reps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Layout Main Splitting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Booking Slots */}
          <div className="lg:col-span-2 bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="font-extrabold text-lg text-white">Recent Booking Actions</h3>
                <p className="text-xs text-[#9ab0c0] mt-0.5">Most recent appointments requested at your clinic.</p>
              </div>
              <button 
                onClick={() => navigate('/bookings')}
                className="text-xs font-bold text-[#008B8B] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-4 divide-y divide-white/5">
              {bookings.length === 0 ? (
                <div className="py-12 text-center text-[#5e7a8e] text-sm">No scheduled bookings found.</div>
              ) : (
                bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0F1E23] border border-white/5 flex items-center justify-center text-[#008B8B] font-extrabold uppercase shrink-0">
                        {b.user?.firstName?.substring(0, 2) || 'PT'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{b.user?.firstName || 'Client Patient'}</p>
                        <p className="text-xs text-[#9ab0c0] mt-0.5">
                          {b.pet?.name || 'Pet'} • {new Date(b.bookingDate).toLocaleDateString()} at {b.timeSlot || '09:00 AM'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25' :
                        b.status === 'CONFIRMED' ? 'bg-[#008B8B]/10 text-white border border-[#008B8B]/20' :
                        b.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        'bg-white/5 text-[#9ab0c0] border border-white/5'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="font-extrabold text-lg text-white">Listing Roster</h3>
                <button 
                  onClick={() => navigate('/listing')}
                  className="text-xs font-bold text-[#008B8B] hover:underline"
                >
                  Edit
                </button>
              </div>

              {activeListing ? (
                <div className="mt-4 space-y-4">
                  {activeListing.logoUrl && (
                    <div className="w-16 h-16 rounded-2xl border border-white/5 overflow-hidden bg-[#0F1E23]">
                      <img src={activeListing.logoUrl} className="w-full h-full object-cover" alt="Clinic Logo" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#008B8B] font-black">Clinic Directory Title</span>
                    <h4 className="font-black text-xl text-white mt-1">{activeListing.title}</h4>
                    <p className="text-xs text-[#9ab0c0] mt-1 leading-relaxed line-clamp-3">{activeListing.description}</p>
                  </div>
                  
                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#5e7a8e] block">Address:</span>
                      <span className="font-semibold text-white line-clamp-1">{activeListing.address}</span>
                    </div>
                    <div>
                      <span className="text-[#5e7a8e] block">Price Range:</span>
                      <span className="font-semibold text-white">{activeListing.priceRange || 'Moderate'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center py-8">
                  <p className="text-[#9ab0c0] text-sm leading-relaxed mb-4">You have not registered any clinic directory listing yet.</p>
                  <button 
                    onClick={() => navigate('/listing')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#008B8B] hover:bg-[#008B8B]/95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#008B8B]/10"
                  >
                    <Plus size={14} />
                    <span>Create Directory Listing</span>
                  </button>
                </div>
              )}
            </div>

            {activeListing && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <button 
                  onClick={() => navigate('/listing')}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText size={14} />
                  <span>Update Listing Details</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default Overview;
