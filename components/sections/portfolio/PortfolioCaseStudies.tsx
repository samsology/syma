'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Database, Code2, LayoutDashboard, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { fadeUp, staggerContainer } from '@/lib/motion';

const caseStudies = [
  {
    id: 'healthcare-ops',
    title: 'Healthcare Operations & Outpatient Tracker',
    client: 'Regional Public Health Network',
    badgeVariant: 'cerulean' as const,
    metric: '45% Reporting Latency Reduction',
    challenge:
      'Facility-level outpatient admissions, bed turnover, and pharmacy inventories were fragmented across hundreds of legacy Excel spreadsheets. Clinical leadership could only review operations weeks after reporting periods ended, missing acute bottlenecks.',
    solution:
      'Engineered an automated SQL data warehouse with Python ingestion connectors, normalizing disparate facility schemas into a single source of truth. Deployed role-gated Power BI dashboards refreshing daily.',
    deliverables: [
      'Automated nightly data ingestion pipelines connecting 12 primary facilities',
      'Clinical indicator threshold alerts delivered to administrative teams',
      'Unified executive scorecard tracking patient length-of-stay and bed occupancy',
    ],
    tools: ['SQL', 'Power BI', 'Python (ETL)', 'PostgreSQL', 'Automated Alerts'],
    icon: Database,
    consultationType: 'healthcare-analytics',
  },
  {
    id: 'survey-analytics',
    title: 'Epidemiological Survey Analytics & Insight Brief',
    client: 'Clinical Research Consortia',
    badgeVariant: 'coral' as const,
    metric: 'Publication-Ready Tables & Regressions',
    challenge:
      'A multi-center epidemiological survey across 14,000 patient records required strict data cleaning, missing-value imputation, confounder adjustments, and academic-grade visualizations adhering to international medical journal standards.',
    solution:
      'Developed reproducible Python and R scripts performing multivariable logistic regression, propensity score matching, and Kaplan-Meier survival curves. Generated publication figures directly matching STROBE and Lancet formatting guidelines.',
    deliverables: [
      'Zero-loss data imputation pipeline resolving incomplete patient records',
      'Reproducible Quarto and Jupyter notebooks with versioned audit trails',
      'High-DPI vector figures and formatted summary tables ready for journal peer review',
    ],
    tools: ['Python', 'Pandas', 'SciPy', 'R / Tidyverse', 'Quarto', 'Matplotlib'],
    icon: Code2,
    consultationType: 'research-intelligence',
  },
  {
    id: 'research-dashboard',
    title: 'Evidence Review & Clinical Decision Support Dashboard',
    client: 'Academic Health Center',
    badgeVariant: 'navy' as const,
    metric: 'Sub-Second Cross-Cohort Querying',
    challenge:
      'Observational trial records and clinical outcome indicators could not be dynamically sliced or compared across treatment arms and demographic cohorts without demanding manual query scripts from overloaded database administrators.',
    solution:
      'Engineered a high-performance relational analytics datamart in PostgreSQL paired with a responsive Next.js and Tailwind clinical web portal, enabling principal investigators to filter multi-arm cohorts with sub-second response times.',
    deliverables: [
      'Custom interactive web portal featuring role-based clinician access',
      'Dynamic multi-variable filtering across trial arms, dosage, and outcome states',
      'Secure data export pipelines with automated de-identification for ethics compliance',
    ],
    tools: ['Next.js', 'PostgreSQL', 'Tailwind CSS', 'REST APIs', 'Cloudflare R2'],
    icon: LayoutDashboard,
    consultationType: 'business-intelligence',
  },
];

export function PortfolioCaseStudies() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <Container className="space-y-16">
        <SectionHeading
          badge="Enterprise Implementations"
          title="Engineered for Real Institutional Impact"
          description="Detailed breakdowns of deployed database pipelines, clinical intelligence systems, and research platforms."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {caseStudies.map((cs) => {
            const Icon = cs.icon;
            return (
              <motion.div key={cs.id} variants={fadeUp} className="flex">
                <Card
                  hoverEffect="spring"
                  className="w-full flex flex-col justify-between border-slate-200/90 bg-white p-7 sm:p-8 rounded-3xl shadow-xs hover:border-brand-cerulean/40 hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="space-y-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/15">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cs.metric}
                      </span>
                    </div>

                    {/* Title & Client */}
                    <div>
                      <Eyebrow variant={cs.badgeVariant} className="mb-2">
                        {cs.client}
                      </Eyebrow>
                      <h3 className="text-xl font-bold font-heading text-slate-900 leading-snug">
                        {cs.title}
                      </h3>
                    </div>

                    {/* Challenge & Solution */}
                    <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                      <div>
                        <strong className="text-slate-900 font-bold block mb-1">
                          The Operational Bottleneck:
                        </strong>
                        <p className="text-slate-500">{cs.challenge}</p>
                      </div>

                      <div>
                        <strong className="text-slate-900 font-bold block mb-1">
                          The Engineering Solution:
                        </strong>
                        <p className="text-slate-500">{cs.solution}</p>
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <strong className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                        Key Deliverables:
                      </strong>
                      <ul className="space-y-1.5">
                        {cs.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tools Applied */}
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                        Technology Stack:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cs.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 text-[11px] font-semibold text-slate-700"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="border-t border-slate-100 pt-6 mt-8">
                    <Link
                      href={`/consultation?type=${cs.consultationType}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-brand-cerulean hover:text-white hover:border-brand-cerulean transition-all"
                    >
                      <span>Discuss Similar Architecture</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
