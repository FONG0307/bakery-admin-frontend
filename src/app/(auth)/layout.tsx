import Header from "@/app/(public)/ui/Header";
import Footer from "@/app/(public)/ui/Footer";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <Header />
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full relative lg:grid items-center hidden overflow-hidden">
            {/* Background image (light & dark) */}
            <div className="absolute inset-0">
              <Image
                src="/images/auth/bakery-background.png"
                alt="Auth Background"
                fill
                priority
                className="object-cover object-center"
              />
              <Image
                src="/images/auth/bakery-background.png"
                alt="Auth Background Dark"
                fill
                priority
                className="object-cover object-center "
              />
              {/* Overlay tint to control brand tone */}
              <div className="absolute inset-0 bg-brand-950/60 dark:bg-black/40" />
            </div>

            <div className="relative items-center justify-center  flex z-10">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/signin" className="block mb-4">
                  {/* <Image
                    width={231}
                    height={48}
                    src="/images/logo/auth-logo.svg"
                    alt="Logo"
                  /> */}
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Fresh and Reliable Bakery Admin Dashboard Template
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          </div>
        </div>
      <Footer />
    </div>
  );
}