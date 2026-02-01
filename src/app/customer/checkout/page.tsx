"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { createOrderFromCart } from "@/lib/order";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, setCart } = useCart();
  const { showSuccess, showError } = useToast();

  const items = cart?.items || [];

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  /* ================= PREFILL USER ================= */
  useEffect(() => {
    if (!user) return;

    setForm({
      full_name:
        [user.first_name, user.last_name].filter(Boolean).join(" ") || "",
      phone: user.phone || "",
      address: "",
    });
  }, [user]);

  const totalPrice = items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit() {
    if (!form.full_name || !form.phone || !form.address) {
      showError("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    try {
      await createOrderFromCart({
        address: form.address,
      });

      setCart(null);
      showSuccess("Đặt hàng thành công! Thanh toán khi nhận hàng 🚚");
      router.push("/customer/orders");
    } catch (err: any) {
        if (err.message === "OUT_OF_STOCK") {
            showError("Một số sản phẩm đã hết hàng, vui lòng kiểm tra lại giỏ hàng");
            router.push("/cart");
        } else {
            showError("Không thể tạo đơn hàng");
        }
    }
  }

  if (!cart || items.length === 0) {
    return (
      <div className="bg-main-cupcake-background min-h-screen flex items-center justify-center">
        <p className="font-bold text-xl">Cart is empty</p>
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

          {/* ================= LEFT – FORM ================= */}
          <div className="bg-white border-4 border-gray-300 p-8">
            <h2 className="text-2xl font-extrabold uppercase mb-6">
              Shipping Information
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="font-bold uppercase text-sm block mb-1">
                  Full name
                </label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-400 px-4 py-3 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-sm block mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-400 px-4 py-3 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-sm block mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border-2 border-gray-400 px-4 py-3 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT – SUMMARY ================= */}
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
                    {Number(i.price * i.quantity).toLocaleString()} ₫
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-extrabold text-lg mb-6">
              <span>Total</span>
              <span>{Number(totalPrice).toLocaleString()} ₫</span>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full border-2 border-black px-6 py-4 font-extrabold uppercase hover:bg-black hover:text-white transition"
            >
              Place Order – Cash on Delivery
            </button>

            <p className="text-xs text-center opacity-60 mt-4">
              Pay when you receive your order 🚚
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
