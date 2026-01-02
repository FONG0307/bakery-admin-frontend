"use client";

import SignInForm from "@/components/auth/SignInForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then((user) => {
        // nếu đã login
        if (user.role === "admin" || user.role === "super_admin") {
          router.replace("/admin");
        } else {
          // user thường → đá về signin lại
          router.replace("/signin");
        }
      })
      .catch(() => {
        // chưa login → cho ở lại trang signin
      });
  }, []);

  return <SignInForm />;
}
