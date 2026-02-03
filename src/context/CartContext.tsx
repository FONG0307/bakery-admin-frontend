"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "@/lib/cart";

/* ================= TYPES ================= */
type CartItem = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  size?: string | null;
};

type Cart = {
  items: CartItem[];
};

type CartContextType = {
  cart: Cart | null;
  draftCart: Cart | null;

  
  setCart: React.Dispatch<React.SetStateAction<Cart | null>>;

  changeQtyLocal: (itemId: number, delta: number) => void;
  syncCartToBackend: () => Promise<void>;
  reloadCart: () => Promise<void>;
};


const CartContext = createContext<CartContextType | null>(null);

/* ================= PROVIDER ================= */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [draftCart, setDraftCart] = useState<Cart | null>(null);

  const syncingRef = useRef(false);
  const loadingCartRef = useRef(false);
  async function reloadCart() {
    if (!user) {
      setCart(null);
      setDraftCart(null);
      return;
    }

    try {
      loadingCartRef.current = true;
      const data = await getCart();
      setCart(data);
      setDraftCart(data);
    } catch (e) {
      console.error("Failed to load cart", e);
      setCart({ items: [] });
      setDraftCart({ items: [] });
    } finally {
      loadingCartRef.current = false;
    }
  }


  /* ===== OPTIMISTIC UPDATE (KHÔNG GỌI API) ===== */
  function changeQtyLocal(itemId: number, delta: number) {
    setDraftCart((prev) => {
      if (!prev) return prev;

      const item = prev.items.find((i) => i.id === itemId);
      if (!item) return prev;

      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        // gọi backend remove
        removeCartItem(itemId).catch(console.error);

        return {
          ...prev,
          items: prev.items.filter((i) => i.id !== itemId),
        };
      }

      // 🟢 Update quantity
      updateCartItem(itemId, newQty).catch(console.error);

      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, quantity: newQty } : i
        ),
      };
    });
  }



  /* ===== SYNC FINAL STATE LÊN BACKEND ===== */
  async function syncCartToBackend() {
    if (!draftCart || syncingRef.current) return;
    syncingRef.current = true;

    try {
      for (const item of draftCart.items) {
        if (item.quantity <= 0) continue; // 🔥 CHỐT LỖI
        await updateCartItem(item.id, item.quantity);
      }
      await reloadCart();
    } catch (e) {
      console.error("Failed to sync cart", e);
    } finally {
      syncingRef.current = false;
    }
  }


  /* ===== AUTO LOAD CART ===== */
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role !== "user") {
      setCart(null);
      setDraftCart(null);
      return;
    }
    reloadCart();
  }, [user, loading]);


  /* ===== AUTO SYNC SAU KHI USER DỪNG THAO TÁC ===== */
  useEffect(() => {
    if (!draftCart) return;
    if (loadingCartRef.current) return;

    const t = setTimeout(() => {
      syncCartToBackend();
    }, 800);

    return () => clearTimeout(t);
  }, [draftCart]);

  /* ===== SYNC KHI RELOAD / ĐÓNG TAB ===== */
  useEffect(() => {
    const handler = () => {
      syncCartToBackend();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        draftCart,
        setCart, 
        changeQtyLocal,
        syncCartToBackend,
        reloadCart,
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
