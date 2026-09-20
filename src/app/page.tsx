import { FlexNavbar } from "@/components/ui/flex-navbar";
import { MovingLinesBackground } from "@/components/ui/moving-lines-background";
import { HeroSection } from "@/components/shop/hero-section";
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
        <main className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-4 pb-16 pt-32 sm:px-6">
          <HeroSection
            badgeText="New season collection"
            title="Everything you love."
            highlight="One place."
            subtitle="Fashion, electronics, home and more, carefully curated in one premium store."
            primaryCTA={{ label: "Start shopping", href: "/products" }}
            secondaryCTA={{ label: "Browse categories", href: "/category" }}
            features={[
              { label: "Free shipping", icon: "truck" },
              { label: "Secure payments", icon: "shield" },
              { label: "Easy returns", icon: "return" },
              { label: "24/7 support", icon: "support" },
            ]}
          />

          <section className="w-full text-center">
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
