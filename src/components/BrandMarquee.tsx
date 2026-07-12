const ITEMS = [
  "IF SIX WAS NINE",
  "L.G.B.",
  "BEAUTIFUL:BEAST",
  "ARCHIVE JAPANESE DESIGNER",
];

export function BrandMarquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="border-y border-line bg-paper overflow-hidden">
      <div className="marquee-track py-4">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-8 pr-8 shrink-0 text-[11px] tracked uppercase text-muted"
          >
            <span>{item}</span>
            <span className="text-line">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
