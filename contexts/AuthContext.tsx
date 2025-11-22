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
  const [recievedToken, setRecievedToken] = useState<string>()
  const [recievedRole, setRecievedRole] = useState<UserRole>()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setRecievedToken(storedToken);
    if (storedRole) {
      let normalizedRole = storedRole as UserRole;
      if (storedRole.toLowerCase() === 'seller') normalizedRole = UserRole.Seller;
      if (storedRole.toLowerCase() === 'agent') normalizedRole = UserRole.agent;
      if (storedRole.toLowerCase() === 'admin') normalizedRole = UserRole.Admin;
      if (storedRole.toLowerCase() === 'superadmin' || storedRole.toLowerCase() === 'super_admin') normalizedRole = UserRole.SuperAdmin;

      setRecievedRole(normalizedRole);
      // Update localStorage if it was incorrect/lowercase
      if (storedRole !== normalizedRole) {
        localStorage.setItem('role', normalizedRole);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, role } = await loginApi(email, password);

      if (token) {
        setRecievedToken(token);
        localStorage.setItem('token', token);
      }

      if (role) {
        // Ensure we save the role matching our Enum (Capitalized)
        // If backend returns lowercase, we map it.
        let normalizedRole = role as UserRole;
        if (role.toString().toLowerCase() === 'seller') normalizedRole = UserRole.Seller;
        if (role.toString().toLowerCase() === 'agent') normalizedRole = UserRole.agent;
        if (role.toString().toLowerCase() === 'admin') normalizedRole = UserRole.Admin;
        if (role.toString().toLowerCase() === 'superadmin' || role.toString().toLowerCase() === 'super_admin') normalizedRole = UserRole.SuperAdmin;

        setRecievedRole(normalizedRole);
        localStorage.setItem('role', normalizedRole);
      } else {
        // Fallback if role is missing
        const defaultRole = UserRole.agent;
        setRecievedRole(defaultRole);
        localStorage.setItem('role', defaultRole);
      }

      // Create minimal user object (could be enhanced with more info from backend)
      const loggedUser: User = {
        name: email,
        email,
        role: role as UserRole || UserRole.agent,
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
    <AuthContext.Provider value={{ user, role: recievedRole as UserRole, recievedToken: recievedToken as string, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

