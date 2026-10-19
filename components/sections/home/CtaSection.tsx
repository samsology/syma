'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export function CtaSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-marketing-dark-bg px-8 py-16 sm:px-16 sm:py-20 text-center text-white shadow-2xl border border-white/10">
          {/* Ambient Lighting Gradients */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[350px] w-[600px] rounded-full bg-brand-cerulean/20 blur-[120px]"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-cerulean/30 bg-brand-cerulean/10 text-brand-cerulean text-xs font-bold uppercase tracking-wider">
              Get Started
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
              Let&apos;s Make Your Data More Useful.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto">
              Tell us about your data questions, reporting needs, or analytics goals. We’ll discuss a practical next step for your team.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/consultation">
                <Button
                  variant="cerulean"
                  size="lg"
                  className="w-full sm:w-auto shadow-lg shadow-brand-cerulean/25 hover:shadow-cerulean-glow font-bold"
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
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
