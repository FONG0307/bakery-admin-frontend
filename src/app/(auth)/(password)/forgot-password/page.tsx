import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Forgot Password Page TailAdmin Dashboard Template",
  // other metadata
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
