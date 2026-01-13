// src/app/verify-email/VerifyEmailClient.tsx
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
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    verifyEmail(token)
    .then((res) => {
        /**
         * res.status có thể là:
         * - "verified_now"
         * - "already_verified"
         */

        if (res.status === "verified_now") {
        // logout user cũ (nếu có)
        logout();

        // login user mới
        setUser(res.user);

        setStatus("success");
        setMessage(
            "Your email has been verified successfully.\nYou will be logged in automatically."
        );

        setTimeout(() => {
            router.replace("/");
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

        // fallback an toàn
        throw new Error("Unknown verification status");
    })
    .catch((err) => {
        console.error("VERIFY FAILED:", err);
        setStatus("error");
        setMessage("Invalid or expired verification link.");
    });

    }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-lg">
        {status === "loading" && (
          <>
            <div className="mb-4 text-4xl animate-spin">⏳</div>
            <h2 className="mb-2 text-xl font-semibold">
              Verifying your email…
            </h2>
            <p className="text-gray-500">
              Please wait while we confirm your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 text-5xl">✅</div>
            <h2 className="mb-2 text-xl font-semibold text-green-600">
              Email verified successfully!
            </h2>
            <p className="text-gray-600 whitespace-pre-line">
              {message}
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Redirecting you now…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 text-5xl">❌</div>
            <h2 className="mb-2 text-xl font-semibold text-red-600">
              Verification failed
            </h2>
            <p className="text-gray-600">{message}</p>

            <button
              onClick={() => router.replace("/signin")}
              className="mt-6 px-6 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Go to Sign In
            </button>
          </>
        )}
        {status === "info" && (
        <>
            <div className="mb-4 text-5xl">ℹ️</div>
            <h2 className="mb-2 text-xl font-semibold text-blue-600">
            Account already verified
            </h2>
            <p className="text-gray-600 whitespace-pre-line">
            {message}
            </p>
        </>
        )}

      </div>
    </div>
  );
}
