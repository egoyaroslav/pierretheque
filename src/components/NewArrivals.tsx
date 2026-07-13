import { products, comingSoon } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { PlaceholderCard } from "@/components/PlaceholderCard";
import { AmbientGlow } from "@/components/AmbientGlow";

export function NewArrivals() {
  return (
    <section id="new-arrivals" className="relative overflow-hidden scroll-mt-20">
      <AmbientGlow />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <p className="text-[11px] tracked uppercase text-muted mb-2">
              One Piece At A Time
            </p>
            <h2 className="font-display text-4xl sm:text-5xl">
              New Arrivals
            </h2>
          </div>
          <a
            href="https://www.instagram.com/pierretheque/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline text-[11px] tracked uppercase text-ink/70 hover:text-ink transition-colors"
          >
            View All ↗
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
          {comingSoon.map((item) => (
            <PlaceholderCard
              key={item.brand}
              brand={item.brand}
              label={item.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
