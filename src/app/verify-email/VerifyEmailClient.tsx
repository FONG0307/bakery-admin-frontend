"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { setUser, logout } = useAuth();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      router.replace("/signin");
      return;
    }

    // 🔥 logout user cũ (nếu có)
    logout();

    verifyEmail(token)
      .then((res) => {
        setUser(res.user);
        console.log("VERIFY SUCCESS:", res);
        router.replace("/customer");
      })
      .catch((err) => {
        console.error("VERIFY FAILED:", err);
        router.replace("/signin?verify=failed");
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Verifying your account…</p>
    </div>
  );
}
