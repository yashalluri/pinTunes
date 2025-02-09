'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  user: {
    username?: string;
    email?: string;
    cid?: string;
  } | null;
  setUser: (user: any) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContextType['user']>(null);

  useEffect(() => {
    // Check localStorage for user data on initial load
    const storedCID = localStorage.getItem('userCID');
    if (storedCID) {
      // Fetch user data using the CID
      fetch('/api/getUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cid: storedCID }),
      })
        .then(res => res.json())
        .then(data => {
          setUser({ ...data, cid: storedCID });
        })
        .catch(console.error);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('userCID');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 