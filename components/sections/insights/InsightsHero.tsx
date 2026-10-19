'use client';

import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { fadeUp, staggerContainer } from '@/lib/motion';

export function InsightsHero() {
  return (
    <section className="relative overflow-hidden bg-[#031428] text-white pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-white/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-brand-cerulean/20 via-brand-navy/15 to-transparent blur-[130px] -z-10"
      />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.div variants={fadeUp} className="flex justify-center">
            <Eyebrow variant="cerulean">Health Intelligence & Research Library</Eyebrow>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.12]"
          >
            Ideas, Methodologies &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cerulean via-sky-300 to-white">
              Engineering Guides.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal"
          >
            In-depth technical briefs, clinical biostatistics guides, production SQL optimizations, and bioinformatics walkthroughs authored by our senior practitioners.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
