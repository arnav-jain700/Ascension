"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section ref={ref} className="relative w-full h-[85vh] lg:h-screen overflow-hidden bg-asc-matte">
      <div className="relative w-full h-full">
        {/* Immersive Background Image - natural aspect ratio */}
        <motion.div style={{ y, willChange: "transform" }} className="w-full h-full absolute inset-0 max-w-[100vw] overflow-hidden">
          <Image
            src="/images/webcover2.png" // User provided image
            alt="Ascension Lifestyle"
            fill
            sizes="100vw"
            quality={85}
            className="w-full h-auto min-h-full block object-cover object-top"
            priority
          />
        </motion.div>
        {/* Lighter, subtle gradient just behind the text on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute inset-0 z-10 flex h-full items-end pb-12 sm:pb-24 lg:items-center lg:pb-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid max-w-2xl gap-4 sm:gap-8"
          >
            {/* Vibe Tag */}
            <motion.div variants={fadeUp} className="inline-flex w-fit items-center space-x-2 rounded border border-white/20 bg-black/20 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              <span>The New Standard</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-black leading-[1.05] tracking-tighter text-white sm:text-6xl lg:text-8xl mix-blend-overlay drop-shadow-2xl"
            >
              Find your <br />
              <span className="text-white">paradise.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="max-w-xl text-sm sm:text-lg font-medium leading-relaxed text-white/90 drop-shadow-md">
              Raw, lived-in basics rooted in natural comfort. Effortless fits designed for simply existing.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2 sm:pt-4">
              <Link
                href="/products"
                className="group relative inline-flex h-12 sm:h-14 items-center justify-center bg-white px-8 sm:px-10 text-sm sm:text-base font-bold text-asc-matte transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                SHOP NEW ARRIVALS
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Modern Scrolling Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 drop-shadow-md hidden sm:flex"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll</span>
          <div className="h-8 sm:h-10 w-[2px] bg-white/30 relative overflow-hidden">
            <motion.div
              className="absolute top-0 w-full h-1/2 bg-white"
              animate={{ y: [0, 40] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
