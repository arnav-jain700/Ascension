"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 28 },
  },
};

const watermark = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-asc-canvas">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 sm:py-12 lg:py-16">
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 320, damping: 28 }}
          className="text-[min(12vw,8rem)] font-bold leading-none tracking-[0.08em] text-asc-sand sm:text-[min(10vw,6rem)]"
        >
          ASCENSION
        </motion.h1>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
          <motion.p
            variants={item}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-asc-charcoal"
          >
            Premium athleisure
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-asc-matte sm:text-5xl lg:text-6xl"
          >
            Elevated essentials for every day.
          </motion.h1>
          <motion.p variants={item} className="mt-6 text-lg leading-relaxed text-asc-charcoal">
            T-shirts and joggers cut for movement, finished for the street. Pure white studio
            energy — built for India, worn everywhere.
          </motion.p>
          <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex h-12 min-w-[140px] items-center justify-center bg-asc-matte px-8 text-sm font-medium text-white transition-colors hover:bg-asc-charcoal"
            >
              Shop the edit
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center border border-asc-border-strong px-8 text-sm font-medium text-asc-matte transition-colors hover:border-asc-matte"
            >
              Our story
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative aspect-[4/5] w-full max-w-md justify-self-center lg:max-w-none"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <div
            className="absolute inset-0 rounded-sm bg-gradient-to-br from-asc-sand-muted via-asc-canvas to-asc-sand shadow-[0_24px_60px_-20px_rgba(10,10,10,0.12)]"
            aria-hidden
          />
          <div className="relative h-full">
            <img
              src="/images/hero-image2.png"
              alt="Ascension Premium Athleisure Collection"
              className="h-full w-full rounded-sm object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
