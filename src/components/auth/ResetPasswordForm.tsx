"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyResetCode, resetPassword } from "@/lib/auth";

export default function TemplateResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordValid = useMemo(() => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }, [password]);

  /* ================= VERIFY CODE ================= */
  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || code.length !== 6) {
      setError("Please enter email and 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyResetCode(email, code);
      setResetToken(res.reset_token);
      setStep("reset");
    } catch (err: any) {
      setError(err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  /* ================= RESET PASSWORD ================= */
  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!resetToken) {
      setError("Missing reset token");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Password confirmation does not match");
      return;
    }
    if (!passwordValid) {
      setError("Password must be at least 8 characters and include upper, lower case and number");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, password, passwordConfirm);
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 1800);
    } catch (err: any) {
      setError(err?.message || "Reset password failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-Pink_Passion flex items-center justify-center min-h-[80vh] pt-20 border-8 border-b-0">
      <form
        onSubmit={step === "verify" ? handleVerify : handleReset}
        className="flex flex-col justify-center items-stretch border-8 p-10 bg-Sky_Whisper w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-2">
          {step === "verify" ? "Verify Reset Code 🍰" : "Reset Password 🔐"}
        </h1>

        <p className="text-sm mb-4">
          {step === "verify"
            ? "Enter your email and the 6-digit code sent to you."
            : "Enter your new password. Minimum 8 characters, includes upper/lower case and number."}
        </p>

        {/* ===== EMAIL ===== */}
        {step === "verify" && (
          <>
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-base font-semibold">Email</label>
              <input
                type="email"
                className="border-4 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="text-base font-semibold">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="border-4 px-3 py-2"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                required
                disabled={loading}
              />
            </div>
          </>
        )}

        {/* ===== RESET PASSWORD ===== */}
        {step === "reset" && (
          <>
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-base font-semibold">New password</label>
              <input
                type="password"
                className="border-4 px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="text-base font-semibold">Confirm password</label>
              <input
                type="password"
                className="border-4 px-3 py-2"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </>
        )}

        {/* ===== ERROR / SUCCESS ===== */}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && (
          <p className="mt-3 text-sm text-green-700">
            Password reset successfully! Redirecting to sign in...
          </p>
        )}

        {/* ===== BUTTON ===== */}
        <div className="mt-4 flex flex-col gap-3">
          <button
            className="button-style w-full"
            style={{ padding: "0.4rem" }}
            disabled={loading || success}
          >
            {loading
              ? "Processing..."
              : step === "verify"
              ? "Verify code"
              : "Reset password"}
          </button>
        </div>

        {/* ===== BACK ===== */}
        <Link className="text-base my-3" href="/signin">
          Back to <span className="font-bold underline">Sign in</span>
        </Link>
      </form>
    </section>
  );
}
