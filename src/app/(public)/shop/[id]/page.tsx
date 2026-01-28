"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductPublic } from "@/lib/product";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    if (!id) return;

    getProductPublic(Number(id))
      .then(setProduct)
      .catch(() => router.replace("/shop"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !product) return null;

  const isCake = product.category?.toLowerCase() === "cake";
  const available = product.daily_stock?.available ?? 0;

  return (
    <div className="bg-main-cupcake-background">
      <main className="max-w-7xl mx-auto px-4 py-20 mt-6 bg-Sky_Whisper border-x-8 border-b-8 border-gray-200 pt-24">
        {/* PRODUCT */}

          {/* INFO */}
          <div className="bg-Lemon_Zest border-4 border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* IMAGE – SEPARATE BOX */}
              <div className="bg-white border-4 border-gray-300 p-3">
                <div className="relative w-[260px] h-[260px] mx-auto">
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
                <h1 className="text-6xl font-extrabold uppercase tracking-wide">
                  {product.item_name}
                </h1>

                <p className="text-xs font-bold uppercase opacity-70">
                  {product.category}
                </p>

                <p className="text-xl font-extrabold">
                  {Number(product.unit_price).toLocaleString()} ₫
                </p>

                {product.description && (
                  <p className="text-base leading-relaxed text-gray-700">
                    {product.description}
                  </p>
                )}

                {/* CAKE */}
                {isCake && (
                  <>
                    <div>
                      <p className="font-bold uppercase text-sm mb-2">Choose size</p>
                      <div className="grid grid-cols-2 gap-3">
                        {product.sizes?.map((s: any) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSize(s)}
                            className={`border-2 px-3 py-2 font-bold text-sm ${
                              selectedSize?.id === s.id
                                ? "border-black bg-black text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {s.name}
                            <br />
                            {Number(s.price).toLocaleString()} ₫
                          </button>
                        ))}
                      </div>
                    </div>

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

                    <button
                      disabled={!selectedSize || !deliveryDate}
                      className="mt-3 border-2 border-black px-6 py-3 font-bold uppercase disabled:opacity-40"
                    >
                      Order cake
                    </button>
                  </>
                )}

                {/* NORMAL PRODUCT */}
                {!isCake && (
                  <>
                    <p className="text-sm font-bold uppercase">
                      Available today:{" "}
                      <span
                        className={available > 0 ? "text-green-700" : "text-red-600"}
                      >
                        {available}
                      </span>
                    </p>

                    <button
                      disabled={available <= 0}
                      className="mt-3 border-2 border-black px-6 py-3 font-bold uppercase disabled:opacity-40"
                    >
                      Add to cart
                    </button>
                  </>
                )}

                <Link
                  href="/shop"
                  className="mt-2 inline-block border-2 border-gray-400 px-4 py-2 font-bold uppercase text-sm w-fit"
                >
                  ← Back to shop
                </Link>
              </div>
            </div>
          </div>


        {/* REVIEWS (PLACEHOLDER) */}
        <section className="mt-14 border-t-4 border-gray-200 pt-10">
          <h2 className="text-2xl font-extrabold uppercase mb-4">
            Customer Reviews
          </h2>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-4">
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="text-yellow-500 text-xl">
                ★
              </span>
            ))}
            <span className="text-sm font-bold opacity-60">
              (No reviews yet)
            </span>
          </div>

          {/* Empty state */}
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
