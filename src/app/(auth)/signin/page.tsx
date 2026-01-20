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
      router.replace("/customer");
    }
  }, [user, loading, router]);

  if (adminMode) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-3">
          <button
            className="text-sm underline"
            onClick={() => setAdminMode(false)}
          >
            Back to simple login
          </button>
        </div>
        <SignInForm />
      </div>
    );
  }

  return <TemplateSignIn onAdminClick={() => setAdminMode(true)} />;
}
