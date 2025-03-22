"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { authService } from '../../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: string | null;
  login: (username: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isLoading: boolean; // Add this missing property
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        console.log('Checking auth status...');
        const userData = await authService.getCurrentUser();
        console.log('Auth status response:', userData);
        
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
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      
      // Store token in localStorage
      localStorage.setItem('authToken', response.token);
      
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
      
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      
      // Remove token from axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      setIsAuthenticated(false);
      setUserRole(null);
      setUserId(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear token even if logout API fails
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
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
      isAdmin,
      isLoading // Make sure this is included
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