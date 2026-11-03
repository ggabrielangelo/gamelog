import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TOKEN_STORAGE_KEY } from '../services/api';
import { fetchMe, login as loginRequest, register as registerRequest } from '../services/auth';
import type { User } from '../types';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await loginRequest(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(u);
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; passwordConfirmation: string }) => {
      const { user: u, token } = await registerRequest(input);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      setUser(u);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
