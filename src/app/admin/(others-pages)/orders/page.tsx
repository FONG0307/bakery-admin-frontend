"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  addOrderItem,
  createOrder,
  updateOrderStatus,
  getOrdersPaginated,
} from "@/lib/order";
import { useAuth } from "@/context/AuthContext";
import type { CartItem } from "@/context/AuthContext";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";

/* ================= TYPES ================= */
interface OrderDisplay {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  image: string;
  status: "Delivered" | "Pending" | "Failed";
  userName: string;
  orderNumber: number;
  createdAt: string;
}

export default function RecentOrders() {
  const { products, fetchData } = useAuth();

  const {
    data: orders,
    meta,
    page,
    setPage,
    reload,
  } = usePaginatedFetch(getOrdersPaginated, { debounce: 300 });

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("pending");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [dayPart, setDayPart] = useState("morning");
  const [showFilter, setShowFilter] = useState(false);

  /* ================= MAP ORDERS ================= */
  const tableData: OrderDisplay[] = useMemo(() => {
    return orders.map((order: any, index: number) => {
      const userName = order.user
        ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim() ||
          order.user.email
        : "Unknown";

      const totalPrice =
        order.items?.reduce(
          (sum: number, item: any) => sum + Number(item.subtotal || 0),
          0
        ) || 0;

      return {
        id: order.id,
        name: `${userName} - Order ${order.id}`,
        variants: `${order.items?.length || 0} Items`,
        category: "Bakery",
        price: `${totalPrice.toLocaleString()} ₫`,
        image: "",
        status:
          order.status === "paid"
            ? "Delivered"
            : order.status === "pending"
            ? "Pending"
            : "Failed",
        userName,
        orderNumber: index + 1,
        createdAt: order.ordered_at || order.created_at,
      };
    });
  }, [orders]);

  const filteredData = useMemo(() => {
    if (!selectedStatuses.length) return tableData;
    return tableData.filter((i) => selectedStatuses.includes(i.status));
  }, [tableData, selectedStatuses]);

  /* ================= FILTER PRODUCTS (STEP 1) ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) =>
      p.item_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* ================= CART ================= */
  function toggleProduct(p: any) {
    setCart((prev) =>
      prev.find((i) => i.product_id === p.id)
        ? prev.filter((i) => i.product_id !== p.id)
        : [
            ...prev,
            {
              product_id: p.id,
              name: p.item_name,
              price: Number(p.unit_price),
              quantity: 1,
            },
          ]
    );
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) =>
      prev.map((i) =>
        i.product_id === id
          ? { ...i, quantity: Math.max(0, i.quantity + delta) }
          : i
      ).filter((i) => i.quantity > 0)
    );
  }

  /* ================= HANDLERS ================= */
  function handleFilterChange(status: string, checked: boolean) {
    setSelectedStatuses((prev) =>
      checked ? [...prev, status] : prev.filter((s) => s !== status)
    );
    setPage(1);
  }

  function handleSeeAll() {
    setSelectedStatuses([]);
    setPage(1);
  }

  async function handleCreateOrder() {
    const order = await createOrder({
      payment_method: paymentMethod,
      day_part: dayPart,
    });

    for (const item of cart) {
      await addOrderItem(order.id, item.product_id, item.quantity);
    }

    setOpenCreate(false);
    setStep(1);
    setCart([]);
    reload();
    fetchData();
  }



  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-10 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Bakery Orders
          </h3>
          <p className="text-sm text-gray-500">Order management & tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={() => setOpenCreate(true)}
          >
            Create Order
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={() => setShowFilter(true)}
          >
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={handleSeeAll}
          >
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Orders
              </TableCell>
              <TableCell isHeader className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Category
              </TableCell>
              <TableCell isHeader className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
              <TableCell isHeader className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">                Created At
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {product.name}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {product.variants}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.price}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.category}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.status === "Pending" ? (
                    <button
                      onClick={() => {
                        const order = orders.find(o => o.id === product.id);
                        setSelectedOrderForStatus(order);
                        setNewStatus(order.status === "paid" ? "paid" : order.status === "pending" ? "pending" : "failed");
                      }}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800"
                    >
                      {product.status}
                    </button>
                  ) : (
                    <Badge
                      size="sm"
                      color={
                        product.status === "Delivered"
                          ? "success"
                          : "error"
                      }
                    >
                      {product.status}
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(product.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <button
                    onClick={() => setSelectedOrder(orders.find(o => o.id === product.id))}
                    className="text-blue-600 hover:underline"
                  >
                    View Items
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between py-4 border-t">
        <span className="text-sm text-gray-500">
          Page {meta?.page} / {meta?.total_pages}
        </span>

        <div className="flex gap-2">
          <button 
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          <button 
            disabled={page >= meta?.total_pages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>
      
      {openCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl w-[600px] p-5 space-y-4">
            <h3 className="text-lg font-semibold">
              {step === 1 ? "Select Products" : "Order Information"}
            </h3>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Search product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <ul className="divide-y max-h-[240px] overflow-auto">
                  {filteredData.map((p: any) => {
                    const selected = cart.find(
                      (i) => i.product_id === p.id
                    );
                    const qty = selected?.quantity || 0;
                    return (
                      <li
                        key={p.id}
                        className="flex justify-between items-center py-2"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={p.image_url || "/images/product/bakery-placeholder.png"}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                            alt={p.item_name}
                          />
                          <span>{p.item_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(p.id, -1)}
                            disabled={qty <= 0}
                            className="px-2 py-1 border rounded disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="w-8 text-center">{qty}</span>
                          <button
                            onClick={() => updateQty(p.id, 1)}
                            className="px-2 py-1 border rounded"
                          >
                            +
                          </button>
                          <button
                            onClick={() => toggleProduct(p)}
                            className={`px-3 py-1 rounded ${
                              qty > 0
                                ? "bg-green-500 text-white"
                                : "border"
                            }`}
                          >
                            ✓
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex justify-end gap-2 pt-3">
                  <button onClick={() => setOpenCreate(false)}>Cancel</button>
                  <button
                    disabled={!cart.length}
                    onClick={() => setStep(2)}
                    className="bg-brand-500 text-white px-4 py-2 rounded"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                </select>

                <select
                  className="w-full border rounded px-3 py-2"
                  value={dayPart}
                  onChange={(e) => setDayPart(e.target.value)}
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>

                <div className="flex justify-end gap-2 pt-3">
                  <button onClick={() => setStep(1)}>Back</button>
                  <button
                    onClick={handleCreateOrder}
                    className="bg-brand-500 text-white px-4 py-2 rounded"
                  >
                    Create Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-[800px] max-h-[85vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xl">Order #{selectedOrder.id}</h3>
              <Badge
                size="sm"
                color={
                  selectedOrder.status === "paid"
                    ? "success"
                    : selectedOrder.status === "pending"
                    ? "warning"
                    : "error"
                }
              >
                {selectedOrder.status}
              </Badge>
            </div>

            {/* Summary and Customer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Amount:</span> {Number(selectedOrder.amount).toLocaleString()} ₫</div>
                  <div><span className="text-gray-500">Ordered at:</span> {new Date(selectedOrder.ordered_at || selectedOrder.created_at).toLocaleString()}</div>
                  <div><span className="text-gray-500">Address:</span> {selectedOrder.address || "N/A"}</div>
                  <div><span className="text-gray-500">Payment method:</span> {selectedOrder.payment_method || "N/A"}</div>
                  <div><span className="text-gray-500">Payment ref:</span> {selectedOrder.payment_ref || "N/A"}</div>
                </div>
              </div>

              <div className="border rounded p-4">
                <h4 className="font-medium mb-2">Customer</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Email:</span> {selectedOrder.user?.email}</div>
                  <div><span className="text-gray-500">Name:</span> {[
                    selectedOrder.user?.first_name,
                    selectedOrder.user?.last_name,
                  ].filter(Boolean).join(" ") || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border rounded p-4">
              <h4 className="font-medium mb-3">Items</h4>
              {selectedOrder.items?.length ? (
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
                      {selectedOrder.items.map((item: any) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-3">
                              <Image
                                width={40}
                                height={40}
                                src={item.image_url || "/images/product/bakery-placeholder.png"}
                                className="h-10 w-10 rounded object-cover"
                                alt={item.name}
                              />
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4">{item.quantity}</td>
                          <td className="py-2 pr-4">{Number(item.unit_price).toLocaleString()} ₫</td>
                          <td className="py-2 pr-4">{Number(item.subtotal).toLocaleString()} ₫</td>
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
                </div>
              ) : (
                <div className="text-sm text-gray-500">No items</div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setSelectedOrder(null)} className="px-3 py-2 border rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrderForStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[400px] space-y-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white text-center">
              Change Order Status
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setSelectedOrderForStatus(null)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await updateOrderStatus(selectedOrderForStatus.id, newStatus);
                    setSelectedOrderForStatus(null);
                    reload();
                    fetchData();
                  } catch (error) {
                    console.error("Failed to update status", error);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[400px] space-y-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white text-center">
              Filter Orders
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes("Pending")}
                  onChange={(e) => handleFilterChange("Pending", e.target.checked)}
                  className="mr-2"
                />
                Pending
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes("Delivered")}
                  onChange={(e) => handleFilterChange("Delivered", e.target.checked)}
                  className="mr-2"
                />
                Delivered
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes("Failed")}
                  onChange={(e) => handleFilterChange("Failed", e.target.checked)}
                  className="mr-2"
                />
                Failed
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowFilter(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
