"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/lib/auth";

export default function TemplateForgotPassword() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 800);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-Pink_Passion flex items-center justify-center min-h-[80vh] pt-20 border-8 border-b-0">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-stretch border-8 p-10 bg-Sky_Whisper w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-2">
          Forgot Password 🍰
        </h1>

        <p className="text-sm mb-4">
          Enter your email and we’ll send you a 6-digit reset code.
        </p>

        {/* EMAIL */}
        <div className="flex flex-col gap-1 mt-2">
          <label htmlFor="email" className="text-base font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="border-4 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>

        {/* SUCCESS */}
        {success && (
          <p className="mt-3 text-sm text-green-700">
            Reset code sent! Please check your email 📩
          </p>
        )}

        {/* ERROR */}
        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <div className="mt-4 flex flex-col gap-3">
          <button
            className="button-style w-full"
            style={{ alignSelf: "center", padding: "0.4rem" }}
            disabled={loading || success}
          >
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </div>

        {/* BACK */}
        <Link className="text-base my-3" href="/signin">
          Remember your password?{" "}
          <span className="font-bold underline">Sign in</span>
        </Link>
      </form>
    </section>
  );
}
