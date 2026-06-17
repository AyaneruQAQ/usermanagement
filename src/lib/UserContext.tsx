'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';
import type { User } from '@/types';

interface UserState {
  user: User | null;
  loading: boolean;
  refresh: () => void;
}

const UserContext = createContext<UserState>({
  user: null,
  loading: true,
  refresh: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    getCurrentUser()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, loading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
