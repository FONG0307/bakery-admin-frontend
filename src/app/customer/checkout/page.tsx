"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { createOrderFromCart, createStripeCheckout } from "@/lib/order";

type PaymentMethod = "cod" | "stripe";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { cart, syncCartToBackend } = useCart();

  const items = cart?.items || [];

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "cod" as PaymentMethod, // cod | stripe
  });

  const [submitting, setSubmitting] = useState(false);

  /* ================= PREFILL USER ================= */
  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      fullName: [user.first_name, user.last_name].filter(Boolean).join(" "),
      phone: user.phone || "",
    }));
  }, [user]);

  const totalPrice = items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  );

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit() {
    if (!form.fullName || !form.phone || !form.address) {
      showError("Please fill in all shipping information.");
      return;
    }

    try {
      setSubmitting(true);

      // 🔥🔥🔥 BẮT BUỘC SYNC CART TRƯỚC
      await syncCartToBackend();

      // 👉 Sau khi sync xong, backend chắc chắn có cart_items
      const order = await createOrderFromCart({
        address: form.address,
        payment_method: form.paymentMethod,
      } as any);

      if (form.paymentMethod === "cod") {
        showSuccess("Order placed successfully! You will pay upon delivery 🚚");
        router.push("/customer/orders");
        return;
      }

      if (form.paymentMethod === "stripe") {
        const session = await createStripeCheckout(order.id);
        window.location.href = session.url;
      }
    } catch (err) {
      showError("Unable to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }


  /* ================= EMPTY CART ================= */
  if ((!cart || items.length === 0) && !submitting) {
    return (
      <div className="bg-main-cupcake-background min-h-screen flex items-center justify-center">
        <p className="font-bold text-xl">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-main-cupcake-background min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-32 bg-Sky_Whisper border-x-8 border-b-8 border-gray-200">
        <h1 className="text-5xl font-extrabold uppercase mb-10">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
          {/* ================= LEFT – SHIPPING FORM ================= */}
          <div className="bg-white border-4 border-gray-300 p-8">
            <h2 className="text-2xl font-extrabold uppercase mb-6">
              Shipping Information
            </h2>

            <div className="flex flex-col gap-4">
              <input
                name="fullName"
                placeholder="Full name"
                value={form.fullName}
                onChange={handleChange}
                disabled={submitting}
                className="border-2 border-gray-400 px-4 py-3 font-semibold disabled:opacity-50"
              />

              <input
                name="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
                disabled={submitting}
                className="border-2 border-gray-400 px-4 py-3 font-semibold disabled:opacity-50"
              />

              <textarea
                name="address"
                placeholder="Shipping address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                disabled={submitting}
                className="border-2 border-gray-400 px-4 py-3 font-semibold disabled:opacity-50"
              />

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                disabled={submitting}
                className="border-2 border-gray-400 px-4 py-3 font-semibold disabled:opacity-50"
              >
                <option value="cod">
                  Cash on Delivery
                </option>
                <option value="stripe">
                  Online Payment (Stripe)
                </option>
              </select>
            </div>
          </div>

          {/* ================= RIGHT – ORDER SUMMARY ================= */}
          <div className="bg-Lemon_Zest border-4 border-gray-300 p-6 h-fit">
            <h2 className="text-2xl font-extrabold uppercase mb-4">
              Order Summary
            </h2>

            <div className="flex flex-col gap-2 mb-4">
              {items.map((i: any) => (
                <div
                  key={i.id}
                  className="flex justify-between text-sm font-bold border-b border-gray-300 pb-2"
                >
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                  <span>
                    {(i.price * i.quantity).toLocaleString()} ₫
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-extrabold text-lg mb-6">
              <span>Total</span>
              <span>{totalPrice.toLocaleString()} ₫</span>
            </div>

            {/* ===== CASH ON DELIVERY ===== */}
            {form.paymentMethod === "cod" && (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full border-2 border-black px-6 py-4 font-extrabold uppercase hover:bg-black hover:text-white transition disabled:opacity-50"
                >
                  {submitting ? "Placing order…" : "Place Order (Pay on Delivery)"}
                </button>
                <p className="text-xs text-center opacity-60 mt-4">
                  Pay when you receive your order 🚚
                </p>
              </>
            )}

            {/* ===== STRIPE PAYMENT ===== */}
            {form.paymentMethod === "stripe" && (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full border-2 border-black px-6 py-4 font-extrabold uppercase hover:bg-black hover:text-white transition disabled:opacity-50"
                >
                  {submitting ? "Starting payment…" : "Create Order & Pay Online"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
