import PublicShop from "../(public)/shop/ShopPublic";
import Header from "../(public)/ui/Header";
import Footer from "../(public)/ui/Footer";

export default function RootShop() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
				<div className="flex-1"><PublicShop /></div>
			<Footer />
		</div>
	);
}
