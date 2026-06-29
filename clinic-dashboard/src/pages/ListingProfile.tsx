import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileTopBar from '../components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { 
  Store, 
  MapPin, 
  DollarSign, 
  Phone, 
  Globe, 
  FileText, 
  Save, 
  Plus, 
  Trash2,
  Image,
  Navigation
} from 'lucide-react';
import { API_URL } from '../config';

const ListingProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listingId, setListingId] = useState<number | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState('Clinic');
  const [address, setAddress] = useState('');
  const [priceRange, setPriceRange] = useState('$$');
  const [contactNumber, setContactNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [lat, setLat] = useState('30.0444');
  const [lon, setLon] = useState('31.2357');

  // Services Roster
  const [services, setServices] = useState<{ name: string; description: string; price: number }[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/directory/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.length > 0) {
        const item = response.data[0];
        setListingId(item.id);
        setTitle(item.title || '');
        setDescription(item.description || '');
        setListingType(item.listingType || 'Clinic');
        setAddress(item.address || '');
        setPriceRange(item.priceRange || '$$');
        setContactNumber(item.contactNumber || '');
        setWebsiteUrl(item.websiteUrl || '');
        setLogoUrl(item.logoUrl || '');
        setServices(item.services || []);
        
        if (item.coordinates) {
          // If POINT geometry is returned as object or string
          if (typeof item.coordinates === 'object') {
            setLat(item.coordinates.lat || '30.0444');
            setLon(item.coordinates.lon || '31.2357');
          } else if (typeof item.coordinates === 'string') {
            // Parse point WKT e.g. POINT(30.0444 31.2357)
            const coords = item.coordinates.replace('POINT(', '').replace(')', '').split(' ');
            setLat(coords[0] || '30.0444');
            setLon(coords[1] || '31.2357');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load clinic listing detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadListing();
    }
  }, [user]);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const price = parseFloat(newServicePrice) || 0;
    const newService = {
      name: newServiceName,
      description: newServiceDesc,
      price
    };

    setServices([...services, newService]);
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServicePrice('');
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, idx) => idx !== index));
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      title,
      description,
      listingType,
      address,
      priceRange,
      contactNumber,
      websiteUrl,
      logoUrl,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      services,
      categoryId: 1 // Default clinic category
    };

    try {
      if (listingId) {
        // Edit existing listing
        await axios.put(`${API_URL}/directory/${listingId}`, payload, { headers });
        setMessage({ type: 'success', text: 'Listing Profile successfully synchronized & updated!' });
      } else {
        // Create new listing
        const res = await axios.post(`${API_URL}/directory`, payload, { headers });
        setListingId(res.data.id);
        setMessage({ type: 'success', text: 'Clinic directory listing registered successfully!' });
      }
      
      // Auto dismiss success toast after 3s
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error('Save listing profile error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not synchronize listing changes. Verify fields.' });
    } finally {
      setSaving(false);
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
          <p className="text-[#9ab0c0] font-semibold text-sm">Retrieving listing attributes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0F1E23] text-white overflow-hidden md:pl-[280px] flex flex-col">
      {/* Navigation */}
      <Sidebar onLogout={handleLogout} />
      <TopBar user={user} />
      <MobileTopBar user={user} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 pt-20 md:pt-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Listing Profile</h1>
            <p className="text-xs md:text-sm text-[#9ab0c0] mt-1">Configure your directory listing presentation details, coordinates, and services roster.</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold border transition-all ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveListing} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg space-y-5">
              <h3 className="font-extrabold text-lg border-b border-white/5 pb-3">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Listing Title</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5e7a8e]">
                      <Store size={16} />
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Oakridge Veterinary Clinic"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Listing Type</label>
                  <select
                    className="block w-full px-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                  >
                    <option value="Clinic">Clinic</option>
                    <option value="Shop">Shop</option>
                    <option value="MobileClinic">Mobile Clinic</option>
                    <option value="Grooming">Grooming Center</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Description</label>
                <div className="relative">
                  <div className="absolute top-3 left-4 text-[#5e7a8e]">
                    <FileText size={16} />
                  </div>
                  <textarea
                    rows={4}
                    className="block w-full pl-11 pr-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a welcoming description of your facility, certifications, and specialties..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Contact Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5e7a8e]">
                      <Phone size={16} />
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Website URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5e7a8e]">
                      <Globe size={16} />
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://www.clinicname.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Services Editor */}
            <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg space-y-5">
              <div>
                <h3 className="font-extrabold text-lg text-white">Services & Pricing Menu</h3>
                <p className="text-xs text-[#9ab0c0] mt-0.5">List specific medical examinations, surgeries, or items you sell, with direct prices.</p>
              </div>

              {/* Added Services List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {services.length === 0 ? (
                  <div className="py-6 text-center text-[#5e7a8e] text-xs bg-[#0F1E23]/30 rounded-xl border border-white/5 border-dashed">
                    No services configured. Build your menu below.
                  </div>
                ) : (
                  services.map((svc, index) => (
                    <div key={index} className="flex items-center justify-between p-3.5 bg-[#0F1E23]/60 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-bold text-white">{svc.name}</p>
                        <p className="text-xs text-[#9ab0c0] mt-0.5">{svc.description || 'No description provided'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-[#008B8B]">${svc.price.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className="text-[#5e7a8e] hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Service Creator Form */}
              <div className="bg-[#0F1E23]/40 border border-white/5 p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-[#008B8B] uppercase tracking-wider">Add Service Item</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="block w-full px-3.5 py-2.5 bg-[#0F1E23] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-[#008B8B] transition-all md:col-span-2"
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Service / Item name (e.g. Core Puppy Vaccination)"
                  />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5e7a8e]">
                      <DollarSign size={14} />
                    </div>
                    <input
                      className="block w-full pl-8 pr-3.5 py-2.5 bg-[#0F1E23] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-[#008B8B] transition-all"
                      type="number"
                      step="0.01"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    className="block flex-1 px-3.5 py-2.5 bg-[#0F1E23] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-[#008B8B] transition-all"
                    type="text"
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Brief details or limitations (e.g. Includes physical checkup)"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-4 bg-[#008B8B] hover:bg-[#008B8B]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                    <span>Roster Service</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Save controls */}
          <div className="space-y-6">
            {/* Visual Logo and Meta */}
            <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="font-extrabold text-lg border-b border-white/5 pb-3">Branding</h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Logo URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5e7a8e]">
                    <Image size={16} />
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://imgur.com/cliniclogo.png"
                  />
                </div>
              </div>

              {logoUrl && (
                <div className="flex justify-center p-4 bg-[#0F1E23]/60 rounded-2xl border border-white/5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* Geographical Coordinates */}
            <div className="bg-[#14252c] border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="font-extrabold text-lg border-b border-white/5 pb-3">Geographical Mapping</h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Physical Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5e7a8e]">
                    <MapPin size={16} />
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B] transition-all"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Vet Parkway, Metropolis"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#9ab0c0] uppercase tracking-wider">Latitude</label>
                  <input
                    className="block w-full px-3.5 py-2.5 bg-[#0F1E23] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-[#008B8B]"
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="30.0444"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#9ab0c0] uppercase tracking-wider">Longitude</label>
                  <input
                    className="block w-full px-3.5 py-2.5 bg-[#0F1E23] border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-[#008B8B]"
                    type="text"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    placeholder="31.2357"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Price Range Tier</label>
                <select
                  className="block w-full px-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#008B8B]"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="$">Economy ($)</option>
                  <option value="$$">Moderate ($$)</option>
                  <option value="$$$">Premium ($$$)</option>
                  <option value="$$$$">Luxury ($$$$)</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center items-center gap-2 py-4 bg-[#008B8B] hover:bg-[#008B8B]/90 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-[#008B8B]/20 active:scale-95 disabled:opacity-75"
            >
              <Save size={18} />
              <span>{saving ? 'Synchronizing to API...' : 'Synchronize Profile'}</span>
            </button>
          </div>
        </form>
      </main>
      
      <MobileBottomNav />
    </div>
  );
};

export default ListingProfile;
