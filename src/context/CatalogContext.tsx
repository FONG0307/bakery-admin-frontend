// src/context/CatalogContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

type CatalogContextType = {
  categories: Category[];
  subcategories: Subcategory[];
  loading: boolean;
};

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/categories`, {
            cache: "no-store",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/subcategories`, {
            cache: "no-store",
          }),
        ]);

        if (!catRes.ok || !subRes.ok) {
          throw new Error("Failed to load catalog");
        }

        const catJson = await catRes.json();
        const subJson = await subRes.json();

        if (!mounted) return;

        setCategories(
          Array.isArray(catJson)
            ? catJson
            : Array.isArray(catJson?.categories)
            ? catJson.categories
            : []
        );

        setSubcategories(
          Array.isArray(subJson)
            ? subJson
            : Array.isArray(subJson?.subcategories)
            ? subJson.subcategories
            : []
        );

        setLoading(false);
      } catch (e) {
        console.error("Catalog load failed", e);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <CatalogContext.Provider
      value={{ categories, subcategories, loading }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog must be used inside CatalogProvider");
  }
  return ctx;
}
