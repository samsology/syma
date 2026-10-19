'use client';

import { motion } from 'framer-motion';
import { Lock, ShieldAlert, Cpu, FileCheck2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { staggerContainer, fadeUp } from '@/lib/motion';

const securityFeatures = [
  {
    icon: Lock,
    title: '100% Client Code & Model Ownership',
    description:
      'You retain full intellectual property ownership of all custom SQL scripts, Python ETL pipelines, Power BI templates, and statistical models engineered during our engagement.',
  },
  {
    icon: ShieldAlert,
    title: 'Engagement-Specific Data Handling',
    description:
      'Data access, storage, and deletion expectations can be agreed for each engagement before work begins.',
  },
  {
    icon: FileCheck2,
    title: 'Confidentiality Planning',
    description:
      'For work involving proprietary information, confidentiality terms can be discussed before any review begins.',
  },
  {
    icon: Cpu,
    title: 'Air-Gapped & On-Premise Compatible',
    description:
      'For healthcare facilities with strict sovereign or on-premise compliance constraints, our pipelines run natively on your internal servers without external cloud dependencies.',
  },
];

export function SolutionsSecurity() {
  return (
    <section className="py-24 lg:py-28 bg-white">
      <Container className="space-y-16">
        <SectionHeading
          badge="Security & Governance"
          title="Confidentiality & Governance Considerations"
          description="We discuss privacy, compliance, and organizational IP needs as part of project scoping."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {securityFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                className="flex items-start gap-5 p-7 rounded-3xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-brand-cerulean/30 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 text-brand-navy flex items-center justify-center shrink-0 border border-brand-navy/10 mt-1">
                  <Icon className="w-6 h-6 text-brand-navy" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold font-heading text-slate-900">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-sans">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
