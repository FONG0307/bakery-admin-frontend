"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteOrder, getOrder } from "@/lib/order";

type OrderItem = {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type Order = {
  id: number;
  status: string;
  amount: number;
  ordered_at: string;
  address?: string | null;
  user: { id: number; email: string; first_name?: string; last_name?: string };
  items: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await getOrder(id);
        if (!mounted) return;
        setOrder(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!order) return;
    if (!confirm(`Delete order #${order.id}? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      await deleteOrder(order.id);
      alert("Order deleted");
      router.push("/admin");
    } catch (e: any) {
      alert(e?.message || "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Order"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Summary</h2>
          <div className="space-y-1 text-sm">
            <div><span className="text-gray-500">Status:</span> {order.status}</div>
            <div><span className="text-gray-500">Amount:</span> {order.amount}</div>
            <div><span className="text-gray-500">Ordered at:</span> {new Date(order.ordered_at).toLocaleString()}</div>
            <div><span className="text-gray-500">Address:</span> {order.address || "N/A"}</div>
          </div>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Customer</h2>
          <div className="space-y-1 text-sm">
            <div><span className="text-gray-500">Email:</span> {order.user.email}</div>
            <div><span className="text-gray-500">Name:</span> {[order.user.first_name, order.user.last_name].filter(Boolean).join(" ") || "N/A"}</div>
          </div>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-medium mb-3">Items</h2>
        {order.items?.length ? (
          <div className="overflow-x-auto">
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
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{it.name}</td>
                    <td className="py-2 pr-4">{it.quantity}</td>
                    <td className="py-2 pr-4">{it.unit_price}</td>
                    <td className="py-2 pr-4">{it.subtotal}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="py-2 pr-4 text-right font-medium">Total</td>
                  <td className="py-2 pr-4 font-medium">{order.amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No items</div>
        )}
      </div>
    </div>
  );
}
