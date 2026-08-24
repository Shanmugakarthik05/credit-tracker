import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '../auth-client';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Better Auth / Neon Auth handles sessions via cookies automatically,
    // but we can also retrieve the current session token if we need to pass it in headers manually,
    // though the SDK fetch client usually does this. For compatibility with our existing Axios/fetch setup:
    const checkSession = async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (data && !error) {
           // We might need a raw token for FastAPI, or rely on cookies.
           // For now, let's just set a dummy token so the app knows we're authenticated
           setToken("neon-auth-active"); 
        } else {
           setToken(null);
        }
      } catch (e) {
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const logout = async () => {
    setIsLoading(true);
    await authClient.signOut();
    setToken(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
