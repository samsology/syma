'use client';

import * as React from 'react';
import { Hospital, Microscope, Globe2, Building2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';

const capabilities = [
  {
    icon: Hospital,
    title: 'Healthcare Facilities',
    desc: 'Unifying outpatient registers, patient records, and operational KPIs into automated clinic scorecards.',
  },
  {
    icon: Microscope,
    title: 'Clinical Research Groups',
    desc: 'Structuring epidemiological survey databases, cohort regression models, and biostatistical tables.',
  },
  {
    icon: Globe2,
    title: 'Public Health Programs',
    desc: 'Designing monitoring frameworks and indicators tracking regional healthcare intervention outcomes.',
  },
  {
    icon: Building2,
    title: 'Enterprise Teams',
    desc: 'Deploying automated Power BI architecture, SQL data pipelines, and internal team capacity training.',
  },
];

export function TrustSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white py-14">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-navy">
            Institutional Analytics Domains
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Engineered for High-Stakes Health and Operational Data
          </h2>
          <p className="mt-3 text-sm text-slate-500 font-sans leading-relaxed">
            Our founding team pairs biomedical science and bioinformatics with software architecture discipline to deliver verified, audit-ready data systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-6 transition-all duration-200 hover:border-brand-cerulean/40 hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cerulean/10 text-brand-cerulean">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 font-heading">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
