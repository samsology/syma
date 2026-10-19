'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Database, Code, Layout } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardTitle } from '@/components/ui/Card';
import { Eyebrow } from '@/components/ui/Eyebrow';

const workAreas = [
  {
    id: 'health-data',
    title: 'Health data and reporting',
    description: 'Organizing health information and developing reporting approaches around a team’s operational questions.',
    tools: ['Data organization', 'Reporting'],
    icon: Database,
  },
  {
    id: 'research-data',
    title: 'Research data analysis',
    description: 'Support for data preparation, statistical analysis, and presenting findings clearly.',
    tools: ['Data preparation', 'Analysis'],
    icon: Code,
  },
  {
    id: 'business-intelligence',
    title: 'Business intelligence',
    description: 'Clearer reporting and dashboard concepts to help teams review the measures that matter to them.',
    tools: ['Reporting', 'Dashboards'],
    icon: Layout,
  },
];

export function CaseStudiesSection() {
  return (
    <section className="bg-white py-20 lg:py-28 border-b border-slate-200/70">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <Eyebrow variant="cerulean">Illustrative Work Areas</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Ways We Can Help Make Data More Useful
            </h2>
            <p className="mt-4 text-base text-slate-600 font-sans leading-relaxed">
              These examples describe service areas, not named client engagements or measured outcomes.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-cerulean hover:text-brand-navy transition-colors shrink-0 group"
          >
          <span>Explore the Portfolio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {workAreas.map((cs) => {
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
                      Illustrative service area
                    </span>
                    <Icon className="h-5 w-5 text-brand-cerulean" />
                  </div>

                  <CardTitle className="text-xl font-bold text-slate-900 font-heading mt-6">
                    {cs.title}
                  </CardTitle>

                  <p className="mt-4 text-sm text-slate-600 leading-relaxed font-sans">{cs.description}</p>
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
