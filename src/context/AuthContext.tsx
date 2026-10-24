import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  availableUsers: UserProfile[];
  loginOrRegister: (params: {
    name: string;
    role?: 'student' | 'teacher';
    email?: string;
    avatar?: string;
    gradeLevel?: string;
  }) => Promise<UserProfile>;
  switchUser: (userId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  resetEntireDatabase: () => Promise<void>;
  isTeacher: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('scratchmaster_active_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If it's an old legacy profile with pre-filled 265 marks, ignore it so user starts fresh at 0
        if (parsed?.totalMarksEarned > 0 && !parsed.createdAt) {
          localStorage.removeItem('scratchmaster_active_user');
          return null;
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return null;
  });

  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setAvailableUsers(data.users);
        if (currentUser) {
          const updatedSelf = data.users.find((u: UserProfile) => u.id === currentUser.id);
          if (updatedSelf) {
            setCurrentUser(updatedSelf);
            localStorage.setItem('scratchmaster_active_user', JSON.stringify(updatedSelf));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch users from server:', err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const loginOrRegister = async (params: {
    name: string;
    role?: 'student' | 'teacher';
    email?: string;
    avatar?: string;
    gradeLevel?: string;
  }): Promise<UserProfile> => {
    const res = await fetch('/api/auth/login-or-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.success && data.user) {
      setCurrentUser(data.user);
      localStorage.setItem('scratchmaster_active_user', JSON.stringify(data.user));
      await refreshUsers();
      return data.user;
    }
    throw new Error(data.error || 'Failed to sign in.');
  };

  const switchUser = (userId: string) => {
    const found = availableUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('scratchmaster_active_user', JSON.stringify(found));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('scratchmaster_active_user');
  };

  const resetEntireDatabase = async () => {
    try {
      await fetch('/api/auth/reset-all', { method: 'POST' });
      setCurrentUser(null);
      localStorage.removeItem('scratchmaster_active_user');
      await refreshUsers();
    } catch (e) {
      console.error('Failed to reset database:', e);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('scratchmaster_active_user', JSON.stringify(updated));

    try {
      await fetch(`/api/users/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await refreshUsers();
    } catch (e) {
      console.error('Failed to update user profile on server:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        loginOrRegister,
        switchUser,
        updateProfile,
        logout,
        resetEntireDatabase,
        isTeacher: currentUser?.role === 'teacher',
        refreshUsers,
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
