"use client";

import { useParams } from "next/navigation";
import ShopGrid from "../../components/ShopGrid";

export default function Page() {
  const { category, subcategory } = useParams();

  return (
    <ShopGrid
      category={category as string}
      subcategory={subcategory as string}
    />
  );
}
