'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { fadeUp } from '@/lib/motion';

export function AboutCta() {
  return (
    <section className="py-20 lg:py-28 bg-[#031428] text-white relative overflow-hidden border-t border-white/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-cerulean/15 blur-[140px] -z-10"
      />

      <Container>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 sm:p-12 lg:p-16 text-center backdrop-blur-md shadow-2xl max-w-4xl mx-auto space-y-6"
        >
          <div className="flex justify-center">
            <Eyebrow variant="cerulean">Partner With Us</Eyebrow>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
            Work With a Science-First Technology Partner.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
            Connect directly with our co-founders to audit your organization’s analytics maturity, scope custom clinical dashboards, or arrange team training.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/consultation" className="w-full sm:w-auto">
              <Button
                variant="cerulean"
                size="lg"
                className="w-full sm:w-auto shadow-xl shadow-brand-cerulean/30"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Schedule Technical Scoping Call
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
                Send General Inquiry
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
