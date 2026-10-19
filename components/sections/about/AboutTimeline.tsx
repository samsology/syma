'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeUp, staggerContainer } from '@/lib/motion';

const milestones = [
  {
    phase: '01 / Foundations',
    title: 'Biomedical & Engineering Roots',
    description:
      'Syma Tech was founded by practitioners with academic and operational roots in Human Anatomy, Bioinformatics, and Electrical Engineering—bridging biological context with rigorous software development.',
  },
  {
    phase: '02 / Capacity',
    title: 'Practical Academy Launch',
    description:
      'Recognizing severe analytics skill shortages in clinical facilities, we launched our cohort-based academy, taking healthcare practitioners and aspiring analysts from raw spreadsheets to production SQL and Power BI.',
  },
  {
    phase: '03 / Scale',
    title: 'Enterprise Clinical Implementations',
    description:
      'We expanded into direct consulting partnerships with regional hospital systems, academic research groups, and NGOs—delivering automated ETL pipelines, decision scorecards, and publication-ready models.',
  },
  {
    phase: '04 / Vision',
    title: 'Computational Biology & AI',
    description:
      'Our ongoing mission expands toward applying high-throughput computational genomics, machine learning models, and predictive risk stratification to African epidemiological challenges.',
  },
];

export function AboutTimeline() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50/70 border-y border-slate-200/80">
      <Container className="space-y-16">
        <SectionHeading
          badge="Evolution & Direction"
          title="Our Journey & Long-Term Ambition"
          description="How an initiative to bridge biomedical sciences and modern code evolved into a specialized health informatics firm."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative border-l-2 border-brand-cerulean/30 max-w-3xl mx-auto pl-8 sm:pl-12 space-y-12"
        >
          {milestones.map((m) => (
            <motion.div key={m.phase} variants={fadeUp} className="relative">
              {/* Bullet circle */}
              <span className="absolute -left-[41px] sm:-left-[57px] top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white border-4 border-brand-cerulean shadow-md" />

              <div className="space-y-2 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-brand-cerulean bg-brand-cerulean/10 px-2.5 py-1 rounded-md border border-brand-cerulean/20 inline-block">
                  {m.phase}
                </span>
                <h3 className="text-xl font-bold font-heading text-slate-900 mt-2">
                  {m.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-sans">
                  {m.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
