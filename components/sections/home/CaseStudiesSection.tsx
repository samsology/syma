'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Database, Code, Layout, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardTitle } from '@/components/ui/Card';
import { Eyebrow } from '@/components/ui/Eyebrow';

const cases = [
  {
    id: 'healthcare-ops',
    title: 'Healthcare Operations Tracker',
    client: 'Regional Public Health Program',
    metric: '45% reduction in reporting latency',
    challenge:
      'Facility-level outpatient service details were fragmented across legacy spreadsheets, making timely review of clinical metrics impossible.',
    solution:
      'Designed and deployed a centralized data schema that connects reporting clinics and feeds a unified dashboard for operations management.',
    tools: ['SQL', 'Power BI', 'Database Schema'],
    icon: Database,
  },
  {
    id: 'survey-analytics',
    title: 'Survey Analytics & Insight Brief',
    client: 'Clinical Research Group',
    metric: 'Publication-ready data tables',
    challenge:
      'A massive epidemiological survey database required cleaning, variable coding, statistical modeling, and academic-grade visualizations.',
    solution:
      'Engineered pandas cleaning scripts, conducted cohort analysis, mapped regressions, and formatted plots directly matching journal submission guides.',
    tools: ['Python', 'Pandas', 'SciPy Regressions'],
    icon: Code,
  },
  {
    id: 'research-dashboard',
    title: 'Evidence Review Dashboard',
    client: 'Academic Health Center',
    metric: 'Immediate operational review',
    challenge:
      'Clinical indicators and cohort metrics were difficult to analyze or compare across variables, time periods, and test groups.',
    solution:
      'Built an interactive data model and visualization layout in Tableau to support statistical comparisons and presentation layers.',
    tools: ['Tableau', 'SQL Database', 'UX Design'],
    icon: Layout,
  },
];

export function CaseStudiesSection() {
  return (
    <section className="bg-white py-20 lg:py-28 border-b border-slate-200/70">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <Eyebrow variant="cerulean">Verified Case Studies</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Evidence of Impact in Clinical & Enterprise Settings
            </h2>
            <p className="mt-4 text-base text-slate-600 font-sans leading-relaxed">
              Real projects where structured data architecture and biostatistical analysis helped teams solve operational bottlenecks.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-cerulean hover:text-brand-navy transition-colors shrink-0 group"
          >
            <span>Explore All Portfolio Projects</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cases.map((cs) => {
            const Icon = cs.icon;
            return (
              <Card
                key={cs.id}
                hoverEffect="spring"
                className="flex flex-col justify-between p-8 border-slate-200/80 bg-white"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy bg-brand-navy/5 px-2.5 py-1 rounded-md">
                      {cs.client}
                    </span>
                    <Icon className="h-5 w-5 text-brand-cerulean" />
                  </div>

                  <CardTitle className="text-xl font-bold text-slate-900 font-heading mt-6">
                    {cs.title}
                  </CardTitle>

                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{cs.metric}</span>
                  </div>

                  <div className="mt-5 space-y-3 text-xs text-slate-600 leading-relaxed font-sans">
                    <p>
                      <strong className="text-slate-900 font-bold block mb-0.5">Problem:</strong>
                      {cs.challenge}
                    </p>
                    <p>
                      <strong className="text-slate-900 font-bold block mb-0.5">Solution:</strong>
                      {cs.solution}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {cs.tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
