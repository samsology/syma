'use client';

import Link from 'next/link';
import FaqSection from '@/components/sections/FaqSection';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';

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
  cta: string;
  href: string;
  featured?: boolean;
};

const programs: Program[] = [
  {
    id: 'data-analytics-fundamentals',
    name: 'Healthcare Data Analytics',
    badge: 'Most Requested',
    price: 'NGN 70,000',
    secondaryPrice: 'Approx. $51',
    duration: '11 Weeks',
    level: 'Beginner Friendly',
    description:
      'Master healthcare reporting, data visualization, dashboard development, SQL, Power BI, and evidence-based decision-making using realistic healthcare datasets.',
    outcomes: [
      'Health Data Reporting',
      'SQL Fundamentals',
      'Power BI Dashboards',
      'Data Cleaning',
      'Healthcare Dashboards',
      'Insight Communication',
      'Capstone Project',
      'Certificate of Completion',
    ],
    cta: 'Enroll Now',
    href: '/enroll?program=Data-Analytics-Fundamentals',
    featured: true,
  },
  {
    id: 'python-for-data-science',
    name: 'Python for Data Science',
    badge: 'Research Workflow',
    price: 'NGN 120,000',
    secondaryPrice: 'Approx. $87',
    duration: '9 Weeks',
    level: 'Intermediate',
    description:
      'Develop modern analytical workflows using Python, Pandas, APIs, automation, and exploratory data analysis for healthcare and research applications.',
    outcomes: [
      'Python Programming',
      'Pandas',
      'NumPy',
      'API Integration',
      'Data Wrangling',
      'Exploratory Data Analysis',
      'Portfolio Project',
      'Mentor Support',
    ],
    cta: 'Enroll Now',
    href: '/enroll?program=Python-for-Data-Science',
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    badge: 'Executive BI',
    price: 'NGN 150,000',
    secondaryPrice: 'Approx. $109',
    duration: '7 Weeks',
    level: 'Advanced',
    description:
      'Design executive dashboards, build KPI frameworks, model performance indicators, and communicate insights that drive organizational performance.',
    outcomes: [
      'Advanced Power BI',
      'DAX',
      'Data Modeling',
      'KPI Dashboards',
      'Executive Reporting',
      'Dashboard UX',
      'Portfolio Project',
      'Certificate',
    ],
    cta: 'Enroll Now',
    href: '/enroll?program=Business-Intelligence',
  },
  {
    id: 'corporate-analytics-training',
    name: 'Training & Capacity Building',
    badge: 'For Organizations',
    price: 'Custom Quote',
    subtitle: 'Tailored for Institutions & Teams',
    description:
      'Customized analytics training for healthcare organizations, NGOs, universities, research teams, and businesses seeking stronger reporting and decision systems.',
    outcomes: [
      'Custom Curriculum',
      'Virtual or On-site',
      'Team Certification',
      'Healthcare & Research Context',
      'Executive Reporting',
      'Dashboard Automation',
      'Business Intelligence',
      'Post-training Support',
    ],
    cta: 'Request Proposal',
    href: '/consultation?program=Corporate-Analytics-Training',
  },
];

const learningPath = ['Healthcare Data Analytics', 'Python for Data Science', 'Business Intelligence'];

const includedBenefits = [
  'Certificate of Completion',
  'Hands-on Projects',
  'Mentor Support',
  'Career Guidance',
  'Portfolio Development',
  'Health, Research, and Business Datasets',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function ProgramCard({ program, index }: { program: Program; index: number }) {
  return (
    <Card
      shouldAnimate
      hoverEffect="lift"
      variants={fadeInUp}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={cn(
        'group flex h-full flex-col justify-between border-slate-200 bg-white p-6 shadow-sm shadow-slate-100/70 sm:p-7',
        program.featured && 'border-primary/35 shadow-primary/10'
      )}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              'inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
              program.featured
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            )}
          >
            {program.badge}
          </span>

          {program.duration && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Clock className="h-4 w-4 text-primary" />
              {program.duration}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <CardTitle className="text-2xl leading-tight text-slate-950">{program.name}</CardTitle>
          <p className="min-h-[72px] text-sm leading-6 text-slate-600">{program.description}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tuition</p>
          <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className="text-2xl font-extrabold tracking-tight text-slate-950">{program.price}</p>
            {program.secondaryPrice && <p className="pb-1 text-xs font-semibold text-slate-500">{program.secondaryPrice}</p>}
          </div>
          {(program.level || program.subtitle) && (
            <p className="mt-2 text-xs font-semibold text-primary">{program.level ?? program.subtitle}</p>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {program.id === 'corporate-analytics-training' ? 'Features' : 'Learning Outcomes'}
          </p>
          <ul className="grid gap-2">
            {program.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2.5 text-sm leading-5 text-slate-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        href={program.href}
        className={cn(
          'mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30',
          program.featured
            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90'
            : 'border border-slate-200 bg-white text-slate-950 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-slate-100'
        )}
        aria-label={`${program.cta} for ${program.name}`}
      >
        {program.cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Card>
  );
}

function LearningJourney() {
  return (
    <section className="py-20 lg:py-24">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeInUp}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 sm:p-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Recommended Path
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Recommended Learning Journey
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              These courses build progressively from healthcare analytics foundations to technical workflows and executive BI.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
            {learningPath.map((step, index) => (
              <div key={step} className="contents">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
                    {index + 1}
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-950">{step}</p>
                </div>
                {index < learningPath.length - 1 && (
                  <div className="flex justify-center text-primary">
                    <ArrowDown className="h-5 w-5 md:hidden" />
                    <ChevronRight className="hidden h-6 w-6 md:block" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function IncludedBenefits() {
  return (
    <section className="border-y border-slate-100 bg-slate-50 py-20 lg:py-24">
      <Container>
        <SectionHeading
          theme="light"
          badge="Included in Every Track"
          title="Every Syma Tech Program Includes"
          description="A consistent support system across all cohorts, built around practical outputs, professional confidence, and decision-ready work."
        />

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {includedBenefits.map((benefit, index) => {
            return (
              <Card
                key={benefit}
                shouldAnimate
                hoverEffect="lift"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="border-slate-200 bg-white p-5 shadow-sm shadow-slate-100"
              >
                <p className="text-sm font-bold text-slate-950">{benefit}</p>
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
      <div className="absolute right-1/4 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <section className="border-b border-slate-100 pb-16">
        <Container>
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Programs & Pricing
            </div>
            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-neutral-dark sm:text-5xl">
              Build analytics capability for healthcare, research, and business intelligence.
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-500">
              Outcome-focused training for students, professionals, and institutional teams who need practical analytics, clear reporting, and stronger decision support.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">Programs & Pricing</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Professional training, clear outcomes, practical pricing.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Compare tracks by level, duration, and the evidence products you will be able to build by the end of the cohort.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {programs.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))}
          </motion.div>
        </Container>
      </section>

      <LearningJourney />
      <IncludedBenefits />

      <FaqSection />

      <section className="bg-white pb-24 lg:pb-32">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/15">
            <h2 className="mx-auto max-w-2xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
              Prepare for Work That Uses Evidence Well
            </h2>
            <p className="mx-auto mb-8 mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              Apply today or speak with our team about the best Syma Tech path for your goals.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/enroll">
                <Button variant="accent" size="lg" className="w-full bg-white font-sans font-bold text-primary shadow-lg shadow-white/10 hover:bg-white/90 sm:w-auto">
                  Apply for Enrollment
                </Button>
              </Link>
              <Link href="/consultation">
                <Button variant="outline" size="lg" className="w-full border-white/25 text-white hover:bg-white/10 sm:w-auto">
                  Book a Consultation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
