"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyResetCode, resetPassword } from "@/lib/auth";

type Step = "verifying" | "reset" | "success" | "error";

export default function RestoreForm() {
  const params = useSearchParams();
  const router = useRouter();

  const email = params.get("email") || "";
  const codeFromUrl = params.get("code") || "";

  const [step, setStep] = useState<Step>("verifying");
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ===== VERIFY RESET CODE ===== */
  useEffect(() => {
    if (!email || !codeFromUrl) {
      setStep("error");
      setMessage("Invalid or expired restore link.");
      return;
    }

    verifyResetCode(email, codeFromUrl)
      .then(() => {
        setStep("reset");
      })
      .catch(() => {
        setStep("error");
        setMessage("Invalid or expired restore link.");
      });
  }, []);

  /* ===== SUBMIT NEW PASSWORD ===== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setMessage("Password confirmation does not match.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      await resetPassword(
        codeFromUrl,
        password,
        confirm
        );


      setStep("success");

      setTimeout(() => {
        router.replace("/signin");
      }, 2500);
    } catch (err) {
      console.error(err);
      setMessage("Failed to reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl animate-fadeIn">

        {/* VERIFYING */}
        {step === "verifying" && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
            <h2 className="text-lg font-semibold text-gray-800">
              Verifying restore link
            </h2>
            <p className="text-sm text-gray-500">
              Please wait a moment…
            </p>
          </div>
        )}

        {/* RESET FORM */}
        {step === "reset" && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 animate-scaleIn text-left"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                🔒
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Reset your password
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter a new password for <br />
                <span className="font-medium text-gray-700">{email}</span>
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none"
                required
              />
            </div>

            {message && (
              <p className="text-sm text-red-500">{message}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {submitting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="space-y-4 animate-scaleIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>
            <h2 className="text-xl font-semibold text-green-600">
              Password reset successful
            </h2>
            <p className="text-sm text-gray-600">
              You can now sign in with your new password.
            </p>
            <p className="text-xs text-gray-400">
              Redirecting to sign in…
            </p>
          </div>
        )}

        {/* ERROR */}
        {step === "error" && (
          <div className="space-y-4 animate-scaleIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-3xl">
              ✕
            </div>
            <h2 className="text-xl font-semibold text-red-600">
              Restore failed
            </h2>
            <p className="text-sm text-gray-600">
              {message}
            </p>

            <button
              onClick={() => router.replace("/signin")}
              className="mt-4 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
