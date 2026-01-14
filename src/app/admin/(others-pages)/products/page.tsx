"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts,createProduct,updateProduct,deleteProduct } from "@/lib/product";

export default function TestProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  useEffect(() => {
    getProducts().then((res) => setProducts(res || []));
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(products.length / perPage));
  }, [products.length]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return products.slice(start, start + perPage);
  }, [products, page]);

  function nextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function formatPrice(price: any) {
    return Number(price || 0).toLocaleString() + " ₫";
  }

  function formatDate(date: any) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  }

  function statusText(product: any) {
    const a = product?.daily_stock?.available ?? 0;
    if (a <= 0) return "Sold Out";
    if (a < 5) return "Low Stock";
    return "Available";
  }

  function statusClass(product: any) {
    const a = product?.daily_stock?.available ?? 0;
    if (a <= 0) return "bg-red-100 text-red-700";
    if (a < 5) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  }

  function ProductForm({
    initial,
    onClose,
    onSaved,
  }: {
    initial?: any;
    onClose: () => void;
    onSaved: (p: any) => void;
  }) {
    const [itemName, setItemName] = useState(initial?.item_name || "");
    const [category, setCategory] = useState(initial?.category || "");
    const [price, setPrice] = useState(initial?.unit_price || "");
    const [image, setImage] = useState<File | null>(null);

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      const fd = new FormData();
      fd.append("product[item_name]", itemName);
      fd.append("product[category]", category);
      fd.append("product[unit_price]", price);
      if (image) fd.append("image", image);

      const saved = initial
        ? await updateProduct(initial.id, fd)
        : await createProduct(fd);

      onSaved(saved);
      onClose();
    }

    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 w-[400px] space-y-3">
          <h3 className="font-semibold text-lg">
            {initial ? "Edit Product" : "Add Product"}
          </h3>

          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />

          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
              Cancel
            </button>
            <button className="px-3 py-1 bg-brand-500 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }


// =============================================================
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Bakery Products (Today)
          </h3>
          <p className="text-sm text-gray-500">Daily stock & product management</p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
          className="bg-brand-500 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          + Add Product
        </button>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500">
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Stock Today</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginatedProducts.map((product: any) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                {/* PRODUCT */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img src={product.image_url || "../images/product/bakery-placeholder.png"} className="h-12 w-12 rounded-md border object-cover" alt="" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.item_name}</span>
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="px-5 py-4 text-sm text-gray-500">{product.category}</td>

                {/* PRICE */}
                <td className="px-5 py-4 text-sm font-medium">{formatPrice(product.unit_price)}</td>

                {/* STOCK */}
                <td className="px-5 py-4 text-sm">{product.daily_stock?.available ?? 0}</td>

                {/* STATUS */}
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(product)}`}>{statusText(product)}</span>
                </td>

                {/* CREATED */}
                <td className="px-5 py-4 text-sm text-gray-500">{formatDate(product.created_at)}</td>

                {/* ACTION */}
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2 text-sm">
                    <button
                      onClick={() => {
                        setEditing(product);
                        setOpenForm(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this product?")) return;
                        await deleteProduct(product.id);
                        setProducts((prev) => prev.filter((p) => p.id !== product.id));
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openForm && (
        <ProductForm
          initial={editing}
          onClose={() => setOpenForm(false)}
          onSaved={(saved) => {
            setProducts((prev) =>
              editing
                ? prev.map((p) => (p.id === saved.id ? saved : p))
                : [saved, ...prev]
            );
          }}
        />
      )}
      {/* PAGINATION */}
      <div className="flex justify-between px-5 py-4 border-t">
        <span className="text-sm text-gray-500">
          Page {page} / {totalPages}
        </span>

        <div className="flex gap-2">
          <button onClick={prevPage} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={nextPage} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  
  );
}
