"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { setUser, logout } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      router.replace("/signin");
      return;
    }

    // 🔥 logout user khác nếu đang login
    logout?.();

    verifyEmail(token)
      .then((res) => {
        setUser(res.user);
        router.replace("/");
      })
      .catch(() => {
        router.replace("/signin");
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Verifying your account…</p>
    </div>
  );
}
