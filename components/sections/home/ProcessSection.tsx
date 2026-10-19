'use client';

import * as React from 'react';
import { Search, Database, LayoutDashboard, Rocket } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Audit & Scoping',
    desc: 'We conduct a technical consultation to audit your current database structures, data sources, and operational reporting latency.',
  },
  {
    number: '02',
    icon: Database,
    title: 'Data Modeling & Pipeline',
    desc: 'We clean noisy variables, build relational SQL schemas, and configure secure extraction pipelines tailored to clinical and enterprise standards.',
  },
  {
    number: '03',
    icon: LayoutDashboard,
    title: 'Analytical & Dashboard Build',
    desc: 'We engineer intuitive, decision-ready Power BI or statistical dashboards designed specifically for clinical directors and executive managers.',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Deployment & Training Handoff',
    desc: 'We configure automated data refreshes, verify data validation rules, and provide practical capacity training to ensure team adoption.',
  },
];

export function ProcessSection() {
  return (
    <section className="bg-slate-50/70 py-20 lg:py-28 border-b border-slate-200/70">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Eyebrow variant="navy">Methodology & Execution</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            How We Build Production Intelligence Systems
          </h2>
          <p className="mt-4 text-base text-slate-600 font-sans leading-relaxed">
            A structured, evidence-based methodology that moves organizations from fragmented spreadsheets to reliable, automated data intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
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

                <div className="mt-6 pt-3 border-t border-slate-50 text-[11px] font-bold text-brand-cerulean uppercase tracking-wider">
                  Phase {idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
