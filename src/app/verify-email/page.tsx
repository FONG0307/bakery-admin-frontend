import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading…</p>
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
