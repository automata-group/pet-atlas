import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ChatHub from './pages/ChatHub';
import Overview from './pages/Overview';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-background text-on-background">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes for Consultants and Admins */}
          <Route element={<ProtectedRoute allowedRoles={[1, 2]} />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/hub" element={<ChatHub />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
