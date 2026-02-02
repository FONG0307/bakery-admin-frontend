"use client";

import Link from "next/link";
import React, { useState } from "react";
import { sendRestoreAccountEmail, signin } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function TemplateSignIn() {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [emailForRestore, setEmailForRestore] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleRestoreAccount() {
    if (!emailForRestore) return;

    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      await sendRestoreAccountEmail(emailForRestore);

      setShowRestore(false);
      setInfo("Check your email to restore your account.");
    } catch (err) {
      setError("Failed to send restore email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setShowRestore(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string) || "";
    const password = (form.get("password") as string) || "";

    try {
      const res = await signin(email, password);
      setUser(res.user);
    } catch (err: any) {
      if (err?.message === "PLEASE_VERIFY_EMAIL") {
        setError("Please verify your email before logging in.");
      } 
      else if (err?.message === "ACCOUNT_DELETED") {
        setEmailForRestore(email);
        setShowRestore(true);
        setError("Your account has been locked.");
      } 
      else {
        setError("Invalid email or password.");
      }
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
        <div className="mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold underline hover:opacity-80"
          >
            Forgot password?
          </Link>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {showRestore && (
          <div className="mt-3 border-2 border-dashed p-3 bg-white">
            <p className="text-sm">
              Your account has been locked.<br />
              Do you want to restore it?
            </p>

            <button
              type="button"
              onClick={handleRestoreAccount}
              className="mt-2 underline font-semibold hover:opacity-80"
              disabled={loading}
            >
              Yes, restore my account
            </button>
          </div>
        )}

        {info && (
          <p className="mt-3 text-sm text-green-700">
            {info}
          </p>
        )}


        <div className="mt-4 flex flex-col gap-3">
          <button className="button-style w-full" style={{ alignSelf: "center", padding: "0.4rem" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </div>

        <Link className="text-base my-3" href="/signup">Don&apos;t have an account? <span className="font-bold underline">Sign up</span></Link>
      </form>
    </section>
  );
}
