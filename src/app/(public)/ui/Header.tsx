import Link from "next/link";
import { kalam } from "./fonts";

export default function Header() {
  return (
    <header className="bg-yellow-800 px-6 py-8 border-8 fixed w-full z-10">
      <nav className="sm:hidden flex justify-between">
        <Link className="text-base font-bold" href="/shop">Shop</Link>
        <Link className={`text-xl font-bold ${kalam.className}`} href="/">Bakery~</Link>
        <Link className="text-base font-bold" href="/contact">Contact Us</Link>
      </nav>

      <nav className="hidden sm:flex justify-between">
        <div className="flex justify-between items-center gap-5">
          <Link className="text-xl font-bold hover:underline" href="/shop">Shop</Link>
          <Link className="text-xl font-bold hover:underline" href="/about">About</Link>
          <Link className="text-xl font-bold hover:underline" href="/contact">Contact Us</Link>
        </div>
        
        <Link className={`text-3xl font-bold ${kalam.className}`} href="/">Bakery~</Link>

        <div className="flex justify-between items-center gap-6">
          <Link className="text-xl font-bold hover:underline" href="/signin">Sign In</Link>
          <Link className="text-xl font-bold hover:underline" href="/signup">Sign Up</Link>
          <Link className="text-xl font-bold hover:underline" href="/shop">Search</Link>
        </div>
      </nav>
    </header>
  )
}
