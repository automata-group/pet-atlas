import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  let user: any = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    localStorage.clear();
  }

  const navItems = [
    { label: 'Overview', icon: 'dashboard', path: '/admin' },
    { label: 'Users', icon: 'group', path: '/admin/users' },
    { label: 'Consultations', icon: 'medical_services', path: '/admin/chats' },
    { label: 'Directory', icon: 'folder_shared', path: '/admin/directory' },
    { label: 'Bookings', icon: 'event', path: '/admin/bookings' },
    { label: 'Blog', icon: 'article', path: '/admin/blog' },
    { label: 'Notifications', icon: 'notifications', path: '/admin/notifications' },
    { label: 'Subscriptions', icon: 'credit_card', path: '/admin/subscriptions' },
    { label: 'Settings', icon: 'settings', path: '/admin/settings' },
    { label: 'Services Grid', icon: 'grid_view', path: '/admin/services' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="bg-background text-on-background font-body-md h-screen overflow-hidden flex">
      {/* Sidebar */}
      <aside className="bg-surface-container-lowest fixed left-0 top-0 h-full w-[280px] border-r border-outline-variant z-50 flex flex-col py-6">
        <div className="px-lg pb-md">
          <h2 className="font-h2 text-h2 text-primary font-bold tracking-tight">Pet-Atlas</h2>
          <p className="font-label-sm text-label-sm text-outline mt-xs">System Administrator</p>
        </div>
        
        <nav className="flex-1 mt-md overflow-y-auto">
          <ul className="space-y-sm">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-6 py-3 border-l-4 transition-all duration-150 font-label-md text-label-md ${
                      isActive 
                        ? 'border-secondary bg-surface-container text-secondary font-semibold' 
                        : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-6 pt-4 border-t border-outline-variant">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-on-surface-variant hover:text-error transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-[280px] h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-surface-container-lowest/80 backdrop-blur-md fixed top-0 right-0 z-40 border-b border-outline-variant flex justify-between items-center h-16 pl-[304px] pr-8 w-full">
          <div className="flex items-center gap-md w-1/3">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-background focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none" 
                placeholder="Search records..." 
                type="text"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-md text-on-surface-variant">
              <button className="hover:text-secondary transition-colors"><span className="material-symbols-outlined">help_outline</span></button>
              <button className="hover:text-secondary transition-colors relative">
                <span className="material-symbols-outlined">chat_bubble_outline</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-on-background">{user.username || 'Admin'}</div>
                <div className="text-xs text-outline">Super Admin</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-h3 text-h3 overflow-hidden border border-outline-variant">
                <img 
                  alt="Admin Avatar" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3rOLKj7jFyijQuVH9IdADhuzVMdWJxKeikdpwTe43JC9GuBWmS94HPNvvx9hOQgGVZLqobg9i9y3eqxWLePuTLCoVMbbF5uLYpL7pfbFPaSb6ldY99Jy5LUa6DSfoJ6ir_ZkT5EjHpxp4nFIpAMAhWc-UCoyamTlNgxvFyF-yx92dfosWSVsPslMw7W_mUN9Ep2TuASBhx10jbNpWm1NyMYtvzmmTFAYMCs1K3eZ4upjhQMpXMdOqmWHuNdfw5HbZlOhZNOCC2OlA"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto mt-16 p- gutter bg-background p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
