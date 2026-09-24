import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartHydrator } from "@/components/shop/cart-hydrator";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Vastify",
  description: "Shop everything in one place",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="min-h-screen font-sans antialiased">
        <CartHydrator />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
