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

    if (user.role !== "admin" && user.role !== "staff") {
      router.replace("/customer");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return <div className="p-4">Customer Page</div>;
}
