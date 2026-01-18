"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/signin");
      return;
    }

    // Redirect customers to shop by default
    if (user.role === "user") router.replace("/customer/shop");
    else router.replace("/admin");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return null;
}
