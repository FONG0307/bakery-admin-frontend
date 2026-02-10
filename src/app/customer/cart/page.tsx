"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function CartPage() {
  const { cart, changeQty, removeItem } = useCart();
  const { showError } = useToast();
  const router = useRouter();

  const items = cart?.items || [];

  const totalPrice = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  function handleCheckout() {
    if (items.length === 0) {
      showError("Your cart is empty. Please add items to proceed to checkout.");
      return;
    }
    router.push("/customer/checkout");
  }

  return (
    <div className="bg-main-cupcake-background min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-32 bg-Sky_Whisper border-x-8 border-b-8 border-gray-200">
        <h1 className="text-5xl font-extrabold uppercase mb-10">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-gray-300 p-10 text-center">
            <p className="font-bold text-lg mb-4">
              Your cart is empty 🍞
            </p>
            <Link
              href="/shop"
              className="inline-block border-2 border-black px-6 py-3 font-bold uppercase"
            >
              Go shopping →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
            {/* LEFT */}
            <div className="flex flex-col gap-6">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex gap-6 p-5 border-4 ${
                    idx % 2 === 0
                      ? "bg-Lemon_Zest border-gray-300"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <div className="relative w-28 h-28 border-2 border-gray-400 bg-white">
                    <Image
                      src={
                        item.image ||
                        "/images/product/bakery-placeholder.png"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 relative">
                    <h3 className="font-extrabold text-xl uppercase">
                      {item.name}
                    </h3>

                    {item.size && (
                      <p className="text-xs opacity-60">
                        Size: {item.size}
                      </p>
                    )}

                    <p className="font-bold mt-2">
                      {Number(item.price).toLocaleString()} ₫
                    </p>

                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => changeQty(item.id, -1)}
                        className="button-style button-style-icon"
                      >
                        −
                      </button>

                      <span className="min-w-[24px] text-center font-extrabold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => changeQty(item.id, +1)}
                        className="button-style button-style-icon"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 border-2 border-black flex items-center justify-center font-black"
                      >
                        ×
                      </button>
                    </div>

                    <p className="font-extrabold text-lg mt-2">
                      {(item.price * item.quantity).toLocaleString()} ₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div className="bg-Lemon_Zest border-4 border-gray-300 p-6 h-fit">
              <h2 className="text-2xl font-extrabold uppercase mb-4">
                Order Summary
              </h2>

              <div className="flex justify-between font-bold mb-2">
                <span>Total items</span>
                <span>{items.length}</span>
              </div>

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>{totalPrice.toLocaleString()} ₫</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full border-2 border-black px-6 py-4 font-extrabold uppercase hover:bg-black hover:text-white transition"
              >
                Go to checkout →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
