'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  Handshake,
  Layers,
  Lightbulb,
  ShieldCheck,
  Target,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Counter } from '@/components/ui/Counter';

const coreValues = [
  {
    title: 'Innovation',
    description: 'We apply analytics, AI-aware workflows, and bioinformatics to healthcare and clinical research questions.',
    icon: Lightbulb,
  },
  {
    title: 'Integrity',
    description: 'We handle clinical databases and research statistics with verified transparency and ethical care.',
    icon: ShieldCheck,
  },
  {
    title: 'Evidence',
    description: 'We build decision-ready models, reports, and dashboards supported by rigorous data validation.',
    icon: Layers,
  },
  {
    title: 'Collaboration',
    description: 'We work closely with hospitals, universities, NGOs, and corporate teams to solve operational bottlenecks.',
    icon: Handshake,
  },
];

const milestones = [
  {
    year: 'Purpose',
    title: 'Data-Driven Action',
    description: 'Providing public health programs and businesses in Africa with unified intelligence layers to guide critical decisions.',
  },
  {
    year: 'Roots',
    title: 'Biomedical Roots',
    description: 'Founded with backgrounds in Human Anatomy, software development, and electrical engineering, bridging sciences and modern data tools.',
  },
  {
    year: 'Service',
    title: 'Deployed Intelligence',
    description: 'Supporting organizations with Power BI dashboards, statistical reports, and custom capacity building.',
  },
  {
    year: 'Vision',
    title: 'Computational Biology & AI',
    description: 'Our long-term ambition is to apply computational biology, genomics, and artificial intelligence to solve clinical challenges in Africa.',
  },
];

export default function About() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      {/* 1. Hero Section */}
      <section className="py-20 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white text-center">
        <Container className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-primary/5 text-xs font-bold text-primary shadow-sm">
            About Syma Tech Solutions
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Grounded in Science, Engineered for Action
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-500 max-w-2xl mx-auto font-normal font-sans">
            We bridge healthcare analytics, research intelligence, business intelligence, and professional data education to build Africa&apos;s data layer.
          </p>
        </Container>
      </section>

      {/* 2. Mission & Vision & Stats Grid */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Mission */}
            <Card hoverEffect="lift" className="p-8 border-slate-100 flex flex-col justify-between bg-white shadow-sm">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Our Mission</CardTitle>
                <CardDescription className="text-sm text-slate-500 leading-relaxed">
                  To empower healthcare programs and organizations with data intelligence platforms, automated dashboard reporting, and practical analytics frameworks that strengthen systems.
                </CardDescription>
              </div>
            </Card>

            {/* Vision */}
            <Card hoverEffect="lift" className="p-8 border-slate-100 flex flex-col justify-between bg-white shadow-sm">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Our Vision</CardTitle>
                <CardDescription className="text-sm text-slate-500 leading-relaxed">
                  To build Africa&apos;s leading health informatics and research intelligence firm, leveraging computational biology, machine learning, and data engineering to solve critical clinical challenges.
                </CardDescription>
              </div>
            </Card>
          </div>

          {/* Quick Metrics */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-slate-900"><Counter value="200+" /></p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Professionals Trained</p>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-slate-200/60 py-4 sm:py-0">
              <p className="text-3xl font-extrabold text-slate-900"><Counter value="40+" /></p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Dashboards Delivered</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900"><Counter value="100%" /></p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Client Satisfaction</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Leadership Grid */}
      <section className="py-24 lg:py-32 border-t border-slate-100 bg-slate-50/50">
        <Container className="space-y-16">
          <SectionHeading
            badge="Leadership Team"
            title="Founding Partners"
            description="Our co-founders connect biomedical sciences, bioinformatics research, and software engineering discipline."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Samuel Johnson */}
            <Card className="p-8 border-slate-150 bg-white flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-150 bg-slate-50 shadow-md">
                <Image
                  src="/images/profile_section.webp"
                  alt="Samuel Johnson"
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="space-y-4 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-none">Samuel Johnson</h3>
                  <span className="text-xs font-semibold text-primary mt-1 block">Co-founder & Healthcare Analyst</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-500">
                  Samuel is a Healthcare Data Analyst and Bioinformatics Enthusiast with a background in Human Anatomy from Ahmadu Bello University, Zaria. He guides data strategy, research modeling, and analytics curriculum mapping.
                </p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                  <a
                    href="https://www.linkedin.com/in/samuel-johnson-766b2a337/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </Card>

            {/* Oluyori Gabriel */}
            <Card className="p-8 border-slate-150 bg-white flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-150 bg-slate-50 shadow-md">
                <Image
                  src="/images/profile_section_1.webp"
                  alt="Oluyori Gabriel"
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="space-y-4 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-none">Oluyori Gabriel</h3>
                  <span className="text-xs font-semibold text-primary mt-1 block">Co-founder & Software Architect</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-500">
                  Gabriel is a software systems engineer with a background in electrical engineering. He leads the development of custom software portals, API integrations, database structures, and platform performance.
                </p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                  <a
                    href="https://www.linkedin.com/in/ol-a-619277269"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 4. Core Values Section */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Foundational Pillars"
            title="Our Values"
            description="How we govern our consulting audits, research datasets, and student mentorship."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val) => {
              const Icon = val.icon;
              return (
                <Card key={val.title} hoverEffect="lift" className="p-6 border-slate-100 bg-white flex flex-col justify-between shadow-sm">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 leading-none">{val.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {val.description}
                    </CardDescription>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 5. Timeline Section */}
      <section className="py-24 lg:py-32 border-t border-slate-100 bg-slate-50/50">
        <Container className="space-y-16">
          <SectionHeading
            badge="History & Growth"
            title="Scientific Path & Direction"
            description="Our structural evolution from biomedical study and data literacy into custom software development and clinical intelligence."
          />

          <div className="relative border-l border-slate-200 max-w-2xl mx-auto pl-8 sm:pl-12 space-y-12">
            {milestones.map((m) => (
              <div key={m.title} className="relative">
                <span className="absolute -left-[39px] sm:-left-[55px] top-1.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white border-4 border-primary shadow" />
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary font-mono bg-primary/5 border border-primary/10 px-2 py-0.5 rounded">
                    {m.year}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{m.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. CTA */}
      <section className="py-20 bg-white">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading max-w-2xl mx-auto leading-snug">
              Work With a Science-First Technology Partner
            </h2>
            <p className="text-sm text-slate-200 max-w-md mx-auto mt-4 mb-8 leading-relaxed">
              Find out how our healthcare operations audits, data visualizations, or training programs can align with your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
                <Button variant="accent" size="lg" className="w-full sm:w-auto font-sans font-bold bg-white text-primary hover:bg-slate-50">
                  Book scoping call
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5">
                  Contact support <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
