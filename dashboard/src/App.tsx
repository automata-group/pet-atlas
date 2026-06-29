import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/Login';

// Layout
import AdminLayout from './components/AdminLayout';

// Admin Pages
import OverviewPage      from './pages/Admin/Overview';
import UsersPage         from './pages/Admin/Users';
import ChatsPage         from './pages/Admin/Chats';
import DirectoryPage     from './pages/Admin/Directory';
import BookingsPage      from './pages/Admin/Bookings';
import BlogPage          from './pages/Admin/Blog';
import NotificationsPage from './pages/Admin/Notifications';
import SubscriptionsPage from './pages/Admin/Subscriptions';
import SettingsPage      from './pages/Admin/Settings';
import ServicesPage      from './pages/Admin/Services';

// Legacy pages
import ClinicTeam from './pages/Clinic/Team';

// Auth Guard
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  let user: any = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
  if (!token) return <Navigate to="/login" replace />;
  if (user.roleId !== 1 && user.roleId !== '1') return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Admin route wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RequireAuth>
    <AdminLayout>{children}</AdminLayout>
  </RequireAuth>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard */}
        <Route path="/admin"               element={<AdminRoute><OverviewPage      /></AdminRoute>} />
        <Route path="/admin/users"         element={<AdminRoute><UsersPage         /></AdminRoute>} />
        <Route path="/admin/chats"         element={<AdminRoute><ChatsPage         /></AdminRoute>} />
        <Route path="/admin/directory"     element={<AdminRoute><DirectoryPage     /></AdminRoute>} />
        <Route path="/admin/bookings"      element={<AdminRoute><BookingsPage      /></AdminRoute>} />
        <Route path="/admin/blog"          element={<AdminRoute><BlogPage          /></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute><NotificationsPage /></AdminRoute>} />
        <Route path="/admin/subscriptions" element={<AdminRoute><SubscriptionsPage /></AdminRoute>} />
        <Route path="/admin/settings"      element={<AdminRoute><SettingsPage      /></AdminRoute>} />
        <Route path="/admin/services"      element={<AdminRoute><ServicesPage      /></AdminRoute>} />

        {/* Clinic (legacy) */}
        <Route path="/clinic" element={<ClinicTeam />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
