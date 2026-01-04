"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && (user.role === "admin" || user.role === "staff")) {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  return <SignInForm />;
}
