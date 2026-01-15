// src/context/AuthContext.tsx
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
        fetchData(); // Fetch products and daily stock after user is set
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function fetchData() {
    try {
        console.log("👉 fetchData called");

        const [prods, stocks] = await Promise.allSettled([
          getProducts(),
          getDailyStock(),
        ]);

        const productsData = prods.status === "fulfilled" ? prods.value : [];
        const stocksData = stocks.status === "fulfilled" ? stocks.value : [];

        setProducts(productsData);
        setDailyStock(stocksData);
      } catch (e) {
        console.error(e);
      }

  }

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
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
export type CartItem = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
};