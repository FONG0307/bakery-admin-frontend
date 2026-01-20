"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrder } from "@/lib/order";

export default function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();

  const orderIdParam = params.get("order_id");
  const orderId = useMemo(
    () => (orderIdParam ? Number(orderIdParam) : null),
    [orderIdParam]
  );

  const [status, setStatus] = useState<
    "processing" | "paid" | "timeout" | "error"
  >("processing");
  const [order, setOrder] = useState<any>(null);

    useEffect(() => {
    if (orderId == null) return;

    const id = orderId; // ✅ id: number
    let stopped = false;
    let interval: any;
    let count = 0;

    async function poll() {
        try {
        const o = await getOrder(id); // ✅ OK
        setOrder(o);

        if (o?.status === "paid") {
            setStatus("paid");
            clearInterval(interval);
            return;
        }
        } catch {
        // ignore
        }

        count += 1;
        if (count >= 30) {
        setStatus("timeout");
        clearInterval(interval);
        }
    }

    poll();
    interval = setInterval(() => {
        if (!stopped) poll();
    }, 2000);

    return () => {
        stopped = true;
        clearInterval(interval);
    };
    }, [orderId]);


  if (!orderId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Invalid payment session</h1>
        <p className="text-gray-600">Missing order_id.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-2">Payment Status</h1>

      {status === "processing" && (
        <div className="rounded border p-4 bg-yellow-50">
          <div className="font-medium">Processing payment…</div>
          <div className="text-sm text-gray-600">
            We're confirming your payment. This may take a few seconds.
          </div>
        </div>
      )}

      {status === "paid" && (
        <div className="rounded border p-4 bg-green-50">
          <div className="font-medium">Payment successful</div>
          <div className="text-sm text-gray-700 mt-1">
            Order #{order?.id} is now paid.
          </div>

          {order?.total && (
            <div className="mt-2 text-sm">
              Total:{" "}
              <span className="font-semibold">
                {Number(order.total).toLocaleString()} ₫
              </span>
            </div>
          )}

          <div className="mt-4">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => router.push("/customer/orders")}
            >
              View my orders
            </button>
          </div>
        </div>
      )}

      {status === "timeout" && (
        <div className="rounded border p-4 bg-gray-50">
          <div className="font-medium">Still processing</div>
          <div className="text-sm text-gray-600">
            It’s taking longer than expected. Please refresh this page or contact support.
          </div>
          <div className="mt-3">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => window.location.reload()}
            >
              Refresh status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
