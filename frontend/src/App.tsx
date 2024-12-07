import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex">
          <Sidebar />
          <div className="ml-64 w-[calc(100%-16rem)] min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              {/* Add placeholder routes for Prep Plan and Job Roles */}
              <Route 
                path="/prep-plan" 
                element={
                  <ProtectedRoute>
                    <div className="p-6 bg-white shadow rounded-lg m-6">Prep Plan Coming Soon</div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/job-roles" 
                element={
                  <ProtectedRoute>
                    <div className="p-6 bg-white shadow rounded-lg m-6">Job Roles Coming Soon</div>
                  </ProtectedRoute>
                } 
              />

              {/* Default Redirect */}
              <Route path="/" element={<Login />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
