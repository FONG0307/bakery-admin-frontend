"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyOrders } from "@/lib/order";

export default function CustomerOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const perPage = 8;
  const [isLoading, setIsLoading] = useState(false);

  /* ===== AUTH GUARD ===== */
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  /* ===== LOAD ORDERS (BACKEND PAGINATION) ===== */
  useEffect(() => {
    if (!user) return;
    load();
  }, [user, page]);

  async function load() {
    try {
      setIsLoading(true);

      const data = await getMyOrders(page, perPage);

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalPages(data.meta?.total_pages || 1);
    } catch (err) {
      console.error("Load orders failed:", err);
      setOrders([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pt-28 px-4 bg-Sky_Whisper border-x-8 border-b-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">My Orders</h1>

        {/* EMPTY STATE */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            You don’t have any orders yet.
          </div>
        )}

        {/* ORDER LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((o: any) => (
            <div
              key={o.id}
              className="bg-white border-4 rounded-lg p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Order #{o.id}</span>
                <StatusBadge status={o.status} />
              </div>

              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-500">Date:</span>{" "}
                  {new Date(o.ordered_at).toLocaleString()}
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>{" "}
                  <span className="font-semibold">
                    {Number(o.amount).toLocaleString()} ₫
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setSelectedOrder(o)}
                  className="button-style w-full"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4">
            <span className="text-sm">
              Page {page} / {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 border-4 disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>

              <button
                className="px-4 py-2 border-4 disabled:opacity-40"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

/* ===== STATUS BADGE ===== */
function StatusBadge({ status }: { status: string }) {
  const color =
    status === "paid"
      ? "bg-green-100 text-green-700"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-200 text-gray-700";

  return (
    <span className={`px-3 py-1 text-xs font-bold rounded ${color}`}>
      {status}
    </span>
  );
}

/* ===== MODAL ===== */
function OrderDetailModal({
  order,
  onClose,
}: {
  order: any;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white border-4 rounded-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Order #{order.id}</h3>
          <StatusBadge status={order.status} />
        </div>

        <div className="border-4 p-4 mb-4 text-sm space-y-1">
          <div>
            <span className="text-gray-500">Total:</span>{" "}
            {Number(order.amount).toLocaleString()} ₫
          </div>
          <div>
            <span className="text-gray-500">Created:</span>{" "}
            {new Date(order.ordered_at).toLocaleString()}
          </div>
          <div>
            <span className="text-gray-500">Address:</span>{" "}
            {order.address || "N/A"}
          </div>
        </div>

        <div className="border-4 p-4">
          <h4 className="font-bold mb-3">Items</h4>

          {order.items?.length ? (
            <div className="space-y-3">
              {order.items.map((it: any) => (
                <div
                  key={it.id}
                  className="flex justify-between gap-4 border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={
                        it.image_url ||
                        "/images/product/bakery-placeholder.png"
                      }
                      alt={it.name}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                    <div>
                      <div className="font-semibold">{it.name}</div>
                      <div className="text-sm text-gray-500">
                        Qty: {it.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-semibold">
                    {Number(it.subtotal).toLocaleString()} ₫
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No items</div>
          )}
        </div>

        <div className="pt-4 text-right">
          <button className="border-4 px-6 py-2 font-bold" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
