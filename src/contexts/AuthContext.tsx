import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userData } from '@/data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  location: string;
  timezone: string;
  avatar: string;
  memberSince: string;
  monthlyIncome: number;
  level: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

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
      const token = localStorage.getItem('pulseboard_token');
      const savedUser = localStorage.getItem('pulseboard_user');
      
      if (token && savedUser) {
        try {
          // In a real app, you'd validate the token with your backend
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('pulseboard_token');
          localStorage.removeItem('pulseboard_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - in real app, this would be an API call
      if (email === 'rahul.sharma@gmail.com' && password === 'password123') {
        const mockUser = {
          ...userData,
          email: email
        };
        
        // Save to localStorage (in real app, you'd save JWT token)
        localStorage.setItem('pulseboard_token', 'mock_jwt_token');
        localStorage.setItem('pulseboard_user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock signup - in real app, this would create a new user
      const newUser = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        age: 25,
        gender: 'Not specified',
        location: 'Unknown',
        timezone: 'UTC',
        avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        monthlyIncome: 0,
        level: 1,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0
      };
      
      // Save to localStorage
      localStorage.setItem('pulseboard_token', 'mock_jwt_token');
      localStorage.setItem('pulseboard_user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('pulseboard_token');
    localStorage.removeItem('pulseboard_user');
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock password reset - in real app, this would send an email
      console.log('Password reset email sent to:', email);
      
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