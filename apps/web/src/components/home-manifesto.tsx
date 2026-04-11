"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function HomeManifesto() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Aesthetic Clean Image Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative justify-self-center lg:justify-self-start w-full max-w-md aspect-[4/5] rounded-xl overflow-hidden shadow-sm ring-1 ring-asc-border"
          >
            <Image
              src="/images/manifesto_img.png"
              alt="Ascension Essentials"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Effortless Values Typography */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold uppercase tracking-widest text-asc-accent">Our Philosophy</span>
            </div>
            
            <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-asc-matte sm:text-5xl lg:text-6xl">
               Your daily rotation, <br/>
               <span className="text-asc-charcoal font-medium">sorted.</span>
            </h2>

            <p className="max-w-xl text-lg text-asc-charcoal leading-relaxed font-medium">
              We ditched the uncomfortable trends and the ridiculous markups. What’s left is a collection of perfectly fitting, effortlessly cool essentials that make getting dressed the easiest part of your day.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-asc-border">
              <div className="bg-asc-sand-muted p-6 rounded-xl border border-asc-border/60">
                <span className="block text-2xl mb-3 text-asc-accent">●</span>
                <h4 className="text-sm font-bold text-asc-matte mb-2">Lived-in Feel</h4>
                <p className="text-sm text-asc-charcoal leading-relaxed">Washed and finished for instant broken-in comfort.</p>
              </div>
              <div className="bg-asc-sand-muted p-6 rounded-xl border border-asc-border/60">
                <span className="block text-2xl mb-3 text-asc-accent">●</span>
                <h4 className="text-sm font-bold text-asc-matte mb-2">Honest Value</h4>
                <p className="text-sm text-asc-charcoal leading-relaxed">Direct-to-you quality without the hype-tax.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
