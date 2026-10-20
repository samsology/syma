'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Database, LineChart, Activity } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { fadeUpVariants } from '@/lib/motion';

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
              We help healthcare teams, researchers, and businesses make better use of complex data through analytics, reporting, and practical data systems.
            </motion.p>

            <motion.div
              variants={fadeUpVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
            >
              <Link href="/student/register">
                <Button
                  variant="cerulean"
                  size="lg"
                  className="w-full sm:w-auto shadow-lg shadow-brand-cerulean/20 hover:shadow-cerulean-glow font-bold"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enroll Now
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

            {/* Capability cues */}
            <motion.div
              variants={fadeUpVariants}
              className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-yellow" />
                <span>Health & research analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Data systems and reporting</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: illustrative, non-outcome system diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-marketing-dark-surface/80 p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-cerulean/10 via-transparent to-brand-yellow/5" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">From data to decisions</p>
                    <p className="mt-1 text-xs text-slate-400">Illustrative system view</p>
                  </div>
                  <LineChart className="h-5 w-5 text-brand-cerulean" aria-hidden="true" />
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { number: '01', title: 'Data sources', detail: 'Records · surveys · operations', icon: Database },
                    { number: '02', title: 'Clear structure', detail: 'Prepare · connect · analyze', icon: Activity },
                    { number: '03', title: 'Useful insight', detail: 'Reports · measures · decisions', icon: LineChart },
                  ].map(({ number, title, detail, icon: Icon }, index) => (
                    <motion.div
                      key={number}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.16 + index * 0.08 }}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-cerulean/10 text-brand-cerulean">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{title}</span>
                        <span className="mt-1 block text-xs text-slate-400">{detail}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{number}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                  A conceptual illustration of the work, not a client dashboard or measured result.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
