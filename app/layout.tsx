import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { getNavigation } from "@/lib/api/products";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Holier",
  description: "Holier E-commerce",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { categories, hasSale } = await getNavigation();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar categories={categories} hasSale={hasSale} />

              {children}

              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <ToastContainer position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
