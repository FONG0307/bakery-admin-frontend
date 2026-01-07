"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  useAuth();
  return <SignInForm />;
}
