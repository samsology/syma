'use client';

import Link from 'next/link';
import FaqSection from '@/components/sections/FaqSection';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

type Program = {
  id: string;
  name: string;
  badge: string;
  price: string;
  secondaryPrice?: string;
  subtitle?: string;
  duration?: string;
  level?: string;
  description: string;
  outcomes: string[];
  projects: string;
  cta: string;
  href: string;
  featured?: boolean;
};

const programs: Program[] = [
  {
    id: 'healthcare-analytics',
    name: 'Healthcare Data Analytics',
    badge: 'Most Requested',
    price: 'NGN 70,000',
    secondaryPrice: 'Approx. $51',
    duration: '11 Weeks',
    level: 'Beginner Friendly',
    description: 'Master healthcare reporting, SQL database schemas, and Power BI dashboard development using realistic patient records.',
    outcomes: [
      'Clinical KPI dashboard mapping',
      'Structured database querying (SQL)',
      'Automated medical operations tracking',
      'Evidence-based clinical decision reporting'
    ],
    projects: 'Hospital Admissions Operations Dashboard',
    cta: 'Apply Today',
    href: '/enroll?program=Healthcare-Data-Analytics',
    featured: true,
  },
  {
    id: 'python-for-data-science',
    name: 'Python for Data Science',
    badge: 'Research Pipeline',
    price: 'NGN 120,000',
    secondaryPrice: 'Approx. $87',
    duration: '9 Weeks',
    level: 'Intermediate Level',
    description: 'Build robust analytic workflows using Pandas, load database APIs, and write automated scripts for clinical datasets.',
    outcomes: [
      'Advanced Pandas database cleaners',
      'API query automation scripting',
      'SciPy clinical cohort regression analysis',
      'Exploratory research data graphing'
    ],
    projects: 'Clinical Survey Statistical Pipeline',
    cta: 'Apply Today',
    href: '/enroll?program=Python-for-Data-Science',
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    badge: 'Executive BI',
    price: 'NGN 150,000',
    secondaryPrice: 'Approx. $109',
    duration: '7 Weeks',
    level: 'Advanced Level',
    description: 'Model metrics using DAX formulas, build custom corporate KPI scorecards, and implement dashboard design principles.',
    outcomes: [
      'Advanced DAX formula database modeling',
      'Corporate performance KPI design',
      'Executive dashboard layout & typography',
      'Governance rules for live enterprise BI'
    ],
    projects: 'Executive Corporate KPI Scorecard',
    cta: 'Apply Today',
    href: '/enroll?program=Business-Intelligence',
  },
];

const learningPath = [
  { step: '1', title: 'Healthcare Analytics', desc: 'Build reporting foundations, SQL knowledge, and dashboard basics.' },
  { step: '2', title: 'Python for Data Science', desc: 'Automate data cleaning, query APIs, and perform regression.' },
  { step: '3', title: 'Business Intelligence', desc: 'Model advanced KPIs, write complex DAX, and deploy dashboard architecture.' }
];

const includedBenefits = [
  'Verifiable Certification',
  'Mentor Portfolio Review',
  'Weekly Live Code Labs',
  'Realistic Clinical Datasets',
  'Career Development Guides',
  '1-on-1 Capstone Guidance',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function ProgramCard({ program, index }: { program: Program; index: number }) {
  return (
    <Card
      shouldAnimate
      hoverEffect="lift"
      variants={fadeInUp}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={`group flex flex-col justify-between border-slate-100 bg-white p-8 shadow-sm ${
        program.featured ? 'border-primary/20 ring-1 ring-primary/5 shadow-md shadow-primary/5' : ''
      }`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              program.featured ? 'bg-primary/5 border border-primary/10 text-primary' : 'bg-slate-50 border border-slate-100 text-slate-500'
            }`}
          >
            {program.badge}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {program.duration}
          </span>
        </div>

        <div>
          <CardTitle className="text-xl font-extrabold text-slate-900 leading-tight">{program.name}</CardTitle>
          <span className="text-[10px] font-bold text-primary block mt-1 uppercase tracking-wide">{program.level}</span>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500">{program.description}</p>
        </div>

        {/* Pricing Segment */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Tuition</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-950">{program.price}</span>
            {program.secondaryPrice && <span className="text-[10px] font-semibold text-slate-400">({program.secondaryPrice})</span>}
          </div>
        </div>

        {/* Project Block */}
        <div className="text-xs">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Featured Capstone</span>
          <span className="font-bold text-slate-800 flex items-center gap-1 bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
            <Award className="w-3.5 h-3.5 text-secondary shrink-0" />
            {program.projects}
          </span>
        </div>

        {/* Outcomes */}
        <div className="space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Outcomes</span>
          <ul className="space-y-2">
            {program.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-50">
        <Link href={program.href} className="w-full">
          <Button variant={program.featured ? 'primary' : 'outline'} className="w-full">
            {program.cta}
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function IncludedBenefits() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/50 py-24 lg:py-32">
      <Container className="space-y-16">
        <SectionHeading
          theme="light"
          badge="Shared Benefits"
          title="Academy Foundations"
          description="Every professional program contains unified mentorship, interactive reviews, and data scopes."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {includedBenefits.map((benefit, index) => {
            return (
              <Card
                key={benefit}
                shouldAnimate
                hoverEffect="lift"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="border-slate-100 bg-white p-6 shadow-sm flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-sm font-bold text-slate-800">{benefit}</span>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default function ProgramsPageContent() {
  return (
    <div className="min-h-screen bg-white py-16 font-sans text-slate-900 lg:py-24">
      {/* Hero */}
      <section className="border-b border-slate-100 pb-16 bg-gradient-to-b from-slate-50/50 to-white text-center">
        <Container className="space-y-6">
          <div className="inline-flex rounded-full border border-primary/10 bg-primary/5 px-3.5 py-1 text-xs font-bold text-primary shadow-sm">
            Professional Education Tracks
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 max-w-4xl mx-auto">
            Practical Skills for Evidence-Led Work
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-500 font-normal">
            Acquire industry-standard skills in analytics, biostatistics, and business intelligence using real public health and business datasets.
          </p>
        </Container>
      </section>

      {/* Grid of Programs */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Programs & Tracks"
            title="Choose Your Learning Track"
            description="Explore fundamental clinical reporting, automated scripting, or dashboard architecture."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {programs.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Learning Journey Timeline */}
      <section className="py-24 lg:py-32 border-t border-slate-100 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Progressive Curriculum"
            title="Curriculum Learning Journey"
            description="Our courses build progressively from foundational query logic up to executive database modeling."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {learningPath.map((path, idx) => (
              <Card key={path.step} className="p-6 border-slate-100 bg-white shadow-sm relative flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm mb-4">
                  {path.step}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{path.title}</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{path.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <IncludedBenefits />
      <FaqSection />

      {/* Final CTA */}
      <section className="bg-white pb-24 lg:pb-32">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/15">
            <h2 className="mx-auto max-w-2xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
              Build Analytics Capability That Stands Out
            </h2>
            <p className="mx-auto mb-8 mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              Apply for our next cohort, or book a scoping call to arrange custom team capacity training.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/enroll">
                <Button variant="accent" size="lg" className="w-full bg-white font-sans font-bold text-primary shadow-lg shadow-white/10 hover:bg-white/90 sm:w-auto">
                  Apply for Enrollment
                </Button>
              </Link>
              <Link href="/consultation">
                <Button variant="outline" size="lg" className="w-full border-white/25 text-white hover:bg-white/5 sm:w-auto">
                  Talk to Scoping Consultant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
