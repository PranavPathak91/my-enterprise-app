import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects unauthenticated users to login page
 */
const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  // Otherwise, render child routes
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
