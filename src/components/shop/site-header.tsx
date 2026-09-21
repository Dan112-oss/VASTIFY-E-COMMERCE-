"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { FlexNavbar } from "@/components/ui/flex-navbar";
import { createClient } from "@/lib/supabase/client";
import { selectCount, useCartStore } from "@/store/cart";

export function SiteHeader() {
  const count = useCartStore(selectCount);
  const pathname = usePathname();
  const [signedIn, setSignedIn] = React.useState(false);

  // Re-check the login state on every page change and on login/logout
  React.useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth
        .getSession()
        .then(({ data }) => setSignedIn(Boolean(data.session)));

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSignedIn(Boolean(session));
      });

      return () => subscription.unsubscribe();
    } catch {
      // Supabase not configured; show the logged-out state
    }
  }, [pathname]);

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <FlexNavbar
        brandName="Vastify"
        tagline="Everything you love. One place."
        launchText="New"
        navLinks={[
          { label: "Shop", href: "/products" },
          { label: "Fashion", href: "/products?category=fashion" },
          { label: "Electronics", href: "/products?category=electronics" },
          { label: "Home & Living", href: "/products?category=home-living" },
        ]}
        cartCount={count}
        cartHref="/cart"
        accountHref={signedIn ? "/account" : "/login"}
        accountActive={signedIn}
      />
    </div>
  );
}
