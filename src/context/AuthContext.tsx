"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe } from "@/lib/auth";
import { getProducts, getDailyStock } from "@/lib/product";

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
  products: any[];
  dailyStock: any[];
  combinedProducts: any[];
  fetchData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [dailyStock, setDailyStock] = useState<any[]>([]);

  const combinedProducts = useMemo(() => {
    return products.map((p: any) => ({
      ...p,
      daily_stock:
        dailyStock.find((d: any) => d.product_id === p.id) || null,
    }));
  }, [products, dailyStock]);

  /* ================= AUTH BOOTSTRAP ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => {
        setUser(res.user);
        fetchData();
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* ================= FETCH DATA ================= */
  async function fetchData() {
    try {
      const [prods, stocks] = await Promise.allSettled([
        getProducts(),
        getDailyStock(),
      ]);

      setProducts(
        prods.status === "fulfilled" ? prods.value.products ?? [] : []
      );

      setDailyStock(
        stocks.status === "fulfilled" ? stocks.value ?? [] : []
      );
    } catch (e) {
      console.error(e);
    }
  }

  /* ================= LOGOUT ================= */
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
        products,
        dailyStock,
        combinedProducts,
        fetchData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
