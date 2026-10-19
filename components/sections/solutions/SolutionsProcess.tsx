'use client';

import { motion } from 'framer-motion';
import { Search, GitMerge, LayoutDashboard, Rocket } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { staggerContainer, fadeUp } from '@/lib/motion';

const steps = [
  {
    number: '01',
    title: 'Audit & Scoping',
    timing: 'Week 1',
    icon: Search,
    description:
      'We execute standard non-disclosure agreements, audit active database schemas (EHR, SQL, CSV), clarify KPIs with clinical leads, and establish governance parameters.',
  },
  {
    number: '02',
    title: 'Pipeline & Schema Modeling',
    timing: 'Weeks 2–3',
    icon: GitMerge,
    description:
      'We construct automated extraction scripts, clean data anomalies, standardize variable dictionaries, and build normalized data models optimized for fast analytical queries.',
  },
  {
    number: '03',
    title: 'Analytical Build & Validation',
    timing: 'Weeks 4–5',
    icon: LayoutDashboard,
    description:
      'We assemble role-tailored dashboards or biostatistical models in bi-weekly feedback sprints, validating every indicator against source clinical records for complete accuracy.',
  },
  {
    number: '04',
    title: 'Deployment & Knowledge Handover',
    timing: 'Week 6',
    icon: Rocket,
    description:
      'We deploy the verified system to your cloud or on-premise infrastructure, conduct comprehensive staff walkthroughs, deliver operational runbooks, and activate SLA support.',
  },
];

export function SolutionsProcess() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50/70 border-y border-slate-200/80">
      <Container className="space-y-16">
        <SectionHeading
          badge="Predictable Delivery"
          title="How We Execute Your Project"
          description="From initial architectural audit to production deployment in structured, transparent milestones."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="relative flex flex-col justify-between p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-brand-cerulean/30 hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold font-heading text-brand-navy/30">
                      {step.number}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-cerulean/10 text-brand-cerulean border border-brand-cerulean/20">
                      {step.timing}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center border border-brand-cerulean/15">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold font-heading text-slate-900 pt-1">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <span>Phase {idx + 1} of 4</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
