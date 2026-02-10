"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrder } from "@/lib/order";
import { useCart } from "@/context/CartContext";

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

    const id = orderId;
    let stopped = false;
    let interval: any;
    let count = 0;

    async function poll() {
        try {
        const o = await getOrder(id);
        setOrder(o);

        if (o?.status === "paid") {
            setStatus("paid");
            clearInterval(interval);
            setTimeout(() => {
              router.replace(`/customer/orders`);
            }, 1500);
            return;
        }
        } catch {
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
      <div className="max-w-2xl mx-auto mt-10 p-4">
        <div className="border-4 border-black bg-red-400 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <h1 className="text-3xl font-black uppercase mb-2">Error!</h1>
          <p className="text-lg font-bold border-t-2 border-black pt-4">
            Invalid payment session. Missing order_id.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Container chính mô phỏng style của Shop */}
      <div className="border-4 border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header - Màu hồng giống thanh search/banner */}
        <div className="bg-[#FF95E9] border-b-4 border-black p-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
            Payment Status
          </h1>
        </div>

        {/* Content Body - Dạng Grid */}
        <div className="p-0">
          
          {/* STATE: PROCESSING */}
          {status === "processing" && (
            <div className="bg-[#FBE7A3] p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-6"></div>
              <div className="text-2xl font-black uppercase mb-2">Processing...</div>
              <div className="text-lg font-bold text-center border-t-2 border-black pt-4 w-full max-w-md">
                We're confirming your payment. <br/> Please do not close this window.
              </div>
            </div>
          )}

          {/* STATE: PAID (SUCCESS) */}
          {status === "paid" && (
            <div className="grid grid-cols-1">
              {/* Khu vực thông báo thành công - Màu xanh Cyan */}
              <div className="bg-[#9BF2FF] p-8 border-b-4 border-black text-center">
                <div className="inline-block bg-green-500 border-4 border-black rounded-full p-2 mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div className="text-3xl font-black uppercase">Payment Successful!</div>
                <div className="mt-2 font-bold text-lg">Redirecting to your order...</div>
              </div>

              {/* Chi tiết đơn hàng - Màu trắng hoặc nhạt */}
              <div className="bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm font-bold text-gray-500 uppercase">Order Number</p>
                  <p className="text-2xl font-black">#{order?.id}</p>
                </div>
                
                {order?.amount && (
                  <div className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                     <p className="text-sm font-bold text-gray-500 uppercase text-center">Total Amount</p>
                     <p className="text-xl font-black text-center">
                       {Number(order.amount).toLocaleString()} ₫
                     </p>
                  </div>
                )}
              </div>

              {/* Button Section */}
              <div className="bg-gray-100 p-6 border-t-4 border-black flex justify-center">
                <button
                  className="bg-white text-black border-2 border-black px-8 py-3 text-lg font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  onClick={() => router.push("/customer/orders")}
                >
                  View My Orders
                </button>
              </div>
            </div>
          )}

          {/* STATE: TIMEOUT */}
          {status === "timeout" && (
            <div className="bg-gray-200 p-8 min-h-[300px] flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-2xl font-black uppercase mb-2">Still Processing</div>
              <div className="text-lg font-bold text-center mb-8 max-w-md">
                It’s taking longer than expected. Please refresh this page to check again.
              </div>
              <button
                className="bg-[#FFC09F] text-black border-2 border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                onClick={() => window.location.reload()}
              >
                Refresh Status
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}