'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Database, FileSpreadsheet, Gauge, ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { springSmooth, fadeUp, staggerContainer } from '@/lib/motion';

export function SolutionsHero() {
  return (
    <section className="relative overflow-hidden bg-[#031428] text-white pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-white/10">
      {/* Ambient background glows */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-brand-cerulean/20 via-brand-navy/15 to-transparent blur-[130px] -z-10" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-0 right-0 w-[450px] h-[450px] bg-brand-cerulean/10 blur-[150px] -z-10" 
      />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          {/* Eyebrow badge */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <Eyebrow variant="cerulean">
              Enterprise Health & Research Intelligence Systems
            </Eyebrow>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.12]"
          >
            Production-Grade Analytics for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cerulean via-sky-300 to-white">
              High-Stakes Health Systems.
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal"
          >
            We transform fragmented EHR extracts, complex research registries, and paper-based records into secure, audit-ready data pipelines, validated biostatistical models, and real-time operational decision intelligence.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link href="/consultation" className="w-full sm:w-auto">
              <Button
                variant="cerulean"
                size="lg"
                className="w-full sm:w-auto shadow-lg shadow-brand-cerulean/25"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Schedule Technical Consultation
              </Button>
            </Link>
            <Link href="/portfolio" className="w-full sm:w-auto">
              <Button
                variant="outline"
                theme="dark"
                size="lg"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                View Case Studies & Dashboards
              </Button>
            </Link>
          </motion.div>

          {/* High-Assurance Capabilities Strip */}
          <motion.div
            variants={fadeUp}
            className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 text-left"
          >
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Audit-Ready</p>
                <p className="text-[11px] text-slate-400">HIPAA & GDPR aware</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Multi-System</p>
                <p className="text-[11px] text-slate-400">EHR, SQL & API ETL</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Publication-Grade</p>
                <p className="text-[11px] text-slate-400">R, STATA & Python</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Rapid Cycles</p>
                <p className="text-[11px] text-slate-400">4-week sprint delivery</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
