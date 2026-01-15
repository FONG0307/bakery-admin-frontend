"use client";

import { useEffect, useMemo, useState } from "react";
import { createProduct,updateProduct,deleteProduct } from "@/lib/product";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";

export default function TestProductsPage() {
  const { combinedProducts, fetchData } = useAuth();
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return combinedProducts.slice(start, start + perPage);
  }, [combinedProducts, page]);

  const filteredData = useMemo(() => {
    if (selectedStatuses.length === 0) return combinedProducts;
    return combinedProducts.filter(product => {
      const status = statusText(product);
      return selectedStatuses.includes(status);
    });
  }, [combinedProducts, selectedStatuses]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredData.length / perPage));
  }, [filteredData.length]);

  const paginatedFilteredProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, page]);

  function nextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function handleFilterChange(status: string, checked: boolean) {
    setSelectedStatuses(prev =>
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
    setPage(1); // reset page
  }

  function handleSeeAll() {
    setSelectedStatuses([]);
    setPage(1);
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[450px] space-y-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white text-center">
            {initial ? "Edit Product" : "Add Product"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
            <input
              type="number"
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {initial ? "Update" : "Add"} Product
            </button>
          </div>
        </form>
      </div>
    );
  }


// =============================================================
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-10 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Bakery Products (Today)
          </h3>
          <p className="text-sm text-gray-500">Daily stock & product management</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            + Add Product
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

      {/* TABLE */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Product
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Category
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Stock Today
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Created
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"> </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedFilteredProducts.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image
                        width={50}
                        height={50}
                        src={product.image_url || "/images/product/bakery-placeholder.png"}
                        className="h-[50px] w-[50px]"
                        alt={product.item_name}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {product.item_name}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.category}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatPrice(product.unit_price)}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.daily_stock?.available ?? 0}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      statusText(product) === "Sold Out"
                        ? "error"
                        : statusText(product) === "Low Stock"
                        ? "warning"
                        : "success"
                    }
                  >
                    {statusText(product)}
                  </Badge>
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatDate(product.created_at)}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
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
                        fetchData();
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {openForm && (
        <ProductForm
          initial={editing}
          onClose={() => setOpenForm(false)}
          onSaved={(saved) => {
            fetchData();
          }}
        />
      )}
      {/* PAGINATION */}
      <div className="flex justify-between py-4 border-t">
        <span className="text-sm text-gray-500">
          Page {page} / {totalPages}
        </span>

        <div className="flex gap-2">
          <button onClick={prevPage} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={nextPage} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
      
      {showFilter && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-[400px] p-5 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Products</h3>
            <div className="space-y-3">
              {["Available", "Low Stock", "Sold Out"].map((status) => (
                <label key={status} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={(e) => handleFilterChange(status, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{status}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowFilter(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  
  );
}
