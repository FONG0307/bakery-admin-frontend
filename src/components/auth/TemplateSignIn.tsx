"use client";

import Link from "next/link";
import React, { useState } from "react";
import { signin } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function TemplateSignIn({ onAdminClick }: { onAdminClick: () => void }) {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string) || "";
    const password = (form.get("password") as string) || "";
    try {
      const res = await signin(email, password);
      setUser(res.user);
    } catch (err: any) {
      if (err?.message === "PLEASE_VERIFY_EMAIL") setError("Please verify your email before logging in");
      else setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-Pink_Passion flex items-center justify-center min-h-[80vh] pt-20 border-8 border-b-0">
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-stretch border-8 p-10 bg-Sky_Whisper w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Welcome To Bakery~</h1>

        <div className="flex flex-col gap-1 mt-2">
          <label htmlFor="email" className="text-base font-semibold">Email</label>
          <input type="email" name="email" id="email" className="border-4 px-3 py-2" required />
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label htmlFor="password" className="text-base font-semibold">Password</label>
          <input type="password" name="password" id="password" className="border-4 px-3 py-2" required />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex flex-col gap-3">
          <button className="button-style w-full" style={{ alignSelf: "center", padding: "0.4rem" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <button
            type="button"
            onClick={onAdminClick}
            className="self-end text-xs text-gray-500 opacity-70 hover:opacity-90 hover:text-gray-700"
          >
            Sign in with admin account
          </button>
        </div>

        <Link className="text-base my-3" href="/signup">Don&apos;t have an account? <span className="font-bold underline">Sign up</span></Link>
      </form>
    </section>
  );
}
