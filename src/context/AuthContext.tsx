// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/lib/auth";

export type User = {
  id: number;
  email: string;
  role: "admin" | "staff" | "user";
  first_name?: string;
  last_name?: string;
  country?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  tax_id?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");

    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }

    getMe(t)
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🔥 ADD LOGOUT IMPLEMENTATION
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
      }}
    >
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
