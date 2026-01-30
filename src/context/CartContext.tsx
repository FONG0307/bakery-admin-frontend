"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getCart } from "@/lib/cart";

type CartContextType = {
  cart: any | null;
  setCart: (c: any | null) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState<any | null>(null);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    async function loadCart() {
      if (!user) {
        setCart(null);
        return;
      }

      try {
        const data = await getCart();
        if (!cancelled) {
          setCart(data);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load cart", e);
          setCart({ items: [] });
        }
      }
    }

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
