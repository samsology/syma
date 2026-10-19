'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Database, LineChart, ShieldCheck, Activity } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { TelemetryCard } from '@/components/ui/TelemetryCard';
import { fadeUpVariants, springCard, springTactile } from '@/lib/motion';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-marketing-dark-bg text-white py-20 lg:py-28">
      {/* Ambient Lighting Gradients */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-cerulean/15 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-40 h-[400px] w-[500px] rounded-full bg-brand-navy/30 blur-[120px]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy & CTAs */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <motion.div variants={fadeUpVariants} className="inline-block">
              <Eyebrow variant="cerulean">
                Health & Research Intelligence Systems
              </Eyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUpVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.08]"
            >
              Turn Health Data Into <span className="text-brand-cerulean">Better Decisions.</span>
            </motion.h1>

            <motion.p
              variants={fadeUpVariants}
              className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              We engineer unified clinical data pipelines, biostatistical research models, and automated executive dashboards that empower healthcare providers and institutions to act with certainty.
            </motion.p>

            <motion.div
              variants={fadeUpVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
            >
              <Link href="/consultation">
                <Button
                  variant="cerulean"
                  size="lg"
                  className="w-full sm:w-auto shadow-lg shadow-brand-cerulean/20 hover:shadow-cerulean-glow font-bold"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Discuss a Project
                </Button>
              </Link>
              <Link href="/solutions">
                <Button
                  variant="outline"
                  theme="dark"
                  size="lg"
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                >
                  Explore Our Solutions
                </Button>
              </Link>
            </motion.div>

            {/* Micro Trust Indicators */}
            <motion.div
              variants={fadeUpVariants}
              className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-cerulean" />
                <span>Strict Data Confidentiality</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-yellow" />
                <span>Clinical & Epidemiological Rigor</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Production SQL & Power BI Schemas</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Illustrative Telemetry Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Background Halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-cerulean/20 to-transparent rounded-3xl blur-2xl -z-10" />

            <div className="space-y-4">
              {/* Primary Telemetry Card */}
              <TelemetryCard
                title="Outpatient Throughput Velocity"
                metric="94.6%"
                trend="+18.4%"
                category="Hospital Operations"
                theme="dark"
                sparklineData={[14, 20, 18, 28, 35, 30, 42, 50]}
              />

              {/* Secondary Companion Card */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={springCard}
                className="rounded-2xl p-4 border border-white/10 bg-marketing-dark-surface/80 backdrop-blur-xl text-white shadow-xl"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/10">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <LineChart className="w-3.5 h-3.5 text-brand-cerulean" />
                    Cohort Biostatistics Pipeline
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Validated
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-left">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Data Latency</p>
                    <p className="text-lg font-bold text-white font-heading mt-0.5">45ms query</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Models Prepared</p>
                    <p className="text-lg font-bold text-white font-heading mt-0.5">Multivariate</p>
                  </div>
                </div>
                <p className="mt-3 text-[9px] text-slate-500 leading-tight">
                  *Illustrative clinical data model simulation for systems visualization.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
