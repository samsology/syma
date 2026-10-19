'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Layers, Cpu, GraduationCap } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { fadeUp, staggerContainer } from '@/lib/motion';

const values = [
  {
    title: 'Methodological Rigor',
    description:
      'We reject superficial vanity metrics. Every dashboard calculation, survival curve, and regression model is validated against source clinical records with reproducible code.',
    icon: Layers,
  },
  {
    title: 'Clinical Confidentiality',
    description:
      'Patient privacy is our non-negotiable standard. We enforce bilateral NDAs, zero permanent raw data retention, and execute workflows in client tenancies or sandbox environments.',
    icon: ShieldCheck,
  },
  {
    title: 'Systems-First Engineering',
    description:
      'We engineer data architectures that work reliably in the real world—accommodating legacy hospital software, intermittent connectivity, and diverse departmental workflows.',
    icon: Cpu,
  },
  {
    title: 'Sustainable Capacity',
    description:
      'We believe in ending permanent reliance on external contractors. Through our academy cohorts and team training, we upskill internal health workers into self-sufficient analysts.',
    icon: GraduationCap,
  },
];

export function AboutValues() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <Container className="space-y-16">
        <SectionHeading
          badge="Operational Standards"
          title="The Principles That Govern Our Work"
          description="How we approach sensitive health datasets, client consulting partnerships, and student mentorship."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {values.map((val) => {
            const Icon = val.icon;
            return (
              <motion.div key={val.title} variants={fadeUp} className="flex">
                <Card
                  hoverEffect="spring"
                  className="w-full p-7 rounded-3xl border-slate-200/90 bg-white shadow-xs hover:border-brand-cerulean/30 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/15">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-bold font-heading text-slate-900 leading-snug">
                      {val.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                      {val.description}
                    </CardDescription>
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
