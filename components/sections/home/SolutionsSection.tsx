'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Activity, LineChart, Brain, Compass, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardTitle } from '@/components/ui/Card';
import { Eyebrow } from '@/components/ui/Eyebrow';

const solutions = [
  {
    icon: Activity,
    title: 'Health Data Intelligence',
    subtitle: 'Clinical & Public Health Systems',
    description:
      'We clean clinical records, standardize diagnostic indicators, and engineer relational databases that turn hospital registers into decision-ready reports.',
    deliverables: [
      'Clinical indicator mapping & cleaning',
      'Outpatient throughput tracking',
      'Epidemiological data schemas',
    ],
    href: '/solutions',
  },
  {
    icon: LineChart,
    title: 'Business Intelligence & Power BI',
    subtitle: 'Automated Operations Dashboards',
    description:
      'Replace manual spreadsheet reconciliations with live executive dashboards, automated daily refreshes, and structured KPI monitoring models.',
    deliverables: [
      'Live Power BI dashboard architecture',
      'Automated daily database refresh pipelines',
      'Executive KPI scorecards & alerts',
    ],
    href: '/solutions',
  },
  {
    icon: Brain,
    title: 'Research Intelligence & Biostatistics',
    subtitle: 'Academic & Clinical Study Rigor',
    description:
      'Support for researchers and clinical trial groups with study design audits, pandas data wrangling, multivariate regression models, and publication tables.',
    deliverables: [
      'Multivariate biostatistical regression',
      'Survey variable cleaning & encoding',
      'Peer-review publication-ready figures',
    ],
    href: '/solutions',
  },
  {
    icon: Compass,
    title: 'Data Strategy & Systems Architecture',
    subtitle: 'Governance & Maturity Roadmaps',
    description:
      'Strategic consulting to evaluate your organization’s analytics maturity, define data governance rules, and architect scalable data layers for future AI integration.',
    deliverables: [
      'Analytics maturity & readiness audit',
      'Relational schema & SQL query optimization',
      'Phased technology implementation roadmap',
    ],
    href: '/solutions',
  },
];

export function SolutionsSection() {
  return (
    <section id="solutions" className="bg-white py-20 lg:py-28 border-b border-slate-200/70">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <Eyebrow variant="cerulean">Services & Capabilities</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Engineered Intelligence for Healthcare and Enterprise
            </h2>
            <p className="mt-4 text-base text-slate-600 font-sans leading-relaxed">
              We provide end-to-end data systems that bridge technical architecture with domain-specific healthcare and research expertise.
            </p>
          </div>
          <Link
            href="/solutions"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-cerulean hover:text-brand-navy transition-colors shrink-0 group"
          >
            <span>View All Detailed Offerings</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            return (
              <Card
                key={sol.title}
                hoverEffect="spring"
                className="flex flex-col justify-between p-8 border-slate-200/80 bg-white"
              >
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cerulean/10 text-brand-cerulean">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 font-mono">
                      {sol.subtitle}
                    </span>
                  </div>

                  <CardTitle className="text-xl font-bold text-slate-900 font-heading mt-6">
                    {sol.title}
                  </CardTitle>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed font-sans">
                    {sol.description}
                  </p>

                  <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-50">
                    {sol.deliverables.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-brand-cerulean shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href={sol.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-cerulean hover:text-brand-navy transition-colors group"
                  >
                    <span>Learn more about {sol.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
