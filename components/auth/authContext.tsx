"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { authService } from '../../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setIsAuthenticated(true);
          setUserRole(userData.role);
          setUserId(userData.id);
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
      } catch (error) {
        // If error, user is not authenticated
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserId(null);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      
      setIsAuthenticated(true);
      setUserRole(response.user.role);
      setUserId(response.user.id);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await authService.logout();
      
      // Remove token from axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      setIsAuthenticated(false);
      setUserRole(null);
      setUserId(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAdmin = () => {
    return userRole === 'admin';
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      userId, 
      login, 
      logout, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};