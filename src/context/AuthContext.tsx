"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/lib/auth";

export type User = {
  id: number;
  email: string;
  role: "admin" | "staff" | "user";

  first_name?: string;
  last_name?: string;

  // Address / billing info
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  tax_id?: string;
  phone?: string;
  bio?: string;
};


type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
