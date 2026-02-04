"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductsPublic } from "@/lib/product";
import Image from "next/image";
import Link from "next/link";

/* ================= TYPES ================= */
type LoadState = "loading" | "success" | "error";

type Product = {
  id: number;
  item_name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  unit_price?: number;
  image_url?: string;
  slug: string; 
};

/* ================= PROPS ================= */
type ShopGridProps = {
  category?: string;
  subcategory?: string;
};

/* ================= ICONS ================= */
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

/* ================= MAIN ================= */
export default function ShopGrid({
  category,
  subcategory,
}: ShopGridProps) {
  /* ===== STATE ===== */
  const [state, setState] = useState<LoadState>("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<any>(null);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setState("loading");

        const res = await getProductsPublic({
          page,
          per_page: perPage,
          category,
          subcategory,
        });

        if (!mounted) return;

        setProducts(res.products);
        setMeta(res.meta);
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
  }, [page, category, subcategory]);

  /* ================= SEARCH FILTER (CLIENT) ================= */
  const filtered = useMemo(() => {
    return products.filter((p) =>
      !q ? true : p.item_name.toLowerCase().includes(q.toLowerCase())
    );
  }, [products, q]);

  /* ================= RESET PAGE ================= */
  useEffect(() => {
    setPage(1);
  }, [q, category, subcategory]);

  /* ================= SKELETON ================= */
  function Skeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-black border-l-4 border-t-4 border-black">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-r-4 border-b-4 border-black bg-white p-4 h-[450px] animate-pulse flex flex-col gap-4">
             <div className="w-full h-1/2 bg-gray-200"></div>
             <div className="w-3/4 h-8 bg-gray-200"></div>
             <div className="w-full h-4 bg-gray-200"></div>
             <div className="w-1/2 h-10 bg-gray-200 mt-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
     

      {/* ===== CONTENT ===== */}
      <main className="flex-1 bg-white flex flex-col">
        {/* SEARCH BAR */}
        <div className="p-6 border-b-4 border-black bg-[#FF90E8] flex items-center justify-center">
            <div className="relative w-full max-w-2xl">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="SEARCH PRODUCTS..."
                    className="w-full border-4 border-black p-4 pl-12 text-xl font-bold uppercase placeholder:text-gray-500 outline-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">
                    <SearchIcon />
                </div>
            </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {state === "loading" ? (
          <Skeleton />
        ) : state === "error" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
             <div className="text-6xl mb-4">⚠️</div>
             <h2 className="text-3xl font-black uppercase mb-2">Oops! Error</h2>
             <p className="font-bold text-red-600 border-2 border-red-600 p-2 bg-red-100 uppercase">
                Unable to load products
             </p>
          </div>
        ) : (
          <>
            {/* GRID DISPLAY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-black border-l-4 border-black">
              {filtered.map((p, index) => {
                 // Logic chọn màu sắc động (Cycle colors based on index)
                 const cardStyles = [
                    { bg: "bg-[#FFFDF5]",  accent: "bg-[#FFAB91]", btn: "bg-[#9AE5FF]" },
                    { bg: "bg-[#FDE68A]",  accent: "bg-[#9AE5FF]", btn: "bg-[#FFAB91]" },
                    { bg: "bg-[#F4A4C9]",  accent: "bg-[#FDE68A]", btn: "bg-white" },
                    { bg: "bg-[#BAFCA2]",  accent: "bg-[#F4A4C9]", btn: "bg-[#FFFDF5]" },
                  ];
                  const style = cardStyles[index % cardStyles.length];

                return (
                  <div
                    key={p.id}
                    className={`group flex flex-col border-r-4 border-b-4 border-black relative transition-all duration-300 ${style.bg}`}
                  >
                    {/* Header: Subcategory */}
                    <div className={`border-b-4 border-black p-2 ${style.accent} font-black text-xs uppercase text-center truncate tracking-widest`}>
                        {p.subcategory || "Special Item"}
                    </div>

                    {/* Image Area with Zoom Effect */}
                    <div className="relative aspect-square border-b-4 border-black overflow-hidden bg-gray-100">
                        {/* Link to detail on Image */}
                        <Link href={`/shop/${p.category}/${p.subcategory}/${p.slug}`} className="block w-full h-full">
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 z-10 transition-colors duration-300" />
                            <Image
                                src={p.image_url || "/images/placeholder.png"}
                                alt={p.item_name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                            />
                        </Link>
                        
                         {/* Quick view button (visual only) */}
                         <button 
                            onClick={(e) => {
                                e.stopPropagation(); 
                                setOrderProduct(p);
                            }}
                            className="absolute bottom-3 right-3 z-20 bg-black text-white p-2 translate-y-16 group-hover:translate-y-0 transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-gray-800"
                            title="Quick View"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                    </div>

                    {/* Info Body */}
                    <div className="p-5 flex flex-col flex-1 justify-between">
                        <Link href={`/shop/${p.category}/${p.subcategory}/${p.slug}`} className="group/text">
                            <h3 className="text-2xl font-black uppercase leading-none mb-2 drop-shadow-sm group-hover/text:underline decoration-4 decoration-black underline-offset-4">
                                {p.item_name}
                            </h3>
                        </Link>
                        <p className="text-sm font-bold opacity-70 line-clamp-2 leading-tight">
                            {p.description}
                        </p>
                    </div>

                    {/* Footer: Price & Button */}
                    <div className="flex border-t-4 border-black bg-white mt-auto">
                      <div className="flex-1 p-3 font-black text-xl flex items-center justify-center border-r-4 border-black">
                        ${p.unit_price}
                      </div>
                      <button
                        onClick={() => setOrderProduct(p)}
                        className={`flex-1 p-3 font-extrabold uppercase ${style.btn} hover:brightness-95 hover:underline transition-all text-sm tracking-wide`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EMPTY STATE */}
            {filtered.length === 0 && (
                <div className="p-20 text-center bg-[#FDE68A] border-b-4 border-black">
                    <h3 className="text-2xl font-black uppercase">No products found</h3>
                    <p className="font-bold opacity-60">Try searching for something else!</p>
                </div>
            )}

            {/* PAGINATION */}
            {meta && meta.total_pages > 1 && (
              <div className="flex justify-center items-center gap-4 py-10 bg-white border-t-4 border-black">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-6 py-3 border-4 border-black font-black uppercase bg-[#9AE5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>

                <div className="font-black text-xl border-4 border-black px-4 py-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
                  {meta.page} / {meta.total_pages}
                </div>

                <button
                  disabled={page === meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-6 py-3 border-4 border-black font-black uppercase bg-[#9AE5FF] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ===== MODAL (QUICK VIEW) ===== */}
      {orderProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#FFFDF5] border-4 border-black p-0 w-full max-w-2xl relative shadow-[16px_16px_0px_0px_#9AE5FF] animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b-4 border-black p-4 bg-[#FFAB91]">
                <h2 className="text-2xl font-black uppercase truncate pr-4">
                {orderProduct.item_name}
                </h2>
                <button
                onClick={() => setOrderProduct(null)}
                className="bg-black text-white p-1 hover:bg-gray-800 transition-colors"
                >
                <CloseIcon />
                </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {/* Image */}
                <div className="aspect-square relative border-4 border-black">
                    <Image 
                        src={orderProduct.image_url || "/images/placeholder.png"} 
                        alt={orderProduct.item_name} 
                        fill 
                        className="object-cover"
                    />
                </div>
                
                {/* Info */}
                <div className="flex flex-col gap-4">
                    <div>
                        <span className="bg-[#BAFCA2] border-2 border-black px-2 py-1 text-xs font-bold uppercase mb-2 inline-block">
                            {orderProduct.category || "General"}
                        </span>
                        <p className="text-sm font-bold mt-2 leading-relaxed">
                            {orderProduct.description || "No description available."}
                        </p>
                    </div>

                    <div className="mt-auto pt-4 border-t-4 border-dashed border-black/20">
                         <div className="text-4xl font-black mb-4">
                            ${orderProduct.unit_price}
                         </div>
                         <Link 
                            href={`/shop/${orderProduct.category}/${orderProduct.subcategory}/${orderProduct.slug}`}
                            className="block w-full text-center py-3 bg-black text-white font-black uppercase hover:bg-[#9AE5FF] hover:text-black border-4 border-black transition-colors"
                         >
                            View Full Details
                         </Link>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}