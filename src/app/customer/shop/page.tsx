"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { createOrder, addOrderItem, createStripeCheckout } from "@/lib/order";
import { useRouter } from "next/navigation";

export default function CustomerShopPage() {
  const { user, loading, combinedProducts, fetchData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const [cart, setCart] = useState<Array<{ id: number; name: string; price: number; qty: number }>>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [dayPart, setDayPart] = useState("morning");
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  function addToCart(p: any) {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === p.id);
      if (exist) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.item_name, price: Number(p.unit_price), qty: 1 }];
    });
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) => prev
      .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
      .filter((i) => i.qty > 0)
    );
  }

  async function handleCheckout() {
    if (!address.trim()) {
      alert("Please enter shipping address");
      return;
    }

    try {
      setSubmitting(true);
      const order = await createOrder({ payment_method: paymentMethod, day_part: dayPart, address });
      for (const item of cart) {
        await addOrderItem(order.id, item.id, item.qty);
      }
      if (paymentMethod === "card") {
        const session = await createStripeCheckout(order.id);
        if (session?.url) {
          window.location.href = session.url; // redirect to Stripe Checkout
          return;
        } else {
          alert("Failed to start payment session");
        }
      } else {
        alert("Order placed successfully");
        setCart([]);
        setCheckoutOpen(false);
      }
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shop</h1>
        <button
          className="px-4 py-2 rounded border"
          onClick={() => setCheckoutOpen(true)}
          disabled={!cart.length}
        >
          Checkout ({cart.length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {combinedProducts.map((p: any) => {
          const available = p.daily_stock?.available ?? p.daily_stock?.quantity ?? null;
          return (
            <div key={p.id} className="border rounded-xl p-4 bg-white dark:bg-gray-900">
              <div className="h-40 mb-3 overflow-hidden rounded">
                <Image
                  src={p.image_url || "/images/product/bakery-placeholder.png"}
                  alt={p.item_name}
                  width={400}
                  height={300}
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="font-medium">{p.item_name}</div>
              <div className="text-sm text-gray-500">{p.category}</div>
              <div className="mt-1 font-semibold">{Number(p.unit_price).toLocaleString()} ₫</div>
              <div className="text-xs text-gray-500">{available !== null ? `Available today: ${available}` : ""}</div>
              <button
                className="mt-3 px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                onClick={() => addToCart(p)}
                disabled={available !== null && available <= 0}
              >
                Add to cart
              </button>
            </div>
          );
        })}
      </div>

      {/* Cart mini panel */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 p-4 rounded-xl border bg-white shadow-lg dark:bg-gray-900">
          <div className="font-medium mb-2">Cart</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {cart.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3">
                <div className="text-sm">{i.name}</div>
                <div className="flex items-center gap-2">
                  <button className="px-2 border rounded" onClick={() => updateQty(i.id, -1)}>-</button>
                  <span>{i.qty}</span>
                  <button className="px-2 border rounded" onClick={() => updateQty(i.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-right text-sm">Total: <span className="font-semibold">{total.toLocaleString()} ₫</span></div>
          <button className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded" onClick={() => setCheckoutOpen(true)}>Checkout</button>
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setCheckoutOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[520px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Checkout</h3>

            <label className="block text-sm mb-1">Shipping Address</label>
            <textarea
              className="w-full border rounded px-3 py-2 mb-3"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter delivery address"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Payment Method</label>
                <select className="w-full border rounded px-3 py-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Time</label>
                <select className="w-full border rounded px-3 py-2" value={dayPart} onChange={(e) => setDayPart(e.target.value)}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 border rounded" onClick={() => setCheckoutOpen(false)}>Cancel</button>
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                onClick={handleCheckout}
                disabled={submitting || cart.length === 0}
              >
                {submitting ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
