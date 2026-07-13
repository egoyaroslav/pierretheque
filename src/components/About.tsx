import { InstagramFeed } from "@/components/InstagramFeed";
import { AmbientGlow } from "@/components/AmbientGlow";

export function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden scroll-mt-20 bg-charcoal text-white border-t border-line-dark"
    >
      <AmbientGlow />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
        <div>
          <p className="text-[11px] tracked uppercase text-white/40 mb-2">
            About The Archive
          </p>
          <h2 className="font-display text-4xl sm:text-5xl leading-tight">
            Curated, not manufactured.
          </h2>
        </div>

        <div className="flex flex-col gap-6 text-sm text-white/55 leading-relaxed">
          <p>
            PIERRETHEQUE sources and authenticates archive pieces from
            Japan&apos;s most coveted underground designers — IF SIX WAS
            NINE, L.G.B., BEAUTIFUL:BEAST and beyond. Nothing is
            reproduced. Every piece is a one-off, hunted down, verified
            and sold once.
          </p>
          <p>
            Two feeds, one obsession — the shop&apos;s drops and the
            founder&apos;s own wardrobe. Follow either below.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 pb-16 sm:pb-24">
        <InstagramFeed />
      </div>
    </section>
  );
}
