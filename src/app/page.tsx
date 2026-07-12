import { Hero } from "@/components/Hero";
import { BrandMarquee } from "@/components/BrandMarquee";
import { NewArrivals } from "@/components/NewArrivals";
import { Brands } from "@/components/Brands";
import { About } from "@/components/About";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <BrandMarquee />
      <NewArrivals />
      <Brands />
      <About />
    </main>
  );
}
