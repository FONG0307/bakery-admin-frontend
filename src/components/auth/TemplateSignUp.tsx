"use client";

import Link from "next/link";
import React, { useState } from "react";
import { signup } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function TemplateSignUp({ onAdminClick }: { onAdminClick: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string) || "";
    const password = (form.get("password") as string) || "";
    const passwordConfirmation = (form.get("password_confirmation") as string) || "";

    if (password !== passwordConfirmation) {
      setLoading(false);
      setError("Password confirmation doesn't match");
      return;
    }

    try {
      await signup(email, password, passwordConfirmation);
      router.push("/signin");
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-Pink_Passion flex items-center justify-center min-h-[80vh] pt-20 border-8 border-b-0">
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-stretch border-8 p-10 bg-Sky_Whisper w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Create your Bakery~ account</h1>

        <div className="flex flex-col gap-1 mt-2">
          <label htmlFor="email" className="text-base font-semibold">Email</label>
          <input type="email" name="email" id="email" className="border-4 px-3 py-2" required />
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label htmlFor="password" className="text-base font-semibold">Password</label>
          <input type="password" name="password" id="password" className="border-4 px-3 py-2" required />
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label htmlFor="password_confirmation" className="text-base font-semibold">Confirm Password</label>
          <input type="password" name="password_confirmation" id="password_confirmation" className="border-4 px-3 py-2" required />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex flex-col gap-3">
          <button className="button-style w-full" style={{ alignSelf: "center", padding: "0.4rem" }} disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
          <button
            type="button"
            onClick={onAdminClick}
            className="self-end text-xs text-gray-500 opacity-70 hover:opacity-90 hover:text-gray-700"
          >
            Sign up with admin account
          </button>
        </div>

        <Link className="text-base my-3" href="/signin">Already have an account? <span className="font-bold underline">Sign in</span></Link>
      </form>
    </section>
  );
}
