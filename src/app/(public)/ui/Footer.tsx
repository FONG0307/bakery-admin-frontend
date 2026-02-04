export default function Footer() {
  return (
    <footer className="bg-yellow-800 px-10 py-4 border-4 border-black">
      <nav className="flex flex-col items-center justify-center gap-2 sm:hidden">
        <a className="font-base font-bold" href="#">FAQ</a>
        <a className="font-base font-bold" href="#">Terms & Conditions</a>
        <a className="font-base font-bold" href="#">Customer Service</a>
        <small className="font-base font-bold text-center">{`© ${new Date().getFullYear()} Bakery~. All rights reserved`}</small>
      </nav>

      <nav className="hidden sm:flex justify-between items-center ">
        <div className="flex justify-between items-center gap-4">
          <a className="font-xl font-bold hover:underline" href="#">FAQ</a>
          <a className="font-xl font-bold hover:underline" href="#">Terms & Conditions</a>
          <a className="font-xl font-bold hover:underline" href="#">Customer Service</a>
          <a className="font-xl font-bold hover:underline" href="https://dribbble.com/shots/19601688-Cupcaked-Neobrutalism-Web-Design-for-a-Bakery" target="_blank" rel="noreferrer">Designed By Gabriella Gading</a>
        </div>
        <small className="font-xl font-bold hover:underline">{`© ${new Date().getFullYear()} Bakery~. All rights reserved`}</small>
      </nav>
    </footer>
  )
}
