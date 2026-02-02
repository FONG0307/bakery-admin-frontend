"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

type Status = "loading" | "success" | "error" | "info";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { setUser, logout } = useAuth();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        if (res.status === "verified_now") {
          logout();
          setUser(res.user);

          setStatus("success");
          setMessage(
            "Your email has been verified successfully.\nYou will be logged in automatically."
          );

          setTimeout(() => {
            router.replace("/customer");
          }, 2500);
          return;
        }

        if (res.status === "already_verified") {
          setStatus("info");
          setMessage(
            "This account has already been verified.\nPlease do not spam the verification link."
          );
          return;
        }

        throw new Error("Unknown verification status");
      })
      .catch((err) => {
        console.error("VERIFY FAILED:", err);
        setStatus("error");
        setMessage("Invalid or expired verification link.");
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl transition-all duration-500 animate-fadeIn">

        {/* LOADING */}
        {status === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
            <h2 className="text-lg font-semibold text-gray-800">
              Verifying your email
            </h2>
            <p className="text-sm text-gray-500">
              Please wait a moment…
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div className="space-y-4 animate-scaleIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>
            <h2 className="text-xl font-semibold text-green-600">
              Email verified!
            </h2>
            <p className="whitespace-pre-line text-sm text-gray-600">
              {message}
            </p>
            <p className="text-xs text-gray-400">
              Redirecting you shortly…
            </p>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="space-y-4 animate-scaleIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-3xl">
              ✕
            </div>
            <h2 className="text-xl font-semibold text-red-600">
              Verification failed
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

        {/* INFO */}
        {status === "info" && (
          <div className="space-y-4 animate-scaleIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-3xl">
              i
            </div>
            <h2 className="text-xl font-semibold text-blue-600">
              Already verified
            </h2>
            <p className="whitespace-pre-line text-sm text-gray-600">
              {message}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
