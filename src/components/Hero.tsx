import Link from "next/link";
import { brands } from "@/lib/products";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-charcoal text-white">
      <div className="relative h-[100svh] lg:h-auto lg:min-h-[720px] lg:grid lg:grid-cols-2">
        {/* Video layer — full-bleed on mobile, right panel on desktop */}
        <div className="absolute inset-0 lg:relative lg:order-2">
          <div className="absolute inset-0 lg:[mask-image:linear-gradient(to_right,transparent,black_14%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent,black_14%)]">
            <video
              className="h-full w-full object-cover grayscale-[0.6] contrast-[1.05] brightness-[0.95] saturate-[1.1]"
              src="/video/hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>

          {/* Depth + legibility gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/15 to-transparent lg:bg-gradient-to-r lg:from-charcoal lg:via-transparent lg:to-transparent lg:opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_50px_rgba(0,0,0,0.45)]" />

          <div className="scanlines opacity-25" />
          <div className="grain opacity-[0.14] mix-blend-overlay" />
        </div>

        {/* Copy layer — overlaid on the video on mobile, left panel on desktop */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 px-5 pb-10 pt-24 sm:px-8 lg:static lg:order-1 lg:h-full lg:justify-between lg:gap-6 lg:px-16 lg:py-16 lg:bg-gradient-to-t lg:from-transparent lg:to-transparent bg-gradient-to-t from-black/85 via-black/35 to-transparent">
          <p className="font-display text-lg tracking-[0.1em] lg:hidden">
            Pierrètèque
          </p>

          <p className="hidden lg:block text-[11px] tracked uppercase text-white/45">
            Worldwide Archive Selection
          </p>

          <h1 className="font-display text-[12vw] leading-[0.95] sm:text-6xl lg:text-[7.4vw] lg:leading-[0.92]">
            Japanese
            <br />
            Designer
            <br />
            <span className="italic text-white/80">Archive.</span>
          </h1>

          <div className="flex flex-col gap-6 lg:gap-7">
            <div className="hidden lg:block h-px w-16 bg-white/30" />

            <div className="hidden lg:flex flex-wrap gap-x-6 gap-y-2 text-[11px] tracked uppercase text-white/70">
              {brands.map((b) => (
                <span key={b}>{b}</span>
              ))}
            </div>

            <p className="hidden lg:block max-w-[46ch] text-base text-white/55 leading-relaxed">
              Hand-selected archive pieces from Japan&apos;s most coveted
              underground labels — sourced, authenticated and sold one
              piece at a time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 lg:pt-2">
              <Link
                href="#new-arrivals"
                className="inline-flex items-center justify-center border border-white/70 px-6 py-2.5 text-[10px] sm:text-[11px] tracked uppercase hover:bg-white hover:text-charcoal transition-colors lg:border-white lg:px-8 lg:py-4"
              >
                Shop New Arrivals
              </Link>
              <a
                href="https://www.instagram.com/vampyerre/"
                target="_blank"
                rel="noreferrer"
                className="hidden lg:inline-flex items-center justify-center px-2 py-4 text-[11px] tracked uppercase text-white/60 hover:text-white transition-colors"
              >
                View Curation ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Unifying grain across the whole hero, ties the video into the text panel */}
      <div className="grain opacity-[0.05] mix-blend-overlay" />
    </section>
  );
}
