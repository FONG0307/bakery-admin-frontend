"use client";

import { useParams } from "next/navigation";
import ShopGrid from "../components/ShopGrid";

export default function CategoryPage() {
  const { category } = useParams();

  return <ShopGrid category={category as string} />;
}
