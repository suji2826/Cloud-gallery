import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { isFirebaseConfigured, getMissingFirebaseConfigKeys } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  missingConfigKeys: string[];
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithDemo: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured] = useState<boolean>(() => isFirebaseConfigured());
  const [missingConfigKeys] = useState<string[]>(() => getMissingFirebaseConfigKeys());

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await authService.signInWithGoogle();
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authService.signInWithEmail(email, pass);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithDemo = async (name?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.signInWithDemo(name);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const getIdToken = useCallback((forceRefresh = false) => {
    return authService.getIdToken(forceRefresh);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isConfigured,
        missingConfigKeys,
        signInWithGoogle,
        signInWithEmail,
        signInWithDemo,
        logout,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
