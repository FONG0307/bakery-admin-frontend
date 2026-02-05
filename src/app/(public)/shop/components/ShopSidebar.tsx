"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { useCatalog } from "@/context/CatalogContext";

/* ================= TYPES ================= */
type Category = {
  id: number;
  name: string;
  slug: string;
};

type Subcategory = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
};

export function ShopSidebar() {
  const params = useParams();
  const currentCategory = params?.category as string | undefined;
  const currentSub = params?.subcategory as string | undefined;
  
  const { categories, subcategories, loading } = useCatalog();

  /* ================= BUILD MAP ================= */
  const categoryMap = useMemo(() => {
    const map: Record<number, Subcategory[]> = {};
    if (!Array.isArray(subcategories)) return map;

    subcategories.forEach((sub) => {
      if (!map[sub.category_id]) map[sub.category_id] = [];
      map[sub.category_id].push(sub);
    });

    return map;
  }, [subcategories]);

  /* ================= UI ================= */
  return (
    <aside className="w-64 bg-[#9AE5FF] border-r-4 border-black p-6">
      <h1 className="text-4xl font-black uppercase mb-6">Shop</h1>

      {/* ALL PRODUCTS */}
      <Link
        href="/shop"
        className={`block mb-4 px-2 py-1 font-black uppercase border-2 border-black
          ${
            !currentCategory
              ? "bg-black text-white"
              : "bg-white hover:bg-black hover:text-white"
          }`}
      >
        All Products
      </Link>

      {loading ? (
        <div className="text-sm font-bold opacity-60">Loading...</div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const isActiveCategory = currentCategory === cat.slug;
            const subs = categoryMap[cat.id] || [];

            return (
              <div key={cat.id}>
                {/* CATEGORY */}
                <Link
                  href={`/shop/${cat.slug}`}
                  className={`block px-2 py-1 font-black uppercase border-2 border-black
                    ${
                      isActiveCategory
                        ? "bg-black text-white"
                        : "bg-white hover:bg-black hover:text-white"
                    }`}
                >
                  {cat.name}
                </Link>

                {/* SUBCATEGORIES */}
                {isActiveCategory && subs.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2">
                    {subs.map((sub) => {
                      const isActiveSub = currentSub === sub.slug;

                      return (
                        <Link
                          key={sub.id}
                          href={`/shop/${cat.slug}/${sub.slug}`}
                          className={`block px-2 py-1 text-xs font-black uppercase border-2 border-black
                            ${
                              isActiveSub
                                ? "bg-[#FFAB91] text-black"
                                : "bg-white hover:bg-black hover:text-white"
                            }`}
                        >
                          ↳ {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
