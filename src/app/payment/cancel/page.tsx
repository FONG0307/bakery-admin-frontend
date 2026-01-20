"use client";

import { Suspense } from "react";
import CancelContent from "./CancelContent";

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <CancelContent />
    </Suspense>
  );
}
