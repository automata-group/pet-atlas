import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, RefreshCw, Layers, Check, X, Palette, HelpCircle } from 'lucide-react';
import api from '../../utils/api';

interface ServiceSection {
  id?: number;
  titleEn: string;
  titleAr: string;
  iconName: string;
  baseColor: string;
  listingType: string;
  isActive: boolean;
}

const PRESET_COLORS = [
  { hex: '#2196F3', name: 'Cool Blue' },
  { hex: '#4CAF50', name: 'Emerald Green' },
  { hex: '#FF9800', name: 'Sunset Orange' },
  { hex: '#9C27B0', name: 'Royal Purple' },
  { hex: '#E91E63', name: 'Vibrant Pink' },
  { hex: '#009688', name: 'Teal Forest' },
  { hex: '#FF5722', name: 'Deep Orange' },
  { hex: '#673AB7', name: 'Deep Purple' }
];

const PRESET_ICONS = [
  { name: 'medical_services', label: 'Medical Services (Clinic)' },
  { name: 'vaccines', label: 'Vaccines/Stethoscope (Vet)' },
  { name: 'content_cut', label: 'Scissors (Grooming)' },
  { name: 'pets', label: 'Pet Paw (Pet Care/Shop)' },
  { name: 'storefront', label: 'Store (Shop)' },
  { name: 'hotel', label: 'Hotel (Boarding)' },
  { name: 'local_taxi', label: 'Taxi (Transport)' },
  { name: 'school', label: 'School Cap (Training)' },
  { name: 'spa', label: 'Lotus (Spa/Care)' },
  { name: 'health_and_safety', label: 'Health Shield' }
];

const LISTING_TYPES = [
  { value: 'Clinic', label: 'Clinic (العيادات)' },
  { value: 'Vet', label: 'Vet (الأطباء البيطريين)' },
  { value: 'Grooming', label: 'Grooming (العناية والحلاقة)' },
  { value: 'Shop', label: 'Shop (مستلزمات الحيوانات)' },
  { value: 'Hotel', label: 'Hotel/Boarding (الفنادق)' },
  { value: 'Transport', label: 'Transport (التوصيل)' },
  { value: 'Training', label: 'Training (التدريب)' }
];

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState<ServiceSection>({
    titleEn: '',
    titleAr: '',
    iconName: 'medical_services',
    baseColor: '#2196F3',
    listingType: 'Clinic',
    isActive: true
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Fetch admin services (includes inactive ones)
      const res = await api.get('/directory/services/admin');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services:', err);
      showNotification('Failed to fetch services sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleEn || !form.titleAr || !form.iconName || !form.listingType) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingId !== null) {
        // Update
        const res = await api.put(`/directory/services/${editingId}`, form);
        setServices(prev => prev.map(s => s.id === editingId ? res.data : s));
        showNotification('Service section updated successfully!');
      } else {
        // Create
        const res = await api.post('/directory/services', form);
        setServices(prev => [...prev, res.data]);
        showNotification('New service section created successfully!');
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save service:', err);
      showNotification('An error occurred while saving the service section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service section? This will remove it from the home screen grid.')) return;
    try {
      setLoading(true);
      await api.post(`/directory/services/${id}/delete`);
      setServices(prev => prev.filter(s => s.id !== id));
      showNotification('Service section deleted successfully!');
    } catch (err) {
      console.error('Failed to delete service:', err);
      showNotification('An error occurred while deleting the service section', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (service: ServiceSection) => {
    if (!service.id) return;
    try {
      const updatedStatus = !service.isActive;
      const res = await api.put(`/directory/services/${service.id}`, {
        isActive: updatedStatus
      });
      setServices(prev => prev.map(s => s.id === service.id ? res.data : s));
      showNotification(`Service section ${updatedStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showNotification('Failed to toggle service section status', 'error');
    }
  };

  const handleEditInit = (service: ServiceSection) => {
    if (!service.id) return;
    setEditingId(service.id);
    setForm({
      titleEn: service.titleEn,
      titleAr: service.titleAr,
      iconName: service.iconName,
      baseColor: service.baseColor,
      listingType: service.listingType,
      isActive: service.isActive
    });
    setShowForm(true);
    // Smooth scroll to form on mobile/small screens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      titleEn: '',
      titleAr: '',
      iconName: 'medical_services',
      baseColor: '#2196F3',
      listingType: 'Clinic',
      isActive: true
    });
    setShowForm(false);
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-gutter">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 ${
          notification.type === 'error' ? 'bg-error text-on-error' : 'bg-secondary text-on-secondary'
        }`}>
          <span className="material-symbols-outlined">{notification.type === 'error' ? 'error' : 'check_circle'}</span>
          <span className="font-label-md text-label-md">{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-background flex items-center gap-3">
            <Layers className="text-primary" size={36} />
            <span>Service Grid Customization</span>
            <span className="text-outline font-body-sm font-normal text-sm ml-2">تخصيص أقسام التطبيق</span>
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Dynamic control of the 4 primary cards in the Flutter mobile application home screen. Replace static code with fully dynamic, localized sections.
          </p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary text-on-primary px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add Custom Section</span>
          </button>
        )}
      </div>

      {/* Main Grid View / Editor Form */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter items-start">
        
        {/* Dynamic Form Sidebar */}
        {showForm && (
          <div className="xl:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm animate-fadeIn duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">{editingId ? 'edit_note' : 'add_circle'}</span>
                </div>
                <h2 className="font-h3 text-h3 text-on-background">
                  {editingId ? 'Edit Section' : 'New Custom Section'}
                </h2>
              </div>
              <button onClick={resetForm} className="text-outline hover:text-on-background p-1 hover:bg-surface-container rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="space-y-5">
              {/* English Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase tracking-wider flex justify-between">
                  <span>English Title</span>
                  <span className="text-[10px] text-primary lowercase font-normal">Required *</span>
                </label>
                <input 
                  type="text"
                  placeholder="e.g., Clinics"
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  value={form.titleEn}
                  onChange={(e) => setForm(prev => ({ ...prev, titleEn: e.target.value }))}
                  required
                />
              </div>

              {/* Arabic Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase tracking-wider flex justify-between">
                  <span>Arabic Title (العنوان بالعربية)</span>
                  <span className="text-[10px] text-primary lowercase font-normal">Required *</span>
                </label>
                <input 
                  type="text"
                  dir="rtl"
                  placeholder="مثال: العيادات"
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary font-body-md"
                  value={form.titleAr}
                  onChange={(e) => setForm(prev => ({ ...prev, titleAr: e.target.value }))}
                  required
                />
              </div>

              {/* Listing Type Mapping */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Listing Type Category Mapping</label>
                <select 
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  value={form.listingType}
                  onChange={(e) => setForm(prev => ({ ...prev, listingType: e.target.value }))}
                >
                  {LISTING_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-1">
                  <HelpCircle size={12} className="inline text-outline" />
                  Maps this category to directory listings with this type.
                </p>
              </div>

              {/* Material Icon Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Icon Selection</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_ICONS.map(ico => {
                    const isSelected = form.iconName === ico.name;
                    return (
                      <button
                        key={ico.name}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, iconName: ico.name }))}
                        title={ico.label}
                        className={`p-2 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary-container text-primary shadow-sm scale-110' 
                            : 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">{ico.name}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 space-y-1">
                  <span className="text-[11px] text-outline block">Or type custom Material Icon code name:</span>
                  <input 
                    type="text"
                    className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary font-mono"
                    value={form.iconName}
                    onChange={(e) => setForm(prev => ({ ...prev, iconName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Color Customization */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={14} className="text-outline" />
                  Base Color Palette
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => {
                    const isSelected = form.baseColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, baseColor: c.hex }))}
                        title={c.name}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && <Check size={14} className="text-white drop-shadow-md" />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-outline">Custom HEX Color:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      className="w-8 h-8 rounded border border-outline-variant cursor-pointer p-0"
                      value={form.baseColor}
                      onChange={(e) => setForm(prev => ({ ...prev, baseColor: e.target.value }))}
                    />
                    <input 
                      type="text"
                      className="w-24 px-2 py-1 bg-surface border border-outline-variant rounded text-xs font-mono outline-none focus:ring-1 focus:ring-primary"
                      value={form.baseColor}
                      onChange={(e) => setForm(prev => ({ ...prev, baseColor: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl border border-outline-variant mt-2">
                <div>
                  <div className="text-sm font-bold text-on-background">Visible in Mobile App</div>
                  <div className="text-[10px] text-outline">Activate to display on home grid immediately</div>
                </div>
                <div 
                  onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${
                    form.isActive ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                >
                  <div 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      form.isActive ? 'right-1' : 'left-1'
                    }`} 
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{editingId ? 'Update Section' : 'Save Section'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Service Cards Grid */}
        <div className={`${showForm ? 'xl:col-span-2' : 'xl:col-span-3'} space-y-4`}>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">view_cozy</span>
                </div>
                <h2 className="font-h3 text-h3 text-on-background">Live Application Sections</h2>
              </div>
              <span className="bg-secondary/10 text-secondary border border-secondary/20 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {services.length} Total Sections
              </span>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-outline-variant rounded-xl">
                <Layers className="mx-auto text-outline mb-4 animate-pulse" size={48} />
                <h3 className="font-h3 text-on-background text-lg font-bold">No custom sections defined</h3>
                <p className="text-sm text-outline mt-1 max-w-sm mx-auto">
                  Click on "Add Custom Section" to create your very first dynamic home screen category card.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => {
                  const softColor = `${service.baseColor}18`; // ~10% opacity hex
                  return (
                    <div 
                      key={service.id || index}
                      className="border border-outline-variant rounded-xl p-5 bg-surface hover:bg-surface-container-low transition-all duration-200 flex flex-col justify-between shadow-sm relative group overflow-hidden"
                    >
                      {/* Brand-color accent line on card top */}
                      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: service.baseColor }} />

                      <div className="flex items-start gap-4">
                        {/* Dynamic Colored Icon */}
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: softColor, border: `1px solid ${service.baseColor}40` }}
                        >
                          <span 
                            className="material-symbols-outlined text-2xl" 
                            style={{ color: service.baseColor }}
                          >
                            {service.iconName}
                          </span>
                        </div>

                        {/* Title details */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-on-background truncate" title={service.titleEn}>
                              {service.titleEn}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-outline-variant bg-surface-container-lowest uppercase text-outline">
                              {service.listingType}
                            </span>
                          </div>
                          
                          <h4 
                            className="font-bold text-on-surface-variant text-right font-body-md" 
                            dir="rtl"
                          >
                            {service.titleAr}
                          </h4>
                        </div>
                      </div>

                      {/* Bottom Status & Control Buttons */}
                      <div className="flex items-center justify-between border-t border-outline-variant/60 mt-5 pt-4">
                        {/* Visibility Switch */}
                        <div className="flex items-center gap-2">
                          <div 
                            onClick={() => toggleActiveStatus(service)}
                            className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${
                              service.isActive ? 'bg-primary' : 'bg-outline-variant'
                            }`}
                          >
                            <div 
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                                service.isActive ? 'right-0.5' : 'left-0.5'
                              }`} 
                            />
                          </div>
                          <span className={`text-xs font-bold ${service.isActive ? 'text-primary' : 'text-outline'}`}>
                            {service.isActive ? 'Active (ظاهر)' : 'Hidden (مخفي)'}
                          </span>
                        </div>

                        {/* Edit/Delete Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditInit(service)}
                            className="p-2 text-outline hover:text-primary hover:bg-primary-container rounded-lg transition-colors flex items-center justify-center"
                            title="Edit Section Settings"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => service.id && handleDelete(service.id)}
                            className="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors flex items-center justify-center"
                            title="Delete Section"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Educational Quick Tips */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold text-on-background flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              <span>Pair-Programming Integration Guideline</span>
            </h4>
            <ul className="list-disc pl-5 text-xs text-outline space-y-1.5">
              <li>Changes made here take effect immediately in real-time inside the mobile application.</li>
              <li>Ensure the icon matches a valid material code (e.g. <code className="font-mono bg-surface p-0.5 rounded text-primary">pets</code> or <code className="font-mono bg-surface p-0.5 rounded text-primary">medical_services</code>) for seamless mobile rendering.</li>
              <li>Bilingual customization provides localization instantly for both Arabic-speaking and English-speaking pet owners.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServicesPage;
