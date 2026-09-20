import Link from "next/link";
import { MovingLinesBackground } from "@/components/ui/moving-lines-background";
import { HeroSection } from "@/components/shop/hero-section";
import { CategoryShowcase } from "@/components/shop/category-showcase";
import { ProductRow } from "@/components/shop/product-grid";
import { sampleProducts } from "@/lib/sample-products";

export default function Home() {
  return (
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

        <section className="w-full">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold">
              Deals of the day
            </h2>
            <Link
              href="/products"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <ProductRow products={sampleProducts} />
        </section>

        <section className="w-full text-center">
          <h2 className="mb-6 font-display text-2xl font-semibold">
            Shop by category
          </h2>
          <CategoryShowcase />
        </section>
      </main>
    </MovingLinesBackground>
  );
}
