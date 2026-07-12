import Link from "next/link";

const TRUST_ITEMS = [
  {
    title: "Worldwide Shipping",
    detail: "Tracked & insured export",
  },
  {
    title: "Authenticated Archive",
    detail: "Every piece verified before listing",
  },
  {
    title: "Secure Payment",
    detail: "Encrypted checkout",
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-charcoal text-white/70">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 border-b border-line-dark">
        {TRUST_ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-4">
            <span className="h-2 w-2 shrink-0 rounded-full border border-white/40" />
            <div>
              <p className="text-[11px] tracked uppercase text-white">
                {item.title}
              </p>
              <p className="text-xs text-white/50 mt-1">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-14 grid grid-cols-2 sm:grid-cols-4 gap-10">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-2xl tracking-[0.08em] text-white">
            PIERRETÈQUE<span className="text-white/40">.</span>
          </p>
          <p className="text-xs text-white/45 mt-4 leading-relaxed max-w-[24ch]">
            Archive Japanese designer wear, curated and sold one piece at a
            time.
          </p>
        </div>

        <div>
          <p className="text-[10px] tracked uppercase text-white/40 mb-4">
            Shop
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/#new-arrivals" className="hover:text-white">
                New In
              </Link>
            </li>
            <li>
              <Link href="/#brands" className="hover:text-white">
                Brands
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracked uppercase text-white/40 mb-4">
            Info
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/#about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <span className="text-white/50">Shipping &amp; Returns</span>
            </li>
            <li>
              <span className="text-white/50">Authenticity</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracked uppercase text-white/40 mb-4">
            Follow
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://www.instagram.com/pierretheque/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                @pierretheque
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/vampyerre/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                @vampyerre — curation
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-6 border-t border-line-dark text-[10px] tracked uppercase text-white/35">
        © {new Date().getFullYear()} Pierrètèque. All rights reserved.
      </div>
    </footer>
  );
}
