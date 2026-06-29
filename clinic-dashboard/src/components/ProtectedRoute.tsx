import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!userStr || !token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(user.roleId)) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return <Outlet />;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
