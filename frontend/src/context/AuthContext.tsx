import React, { createContext, useState, useContext, ReactNode } from 'react';
import AuthService, { AuthResponse } from '../services/authService';

// Define the shape of the authentication context
interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false
});

// Authentication Provider Component
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to track current user
  const [user, setUser] = useState(AuthService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());

  // Login method
  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await AuthService.login({ email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  // Register method
  const register = async (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string
  ) => {
    try {
      const response: AuthResponse = await AuthService.register({ 
        firstName,
        lastName,
        email,
        password
      });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout method
  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Value to be provided to context consumers
  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
export default AuthContext;
