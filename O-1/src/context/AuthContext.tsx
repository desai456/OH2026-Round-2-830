import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  token: string;
}

interface AuthContextType {
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole, company?: string) => Promise<boolean>;
  logout: () => void;
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated user store (in-memory for demo)
const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  'alex.morgan@dealflow360.io': {
    id: 'u1', name: 'Alex Morgan', email: 'alex.morgan@dealflow360.io',
    role: 'Sales Rep', token: 'tok_salesrep_alex'
  },
  'sarah.vance@dealflow360.io': {
    id: 'u2', name: 'Sarah Vance', email: 'sarah.vance@dealflow360.io',
    role: 'Sales Manager', token: 'tok_mgr_sarah'
  },
  'michael.sterling@dealflow360.io': {
    id: 'u3', name: 'Michael Sterling', email: 'michael.sterling@dealflow360.io',
    role: 'Finance', token: 'tok_fin_michael'
  },
  'david.ops@dealflow360.io': {
    id: 'u4', name: 'David Ops', email: 'david.ops@dealflow360.io',
    role: 'Operations', token: 'tok_ops_david'
  },
  'elena.rostova@dealflow360.io': {
    id: 'u5', name: 'Elena Rostova', email: 'elena.rostova@dealflow360.io',
    role: 'Admin', token: 'tok_admin_elena'
  },
  'm.brody@acmecorp.com': {
    id: 'u6', name: 'Marcus Brody', email: 'm.brody@acmecorp.com',
    role: 'Customer', company: 'Acme Corp', token: 'tok_cust_marcus'
  },
};

const STORAGE_KEY = 'dealflow360_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setAuthUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600)); // Simulate API call

    // Check demo accounts (any password works for demo accounts)
    const normalizedEmail = email.toLowerCase().trim();
    if (DEMO_ACCOUNTS[normalizedEmail]) {
      persistUser(DEMO_ACCOUNTS[normalizedEmail]);
      return true;
    }

    // Check registered accounts from localStorage
    const registered = JSON.parse(localStorage.getItem('dealflow360_registered_users') || '{}');
    if (registered[normalizedEmail] && registered[normalizedEmail].password === password) {
      const user = registered[normalizedEmail] as AuthUser & { password: string };
      const { password: _, ...userWithoutPassword } = user;
      persistUser(userWithoutPassword);
      return true;
    }

    return false;
  };

  const signup = async (name: string, email: string, password: string, role: UserRole, company?: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800)); // Simulate API call

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    if (DEMO_ACCOUNTS[normalizedEmail]) return false;

    const registered = JSON.parse(localStorage.getItem('dealflow360_registered_users') || '{}');
    if (registered[normalizedEmail]) return false;

    // Create new user
    const newUser: AuthUser & { password: string } = {
      id: `u-custom-${Date.now()}`,
      name,
      email: normalizedEmail,
      role,
      company: company || undefined,
      token: `tok_custom_${Date.now()}`,
      password,
    };

    registered[normalizedEmail] = newUser;
    localStorage.setItem('dealflow360_registered_users', JSON.stringify(registered));

    const { password: _, ...userWithoutPassword } = newUser;
    persistUser(userWithoutPassword);
    return true;
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const loginAsDemo = (role: UserRole) => {
    const demoMap: Record<UserRole, string> = {
      'Sales Rep': 'alex.morgan@dealflow360.io',
      'Sales Manager': 'sarah.vance@dealflow360.io',
      'Finance': 'michael.sterling@dealflow360.io',
      'Operations': 'david.ops@dealflow360.io',
      'Admin': 'elena.rostova@dealflow360.io',
      'Customer': 'm.brody@acmecorp.com',
    };
    const email = demoMap[role];
    if (email && DEMO_ACCOUNTS[email]) {
      persistUser(DEMO_ACCOUNTS[email]);
    }
  };

  return (
    <AuthContext.Provider value={{
      authUser,
      isAuthenticated: !!authUser,
      isLoading,
      login,
      signup,
      logout,
      loginAsDemo,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
