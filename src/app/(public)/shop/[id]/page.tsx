"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getProductPublic } from "@/lib/product";
import { addToCart } from "@/lib/cart";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

type LoadState = "loading" | "success" | "error";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [state, setState] = useState<LoadState>("loading");

  /* ================= STATE ================= */
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState("");

  /* ================= CONTEXT ================= */
  const { user } = useAuth();
  const { setCart } = useCart();
  const { showSuccess, showError } = useToast();
  
  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function load() {
      try {
        setState("loading");

        const res = await getProductPublic(Number(id));

        if (!mounted) return;

        if (!isValidProduct(res)) {
          throw new Error("INVALID_PRODUCT");
        }

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
  }, [id]);
  useEffect(() => {
    if (state === "error") {
      router.replace("/shop");
    }
  }, [state, router]);

  function isValidProduct(p: any) {
    return (
      p &&
      typeof p.id === "number" &&
      typeof p.item_name === "string" &&
      p.unit_price !== undefined &&
      !isNaN(Number(p.unit_price))
    );
  }

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
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        showError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
        router.push("/signin");
      } else {
        showError("Không thể thêm vào giỏ hàng");
      }
    }
  }



  function ProductDetailSkeleton() {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="bg-white border-4 p-6 grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8">
          <div className="h-[450px] bg-gray-200" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 w-3/4" />
            <div className="h-4 bg-gray-200 w-1/4" />
            <div className="h-6 bg-gray-200 w-1/3" />
            <div className="h-20 bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return <ProductDetailSkeleton />;
  }


  if (state === "error") return null;
  
  if (state !== "success") return null;
  
  const isCake = product.category?.toLowerCase() === "cake";
  const available = product.daily_stock?.available ?? 0;
  
  return (
    <div className="bg-main-cupcake-background">
      <main className="max-w-7xl mx-auto px-4 py-20 bg-Sky_Whisper border-x-8 border-b-8 border-gray-200">

        {/* PRODUCT CARD */}
        <section className="bg-Lemon_Zest border-4 border-gray-200 p-6">

          {/* IMAGE + INFO */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-start">

            {/* IMAGE */}
            <div className="bg-white border-4 border-gray-300 p-4 flex justify-center">
              <div className="
                relative
                w-[280px] h-[280px]
                sm:w-[360px] sm:h-[360px]
                lg:w-[450px] lg:h-[450px]
              ">
                <Image
                  src={product.image_url || "/images/product/bakery-placeholder.png"}
                  alt={product.item_name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>



            {/* INFO */}
            <div className="flex flex-col gap-4">
              <h1 className="text-7xl font-extrabold uppercase tracking-wide">
                {product.item_name}
              </h1>

              <p className="text-xs font-bold uppercase opacity-70">
                {product.category}
              </p>

              <p className="text-2xl font-extrabold">
                {Number(product.unit_price).toLocaleString()} ₫
              </p>

              {product.description && (
                <p className="text-base leading-relaxed text-gray-700">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* OPTIONS */}
          <div className="mt-8 border-t-4 border-dashed border-gray-300 pt-6">

            {/* CAKE OPTIONS */}
            {isCake && (
              <div className="flex flex-col gap-6">

                {/* SIZE */}
                <div>
                  <p className="font-bold uppercase text-sm mb-2">
                    Choose size
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {product.sizes?.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s)}
                        className={`border-2 px-3 py-2 font-bold text-sm transition
                          ${
                            selectedSize?.id === s.id
                              ? "border-black bg-black text-white"
                              : "border-gray-300 bg-white hover:border-black"
                          }
                        `}
                      >
                        {s.name}
                        <div className="text-xs mt-1">
                          {Number(s.price).toLocaleString()} ₫
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DELIVERY DATE */}
                <div>
                  <label className="font-bold uppercase text-sm block mb-1">
                    Delivery date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="border-2 border-gray-300 px-3 py-2 bg-white font-semibold"
                  />
                </div>
              </div>
            )}

            {/* NORMAL PRODUCT */}
            
          </div>
          <div className="mt-8 border-t-4 border-dashed border-gray-300 pt-6">

            {!isCake && (
              <p className="text-sm font-bold uppercase mt-4">
                Available today:{" "}
                <span className={available > 0 ? "text-green-700" : "text-red-600"}>
                  {available}
                </span>
              </p>
            )}
            {!isCake && (
              <div className="mt-4">
                <p className="font-bold uppercase text-sm mb-2">Quantity</p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="border-2 border-gray-400 px-3 py-1 font-bold"
                  >
                    −
                  </button>

                  <span className="font-bold text-lg">{quantity}</span>

                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="border-2 border-gray-400 px-3 py-1 font-bold"
                    disabled={quantity >= available}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTION */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={
                isCake
                  ? !selectedSize || !deliveryDate
                  : available <= 0
              }
              className="border-2 border-black px-8 py-3 font-bold uppercase disabled:opacity-40"
            >
              {isCake ? "Order now" : "Add to cart"}
            </button>

            <Link
              href="/shop"
              className="border-2 border-gray-400 px-5 py-2 font-bold uppercase text-sm"
            >
              ← Back
            </Link>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="mt-14 border-t-4 border-gray-200 pt-10">
          <h2 className="text-2xl font-extrabold uppercase mb-4">
            Customer Reviews
          </h2>

          <div className="flex items-center gap-2 mb-4">
            {"★★★★★".split("").map((_, i) => (
              <span key={i} className="text-yellow-500 text-xl">★</span>
            ))}
            <span className="text-sm font-bold opacity-60">
              (No reviews yet)
            </span>
          </div>

          <div className="border-2 border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="font-semibold opacity-60">
              This product has no reviews yet.
            </p>
            <p className="text-sm opacity-50 mt-1">
              Reviews will appear here once customers start sharing feedback.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
