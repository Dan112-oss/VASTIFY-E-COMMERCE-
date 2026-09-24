"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";

export function SiteFooter() {
  const pathname = usePathname();

  // The admin panel has its own layout and doesn't need the store footer
  if (pathname.startsWith("/admin")) return null;

  return <Footer />;
}
