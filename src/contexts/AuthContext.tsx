import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { config } from '@/lib/config';
import { apiClient, User } from '@/lib/api';

// User interface imported from @/lib/api

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(config.auth.tokenKey);
      
      if (token) {
        try {
          // Validate token with backend and get current user
          const isValid = await apiClient.verifyToken(token);
          if (isValid) {
            const userData = await apiClient.getCurrentUser();
            setUser(userData);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem(config.auth.tokenKey);
            localStorage.removeItem(config.auth.userKey);
            localStorage.removeItem(config.auth.refreshTokenKey);
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.userKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.signin({ email, password });
      
      // Store tokens
      localStorage.setItem(config.auth.tokenKey, response.accessToken);
      localStorage.setItem(config.auth.refreshTokenKey, response.refreshToken);
      localStorage.setItem(config.auth.userKey, JSON.stringify(response.user));
      
      setUser(response.user);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.signup(userData);
      
      // Store tokens
      localStorage.setItem(config.auth.tokenKey, response.accessToken);
      localStorage.setItem(config.auth.refreshTokenKey, response.refreshToken);
      localStorage.setItem(config.auth.userKey, JSON.stringify(response.user));
      
      setUser(response.user);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.userKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Requesting password reset for:', email);
      await apiClient.forgotPassword(email);
      
      console.log('Password reset email sent successfully');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 