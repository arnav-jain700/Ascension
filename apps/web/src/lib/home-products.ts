import type { HomeProductPreview } from "@/components/home-product-grid";

/** Placeholder grid until Stage 4 catalog API. Slugs align with future PDP routes. */
export const homeProductPreviews: HomeProductPreview[] = [
  {
    slug: "essential-tee-black",
    name: "Essential Tee",
    category: "T-shirt",
    priceLabel: "From ₹1,990",
    tone: "matte",
  },
  {
    slug: "essential-tee-white",
    name: "Essential Tee — White",
    category: "T-shirt",
    priceLabel: "From ₹1,990",
    tone: "sand",
  },
  {
    slug: "stride-jogger",
    name: "Stride Jogger",
    category: "Jogger",
    priceLabel: "From ₹3,490",
    tone: "charcoal",
  },
  {
    slug: "rest-day-jogger",
    name: "Rest Day Jogger",
    category: "Jogger",
    priceLabel: "From ₹3,290",
    tone: "sand",
  },
];
