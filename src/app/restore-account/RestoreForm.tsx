"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "loading" | "success" | "error";

export default function RestoreAccountClient() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or expired restore link.");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/restore-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Restore failed");

        // 🔥 backend trả token + user → auto login
        localStorage.setItem("token", data.token);

        setStatus("success");
        setMessage("Your account has been restored successfully.");

        setTimeout(() => {
          router.replace("/customer");
        }, 2000);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Invalid or expired restore link.");
      });
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow">
        {status === "loading" && (
          <>
            <div className="mb-4 animate-spin">⏳</div>
            <h2 className="font-semibold">Restoring your account…</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 text-3xl">✅</div>
            <h2 className="font-semibold text-green-600">
              Account restored
            </h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <p className="mt-3 text-xs text-gray-400">
              Redirecting…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 text-3xl">❌</div>
            <h2 className="font-semibold text-red-600">
              Restore failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>

            <button
              onClick={() => router.replace("/signin")}
              className="mt-4 rounded bg-gray-900 px-4 py-2 text-white"
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
