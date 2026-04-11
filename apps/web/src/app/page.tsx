import { HomeHero } from "@/components/home-hero";
import { HomeProductGrid } from "@/components/home-product-grid";
import { HomeManifesto } from "@/components/home-manifesto";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-asc-canvas">
      <HomeHero />
      <HomeManifesto />
      <HomeProductGrid />
    </div>
  );
}
