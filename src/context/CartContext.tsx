"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "@/lib/cart";

/* ================= TYPES ================= */
export type CartItem = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  size?: string | null;
};

export type Cart = {
  items: CartItem[];
  summary?: {
    subtotal: number;
    discount_amount: number;
    total: number;
    discount_code?: string | null;
  };
};

type CartContextType = {
  cart: Cart | null;
  reloadCart: () => Promise<void>;
  changeQty: (itemId: number, delta: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCartLocal: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

/* ================= PROVIDER ================= */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);

  /* ===== LOAD CART (LOGIN / RELOAD PAGE) ===== */
  async function reloadCart() {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setCart({ items: [] });
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "user") {
      setCart(null);
      return;
    }
    reloadCart();
  }, [user, loading]);

  /* ===== CHANGE QTY (OPTIMISTIC + 1 API CALL) ===== */
  async function changeQty(itemId: number, delta: number) {
    if (!cart) return;

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    // 🔥 OPTIMISTIC UI
    setCart({
      ...cart,
      items:
        newQty <= 0
          ? cart.items.filter((i) => i.id !== itemId)
          : cart.items.map((i) =>
              i.id === itemId ? { ...i, quantity: newQty } : i
            ),
    });

    try {
      if (newQty <= 0) {
        await removeCartItem(itemId);
      } else {
        await updateCartItem(itemId, newQty);
      }
    } catch {
      // rollback nếu lỗi
      reloadCart();
    }
  }

  /* ===== REMOVE ITEM ===== */
  async function removeItem(itemId: number) {
    if (!cart) return;

    setCart({
      ...cart,
      items: cart.items.filter((i) => i.id !== itemId),
    });

    try {
      await removeCartItem(itemId);
    } catch {
      reloadCart();
    }
  }

  /* ===== CLEAR CART LOCAL (SAU PAYMENT) ===== */
  function clearCartLocal() {
    setCart({ items: [] });
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        reloadCart,
        changeQty,
        removeItem,
        clearCartLocal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
