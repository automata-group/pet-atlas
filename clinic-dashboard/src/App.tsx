import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Overview from './pages/Overview';
import ListingProfile from './pages/ListingProfile';
import TeamManagement from './pages/TeamManagement';
import Bookings from './pages/Bookings';
import Settings from './pages/Settings';
import ChatHub from './pages/ChatHub';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-[#0F1E23] text-white">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes for Clinic Owners (Role 3) and Admins (Role 1) */}
          <Route element={<ProtectedRoute allowedRoles={[1, 3]} />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/listing" element={<ListingProfile />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/chat" element={<ChatHub />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
