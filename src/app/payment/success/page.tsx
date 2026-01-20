"use client";

import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading payment…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
