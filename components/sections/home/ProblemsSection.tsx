'use client';

import * as React from 'react';
import { FileSpreadsheet, Clock, AlertTriangle, Layers } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Eyebrow } from '@/components/ui/Eyebrow';

const problems = [
  {
    icon: FileSpreadsheet,
    title: 'Disconnected Spreadsheets & Siloed EHRs',
    description:
      'Patient records, drug inventories, and facility logs live in incompatible files, leaving directors without a unified source of truth.',
  },
  {
    icon: Clock,
    title: 'Multi-Week Reporting Latency',
    description:
      'Manual report compilation means operations decisions are made on stale numbers weeks after clinical events take place.',
  },
  {
    icon: Layers,
    title: 'Complex Research Data Wrangles',
    description:
      'Epidemiological surveys and cohort studies stall before publication due to inconsistent variable coding, missing data, and complex regression requirements.',
  },
  {
    icon: AlertTriangle,
    title: 'Internal Analytics Capacity Gaps',
    description:
      'Teams are overwhelmed by raw data because staff lack practical training in modern relational schemas, SQL, and automated Power BI models.',
  },
];

export function ProblemsSection() {
  return (
    <section className="bg-marketing-light-bg py-20 lg:py-28 border-b border-slate-200/70">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Eyebrow variant="navy">Operational Bottlenecks</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            The Data Challenges Slowing Down Health Systems
          </h2>
          <p className="mt-4 text-base text-slate-600 font-sans leading-relaxed">
            Healthcare and research initiatives generate immense data, but critical decisions remain blocked by fragmented storage and manual reporting bottlenecks.
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
