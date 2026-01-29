import Header from "./ui/Header";
import Footer from "./ui/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24">{children}</div>
      <Footer />
    </div>
  );
}
