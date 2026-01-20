"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createStripeCheckout } from "@/lib/order";

export default function CancelContent() {
  const params = useSearchParams();
  const orderIdParam = params.get("order_id");
  const orderId = useMemo(
    () => (orderIdParam ? Number(orderIdParam) : null),
    [orderIdParam]
  );

  const [submitting, setSubmitting] = useState(false);

  async function retry() {
    if (!orderId) return;
    try {
      setSubmitting(true);
      const session = await createStripeCheckout(orderId);
      if (session?.url) {
        window.location.href = session.url;
      } else {
        alert("Failed to create a new payment session");
      }
    } catch (e: any) {
      alert(e?.message || "Retry failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-2">Payment canceled</h1>
      <p className="text-gray-600 mb-4">
        Your payment was canceled or didn't complete.
      </p>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={retry}
          disabled={!orderId || submitting}
        >
          {submitting ? "Starting…" : "Try again"}
        </button>

        <a href="/customer/shop" className="px-4 py-2 rounded border">
          Back to shop
        </a>
      </div>
    </div>
  );
}
