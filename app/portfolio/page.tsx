'use client';

import Link from 'next/link';
import { ArrowRight, Code, ShieldCheck, Database, Layout, BarChart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import PortfolioShowcase from '@/components/sections/PortfolioShowcase';

const caseStudies = [
  {
    id: 'healthcare-ops',
    title: 'Healthcare Operations Tracker',
    client: 'Regional Public Health Program',
    metric: 'Reporting latency reduced by 45%',
    challenge: 'Facility-level outpatient service details were fragmented across legacy spreadsheets, making timely review of clinical metrics impossible.',
    solution: 'Designed and deployed a centralized data schema that connects reporting clinics and feeds a unified dashboard for operations management.',
    tools: ['SQL', 'Power BI', 'Excel pipelines', 'Database schemas'],
    icon: Database
  },
  {
    id: 'survey-analytics',
    title: 'Survey Analytics & Insight Brief',
    client: 'Clinical Research Group',
    metric: 'Publication-ready data tables',
    challenge: 'A massive epidemiological survey database required cleaning, variable coding, statistical modeling, and academic-grade visualizations.',
    solution: 'Engineered pandas cleaning scripts, conducted cohort analysis, mapped regressions, and formatted plots directly matching journal submission guides.',
    tools: ['Python', 'Pandas', 'SciPy', 'Jupyter notebooks', 'Matplotlib'],
    icon: Code
  },
  {
    id: 'research-dashboard',
    title: 'Evidence review dashboard',
    client: 'Academic Health Center',
    metric: 'Immediate operational review',
    challenge: 'Clinical indicators and cohort metrics were difficult to analyze or compare across variables, time periods, and test groups.',
    solution: 'Built an interactive data model and visualization layout in Tableau to support statistical comparisons and presentation layers.',
    tools: ['Tableau', 'SQL database', 'Data wrangling', 'UX design'],
    icon: Layout
  }
];

const studentProjects = [
  {
    id: 'outpatient-kpis',
    title: 'Outpatient KPI Reporting System',
    student: 'Agbo Emmanuella (Analytics Cohort 8)',
    challenge: 'Mapped clinic admissions trends and patient follow-ups to track quality outcomes.',
    solution: 'Constructed an end-to-end data pipeline cleaning clinical CSV files and feeding a Power BI KPI tracker.',
    tools: ['Power BI', 'SQL', 'Excel', 'UI design'],
    icon: BarChart
  },
  {
    id: 'genomic-pipeline',
    title: 'Genomic Variant Frequency Pipeline',
    student: 'Omachonu Ezekiel (Python Cohort 3)',
    challenge: 'Needed to parse and filter variant sequence files to compute allele occurrence rates.',
    solution: 'Wrote structured python scripts processing raw sequence files, exporting variant tables to database systems.',
    tools: ['Python', 'Bioinformatics scripts', 'SQL database'],
    icon: Code
  }
];

export default function Portfolio() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      {/* 1. Hero */}
      <section className="py-20 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white text-center">
        <Container className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-primary/5 text-xs font-bold text-primary shadow-sm">
            Case Studies & Portfolio
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Decisions Guided by Clear Evidence
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-500 max-w-2xl mx-auto font-normal">
            Explore deployed dashboards, clinical database pipelines, and research analytics prepared by our team and academy graduates.
          </p>
        </Container>
      </section>

      {/* 2. Interactive Showcase */}
      <div className="bg-slate-50/30 border-b border-slate-100">
        <Container>
          <PortfolioShowcase />
        </Container>
      </div>

      {/* 3. Selected Case Studies */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Consulting Work"
            title="Enterprise Case Studies"
            description="Phased reporting solutions built for public health institutions, research partners, and clinical coordinators."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((cs) => {
              const Icon = cs.icon;
              return (
                <Card
                  key={cs.id}
                  hoverEffect="lift"
                  className="flex flex-col justify-between border-slate-100 bg-white p-8 shadow-sm relative"
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-100">
                        {cs.metric}
                      </span>
                    </div>

                    {/* Title & Challenge */}
                    <div className="space-y-3">
                      <CardTitle className="text-lg font-bold text-slate-900 leading-snug">{cs.title}</CardTitle>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">{cs.client}</span>
                      <div className="space-y-3 text-xs sm:text-sm text-slate-500 leading-relaxed pt-2 border-t border-slate-50">
                        <p>
                          <strong className="text-slate-800 font-bold">Challenge:</strong> {cs.challenge}
                        </p>
                        <p>
                          <strong className="text-slate-800 font-bold">Solution:</strong> {cs.solution}
                        </p>
                      </div>
                    </div>

                    {/* Tools */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tools Applied</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cs.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-600 font-semibold"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-5 mt-8">
                    <Link href="/consultation" className="w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs py-2 border-slate-200">
                        Discuss similar architecture
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. Graduate Projects */}
      <section className="py-24 lg:py-32 border-t border-slate-100 bg-slate-50/50">
        <Container className="space-y-16">
          <SectionHeading
            badge="Academy Portfolios"
            title="Graduate Capstone Showcase"
            description="Sample projects from cohort graduates applying structured querying, data cleaning, and dashboard design."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {studentProjects.map((proj) => {
              const Icon = proj.icon;
              return (
                <Card
                  key={proj.id}
                  hoverEffect="lift"
                  className="flex flex-col sm:flex-row gap-6 border-slate-150 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{proj.title}</h3>
                      <span className="text-[10px] font-semibold text-primary mt-1 block">{proj.student}</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2">
                      <p><strong>Challenge:</strong> {proj.challenge}</p>
                      <p><strong>Solution:</strong> {proj.solution}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {proj.tools.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500 font-semibold border border-slate-150/50">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 5. CTA */}
      <section className="py-20 bg-white">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading max-w-2xl mx-auto leading-snug">
              Build Evidence-Ready Dashboards & Systems
            </h2>
            <p className="text-sm text-slate-200 max-w-md mx-auto mt-4 mb-8 leading-relaxed">
              Schedule a scoping consultation to audit database tracking, scope requirements, and align metrics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
                <Button variant="accent" size="lg" className="w-full sm:w-auto font-sans font-bold bg-white text-primary hover:bg-slate-50">
                  Book Consultation
                </Button>
              </Link>
              <Link href="/solutions">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5">
                  Explore Solutions <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
