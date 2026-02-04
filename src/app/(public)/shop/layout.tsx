import { ShopSidebar } from "./components/ShopSidebar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FF90E8] mt-4 border-4 border-black">
      {/* SIDEBAR */}
      <ShopSidebar />

      {/* CONTENT */}
      <main className="flex-1 bg-white">
        {children}
      </main>
    </div>
  );
}
