import Link from "next/link";
import { FlexNavbar } from "@/components/ui/flex-navbar";
import { MovingLinesBackground } from "@/components/ui/moving-lines-background";
import { CategoryShowcase } from "@/components/shop/category-showcase";

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

      <MovingLinesBackground className="min-h-screen" opacity={0.7}>
        <main className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 pb-16 pt-32 text-center sm:px-6">
          <section className="flex flex-col items-center gap-5">
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
              Premium marketplace
            </span>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-6xl">
              Everything you love.
              <br />
              One place.
            </h1>
            <p className="max-w-md text-muted-foreground">
              Fashion, electronics, home and more, carefully curated in one
              store.
            </p>
            <Link
              href="/products"
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start shopping
            </Link>
          </section>

          <section className="w-full">
            <h2 className="mb-6 font-display text-2xl font-semibold">
              Shop by category
            </h2>
            <CategoryShowcase />
          </section>
        </main>
      </MovingLinesBackground>
    </>
  );
}
