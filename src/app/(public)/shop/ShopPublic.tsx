"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductsPublic } from "@/lib/product";
import Image from "next/image";
import Link from "next/link";

export default function ShopPublic() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    getProductsPublic()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      const name = (p.item_name || "").toLowerCase();
      const okName = !q || name.includes(q.toLowerCase());
      const okCat = category === "all" || p.category === category;
      return okName && okCat;
    });
  }, [products, q, category]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Shop</h1>
        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="px-3 py-2 border rounded w-64"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No products available. Please sign in to view.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p: any) => (
            <article key={p.id} className="border rounded-xl p-4 bg-white dark:bg-gray-900">
              <div className="h-40 mb-3 overflow-hidden rounded">
                <Image
                  src={p.image_url || "/images/product/bakery-placeholder.png"}
                  alt={p.item_name}
                  width={400}
                  height={300}
                  className="w-full h-40 object-cover"
                />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{p.item_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{p.category}</p>
              {p.today_stock?.remaining != null && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Available today: {p.today_stock.remaining}</p>
              )}
              {p.unit_price != null && (
                <p className="mt-1 font-semibold">{Number(p.unit_price).toLocaleString()} ₫</p>
              )}
              <Link href="/customer/shop" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Add to cart</Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}