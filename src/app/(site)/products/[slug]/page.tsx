import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/data/products";
import { getComingSoon } from "@/lib/data/coming-soon";
import { ProductGallery } from "@/components/ProductGallery";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PlaceholderCard } from "@/components/PlaceholderCard";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const comingSoon = await getComingSoon();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-6 text-[11px] tracked uppercase text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/#new-arrivals" className="hover:text-ink">
          New Arrivals
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.brand}</span>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery
          images={product.images}
          alt={`${product.brand} — ${product.name}`}
        />

        <div className="flex flex-col gap-8 lg:pt-4 lg:max-w-[46ch]">
          <div>
            <p className="text-[11px] tracked uppercase text-muted mb-2">
              {product.brand}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight">
              {product.name}
            </h1>
            <p className="text-lg text-ink/70 mt-4">{product.price}</p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] tracked uppercase text-muted border-y border-line py-4">
            <span>Size {product.size}</span>
            <span>{product.condition}</span>
            <span>Origin — {product.origin}</span>
          </div>

          <div className="flex flex-col gap-4 text-sm text-ink/75 leading-relaxed">
            {product.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <AddToCartButton className="w-full sm:w-auto" />

          <details className="border-t border-line pt-4 text-sm" open>
            <summary className="cursor-pointer text-[11px] tracked uppercase text-ink/80">
              Details
            </summary>
            <dl className="mt-4 flex flex-col gap-3">
              {product.details.map((d) => (
                <div
                  key={d.label}
                  className="flex justify-between gap-6 text-ink/65"
                >
                  <dt className="text-muted shrink-0">{d.label}</dt>
                  <dd className="text-right">{d.value}</dd>
                </div>
              ))}
            </dl>
          </details>

          <details className="border-t border-line pt-4 text-sm">
            <summary className="cursor-pointer text-[11px] tracked uppercase text-ink/80">
              Shipping &amp; Authenticity
            </summary>
            <p className="mt-4 text-ink/65 leading-relaxed">
              Every archive piece is inspected and authenticated before
              listing. Orders ship worldwide, tracked and insured, within
              2–4 business days of purchase confirmation.
            </p>
          </details>
        </div>
      </div>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-16 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl mb-10">
            More From The Archive
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {comingSoon.map((item) => (
              <PlaceholderCard
                key={item.id}
                brand={item.brand}
                label={item.label}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
