export function About() {
  return (
    <section id="about" className="scroll-mt-20">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
        <div>
          <p className="text-[11px] tracked uppercase text-muted mb-2">
            About The Archive
          </p>
          <h2 className="font-display text-4xl sm:text-5xl leading-tight">
            Curated, not manufactured.
          </h2>
        </div>

        <div className="flex flex-col gap-6 text-sm text-ink/70 leading-relaxed">
          <p>
            PIERRETÈQUE sources and authenticates archive pieces from
            Japan&apos;s most coveted underground designers — IF SIX WAS
            NINE, L.G.B., BEAUTIFUL:BEAST and beyond. Nothing is
            reproduced. Every piece is a one-off, hunted down, verified
            and sold once.
          </p>
          <p>
            Curation is led by{" "}
            <a
              href="https://www.instagram.com/vampyerre/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 decoration-line hover:decoration-ink transition-colors"
            >
              @vampyerre
            </a>
            . Follow the full archive as it drops on{" "}
            <a
              href="https://www.instagram.com/pierretheque/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 decoration-line hover:decoration-ink transition-colors"
            >
              @pierretheque
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
