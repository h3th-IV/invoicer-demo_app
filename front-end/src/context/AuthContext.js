import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const loginStaff = async (email, password) => {
    try {
      const response = await authAPI.loginStaff({ email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Staff logged in successfully!');
      return { success: true };
    } catch (error) {
      handleApiError(error, toast, 'Login failed');
      return { success: false };
    }
  };

  // Register function
  const registerStaff = async (userData) => {
    try {
      const response = await authAPI.registerStaff(userData);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Staff registered successfully!');
      return { success: true };
    } catch (error) {
      handleApiError(error, toast, 'Registration failed');
      return { success: false };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
  };

  // Check if user is staff
  const isStaff = () => {
    return user && user.type === 'staff';
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.type === 'staff' && user.role === 'admin';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    loginStaff,
    registerStaff,
    logout,
    isStaff,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 