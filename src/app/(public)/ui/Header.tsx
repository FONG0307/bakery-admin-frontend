"use client";

import Link from "next/link";
import { kalam } from "./fonts";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { signout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

export default function Header() {
  const { user, loading, setUser } = useAuth();
  const { cart } = useCart();
  const router = useRouter();

  const [openUser, setOpenUser] = useState(false);
  const [openCart, setOpenCart] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const ITEM_BG_COLORS = [
    "bg-pink-100",
    "bg-blue-100",
    "bg-yellow-100",
    "bg-green-100",
  ];
  useClickOutside(userRef, () => setOpenUser(false));
  useClickOutside(cartRef, () => setOpenCart(false));

  async function handleSignout() {
    try {
      await signout();
    } finally {
      setUser(null);
      setOpenUser(false);
      router.replace("/signin");
      router.refresh();
    }
  }

  const totalQty =
    cart?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

  const totalPrice =
    cart?.items?.reduce(
      (sum: number, i: any) => sum + i.quantity * Number(i.price),
      0
    ) || 0;

  return (
    <header className="bg-yellow-800 px-6 py-8 border-8 fixed w-full z-10 h-32">
      <nav className="hidden sm:flex justify-between items-center relative">
        {/* LEFT */}
        <div className="flex items-center gap-5">
          <Link className="text-xl font-bold hover:underline" href="/shop">
            Shop
          </Link>
          <Link className="text-xl font-bold hover:underline" href="/about">
            About
          </Link>
        </div>

        {/* CENTER */}
        <Link className={`text-3xl font-bold ${kalam.className}`} href="/">
          Bakery~
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-8 relative">
          {/* ================= CART ================= */}
          {user && (
            <div ref={cartRef} className="relative">
              <button
                onClick={() => {
                  setOpenCart((o) => !o);
                  setOpenUser(false);
                }}
                className="relative text-xl font-bold"
              >
                🛒 Cart,
                {totalQty > 0 && (
                  <span className="">
                    {" "+totalQty}
                  </span>
                )}
              </button>

              {openCart && (
                <div className="absolute right-0 top-full mt-4 w-80 bg-white border-4 border-black shadow-xl z-50
                                transition-all duration-200 ease-out origin-top scale-100 opacity-100">
                  {!cart || cart.items.length === 0 ? (
                    <p className="p-4 text-sm font-bold text-center">
                      Cart is empty
                    </p>
                  ) : (
                    <>
                      <ul className="max-h-72 overflow-auto">
                        {cart.items.map((item: any, index: number) => {
                          const bgColor =
                            ITEM_BG_COLORS[index % ITEM_BG_COLORS.length];

                          return (
                            <Link
                              key={item.id}
                              href={`/shop/${item.product_id}`}
                              onClick={() => setOpenCart(false)}
                              className={`block ${bgColor} hover:brightness-95 transition`}
                            >
                              <li className="flex gap-3 p-3 border-b border-gray-300">
                                <img
                                  src={
                                    item.image ||
                                    "/images/product/bakery-placeholder.png"
                                  }
                                  alt={item.name}
                                  className="w-14 h-14 object-cover border-2 border-gray-400 bg-white"
                                />

                                <div className="flex-1">
                                  <p className="font-bold text-sm leading-tight">
                                    {item.name}
                                  </p>

                                  {item.size && (
                                    <p className="text-xs opacity-70">
                                      Size: {item.size}
                                    </p>
                                  )}

                                  <p className="text-xs mt-1">
                                    {item.quantity} ×{" "}
                                    {Number(item.price).toLocaleString()} ₫
                                  </p>
                                </div>
                              </li>
                            </Link>
                          );
                        })}
                      </ul>


                      {/* TOTAL */}
                      <div className="p-4 border-t-4 border-black flex justify-between font-extrabold">
                        <span>Total</span>
                        <span>{totalPrice.toLocaleString()} ₫</span>
                      </div>

                      <Link
                        href="/customer/cart"
                        onClick={() => setOpenCart(false)}
                        className="block text-center font-extrabold p-3 border-t-4 border-black hover:bg-gray-100"
                      >
                        View cart →
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= USER ================= */}
          {loading ? null : user ? (
            <div ref={userRef} className="relative">
              <button
                onClick={() => {
                  setOpenUser((o) => !o);
                  setOpenCart(false);
                }}
                className="text-xl font-bold hover:underline"
              >
                Hi, {user.first_name || user.email}
              </button>

              {openUser && (
                <div className="absolute right-0 top-full mt-4 w-52 bg-white border-4 border-black shadow-xl z-50
                                transition-all duration-200 ease-out origin-top">
                  <Link
                    href="/customer/profile"
                    onClick={() => setOpenUser(false)}
                    className="block px-4 py-3 font-bold hover:bg-gray-100"
                  >
                    👤 My profile
                  </Link>

                  <Link
                    href="/customer/orders"
                    onClick={() => setOpenUser(false)}
                    className="block px-4 py-3 font-bold hover:bg-gray-100"
                  >
                    📦 My orders
                  </Link>

                  <button
                    onClick={handleSignout}
                    className="w-full text-left px-4 py-3 font-bold hover:bg-gray-100 border-t-4 border-black"
                  >
                    🚪 Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="text-xl font-bold hover:underline" href="/signin">
                Sign In
              </Link>
              <Link className="text-xl font-bold hover:underline" href="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
