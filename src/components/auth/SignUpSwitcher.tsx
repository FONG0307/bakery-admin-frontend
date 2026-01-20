"use client";

import { useState } from "react";
import SignUpForm from "@/components/auth/SignUpForm";
import TemplateSignUp from "@/components/auth/TemplateSignUp";

export default function SignUpSwitcher() {
  const [adminMode, setAdminMode] = useState(false);

  if (adminMode) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-3">
          <button className="text-sm underline" onClick={() => setAdminMode(false)}>
            Back to simple sign up
          </button>
        </div>
        <SignUpForm />
      </div>
    );
  }

  return <TemplateSignUp onAdminClick={() => setAdminMode(true)} />;
}
