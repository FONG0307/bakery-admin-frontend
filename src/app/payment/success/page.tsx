"use client";

import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[50vh] bg-white">
          <div className="border-4 border-black bg-[#FF95E9] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">
              Loading Payment...
            </h2>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}