import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, MapPin, Phone, Star, ShieldCheck, ShieldAlert, Filter, Loader2, Building2, Store, Stethoscope, MoreVertical, UserPlus, UserCheck, Key, Target } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../utils/api';
import Modal from '../../components/Modal';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Listing {
  id: number;
  title: string;
  listingType: string;
  address?: string;
  contactNumber?: string;
  isOfficial?: boolean;
  avgStars?: number;
  owner?: { username: string };
  coordinates?: { lat: number; lon: number };
}

interface UserItem {
  id: number;
  username: string;
  email: string;
}

const TYPE_MAP: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  Vet:     { label: 'Veterinary', icon: Stethoscope, color: 'text-blue-700',   bgColor: 'bg-blue-100 border-blue-200' },
  Clinic:  { label: 'Clinic',     icon: Building2,   color: 'text-green-700',  bgColor: 'bg-green-100 border-green-200' },
  Shop:    { label: 'Pet Shop',   icon: Store,       color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-200' },
};

const CATEGORY_MAP: Record<string, number> = {
  Clinic: 1, Vet: 2, Insurance: 3, MobileClinic: 4, Grooming: 5, PetSitter: 6, Boarding: 7, Event: 8, Shop: 9,
};

// Map Sub-component to handle clicks
const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

// Map View Adjuster
const ChangeView = ({ center }: { center: L.LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const DirectoryPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [showModal, setShowModal] = useState(false);
  const [ownerMode, setOwnerMode] = useState<'existing' | 'new'>('existing');
  const [submitting, setSubmitting] = useState(false);

  // Map state
  const [mapPosition, setMapPosition] = useState<L.LatLng>(new L.LatLng(24.7136, 46.6753)); // Riyadh Default
  const [mapSearch, setMapSearch] = useState('');

  const [form, setForm] = useState({ 
    title: '', 
    listingType: 'Clinic', 
    address: '', 
    contactNumber: '',
    description: '',
    ownerId: '',
    newOwner: { username: '', email: '', password: '' }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listingsRes, usersRes] = await Promise.all([
        api.get('/directory'),
        api.get('/auth/admin/users')
      ]);
      setListings(listingsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMapSearch = async () => {
    if (!mapSearch) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch)}`);
      const data = await res.json();
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0];
        setMapPosition(new L.LatLng(parseFloat(lat), parseFloat(lon)));
        setForm(prev => ({ ...prev, address: display_name }));
      }
    } catch (e) {
      console.error('Map search failed:', e);
    }
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.title?.toLowerCase().includes(search.toLowerCase()) || l.address?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || l.listingType === typeFilter;
    return matchSearch && matchType;
  });

  useEffect(() => { setCurrentPage(1); }, [search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: listings.length,
    verified: listings.filter(l => l.isOfficial).length,
    vets: listings.filter(l => l.listingType === 'Vet').length,
    clinics: listings.filter(l => l.listingType === 'Clinic').length,
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalOwnerId = form.ownerId;
      if (ownerMode === 'new') {
        const userRes = await api.post('/auth/admin/users', { ...form.newOwner, roleId: 4 });
        finalOwnerId = userRes.data.id;
      }

      const payload = {
        ...form,
        categoryId: CATEGORY_MAP[form.listingType] || 1,
        ownerId: finalOwnerId,
        coordinates: { lat: mapPosition.lat, lon: mapPosition.lng }
      };
      
      await api.post('/directory', payload);
      await fetchData();
      alert('✅ تم تسجيل المنشأة والمالك بنجاح!');
      setShowModal(false);
      setForm({ 
        title: '', listingType: 'Clinic', address: '', contactNumber: '', description: '', ownerId: '', 
        newOwner: { username: '', email: '', password: '' } 
      });
      setOwnerMode('existing');
    } catch (e: any) {
      console.error('Registration Flow Error:', e);
      const errorMsg = e.response?.data?.message || 'فشل في إكمال العملية. تأكد من أن البيانات فريدة وغير مسجلة مسبقاً.';
      alert(`تنبيه: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-gutter">
      {/* Header & Stats (Shortened for space) */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">Medical Directory</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Audit and manage healthcare facilities and locations.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md flex items-center gap-xs shadow-lg">
          <Plus size={18} /> Register Facility
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {[{ label: 'Total Listings', value: stats.total, icon: Building2 }, { label: 'Verified', value: stats.verified, icon: ShieldCheck }, { label: 'Vets', value: stats.vets, icon: Stethoscope }, { label: 'Clinics', value: stats.clinics, icon: Building2 }].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-outline uppercase">{s.label}</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant"><s.icon size={18} /></div>
            </div>
            <div className="font-display text-display text-on-background">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant bg-surface-container-low flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm" placeholder="Search facilities..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="Vet">Veterinary</option>
            <option value="Clinic">Clinic</option>
            <option value="Shop">Pet Shop</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-label-md text-label-md text-outline uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Facility</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">Stars</th>
                <th className="px-6 py-4">Trust</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
              ) : paginated.map(l => {
                const type = TYPE_MAP[l.listingType] || TYPE_MAP.Vet;
                return (
                  <tr key={l.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${type.bgColor} ${type.color}`}><type.icon size={20} /></div>
                        <div><div className="font-bold">{l.title}</div><div className="text-[10px] text-outline">@{l.owner?.username || 'admin'}</div></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${type.bgColor} ${type.color}`}>{type.label}</span></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-1.5"><MapPin size={14} className="text-outline" /> {l.address || 'Global'}</div></td>
                    <td className="px-6 py-4 text-center"><div className="inline-flex items-center gap-1 bg-surface-container px-2 py-1 rounded border border-outline-variant"><Star size={12} className="text-warning fill-warning" /> {Number(l.avgStars || 0).toFixed(1)}</div></td>
                    <td className="px-6 py-4">{l.isOfficial ? <span className="text-secondary flex items-center gap-1 text-xs font-bold"><ShieldCheck size={14} /> Verified</span> : <span className="text-outline flex items-center gap-1 text-xs"><ShieldAlert size={14} /> Unverified</span>}</td>
                    <td className="px-6 py-4 text-right"><button className="text-outline hover:text-primary"><MoreVertical size={18} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Facility" maxWidth="max-w-6xl">
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Info */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2"><Building2 size={16} /> Basic Details</h4>
              <input className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm" placeholder="Facility Name" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <select className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm" value={form.listingType} onChange={e => setForm({ ...form, listingType: e.target.value })}>
                {Object.keys(CATEGORY_MAP).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <textarea className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm" placeholder="Description..." rows={3} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm" placeholder="Contact Phone" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} />
              
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant space-y-3">
                <h4 className="font-bold text-xs text-secondary flex items-center gap-2"><UserCheck size={14} /> Owner</h4>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setOwnerMode('existing')} className={`flex-1 py-1 text-[10px] font-bold rounded border ${ownerMode === 'existing' ? 'bg-secondary text-on-secondary' : 'bg-surface'}`}>Existing</button>
                  <button type="button" onClick={() => setOwnerMode('new')} className={`flex-1 py-1 text-[10px] font-bold rounded border ${ownerMode === 'new' ? 'bg-secondary text-on-secondary' : 'bg-surface'}`}>New</button>
                </div>
                {ownerMode === 'existing' ? (
                  <select className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-xs" value={form.ownerId} onChange={e => setForm({ ...form, ownerId: e.target.value })} required>
                    <option value="">-- Choose User --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded text-xs" placeholder="Username" required value={form.newOwner.username} onChange={e => setForm({ ...form, newOwner: { ...form.newOwner, username: e.target.value } })} />
                    <input className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded text-xs" placeholder="Email" required value={form.newOwner.email} onChange={e => setForm({ ...form, newOwner: { ...form.newOwner, email: e.target.value } })} />
                    <input className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded text-xs" placeholder="Password" required value={form.newOwner.password} onChange={e => setForm({ ...form, newOwner: { ...form.newOwner, password: e.target.value } })} />
                  </div>
                )}
              </div>
            </div>

            {/* Column 2 & 3: Map */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2"><MapPin size={16} /> Precise Location</h4>
                <div className="flex gap-2 w-2/3">
                  <input className="flex-1 px-4 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs" placeholder="Search address or city..." value={mapSearch} onChange={e => setMapSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleMapSearch())} />
                  <button type="button" onClick={handleMapSearch} className="bg-secondary text-on-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Search size={14} /> Search</button>
                </div>
              </div>
              
              <div className="h-[400px] rounded-2xl border-2 border-outline-variant overflow-hidden relative z-0">
                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                  <ChangeView center={mapPosition} />
                </MapContainer>
                <div className="absolute bottom-4 left-4 z-[1000] bg-surface/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-outline-variant shadow-lg text-[10px] font-medium text-on-background flex items-center gap-2">
                  <Target size={14} className="text-primary" />
                  Lat: {mapPosition.lat.toFixed(4)}, Lon: {mapPosition.lng.toFixed(4)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Final Display Address</label>
                <input className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm" placeholder="Verified Address String" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant">
            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg font-bold text-sm text-outline hover:bg-surface-variant transition-all">Cancel</button>
            <button type="submit" disabled={submitting} className="px-8 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02]">
              {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Complete Registration'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DirectoryPage;
