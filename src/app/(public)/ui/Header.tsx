"use client";

import Link from "next/link";
import { kalam } from "./fonts";
import { useAuth } from "@/context/AuthContext";
import { signout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();

  async function handleSignout() {
    try {
      await signout();       // gọi API /logout
    } finally {
      setUser(null);         // clear user local
      router.replace("/signin");
      router.refresh();      // rất quan trọng với App Router
    }
  }

  return (
    <header className="bg-yellow-800 px-6 py-8 border-8 fixed w-full z-10">
      {/* Mobile */}
      <nav className="sm:hidden flex justify-between">
        <Link className="text-base font-bold" href="/shop">Shop</Link>
        <Link className={`text-xl font-bold ${kalam.className}`} href="/">Bakery~</Link>
        <Link className="text-base font-bold" href="/contact">Contact Us</Link>
      </nav>

      {/* Desktop */}
      <nav className="hidden sm:flex justify-between items-center">
        <div className="flex items-center gap-5">
          <Link className="text-xl font-bold hover:underline" href="/shop">Shop</Link>
          <Link className="text-xl font-bold hover:underline" href="/about">About</Link>
          <Link className="text-xl font-bold hover:underline" href="/contact">Contact Us</Link>
        </div>

        <Link className={`text-3xl font-bold ${kalam.className}`} href="/">
          Bakery~
        </Link>

        <div className="flex items-center gap-6">
          {loading ? null : user ? (
            <>
              <span className="text-xl font-bold">
                Hi, {user.first_name || user.email}
              </span>

              <button
                onClick={handleSignout}
                className="text-xl font-bold hover:underline"
              >
                Sign out
              </button>
            </>
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
