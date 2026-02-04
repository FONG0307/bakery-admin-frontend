export function ShopSkeleton() {
  return (
    <div className="flex">
      {/* ===== SIDEBAR SKELETON ===== */}
      <aside className="w-64 bg-[#9AE5FF] border-r-2 border-black p-6 space-y-4">
        <div className="h-8 w-32 bg-black/20 animate-pulse" />

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-24 bg-black/20 animate-pulse" />
        ))}
      </aside>

      {/* ===== GRID SKELETON ===== */}
      <main className="flex-1 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l-2 border-t-2 border-black">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="border-r-2 border-b-2 border-black p-4 space-y-4"
            >
              <div className="aspect-square bg-black/10 animate-pulse" />
              <div className="h-5 w-3/4 bg-black/20 animate-pulse" />
              <div className="h-4 w-full bg-black/10 animate-pulse" />
              <div className="h-10 w-full bg-black/20 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
