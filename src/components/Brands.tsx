import { AmbientGlow } from "@/components/AmbientGlow";

const BRANDS = [
  {
    name: "IF SIX WAS NINE",
    note: "Mud-dyed denim, leather lacing and hand-distressed archive silhouettes.",
  },
  {
    name: "L.G.B.",
    note: "Worn-leather outerwear built for permanent, honest decay.",
  },
  {
    name: "BEAUTIFUL:BEAST",
    note: "Painterly cutsew and knitwear from Japan's underground.",
  },
];

export function Brands() {
  return (
    <section
      id="brands"
      className="relative overflow-hidden scroll-mt-20 bg-charcoal text-white"
    >
      <AmbientGlow />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-16 sm:py-24">
        <p className="text-[11px] tracked uppercase text-white/45 mb-2">
          Labels We Carry
        </p>
        <h2 className="font-display text-4xl sm:text-5xl mb-12 sm:mb-16">
          The Brands
        </h2>

        <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
          {BRANDS.map((brand, i) => (
            <div
              key={brand.name}
              className="border-t border-line-dark pt-6 flex flex-col gap-3"
            >
              <span className="text-[10px] tracked text-white/35">
                0{i + 1}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl">
                {brand.name}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-[36ch]">
                {brand.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
