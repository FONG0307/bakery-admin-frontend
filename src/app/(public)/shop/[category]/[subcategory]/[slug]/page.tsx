"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getProductPublicBySlug } from "@/lib/product";
import { addToCart } from "@/lib/cart";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

/* ================= ICONS ================= */
const ArrowLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);
const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);
const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

type LoadState = "loading" | "success" | "error";

export default function ProductDetailPage() {
  const { category, subcategory, slug } = useParams<{
    category: string;
    subcategory: string;
    slug: string;
  }>();

  const router = useRouter();
  const [state, setState] = useState<LoadState>("loading");

  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState("");

  const { user } = useAuth();
  const { setCart } = useCart();
  const { showSuccess, showError } = useToast();

  /* ================= LOAD BY SLUG ================= */
  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    async function load() {
      try {
        setState("loading");
        const res = await getProductPublicBySlug(slug);
        if (!mounted) return;

        setProduct(res);
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
  }, [slug]);

  useEffect(() => {
    if (state === "error") {
      router.replace("/shop");
    }
  }, [state, router]);

  async function handleAddToCart() {
    if (!user) {
      showError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
      router.push("/signin");
      return;
    }

    try {
      const cart = await addToCart({
        product_id: product.id,
        quantity,
        size: selectedSize?.name ?? null,
      });

      setCart(cart);
      showSuccess("Đã thêm sản phẩm vào giỏ hàng");
    } catch {
      showError("Không thể thêm vào giỏ hàng");
    }
  }

  /* ================= SKELETON ================= */
  if (state === "loading") {
    return (
      <div className="bg-[#FF90E8] min-h-screen p-8 flex items-center justify-center">
        <div className="w-full max-w-6xl bg-white border-4 border-black h-[500px] animate-pulse" />
      </div>
    );
  }

  if (state !== "success") return null;

  const isCake = product.category?.slug === "cake";
  const available = product.daily_stock?.available ?? 0;

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="bg-[#FF90E8] min-h-screen py-10 px-4 md:px-8 text-black">
      <div className="max-w-7xl mx-auto mb-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-white border-2 border-black px-4 py-2 font-black uppercase hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft /> Back to Shop
        </Link>
      </div>

<main className="max-w-7xl mx-auto">
        {/* PRODUCT CARD CONTAINER */}
        <div className="bg-[#FDE68A] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-[45%_55%]">

          {/* LEFT: IMAGE SECTION */}
          <div className="bg-white border-b-4 lg:border-b-0 lg:border-r-4 border-black p-8 flex items-center justify-center relative overflow-hidden group">
            {/* Background Pattern trang trí */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            
            <div className="relative w-full aspect-square max-w-[500px] border-4 border-black bg-white shadow-[8px_8px_0px_0px_#9AE5FF] transition-transform duration-500 group-hover:shadow-[12px_12px_0px_0px_#FFAB91]">
              <Image
                src={product.image_url || "/images/product/bakery-placeholder.png"}
                alt={product.item_name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                priority
              />
               {/* Label Category */}
 
            </div>
          </div>

          {/* RIGHT: INFO SECTION */}
          <div className="p-6 md:p-10 flex flex-col h-full relative">
            
            {/* Header Info */}
            <div className="mb-6 border-b-4 border-black/10 pb-6">
                <h1 className="text-4xl md:text-6xl font-black uppercase leading-none mb-4 drop-shadow-sm">
                    {product.item_name}
                </h1>
                
                <div className="flex items-center gap-4 mb-4">
                     <p className="text-3xl font-black bg-[#9AE5FF] inline-block px-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        {Number(product.unit_price).toLocaleString()} ₫
                     </p>
                     
                     {/* Giả lập rating */}
                     <div className="flex gap-1 text-black">
                        {[1,2,3,4,5].map(i => <StarIcon key={i}/>)}
                        <span className="text-sm font-bold opacity-60 ml-1">(New)</span>
                     </div>
                </div>

                {product.description && (
                    <p className="text-base font-medium leading-relaxed opacity-90">
                        {product.description}
                    </p>
                )}
            </div>

            {/* ACTION AREA */}
            <div className="mt-auto space-y-6">
                
                {/* 1. CAKE SPECIFIC OPTIONS */}
                {isCake && (
                    <div className="space-y-6 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                        {/* Size Selection */}
                        <div>
                            <p className="font-black uppercase text-sm mb-3">Select Size:</p>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes?.map((s: any) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedSize(s)}
                                    className={`
                                        flex-1 min-w-[100px] border-4 border-black px-3 py-2 font-bold text-sm uppercase transition-all
                                        ${selectedSize?.id === s.id 
                                            ? "bg-black text-white shadow-[4px_4px_0px_0px_#FFAB91] translate-x-[2px] translate-y-[2px]" 
                                            : "bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"}
                                    `}
                                >
                                    {s.name}
                                    <div className="text-xs opacity-80 mt-1">{Number(s.price).toLocaleString()} ₫</div>
                                </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div>
                             <p className="font-black uppercase text-sm mb-3">Delivery Date:</p>
                             <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="w-full border-4 border-black p-3 font-bold bg-[#FFAB91] focus:bg-[#ff9a7a] outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                             />
                        </div>
                    </div>
                )}

                {/* 2. NON-CAKE OPTIONS (Stock & Quantity) */}
                {!isCake && (
                     <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                         <div className="flex justify-between items-center mb-3">
                             <p className="font-black uppercase text-sm">Quantity:</p>
                             <p className={`font-bold uppercase text-xs border-2 border-black px-2 py-1 ${available > 0 ? "bg-[#BAFCA2]" : "bg-red-400"}`}>
                                {available > 0 ? `${available} Available` : "Sold Out"}
                             </p>
                         </div>

                        <div className="flex items-center gap-0">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="w-14 h-14 bg-[#FFAB91] border-4 border-black font-black text-2xl hover:bg-[#ff9676] active:bg-black active:text-white transition-colors"
                            >
                                −
                            </button>
                            <div className="h-14 flex-1 border-y-4 border-black flex items-center justify-center font-black text-2xl bg-gray-50">
                                {quantity}
                            </div>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                disabled={quantity >= available}
                                className="w-14 h-14 bg-[#9AE5FF] border-4 border-black font-black text-2xl hover:bg-[#7ad3ff] active:bg-black active:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                +
                            </button>
                        </div>
                     </div>
                )}

                {/* 3. MAIN BUTTON */}
                <button
                    onClick={handleAddToCart}
                    disabled={isCake ? (!selectedSize || !deliveryDate) : available <= 0}
                    className="
                        w-full py-5 px-6 
                        bg-black text-white 
                        border-4 border-black 
                        font-black uppercase text-xl tracking-widest
                        shadow-[8px_8px_0px_0px_#fff] 
                        hover:shadow-[12px_12px_0px_0px_#fff] hover:-translate-y-1 hover:bg-[#333]
                        active:translate-y-0 active:shadow-[4px_4px_0px_0px_#fff]
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                        transition-all
                        flex items-center justify-center gap-3
                    "
                >
                    {available <= 0 && !isCake ? "Out of Stock" : (isCake ? "Order Custom Cake" : "Add to Cart")}
                    {available > 0 && <CartIcon />}
                </button>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <section className="mt-16">
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
               <span className="bg-[#FFAB91] px-2 border-2 border-black">Reviews</span>
               <span className="text-lg font-bold opacity-50 text-gray-400">What people say</span>
            </h2>

            <div className="border-4 border-dashed border-gray-300 bg-gray-50 p-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                <div className="flex gap-1 text-gray-300 mb-4 text-3xl">
                    ★★★★★
                </div>
              <p className="font-bold text-lg opacity-60 uppercase">
                This product has no reviews yet.
              </p>
              <p className="text-sm opacity-50 mt-1 max-w-md">
                 Be the first one to taste this amazing creation and tell the world about it!
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
