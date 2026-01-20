import PublicHome from "./(public)/HomePublic";
import Header from "./(public)/ui/Header";
import Footer from "./(public)/ui/Footer";

export default function RootHome() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<div className="flex-1"><PublicHome /></div>
			<Footer />
		</div>
	);
}
