"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

type CategoryMap = Record<string, string[]>;

const CATEGORY_MAP: CategoryMap = {
  cake: ["chocolate", "vanilla", "fruit"],
  bread: ["croissant", "toast"],
  drink: ["coffee", "tea"],
};

export function ShopSidebar() {
  const params = useParams();
  const currentCategory = params?.category as string | undefined;
  const currentSub = params?.subcategory as string | undefined;

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

      {/* CATEGORY LIST */}
      <div className="space-y-4">
        {Object.entries(CATEGORY_MAP).map(([cat, subs]) => {
          const isActiveCategory = currentCategory === cat;

          return (
            <div key={cat}>
              {/* CATEGORY */}
              <Link
                href={`/shop/${cat}`}
                className={`block px-2 py-1 font-black uppercase border-2 border-black
                  ${
                    isActiveCategory
                      ? "bg-black text-white"
                      : "bg-white hover:bg-black hover:text-white"
                  }`}
              >
                {cat}
              </Link>

              {/* SUBCATEGORIES */}
              {isActiveCategory && (
                <div className="ml-4 mt-2 space-y-2">
                  {subs.map((sub) => {
                    const isActiveSub = currentSub === sub;

                    return (
                      <Link
                        key={sub}
                        href={`/shop/${cat}/${sub}`}
                        className={`block px-2 py-1 text-xs font-black uppercase border-2 border-black
                          ${
                            isActiveSub
                              ? "bg-[#FFAB91] text-black"
                              : "bg-white hover:bg-black hover:text-white"
                          }`}
                      >
                        ↳ {sub}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
