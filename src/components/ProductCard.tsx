import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-soft">
        <Image
          src={product.images[0]}
          alt={`${product.brand} — ${product.name}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover grayscale-[0.15] contrast-[1.05] transition-opacity duration-500 group-hover:opacity-0"
          priority
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover grayscale-[0.15] contrast-[1.05] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] tracked uppercase text-muted">
            {product.brand}
          </p>
          <p className="text-sm mt-1">{product.name}</p>
        </div>
        <p className="text-sm text-muted whitespace-nowrap">{product.price}</p>
      </div>
    </Link>
  );
}
