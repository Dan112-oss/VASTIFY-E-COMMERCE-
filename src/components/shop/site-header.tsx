"use client";

import { FlexNavbar } from "@/components/ui/flex-navbar";
import { selectCount, useCartStore } from "@/store/cart";

export function SiteHeader() {
  const count = useCartStore(selectCount);

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <FlexNavbar
        brandName="Vastify"
        tagline="Everything you love. One place."
        launchText="New"
        navLinks={[
          { label: "Shop", href: "/products" },
          { label: "Categories", href: "/category" },
          { label: "Deals", href: "/deals" },
          { label: "About", href: "/about" },
        ]}
        cartCount={count}
        cartHref="/cart"
      />
    </div>
  );
}
