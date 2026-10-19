'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  Brain,
  Code2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/motion';

const pillars = [
  {
    id: 'healthcare-analytics',
    title: 'Healthcare Analytics & Clinical BI',
    category: 'Clinical Operations & Hospitals',
    badgeVariant: 'cerulean' as const,
    icon: Activity,
    summary:
      'Unify inpatient admissions, bed occupancy, laboratory turnover, and pharmacy inventory into intuitive, audit-ready operational dashboards that refresh daily.',
    problem:
      'Hospital leadership makes critical staffing and bed allocation decisions based on stale end-of-month summaries, missing acute patient flow bottlenecks.',
    deliverables: [
      'Real-time bed occupancy, length-of-stay (LOS), and triage latency monitors',
      'Automated ETL pipelines connecting EHR, SQL, and legacy spreadsheet data',
      'Role-gated departmental dashboards (Executive, Nursing, Pharmacy, Billing)',
      'Clinical indicator threshold alerts delivered to administrative teams',
    ],
    techStack: ['SQL', 'Power BI', 'PostgreSQL', 'Python', 'FHIR Interfaces'],
    ctaText: 'Scope Clinical Analytics',
    ctaLink: '/consultation?type=healthcare-analytics',
  },
  {
    id: 'research-intelligence',
    title: 'Research Intelligence & Biostatistics',
    category: 'Clinical Trials & Academic Labs',
    badgeVariant: 'coral' as const,
    icon: Brain,
    summary:
      'Accelerate your path to peer-reviewed publication with rigorous biostatistical design, reproducible data cleaning scripts, and high-resolution journal figures.',
    problem:
      'Research teams lose critical months reconciling missing observation variables, resolving multi-arm trial imbalances, and formatting statistical models to journal standards.',
    deliverables: [
      'Multivariable regression, survival analysis (Kaplan-Meier, Cox PH), and propensity matching',
      'Reproducible R, Python, and STATA scripts with full version-controlled audit trails',
      'Publication-ready high-DPI figures and STROBE/CONSORT compliant summary tables',
      'Protocol review and statistical analysis plan (SAP) consultation',
    ],
    techStack: ['R / Tidyverse', 'Python (SciPy)', 'STATA', 'REDCap', 'Quarto'],
    ctaText: 'Scope Research Support',
    ctaLink: '/consultation?type=research-intelligence',
  },
  {
    id: 'business-intelligence',
    title: 'Digital Health Tooling & Custom Portals',
    category: 'Healthtech & Diagnostic Systems',
    badgeVariant: 'yellow' as const,
    icon: Code2,
    summary:
      'When commercial software is too rigid or costly, we engineer purpose-built, secure web applications, diagnostic scoring aids, and custom data intake registries.',
    problem:
      'Off-the-shelf health software forces clinicians into awkward workflows, lacking the specialized intake parameters needed for modern diagnostic and research initiatives.',
    deliverables: [
      'Secure, responsive web portals for patient screening and research registry intake',
      'Automated clinical risk-scoring calculators and diagnostic decision aids',
      'Encrypted document & imaging archival utilizing Cloudflare R2 and S3 protocols',
      'Direct REST & GraphQL API integrations linking hardware to data warehouses',
    ],
    techStack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Cloudflare R2', 'Supabase'],
    ctaText: 'Scope Custom Tooling',
    ctaLink: '/consultation?type=business-intelligence',
  },
  {
    id: 'training-capacity',
    title: 'Enterprise Capacity Building & Academy',
    category: 'Institutional Upskilling',
    badgeVariant: 'navy' as const,
    icon: GraduationCap,
    summary:
      'Transform your internal hospital, ministry, or research staff into self-sufficient data analysts through intensive, cohort-based technical training masterclasses.',
    problem:
      'Institutions remain permanently dependent on expensive external consultants for minor query adjustments and basic weekly reporting updates.',
    deliverables: [
      'Hands-on interactive masterclasses in SQL, clinical data hygiene, and Power BI',
      'Customized curriculum built directly around your institution’s sanitized schemas',
      '1-on-1 capstone project coaching with measurable real-world reporting outcomes',
      'Syma Tech verified certification and ongoing LMS alumni resource access',
    ],
    techStack: ['Hands-on Cohorts', 'Sanitized Datasets', 'LMS Player', 'Executive Briefs'],
    ctaText: 'Scope Team Training',
    ctaLink: '/consultation?type=training-capacity',
  },
];

export function SolutionsPillars() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <Container className="space-y-16">
        <SectionHeading
          badge="Core Offerings"
          title="Engineered Solutions for Institutional Impact"
          description="Explore our specialized technical methodologies designed to build long-term institutional intelligence, eliminate reporting delays, and enforce clinical rigor."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10"
        >
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div key={pillar.id} variants={fadeUp} className="flex">
                <Card
                  hoverEffect="spring"
                  className="w-full flex flex-col justify-between border-slate-200/90 bg-white p-8 sm:p-9 rounded-3xl shadow-xs hover:border-brand-cerulean/40 hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="space-y-6">
                    {/* Header: Eyebrow + Icon */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Eyebrow variant={pillar.badgeVariant}>
                          {pillar.category}
                        </Eyebrow>
                        <h3 className="text-2xl font-bold font-heading text-slate-900 mt-2.5">
                          {pillar.title}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/15">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
                      {pillar.summary}
                    </p>

                    {/* Problem Callout */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700">
                      <span className="font-bold text-slate-900 block mb-1">
                        The Core Bottleneck:
                      </span>
                      <p className="text-slate-500 leading-relaxed">
                        {pillar.problem}
                      </p>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        What We Deliver:
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                        {pillar.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Technology Stack Tags */}
                    <div className="pt-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Technologies & Frameworks:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {pillar.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 text-[11px] font-semibold text-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Link */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={pillar.ctaLink}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-cerulean hover:text-brand-navy transition-colors group"
                    >
                      <span>{pillar.ctaText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
