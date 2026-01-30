//src/app/admin/layout.tsx
"use client";

import { useSidebar } from "@/context/SidebarContext";
import React from "react";
import Header from "@/app/(public)/ui/Header";



export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-300 `}>
      <Header />
      <main className="flex-1 mt-8">
        {children}
      </main>
    </div>
  );
}
