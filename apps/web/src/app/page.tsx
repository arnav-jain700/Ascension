import { HomeHero } from "@/components/home-hero";
import { HomeProductGrid } from "@/components/home-product-grid";
import { homeProductPreviews } from "@/lib/home-products";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <HomeHero />
      <HomeProductGrid products={homeProductPreviews} />
    </div>
  );
}
