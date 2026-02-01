"use client";

import { useEffect, useState } from "react";
import { getProductsPublic } from "@/lib/product";
import Link from "next/link";

export default function HomePublic() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // ✅ DÙNG API PUBLIC – KHÔNG AUTH
        const res = await getProductsPublic();

        if (!mounted) return;
        if (!Array.isArray(res)) return;

        // ✅ LẤY 4 SẢN PHẨM – ƯU TIÊN KHÁC CATEGORY
        const picked: any[] = [];
        const usedCategories = new Set<string>();

        // vòng 1: ưu tiên category khác nhau
        for (const p of res) {
          if (picked.length >= 4) break;
          const cat = p.category || "unknown";
          if (!usedCategories.has(cat)) {
            picked.push(p);
            usedCategories.add(cat);
          }
        }

        // vòng 2: nếu chưa đủ 4 thì lấy thêm (cho phép trùng)
        if (picked.length < 4) {
          for (const p of res) {
            if (picked.length >= 4) break;
            if (!picked.includes(p)) {
              picked.push(p);
            }
          }
        }

        setProducts(picked);
      } catch (e) {
        console.error("HomePublic load error:", e);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <main className="h-screen grid grid-cols-3 md:grid-cols-6 xl:grid-cols-9 xl:grid-rows-2 xl:h-screen pt-20">
       
        <div className="bg-main-cupcake-one bg-cover bg-no-repeat border-x-8 border-b-8 row-start-1 col-span-1 md:col-span-2 xl:col-span-2"></div>

        <div className="bg-Coral_Sunset w-full h-full col-start-2 col-span-full row-start-1 border-r-8 border-b-8 flex flex-col justify-center gap-2 items-start pl-4 md:col-span-2 xl:col-span-4 xl:gap-3 xl:pl-20">
          <h1 className="text-3xl font-bold uppercase xl:text-5xl">
            100% <br /> <span>Gluten free</span> <br /> Goodness
          </h1>
          <Link className="button-style" href="/shop">Order Now</Link>
        </div>

        <div className="bg-main-cupcake-three md:bg-cover md:bg-center md:bg-no-repeat md:col-span-2 md:border-b-8 md:border-r-8 xl:col-span-3 xl:row-span-2"></div>

        <div className="bg-Pink_Passion col-span-2 border-l-8 border-b-8 flex flex-col justify-center gap-2 items-start pl-4 md:col-span-3 xl:py-10 xl:gap-6">
            <h2 className="text-base font-extrabold xl:text-2xl">Get more than just cakes!</h2>
            <p className="text-base xl:text-xl">
              We pride ourselves on making the best tasting gluten-free cakes
              possible.
            </p>
        </div>

        <div className="bg-main-cupcake-two bg-cover bg-center bg-no-repeat col-start-3 md:col-start-4 md:col-span-3 border-x-8 border-b-8 xl:col-span-2"></div>

        <div className="hidden xl:block xl:col-span-1 bg-Sky_Whisper border-r-8 border-b-8"></div>
      </main>

      <section className="learn-more-section grid grid-cols-4">
        <div className="bg-main-cupcake-four bg-no-repeat bg-cover xl:h-[50rem] col-start-1 col-end-3 border-x-8 border-b-8"></div>
        <section className="bg-Lemon_Zest border-r-8 border-b-8 p-4 col-span-2 xl:flex xl:flex-col xl:items-start xl:justify-center xl:p-20 xl:gap-10">
          <h2 className="text-base font-extrabold mb-4 xl:text-xl">
            Made with love and care, our gluten-free cakes not only look
            great but also taste amazing. Each one is meticulously crafted to
            order in our dedicated kitchen
          </h2>
          <p className="text-sm font-semibold xl:text-xl">
            At Bakery~, we believe in the importance of delivering pure joy
            through delicious, wholesome gluten-free treats. Our cakes are
            crafted with care and passion to ensure they are just as good as
            those made with traditional ingredients. What sets us apart is our
            commitment to using only natural, non-GMO ingredients, and our
            dedication to making sure our cakes are free from additives or
            preservatives.
          </p>
          <Link className="text-sm font-semibold underline xl:text-base" href="/about">Learn More</Link>
        </section>
      </section>

      <section className="flex flex-col xl:grid xl:grid-cols-4 xl:grid-rows-2">
        <div className="bg-Sky_Whisper border-x-8 border-b-8 p-4 xl:col-span-2">
          <h2 className="font-bold">
            Discover the magic of our gluten-free cakes! Our creations are a
            delightful fusion of flavors and artistry, sure to please any
            palate. From zesty lemon to velvety red velvet, there&apos;s a cake
            for every taste preference.
          </h2>
        </div>

        <div className="bg-Pink_Passion border-x-8 border-b-0 p-10 xl:col-span-2 xl:row-start-2">
          <Link className="button-style " href="/shop">Go To Shop</Link>
        </div>


       <section className="hidden xl:grid xl:grid-cols-6 xl:col-span-2 w-full xl:row-span-2">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="xl:col-span-3 xl:h-96 border-r-8 flex items-end bg-cover bg-center"
              style={{
                backgroundImage: `url(${product.image_url})`,
              }}
            >
              <Link
                href={`/shop/${product.id}`}
                className="bg-Lemon_Zest text-center text-xl font-bold border-t-8 w-full py-2 hover:underline"
              >
                {product.item_name}
              </Link>
            </div>
          ))}
        </section>

        <div className="bg-main-cupcake-one"></div>


        <div className="bg-main-cupcake-two"></div>
      </section>
    </>
  );
}