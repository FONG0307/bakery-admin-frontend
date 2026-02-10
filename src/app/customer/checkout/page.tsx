"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { createOrderFromCart, createStripeCheckout } from "@/lib/order";
import { applyVoucher } from "@/lib/cart";

type PaymentMethod = "cod" | "stripe";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, reloadCart, clearCartLocal } = useCart();
  const { showSuccess, showError } = useToast();

  const items = cart?.items || [];
  const summary = cart?.summary;

  const [voucherCode, setVoucherCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "cod" as PaymentMethod,
  });

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
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ================= APPLY VOUCHER ================= */
  async function handleApplyVoucher() {
    if (!voucherCode) return;

    try {
      await applyVoucher(voucherCode);

      await reloadCart();

      showSuccess("Voucher applied successfully 🎉");
    } catch {
      showError("Invalid or expired voucher code");
    }
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit() {
    if (!form.fullName || !form.phone || !form.address) {
      showError("Please fill in all shipping information.");
      return;
    }

    if (items.length === 0) {
      showError("Your cart is empty");
      return;
    }

    try {
      setSubmitting(true);

      const order = await createOrderFromCart({
        address: form.address,
        payment_method: form.paymentMethod,
      } as any);

      clearCartLocal();

      if (form.paymentMethod === "cod") {
        showSuccess("Order placed successfully! You will pay upon delivery 🚚");
        router.push("/customer/orders");
        return;
      }

      // STRIPE
      const session = await createStripeCheckout(order.id);
      window.location.href = session.url;
    } catch (err) {
      showError("Unable to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ================= EMPTY CART ================= */
  if (!cart || items.length === 0) {
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
            <div className="flex gap-2 mb-4">
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Voucher code"
                className="flex-1 border-2 border-gray-400 px-3 py-2 font-bold"
              />
              <button
                onClick={handleApplyVoucher}
                disabled={!voucherCode || items.length === 0}
                className="border-2 border-black px-4 font-extrabold uppercase disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {/* ===== ORDER SUMMARY BREAKDOWN ===== */}
            <div className="flex flex-col gap-2 text-sm font-bold mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {(summary?.subtotal ?? totalPrice).toLocaleString()} ₫
                </span>
              </div>

              {summary?.discount_amount && summary.discount_amount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>
                    Discount
                    {summary.discount_code && (
                      <> (<b>{summary.discount_code}</b>)</>
                    )}
                  </span>
                  <span>
                    -{summary.discount_amount.toLocaleString()} ₫
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg border-t pt-2">
                <span>Total</span>
                <span>
                  {(summary?.total ?? totalPrice).toLocaleString()} ₫
                </span>
              </div>
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
