import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

const outfit = Outfit({
  subsets: ["latin"],
});
console.log("API URL =", process.env.NEXT_PUBLIC_API_URL);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
         <AuthProvider> 
          <ThemeProvider>
            <ToastProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
