'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye, Handshake, Layers, Lightbulb, ShieldCheck, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

const coreValues = [
  {
    title: 'Innovation',
    description: 'We apply analytics, AI-aware thinking, and practical technology to healthcare, research, and business challenges.',
    icon: Lightbulb,
  },
  {
    title: 'Integrity',
    description: 'We handle evidence, client work, and professional education with honesty, care, and respect for context.',
    icon: ShieldCheck,
  },
  {
    title: 'Evidence',
    description: 'We believe decisions should be guided by clear analysis, credible methods, and transparent interpretation.',
    icon: Layers,
  },
  {
    title: 'Collaboration',
    description: 'We work with healthcare teams, researchers, NGOs, universities, businesses, and learners as partners.',
    icon: Handshake,
  },
];

const milestones = [
  {
    year: 'Purpose',
    title: 'Why We Exist',
    description: 'Africa needs stronger systems for turning health, research, and business information into decisions that improve lives and institutions.',
  },
  {
    year: 'Founder',
    title: 'Biomedical Roots',
    description: 'Samuel Johnson brings a B.Sc. in Human Anatomy from Ahmadu Bello University, Zaria, and a deep interest in healthcare analytics, bioinformatics, neuroscience, AI, and public health.',
  },
  {
    year: 'Work',
    title: 'Intelligence in Practice',
    description: 'Syma Tech Solutions supports dashboards, research analysis, KPI frameworks, reports, and professional training for teams and individuals.',
  },
  {
    year: 'Vision',
    title: 'A Long-Term Scientific Ambition',
    description: 'The founder’s long-term vision is to apply artificial intelligence, computational biology, and data science to solve Africa’s healthcare challenges and contribute to global science.',
  },
];

export default function About() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen py-16 lg:py-24">
      <section className="pb-16 border-b border-slate-100">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 text-xs font-bold text-secondary">
              About Syma Tech
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight font-heading text-neutral-dark">
              A Health & Research Intelligence Company Built for Africa
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Syma Tech Solutions empowers organizations and professionals through healthcare analytics, business intelligence, research support, technology solutions, and practical data education.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 relative h-96 w-full rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-50">
              <Image
                src="/images/profile_section.png"
                alt="Samuel Johnson, founder of Syma Tech Solutions"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block">Founder Story</span>
              <h2 className="text-3xl font-bold font-heading text-neutral-dark">Founded by Samuel Johnson</h2>
              <p className="text-slate-600 leading-relaxed">
                Samuel Johnson is a Healthcare Data Analyst, Bioinformatics Enthusiast, and Technology Entrepreneur with a background in Human Anatomy from Ahmadu Bello University, Zaria.
              </p>
              <p className="text-slate-600 leading-relaxed">
                His work combines biomedical sciences, healthcare analytics, business intelligence, and technology to improve healthcare delivery, research outcomes, and evidence-based decision-making across Africa.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Syma Tech Solutions was founded to bridge healthcare, research, and technology through analytics consulting, business intelligence solutions, research support, and professional education.
              </p>
              <div className="pt-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center shadow-md">
                  SJ
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Samuel Johnson</h4>
                  <span className="text-xs text-slate-400">Founder, Healthcare Data Analyst & Technology Entrepreneur</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card hoverEffect="lift" className="bg-white border-slate-200/80 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 text-secondary flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-dark font-heading">Our Mission</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  To empower organizations and professionals with practical analytics, business intelligence, and technology solutions that improve decision-making, strengthen healthcare systems, and accelerate innovation across Africa.
                </p>
              </div>
            </Card>

            <Card hoverEffect="lift" className="bg-white border-slate-200/80 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 text-secondary flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-dark font-heading">Our Vision</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  To become Africa&apos;s leading Health & Research Intelligence company, advancing healthcare, research, and public policy through innovative data solutions.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            badge="Foundational Pillars"
            title="Core Values We Live By"
            description="Our values guide how we support institutions, train professionals, and translate evidence into action."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((val) => {
              const Icon = val.icon;
              return (
                <Card key={val.title} hoverEffect="lift" className="bg-white border-slate-200/80 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-slate-900 text-lg font-bold">{val.title}</CardTitle>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{val.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-100">
        <Container>
          <SectionHeading
            badge="Who We Are"
            title="Purpose, Science, and Practical Intelligence"
            description="Syma Tech Solutions sits at the intersection of healthcare analytics, research intelligence, business intelligence, technology solutions, and professional education."
          />
          <div className="relative border-l border-slate-200 max-w-3xl mx-auto pl-8 sm:pl-12 space-y-12">
            {milestones.map((m) => (
              <div key={m.title} className="relative">
                <span className="absolute -left-[39px] sm:-left-[55px] top-1.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white border-4 border-primary shadow" />
                <div className="space-y-2">
                  <span className="text-sm font-extrabold text-secondary font-mono">{m.year}</span>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">{m.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/10">
            <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl mx-auto font-heading leading-tight">
              Build Better Decisions With Evidence
            </h2>
            <p className="text-secondary/90 text-sm sm:text-base max-w-md mx-auto mt-4 mb-8 leading-relaxed">
              Work with us on healthcare analytics, research intelligence, BI dashboards, training, and practical technology solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/programs">
                <Button variant="accent" size="lg" className="w-full sm:w-auto font-sans font-bold shadow-lg shadow-secondary/10">
                  Explore Programs
                </Button>
              </Link>
              <Link href="/consultation">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                  Book a Consultation <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
