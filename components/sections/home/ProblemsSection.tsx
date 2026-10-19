'use client';

import * as React from 'react';
import { FileSpreadsheet, Clock, AlertTriangle, Layers } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';

const problems = [
  {
    icon: FileSpreadsheet,
    title: 'Data spread across different sources',
    description:
      'When information lives in separate files and systems, teams may spend extra effort bringing it together for a clear view.',
  },
  {
    icon: Clock,
    title: 'Time-consuming reporting',
    description:
      'Manual steps in reporting can make it harder to prepare consistent information when teams need it.',
  },
  {
    icon: Layers,
    title: 'Complex research data',
    description:
      'Preparing survey and study data can involve careful coding, data checks, and analysis before results are ready to share.',
  },
  {
    icon: AlertTriangle,
    title: 'Building analytics skills',
    description:
      'Teams may need practical support to build confidence with data tools, analysis, and reporting workflows.',
  },
];

export function ProblemsSection() {
  return (
    <section className="bg-marketing-light-bg py-20 lg:py-28 border-b border-slate-200/70">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Eyebrow variant="navy">Operational Bottlenecks</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Making Complex Data Easier to Use
          </h2>
          <p className="mt-4 text-base text-slate-600 font-sans leading-relaxed">
            Different teams face different data and reporting needs. We help them clarify the problem and find an appropriate analytical approach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {problems.map((prob) => {
            const Icon = prob.icon;
            return (
              <div
                key={prob.title}
                className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:border-brand-cerulean/50 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy">
                    <Icon className="h-6 w-6 text-brand-cerulean" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    {prob.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed font-sans">
                  {prob.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
