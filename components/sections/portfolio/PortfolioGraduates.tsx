'use client';

import { motion } from 'framer-motion';
import { BarChart3, Code2, LineChart, ShieldCheck, UserCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { fadeUp, staggerContainer } from '@/lib/motion';

const studentProjects = [
  {
    id: 'outpatient-kpis',
    title: 'Outpatient KPI Reporting System',
    student: 'Agbo Emmanuella',
    cohort: 'Analytics Cohort 8',
    challenge:
      'Mapped clinic admissions trends and patient follow-ups to track quality outcomes across regional primary care units.',
    solution:
      'Constructed an end-to-end data pipeline cleaning clinical CSV files and feeding an interactive Power BI KPI tracker.',
    tools: ['Power BI', 'SQL Queries', 'Data Hygiene', 'UI/UX Design'],
    icon: BarChart3,
  },
  {
    id: 'genomic-pipeline',
    title: 'Genomic Variant Frequency Pipeline',
    student: 'Omachonu Ezekiel',
    cohort: 'Python Cohort 3',
    challenge:
      'Needed to parse and filter large variant sequence files to compute allele occurrence rates and population frequencies.',
    solution:
      'Wrote structured Python scripts processing raw VCF sequence files, exporting sanitized variant tables to SQL databases.',
    tools: ['Python', 'Pandas', 'Bioinformatics Scripts', 'SQL'],
    icon: Code2,
  },
  {
    id: 'triage-monitor',
    title: 'Emergency Triage Latency & Flow Monitor',
    student: 'Kalu Chinedu',
    cohort: 'Analytics Cohort 6',
    challenge:
      'Investigated emergency ward congestion where triage-to-physician wait times were not systematically logged.',
    solution:
      'Engineered an automated alert dashboard identifying surge hours and estimating physician queue backlogs.',
    tools: ['Power BI', 'Excel Automation', 'Process Mapping'],
    icon: LineChart,
  },
  {
    id: 'trial-randomization',
    title: 'Clinical Trial Randomization & Audit Tracker',
    student: 'Aisha Bello',
    cohort: 'Biostatistics Cohort 2',
    challenge:
      'Designed a blinded block randomization model to balance baseline patient covariates across two trial arms.',
    solution:
      'Authored verifiable R scripts generating balanced allocation sequences with audit-ready log tracking.',
    tools: ['R / Tidyverse', 'Biostatistics', 'STROBE Guidelines'],
    icon: ShieldCheck,
  },
];

export function PortfolioGraduates() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50/70 border-y border-slate-200/80">
      <Container className="space-y-16">
        <SectionHeading
          badge="Academy Capstones"
          title="Graduate Portfolio Showcase"
          description="Sample capstone implementations engineered by our cohort fellows applying structured SQL querying, data hygiene, and biostatistical modeling."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {studentProjects.map((proj) => {
            const Icon = proj.icon;
            return (
              <motion.div key={proj.id} variants={fadeUp} className="flex">
                <Card
                  hoverEffect="spring"
                  className="w-full flex flex-col justify-between p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-brand-cerulean/30 hover:shadow-lg transition-all"
                >
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/15">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block flex items-center justify-end gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          {proj.student}
                        </span>
                        <span className="text-[11px] font-semibold text-brand-cerulean">
                          {proj.cohort}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold font-heading text-slate-900">
                        {proj.title}
                      </h3>
                      <div className="space-y-2 mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        <p>
                          <strong className="text-slate-800">Challenge: </strong>
                          {proj.challenge}
                        </p>
                        <p>
                          <strong className="text-slate-800">Solution: </strong>
                          {proj.solution}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {proj.tools.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] text-slate-600 font-semibold border border-slate-200/60"
                      >
                        {t}
                      </span>
                    ))}
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
