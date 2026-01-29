"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SignInForm from "@/components/auth/SignInForm";
import TemplateSignIn from "@/components/auth/TemplateSignIn";

export default function SignInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) return;

    if (user.role === "admin" || user.role === "staff") {
      router.replace("/admin");
      return;
    }

    if (user.role === "user") {
      router.replace("/shop");
    }
  }, [user, loading, router]);



  return <TemplateSignIn />;
}
