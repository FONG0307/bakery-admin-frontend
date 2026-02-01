"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductsPublic } from "@/lib/product";
import Image from "next/image";
import Link from "next/link";

type LoadState = "loading" | "success" | "error";

export default function ShopPublic() {
  const [state, setState] = useState<LoadState>("loading");
  const [products, setProducts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setState("loading");

        const res = await getProductsPublic();

        if (!mounted) return;

        if (!Array.isArray(res)) {
          throw new Error("INVALID_PRODUCTS");
        }

        // filter + normalize nhẹ
        const valid = res.filter(isValidProduct).map((p: any) => ({
          ...p,
          unit_price:
            p.unit_price != null ? Number(p.unit_price) : null,
        }));

        setProducts(valid);
        setState("success");
      } catch (e) {
        console.error(e);
        if (mounted) setState("error");
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= HELPERS ================= */
  function isValidProduct(p: any) {
    return (
      p &&
      typeof p.id === "number" &&
      typeof p.item_name === "string"
    );
  }

  function isCake(p: any) {
    return p?.category?.toLowerCase() === "cake";
  }

  function shortDesc(text?: string, max = 90) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "…" : text;
  }
  /* =========================================== */

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

  /* ================= SKELETON ================= */
  function ShopSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-4 border-gray-200 bg-white flex flex-col"
          >
            <div className="h-52 bg-gray-200 border-b-4 border-gray-200" />
            <div className="p-4 space-y-3 flex-1">
              <div className="h-5 bg-gray-200 w-3/4" />
              <div className="h-3 bg-gray-200 w-1/4" />
              <div className="h-4 bg-gray-200 w-full" />
              <div className="h-4 bg-gray-200 w-2/3" />
              <div className="h-10 bg-gray-200 mt-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  /* =========================================== */

  return (
    <div className="bg-main-cupcake-background">
      <main className="max-w-7xl mx-auto px-4 py-20 mt-6 bg-Sky_Whisper border-x-8 border-b-8 border-gray-200 pt-32">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 border-b-8 border-gray-200 pb-6">
          <h1 className="text-4xl font-extrabold uppercase tracking-wide">
            Shop
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="px-4 py-3 border-2 border-gray-200 bg-white font-semibold uppercase tracking-wide w-64 focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 bg-white font-semibold uppercase tracking-wide focus:outline-none"
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTENT */}
        {state === "loading" ? (
          <ShopSkeleton />
        ) : state === "error" ? (
          <div className="text-center font-bold uppercase tracking-wide">
            Cannot load products
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center font-bold uppercase tracking-wide">
            No products available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p: any) => {
              const available = p.daily_stock?.available ?? null;

              return (
                <article
                  key={p.id}
                  className="
                    border-4 border-gray-200
                    bg-Lemon_Zest
                    flex flex-col
                    transition
                    hover:-translate-y-1
                  "
                >
                  {/* IMAGE */}
                  <Link href={`/shop/${p.id}`}>
                    <div className="h-52 overflow-hidden border-b-4 border-gray-200 cursor-pointer">
                      <Image
                        src={
                          p.image_url ||
                          "/images/product/bakery-placeholder.png"
                        }
                        alt={p.item_name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </div>
                  </Link>

                  {/* BODY */}
                  <div className="p-4 flex flex-col flex-1">
                    <Link
                      href={`/shop/${p.id}`}
                      className="font-extrabold uppercase tracking-wide text-lg hover:underline"
                    >
                      {p.item_name}
                    </Link>

                    <p className="text-xs font-bold uppercase opacity-70 mt-1">
                      {p.category}
                    </p>

                    {p.description && (
                      <p className="mt-2 text-sm leading-snug text-gray-700">
                        {shortDesc(p.description)}
                      </p>
                    )}

                    {/* STOCK */}
                    {!isCake(p) && available !== null && (
                      <p
                        className={`text-xs font-bold uppercase mt-2 ${
                          available > 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {available > 0
                          ? `Available today: ${available}`
                          : "Out of stock"}
                      </p>
                    )}

                    {/* PRICE */}
                    {p.unit_price != null && (
                      <p className="mt-2 text-lg font-extrabold">
                        {Number(p.unit_price).toLocaleString()} ₫
                      </p>
                    )}

                    {/* CTA */}
                    <Link
                      href={`/shop/${p.id}`}
                      className="
                        mt-auto
                        inline-block
                        text-center
                        border-2 border-gray-200
                        px-4 py-2
                        font-bold uppercase
                        tracking-wide
                        hover:bg-black hover:text-white
                        transition
                      "
                    >
                      {isCake(p) ? "Order now" : "Add to cart"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
