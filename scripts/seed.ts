import { createProduct } from "@/lib/data/products";
import { createBrand } from "@/lib/data/brands";
import { createComingSoonItem } from "@/lib/data/coming-soon";

async function seed() {
  await createProduct({
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
      { label: "Authenticity", value: "Verified archive piece, sold directly by PIERRETHEQUE" },
    ],
  });

  await createBrand({
    name: "IF SIX WAS NINE",
    note: "Mud-dyed denim, leather lacing and hand-distressed archive silhouettes.",
    position: 0,
  });
  await createBrand({
    name: "L.G.B.",
    note: "Worn-leather outerwear built for permanent, honest decay.",
    position: 1,
  });
  await createBrand({
    name: "BEAUTIFUL:BEAST",
    note: "Painterly cutsew and knitwear from Japan's underground.",
    position: 2,
  });

  await createComingSoonItem({ brand: "L.G.B.", label: "Leather & Outerwear", position: 0 });
  await createComingSoonItem({ brand: "BEAUTIFUL:BEAST", label: "Knitwear & Cutsew", position: 1 });
  await createComingSoonItem({ brand: "ARCHIVE", label: "Accessories", position: 2 });

  console.log("Seed complete.");
}

seed().then(() => process.exit(0));
