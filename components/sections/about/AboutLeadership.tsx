'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { fadeUp, staggerContainer } from '@/lib/motion';

const leaders = [
  {
    name: 'Samuel Johnson',
    role: 'Co-founder & Lead Biostatistician',
    credentials: 'BSc Human Anatomy • MSc Bioinformatics',
    focus: 'Health Data Analytics, Clinical Biostatistics, Research Pipeline Architecture',
    bio: 'Samuel brings a deep biomedical and computational biology background to health data systems. He leads data strategy, epidemiological study design, regression modeling, and analytics curriculum mapping for Syma Tech. His work focuses on transforming unstructured hospital records and observational research trials into validated, publication-grade intelligence.',
    image: '/images/profile_section.webp',
    linkedin: 'https://www.linkedin.com/in/samuel-johnson-766b2a337/',
    icon: ShieldCheck,
  },
  {
    name: 'Oluyori Gabriel',
    role: 'Co-founder & Software Systems Architect',
    credentials: 'BEng Electrical & Electronics Engineering',
    focus: 'Cloud Architecture, Relational Databases, API Engineering, System Reliability',
    bio: 'Gabriel is a software systems engineer with extensive background in hardware-software interfaces and distributed database design. He oversees custom digital health tooling, PostgreSQL datamart performance, REST/GraphQL API connectors, and security protocol compliance, ensuring our analytics platforms scale effortlessly with sub-second latency.',
    image: '/images/profile_section_1.webp',
    linkedin: 'https://www.linkedin.com/in/ol-a-619277269',
    icon: Cpu,
  },
];

export function AboutLeadership() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50/70 border-y border-slate-200/80">
      <Container className="space-y-16">
        <SectionHeading
          badge="Founding Leadership"
          title="Practitioners at the Intersection of Health & Code"
          description="Our founders unite biomedical sciences, biostatistics research, and software engineering discipline to solve real clinical operations problems."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto"
        >
          {leaders.map((leader) => {
            const Icon = leader.icon;
            return (
              <motion.div key={leader.name} variants={fadeUp} className="flex">
                <Card
                  hoverEffect="spring"
                  className="w-full p-8 sm:p-9 rounded-3xl border-slate-200/90 bg-white shadow-xs hover:border-brand-cerulean/30 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    {/* Header: Photo + Name/Role */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md">
                        <Image
                          src={leader.image}
                          alt={leader.name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>
                      <div className="text-center sm:text-left space-y-1">
                        <h3 className="text-2xl font-bold font-heading text-slate-900">
                          {leader.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-brand-cerulean">
                          {leader.role}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 font-semibold pt-0.5">
                          {leader.credentials}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans border-t border-slate-100 pt-4">
                      {leader.bio}
                    </p>

                    {/* Focus Area */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">
                        Domain Focus:
                      </span>
                      <span className="text-slate-500">{leader.focus}</span>
                    </div>
                  </div>

                  {/* LinkedIn Link */}
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={leader.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-cerulean transition-colors group"
                    >
                      <svg className="w-4 h-4 text-brand-cerulean fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      <span>Connect on LinkedIn</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
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
