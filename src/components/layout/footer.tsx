import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

const SHOP_LINKS = [
  { label: "All products", href: "/products" },
  { label: "Fashion", href: "/products?category=fashion" },
  { label: "Electronics", href: "/products?category=electronics" },
  { label: "Home & Living", href: "/products?category=home-living" },
];

const COMPANY_LINKS = [
  { label: "Sell on Vastify", href: "/sell" },
  { label: "My account", href: "/account" },
  { label: "My orders", href: "/account/orders" },
  { label: "Cart", href: "/cart" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg border border-primary/60 bg-primary/10 font-display text-xl font-semibold text-primary">
                V
              </span>
              <span className="font-display text-lg font-semibold uppercase tracking-[0.2em]">
                Vastify
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Fashion, electronics, home and more, curated in one premium
              store.
            </p>
            <div className="flex gap-3 pt-1">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <span
                  key={i}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Free shipping on every order</li>
              <li>Secure payments with Stripe</li>
              <li>Easy returns within 30 days</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Vastify. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy policy</span>
            <span>Terms of service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
