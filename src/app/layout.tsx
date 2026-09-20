import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vastify",
  description: "Shop everything in one place",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
