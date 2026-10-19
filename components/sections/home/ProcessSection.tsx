'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Database, LayoutDashboard, Rocket } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Understand the need',
    desc: 'We discuss your goals, questions, existing data, and the people who will use the results.',
  },
  {
    number: '02',
    icon: Database,
    title: 'Review the data',
    desc: 'Together, we consider available data, reporting workflows, constraints, and relevant context.',
  },
  {
    number: '03',
    icon: LayoutDashboard,
    title: 'Choose an approach',
    desc: 'We outline suitable analysis, reporting, or data-system options for the problem at hand.',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Deliver and support',
    desc: 'We agree on the deliverables and any follow-up or training needed to help your team use them.',
  },
];

export function ProcessSection() {
  return (
    <section className="bg-slate-50/70 py-20 lg:py-28 border-b border-slate-200/70">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Eyebrow variant="navy">Methodology & Execution</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            How We Work Together
          </h2>
          <p className="mt-4 text-base text-slate-600 font-sans leading-relaxed">
            Each engagement starts with the problem and the available context, then shapes the work around what your team needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-2xl font-black font-heading text-brand-navy/30">
                      {step.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cerulean/10 text-brand-cerulean">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-900 font-heading">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link href="/consultation" className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-cerulean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean focus-visible:ring-offset-2">
            Talk through your project
          </Link>
        </div>
      </Container>
    </section>
  );
}
