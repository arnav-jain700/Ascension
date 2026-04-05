"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export type HomeProductPreview = {
  slug: string;
  name: string;
  category: string;
  priceLabel: string;
  tone: "sand" | "matte" | "charcoal";
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
  },
};

const toneClass: Record<HomeProductPreview["tone"], string> = {
  sand: "from-asc-sand to-asc-sand-muted",
  matte: "from-asc-matte/10 to-asc-matte/5",
  charcoal: "from-asc-charcoal/15 to-asc-charcoal/5",
};

export function HomeProductGrid({ products }: { products: HomeProductPreview[] }) {
  return (
    <section className="border-t border-asc-border bg-asc-canvas py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-asc-matte sm:text-3xl">
            New arrivals
          </h2>
          <p className="mt-3 text-asc-charcoal">
            Tees and joggers in the Ascension cut. Catalog syncs from the API in Stage 4.
          </p>
        </div>
        <motion.ul
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {products.map((p) => (
            <motion.li key={p.slug} variants={card}>
              <Link href={`/products/${p.slug}`} className="group block">
                <div
                  className={`relative aspect-[3/4] overflow-hidden rounded-sm bg-gradient-to-b ${toneClass[p.tone]} ring-1 ring-asc-border transition-shadow group-hover:shadow-lg group-hover:ring-asc-border-strong`}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-wider text-asc-charcoal/50">
                    Image
                  </span>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-xs uppercase tracking-wider text-asc-charcoal">{p.category}</p>
                  <h3 className="font-medium text-asc-matte group-hover:text-asc-accent transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm text-asc-charcoal">{p.priceLabel}</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
        <p className="mt-12 text-center">
          <Link
            href="/products"
            className="text-sm font-medium text-asc-matte underline-offset-4 hover:text-asc-accent hover:underline"
          >
            View all products
          </Link>
        </p>
      </div>
    </section>
  );
}
