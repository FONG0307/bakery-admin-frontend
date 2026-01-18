"use client";

import { useEffect, useMemo, useState } from "react";
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
  const perPage = 10;

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    try {
      const data = await getMyOrders();
      // newest first
      const sorted = data.sort((a: any, b: any) => new Date(b.ordered_at || b.created_at).getTime() - new Date(a.ordered_at || a.created_at).getTime());
      setOrders(sorted);
    } catch (e) {
      console.error(e);
    }
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(orders.length / perPage)), [orders.length]);
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return orders.slice(start, start + perPage);
  }, [orders, page]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Orders</h1>

      <div className="overflow-x-auto border rounded-xl bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((o: any) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="py-3 px-4">#{o.id}</td>
                <td className="py-3 px-4 capitalize">{o.status}</td>
                <td className="py-3 px-4">{Number(o.amount).toLocaleString()} ₫</td>
                <td className="py-3 px-4">{new Date(o.ordered_at || o.created_at).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:underline" onClick={() => setSelectedOrder(o)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <button className="px-3 py-1 border rounded" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[720px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order #{selectedOrder.id}</h3>
              <span className="text-sm capitalize">{selectedOrder.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded p-4">
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Amount:</span> {Number(selectedOrder.amount).toLocaleString()} ₫</div>
                  <div><span className="text-gray-500">Created:</span> {new Date(selectedOrder.ordered_at || selectedOrder.created_at).toLocaleString()}</div>
                  <div><span className="text-gray-500">Address:</span> {selectedOrder.address || "N/A"}</div>
                </div>
              </div>
              <div className="border rounded p-4">
                <h4 className="font-medium mb-2">Payment</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Method:</span> {selectedOrder.payment_method || "N/A"}</div>
                  <div><span className="text-gray-500">Reference:</span> {selectedOrder.payment_ref || "N/A"}</div>
                </div>
              </div>
            </div>

            <div className="border rounded p-4 mt-4">
              <h4 className="font-medium mb-3">Items</h4>
              {selectedOrder.items?.length ? (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Qty</th>
                      <th className="py-2 pr-4">Unit Price</th>
                      <th className="py-2 pr-4">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((it: any) => (
                      <tr key={it.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-3">
                            <Image
                              src={it.image_url || "/images/product/bakery-placeholder.png"}
                              alt={it.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <span>{it.name}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">{it.quantity}</td>
                        <td className="py-2 pr-4">{Number(it.unit_price).toLocaleString()} ₫</td>
                        <td className="py-2 pr-4">{Number(it.subtotal).toLocaleString()} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="py-2 pr-4 text-right font-medium">Total</td>
                      <td className="py-2 pr-4 font-medium">{Number(selectedOrder.amount).toLocaleString()} ₫</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="text-sm text-gray-500">No items</div>
              )}
            </div>

            <div className="mt-3 text-right">
              <button className="px-3 py-2 border rounded" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
