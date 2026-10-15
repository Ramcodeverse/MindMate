import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../utils/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<NonNullable<User['preferences']>>) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  switchAccount: (role: 'user' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getStoredToken();
        if (token) {
          const res = await api.getCurrentUser();
          setUser(res.user);
        } else {
          // Auto-load demo user Sarah
          const res = await api.login('sarah.johnson@email.com', 'sarah123');
          setStoredToken(res.token);
          setUser(res.user);
        }
      } catch (err) {
        console.warn('[AuthContext] Session restore failed, defaulting to demo user', err);
        try {
          const res = await api.login('sarah.johnson@email.com', 'sarah123');
          setStoredToken(res.token);
          setUser(res.user);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password = 'password123'): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.login(email, password);
      setStoredToken(res.token);
      setUser(res.user);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password = 'password123'): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.register(name, email, password);
      setStoredToken(res.token);
      setUser(res.user);
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    setStoredToken(null);
    setUser(null);
  };

  const updateUserPreferences = async (prefs: Partial<NonNullable<User['preferences']>>) => {
    if (!user) return;
    try {
      const updated = await api.updateProfile({ preferences: prefs });
      setUser(updated);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  const updateName = async (name: string) => {
    if (!user) return;
    try {
      const updated = await api.updateProfile({ name });
      setUser(updated);
    } catch (err) {
      console.error('Failed to update name:', err);
    }
  };

  const switchAccount = async (role: 'user' | 'admin') => {
    if (role === 'admin') {
      await login('admin@mindmate.com', 'admin123');
    } else {
      await login('sarah.johnson@email.com', 'sarah123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserPreferences,
        updateName,
        switchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};