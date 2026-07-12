export type Product = {
  slug: string;
  brand: string;
  name: string;
  price: string;
  images: string[];
  size: string;
  condition: string;
  origin: string;
  description: string[];
  details: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "ifsixwasnine-mudmax-gypsy",
    brand: "IF SIX WAS NINE",
    name: "Mudmax Gypsy",
    price: "Price on request",
    images: [
      "/products/mudmax-gypsy/front.jpg",
      "/products/mudmax-gypsy/detail.jpg",
    ],
    size: "28",
    condition: "Archive — Pre-Owned",
    origin: "Japan",
    description: [
      "A one-of-one piece from IF SIX WAS NINE's mud-dyed “Gypsy” denim line — the label's signature hand-distressed silhouette, worked over with earth pigment, splatter patina and reinforced tear repairs until no two pairs read the same.",
      "The waist closes with a corset-style leather lace instead of a standard fly, cinching the hip and giving the cut its unmistakable, body-conscious drape. Below the knee, the original denim is cut away and replaced with a bonded black leather flare panel, raw-edged at the hem.",
      "Sourced directly from the archive, authenticated, and photographed unworn since acquisition. Sold as seen — the wear is the piece.",
    ],
    details: [
      { label: "Label", value: "IF SIX WAS NINE" },
      { label: "Fabric", value: "Cotton denim, bonded leather panel, leather lace" },
      { label: "Construction", value: "Hand-distressed, mud-dye patina, corset lacing" },
      { label: "Care", value: "Specialist dry clean only — do not machine wash" },
      { label: "Authenticity", value: "Verified archive piece, sold directly by PIERRETÈQUE" },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const comingSoon = [
  {
    brand: "L.G.B.",
    label: "Leather & Outerwear",
  },
  {
    brand: "BEAUTIFUL:BEAST",
    label: "Knitwear & Cutsew",
  },
  {
    brand: "ARCHIVE",
    label: "New Pieces Weekly",
  },
];

export const brands = ["IF SIX WAS NINE", "L.G.B.", "BEAUTIFUL:BEAST"];
