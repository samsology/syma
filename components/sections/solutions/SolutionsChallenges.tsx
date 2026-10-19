'use client';

import { motion } from 'framer-motion';
import { Layers, Network, Clock, AlertTriangle } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { staggerContainer, fadeUp } from '@/lib/motion';

const challenges = [
  {
    icon: Network,
    metric: '70%+',
    highlight: 'Data Trapped in Silos',
    title: 'The Interoperability Barrier',
    description:
      'Electronic health records, laboratory systems, and pharmacy registries exist in disconnected silos. Hospital directors and medical heads make resource decisions using fragmented paper notes or stale weekly spreadsheets.',
  },
  {
    icon: Layers,
    metric: 'Months Lost',
    highlight: 'Delayed Study Publications',
    title: 'The Biostatistical Void',
    description:
      'Generalist software vendors lack epidemiological literacy. They build pretty dashboards that fail basic biostatistical validation, leaving clinical researchers stranded when journals demand rigorous survival curves and multivariable control.',
  },
  {
    icon: Clock,
    metric: '15+ Hrs',
    highlight: 'Per Week in Manual Collation',
    title: 'The Operational Burnout Cycle',
    description:
      'Healthcare and research teams burn hundreds of administrative hours manually copying, reformatting, and sanitizing numbers. This manual fatigue creates data entry errors and delays urgent interventions.',
  },
];

export function SolutionsChallenges() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50/70 border-b border-slate-200/80">
      <Container>
        <SectionHeading
          badge="Operational Bottlenecks"
          title="Why Off-The-Shelf Healthcare Software Falls Short"
          description="Healthcare operations and clinical research demand domain-specific statistical rigor, strict data confidentiality, and deep EHR schema literacy that generic SaaS vendors simply cannot provide."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {challenges.map((c, idx) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.title} variants={fadeUp}>
                <Card
                  hoverEffect="spring"
                  className="h-full flex flex-col justify-between border-slate-200/90 bg-white p-7 shadow-xs hover:border-brand-cerulean/30 hover:shadow-lg transition-all"
                >
                  <div className="space-y-5">
                    {/* Top Row: Icon + Metric */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-brand-coral/10 text-brand-coral flex items-center justify-center border border-brand-coral/15">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl font-black font-heading text-slate-900 tracking-tight">
                          {c.metric}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-coral">
                          {c.highlight}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold font-heading text-slate-900 pt-2">
                      {c.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed font-sans">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <AlertTriangle className="w-3.5 h-3.5 text-brand-coral shrink-0" />
                    <span>Impacts institutional clinical throughput & funding</span>
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
