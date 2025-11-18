import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '@/services/api';

export enum UserRole {

  Seller = 'Seller',
  agent = 'Agent',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
  auth = 'authentication'
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  recievedToken: string
  role: UserRole
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [recievedToken, setRecievedToken] = useState('')
  const [recievedRole, setRecievedRole] = useState<UserRole>()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, role } = await loginApi(email, password);
      console.log(token);
      console.log(role);


      setRecievedToken(token as string)
      setRecievedRole(role as UserRole)
      // Save token & role
      localStorage.setItem('token', recievedToken);
      // localStorage.setItem('role', recievedRole || 'Agent');

      setRecievedToken(token as string);
      setRecievedRole(role as UserRole);


      // Create minimal user object (could be enhanced with more info from backend)
      const loggedUser: User = {
        name: email,
        email,
        role: role as UserRole,
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
    <AuthContext.Provider value={{ user, role: recievedRole, recievedToken, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

