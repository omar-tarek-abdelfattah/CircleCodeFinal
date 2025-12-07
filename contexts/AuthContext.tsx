import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginApi,
  emailExistApi,
  agentRegisterApi,
  sellerRegisterApi,
  confirmEmailApi,
  resendConfirmationEmailApi,
  forgetPasswordApi,
  saveNewPasswordApi,
  changePasswordApi
} from '../services/api.ts';

export enum UserRole {
  Seller = 'Seller',
  agent = 'Agent',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  salary?: number;
}

interface AuthContextType {
  user: User | null;
  recievedToken: string;
  role: UserRole;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;

  // ⬇️ Auth APIs
  checkEmailExists: (email: string) => Promise<boolean>;
  registerAgent: (data: any) => Promise<any>;
  registerSeller: (data: any) => Promise<any>;
  confirmEmail: (email: string, token: string) => Promise<any>;
  resendConfirmation: (email: string) => Promise<any>;
  forgetPassword: (email: string) => Promise<any>;
  saveNewPassword: (data: {
    email: string;
    token: string;
    password: string;
    confirmPassword: string;
  }) => Promise<boolean>;
  changePassword: (email: string, oldPassword: string, password: string, confirmPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [recievedToken, setRecievedToken] = useState<string>('');
  const [recievedRole, setRecievedRole] = useState<UserRole>(UserRole.agent);

  // 🔹 Load saved auth from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') as UserRole;

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setRecievedToken(storedToken);
    if (storedRole) setRecievedRole(storedRole);
  }, []);

  // 🔹 Login
  const login = async (email: string, password: string) => {
    try {
      const { token, role } = await loginApi(email, password);

      if (token) {
        setRecievedToken(token);
        localStorage.setItem('token', token);
      }

      if (role) {
        setRecievedRole(role as UserRole);
        localStorage.setItem('role', role);
      }

      const loggedUser: User = { name: email, email, role: role as UserRole };
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
    } catch (error: any) {
      console.log(error.message);
      if (error.message && error.message.includes("invalid Credentials")) {
        throw new Error("Invalid email or password");
      }
      if (error.message && error.message.toLowerCase().includes("confirm")) {
        throw new Error("Please confirm your email address.");
      }
      if (error.message && error.message.toLowerCase().includes("Your account is on hold")) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  // 🔹 Update user
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  // 🔹 Auth API handlers
  const checkEmailExists = (email: string) => emailExistApi(email);
  const registerAgent = (data: any) => agentRegisterApi(data);
  const registerSeller = (data: any) => sellerRegisterApi(data);
  const confirmEmail = (email: string, token: string) => confirmEmailApi(email, token);
  const resendConfirmation = (email: string) => resendConfirmationEmailApi(email);
  const forgetPassword = (email: string) => forgetPasswordApi(email);
  const saveNewPassword = (data: {
    email: string;
    token: string;
    password: string;
    confirmPassword: string;
  }) => saveNewPasswordApi(data);
  const changePassword = (email: string, oldPassword: string, password: string, confirmPassword: string) =>
    changePasswordApi(email, oldPassword, password, confirmPassword);

  return (
    <AuthContext.Provider value={{
      user,
      role: recievedRole,
      recievedToken,
      login,
      logout,
      updateUser,
      checkEmailExists,
      registerAgent,
      registerSeller,
      confirmEmail,
      resendConfirmation,
      forgetPassword,
      saveNewPassword,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
