'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Dna, Activity, ShieldCheck, Award } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { fadeUp, staggerContainer } from '@/lib/motion';

export function AboutHero() {
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
            <Eyebrow variant="cerulean">Grounded in Science, Engineered for Action</Eyebrow>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.12]"
          >
            Engineering the Intelligence Layer for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cerulean via-sky-300 to-white">
              African Health & Research.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal"
          >
            Syma Tech Solutions bridges biomedical sciences, biostatistics, and enterprise software engineering to transform fragmented health datasets into compliant, production-grade intelligence systems.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link href="/consultation" className="w-full sm:w-auto">
              <Button
                variant="cerulean"
                size="lg"
                className="w-full sm:w-auto shadow-xl shadow-brand-cerulean/25"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Schedule Technical Consultation
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                variant="outline"
                theme="dark"
                size="lg"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Contact Partnerships
              </Button>
            </Link>
          </motion.div>

          {/* Institutional Trust Strip */}
          <motion.div
            variants={fadeUp}
            className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 text-left"
          >
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                <Dna className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Biomedical Roots</p>
                <p className="text-[11px] text-slate-400">Science-first methods</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Clinical Rigor</p>
                <p className="text-[11px] text-slate-400">Validated biostatistics</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Data Governance</p>
                <p className="text-[11px] text-slate-400">Zero data retention</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Practical Academy</p>
                <p className="text-[11px] text-slate-400">Hands-on real schemas</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
