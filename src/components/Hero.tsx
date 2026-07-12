import Link from "next/link";
import { brands } from "@/lib/products";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-charcoal text-white">
      <div className="mx-auto max-w-[1600px] grid lg:grid-cols-2 min-h-[560px] lg:min-h-[680px]">
        {/* Copy */}
        <div className="relative z-10 flex flex-col justify-center gap-7 px-6 sm:px-10 lg:px-16 py-16 lg:py-0">
          <p className="text-[11px] tracked uppercase text-white/50">
            Worldwide Archive Selection
          </p>

          <h1 className="font-display text-[15vw] leading-[0.95] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
            Japanese
            <br />
            Designer
            <br />
            <span className="italic text-white/80">Archive.</span>
          </h1>

          <div className="h-px w-16 bg-white/30" />

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] tracked uppercase text-white/70">
            {brands.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>

          <p className="max-w-[42ch] text-sm text-white/55 leading-relaxed">
            Hand-selected archive pieces from Japan&apos;s most coveted
            underground labels — sourced, authenticated and sold one piece
            at a time.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="#new-arrivals"
              className="inline-flex items-center justify-center border border-white px-7 py-3 text-[11px] tracked uppercase hover:bg-white hover:text-charcoal transition-colors"
            >
              Shop New Arrivals
            </Link>
            <a
              href="https://www.instagram.com/vampyerre/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-2 py-3 text-[11px] tracked uppercase text-white/60 hover:text-white transition-colors"
            >
              View Curation ↗
            </a>
          </div>
        </div>

        {/* Video panel */}
        <div className="relative min-h-[380px] lg:min-h-full">
          <div className="absolute inset-0 lg:[mask-image:linear-gradient(to_right,transparent,black_14%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent,black_14%)]">
            <video
              className="h-full w-full object-cover grayscale-[0.25] contrast-[1.12] brightness-[0.82] saturate-[0.85]"
              src="/video/hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>

          {/* Depth + legibility gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent lg:bg-gradient-to-r lg:from-charcoal lg:via-transparent lg:to-transparent lg:opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />
          <div className="absolute inset-0 shadow-[inset_0_0_140px_60px_rgba(0,0,0,0.55)]" />

          <div className="grain opacity-[0.16] mix-blend-overlay" />

          <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 text-right">
            <p className="text-[9px] sm:text-[10px] tracked uppercase text-white/50">
              Archive Footage
            </p>
            <p className="text-[9px] sm:text-[10px] tracked uppercase text-white/50">
              Loop 01 / 01
            </p>
          </div>
        </div>
      </div>

      {/* Unifying grain across the whole hero, ties the video into the text panel */}
      <div className="grain opacity-[0.05] mix-blend-overlay" />
    </section>
  );
}
