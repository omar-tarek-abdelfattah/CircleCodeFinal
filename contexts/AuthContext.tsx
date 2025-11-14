import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '@/services/api';

export type UserRole = 'seller' | 'agent' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    try {
      const { token, role: apiRole, id } = await loginApi(email, password, role || 'admin');

      // Save token & role
      localStorage.setItem('token', token);
      localStorage.setItem('role', apiRole || role || 'admin');
      localStorage.setItem('id', id);

      // Create minimal user object (could be enhanced with more info from backend)
      const loggedUser: User = {
        id, // can be replaced with backend id
        name: email,
        email,
        role: apiRole || role || 'admin',
      };
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
    } catch (error: any) {
      if (error.statusCode == 401) {
        throw new Error('Invalid Email or Password')
      }
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

