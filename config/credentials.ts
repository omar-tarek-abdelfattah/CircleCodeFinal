// Temporary hardcoded credentials for development
// These will be replaced by real API authentication once backend integration is complete

import { User, UserRole } from '../types';

export interface Credential {
  email: string;
  password: string;
  user: User;
}

// Hardcoded credentials for each role
export const CREDENTIALS: Credential[] = [
  // Admin credentials
  {
    email: 'admin@circlecode.com',
    password: 'admin123',
    user: {
      id: 'ADM-001',
      name: 'Admin User',
      email: 'admin@circlecode.com',
      role: 'admin',
      phone: '+1 234 567 8900',
      status: 'active',
    },
  },
  // Agent credentials
  {
    email: 'agent@circlecode.com',
    password: 'agent123',
    user: {
      id: 'AGT-001',
      name: 'Agent User',
      email: 'agent@circlecode.com',
      role: 'agent',
      phone: '+1 234 567 8901',
      status: 'active',
    },
  },
  // Seller credentials
  {
    email: 'seller@circlecode.com',
    password: 'seller123',
    user: {
      id: 'SEL-001',
      name: 'Seller User',
      email: 'seller@circlecode.com',
      role: 'seller',
      phone: '+1 234 567 8902',
      status: 'active',
    },
  },
];

/**
 * Validates user credentials
 * @param email - User email
 * @param password - User password
 * @param role - Expected user role
 * @returns User object if valid, null otherwise
 */
export function validateCredentials(
  email: string,
  password: string,
  role: UserRole
): User | null {
  const credential = CREDENTIALS.find(
    (cred) =>
      cred.email.toLowerCase() === email.toLowerCase() &&
      cred.password === password &&
      cred.user.role === role
  );

  return credential ? credential.user : null;
}
