'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Activity,
  LineChart,
  Brain,
  GraduationCap,
  Settings,
  Compass,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

const solutions = [
  {
    title: 'Healthcare Analytics',
    icon: Activity,
    problem: 'Clinical and public health data sit in disconnected databases, hiding metrics on outcomes and performance.',
    approach: 'We clean datasets, map clinical variables, and translate complex health indicators into streamlined reports.',
    outcomes: 'Cleaner reporting audits, improved tracking of system-wide indicators, and evidence-supported planning.',
  },
  {
    title: 'Business Intelligence',
    icon: LineChart,
    problem: 'Decision-makers waste hours manually compiling spreadsheets, delaying strategic action and growth decisions.',
    approach: 'We build structured data connections, KPI schemas, and live Power BI templates tailored for executives.',
    outcomes: 'Instant dashboard visibility, automated operations workflows, and rapid answers to financial metrics.',
  },
  {
    title: 'Research Intelligence',
    icon: Brain,
    problem: 'Academic and clinical research studies require advanced biostatistics and data cleaning before journal submission.',
    approach: 'We consult on study designs, script data pipeline cleaners, and prepare publication-ready charts.',
    outcomes: 'Methodological rigor, verified data tables, and statistical summaries ready for policy or academic review.',
  },
  {
    title: 'Data Strategy',
    icon: Compass,
    problem: 'Institutions lack a clear development path for governance, metrics alignment, and analytics maturity.',
    approach: 'We audit active tech systems, map metrics requirements, and construct actionable 3-phase roadmaps.',
    outcomes: 'Clean metadata alignment, defined governance rules, and a scalable pathway to advanced modeling.',
  },
  {
    title: 'Dashboard Development',
    icon: Settings,
    problem: 'Static reporting files obscure important changes, leaving managers blind to mid-month performance drops.',
    approach: 'We design custom dashboard views in Power BI or Streamlit with user-friendly hierarchies.',
    outcomes: 'Automated data refreshes, intuitive reporting flows, and centralized management metrics.',
  },
  {
    title: 'Capacity Building',
    icon: GraduationCap,
    problem: 'Internal operational teams lack the technical skills to build custom database queries and dashboard reports.',
    approach: 'We host interactive corporate masterclasses on SQL, Python libraries, and dashboard UX principles.',
    outcomes: 'Stronger technical self-sufficiency, certified analysts, and modern database management habits.',
  },
];

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Solutions() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      {/* 1. Hero Section */}
      <section className="py-20 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white text-center">
        <Container className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-primary/5 text-xs font-bold text-primary shadow-sm">
            Consulting Services
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Smarter Systems for Complex Operations
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-500 max-w-2xl mx-auto font-normal">
            Syma Tech Solutions works with hospitals, research teams, NGOs, and businesses to convert raw information into actionable systems.
          </p>
        </Container>
      </section>

      {/* 2. Solutions Services List */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Scoping & Scenarios"
            title="Our Core Offerings"
            description="Explore our functional methodologies designed to build institutional intelligence and operational excellence."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {solutions.map((sol) => {
              const Icon = sol.icon;
              return (
                <Card
                  key={sol.title}
                  hoverEffect="lift"
                  className="flex flex-col justify-between border-slate-100 bg-white p-6 shadow-sm relative"
                >
                  <div className="space-y-6">
                    {/* Card Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 leading-none">{sol.title}</CardTitle>
                    </div>

                    {/* Problem - Approach - Outcome Structure */}
                    <div className="space-y-4 pt-2 border-t border-slate-50 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-500 text-[9px]">
                          <AlertCircle className="w-3.5 h-3.5" /> Problem
                        </span>
                        <p className="text-slate-500 leading-relaxed pl-5">{sol.problem}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary text-[9px]">
                          <HelpCircle className="w-3.5 h-3.5" /> Our Approach
                        </span>
                        <p className="text-slate-500 leading-relaxed pl-5">{sol.approach}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-green-600 text-[9px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Outcome
                        </span>
                        <p className="text-slate-500 leading-relaxed pl-5">{sol.outcomes}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-8 border-t border-slate-50 pt-5">
                    <Link
                      href={`/consultation?type=${encodeURIComponent(sol.title)}`}
                      className="w-full inline-flex h-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                    >
                      Discuss this solution <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* 3. CTA Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading max-w-2xl mx-auto leading-snug">
              Build the Intelligence Layer Your Institution Needs
            </h2>
            <p className="text-sm text-slate-200 max-w-lg mx-auto mt-4 mb-8 leading-relaxed">
              Connect with Samuel Johnson and Oluyori Gabriel to audit your technical setup, scope databases, and deploy analytics.
            </p>
            <Link href="/consultation">
              <Button variant="accent" size="lg" className="bg-white text-primary hover:bg-slate-50 font-bold shadow-lg shadow-white/5">
                Schedule scoping call <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
