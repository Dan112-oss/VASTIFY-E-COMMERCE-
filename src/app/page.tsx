import { FlexNavbar } from "@/components/ui/flex-navbar";

export default function Home() {
  return (
    <>
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
          cartCount={2} // demo value; will come from the cart store later
        />
      </div>

      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 pt-28 text-center">
        <h1 className="font-display text-4xl font-semibold">
          Everything you love. One place.
        </h1>
        <p className="max-w-sm text-muted-foreground">Store coming soon.</p>
        <span className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
          Theme check
        </span>
      </main>
    </>
  );
}
