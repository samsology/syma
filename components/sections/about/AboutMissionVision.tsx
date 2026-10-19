'use client';

import { motion } from 'framer-motion';
import { Target, Eye, Building2, BookOpen, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeUp, staggerContainer } from '@/lib/motion';

export function AboutMissionVision() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <Container className="space-y-16">
        <SectionHeading
          badge="Guiding Principles"
          title="Mission & Strategic Vision"
          description="We are building the systems, datasets, and human capital required to power precision healthcare and epidemiological intelligence across Africa."
          align="center"
        />

        {/* Mission & Vision Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
        >
          {/* Mission */}
          <motion.div variants={fadeUp} className="flex">
            <Card
              hoverEffect="spring"
              className="w-full p-8 sm:p-10 rounded-3xl border-slate-200/90 bg-white flex flex-col justify-between shadow-xs hover:border-brand-cerulean/30 hover:shadow-xl transition-all"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center border border-brand-cerulean/15">
                  <Target className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold font-heading text-slate-900">
                  Our Mission
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
                  To eliminate clinical reporting latency and research data bottlenecks by equipping healthcare facilities, research groups, and life sciences teams with production-grade data pipelines, validated biostatistical models, and actionable decision dashboards.
                </CardDescription>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Action-oriented analytics for high-stakes healthcare environments</span>
              </div>
            </Card>
          </motion.div>

          {/* Vision */}
          <motion.div variants={fadeUp} className="flex">
            <Card
              hoverEffect="spring"
              className="w-full p-8 sm:p-10 rounded-3xl border-slate-200/90 bg-white flex flex-col justify-between shadow-xs hover:border-brand-cerulean/30 hover:shadow-xl transition-all"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center border border-brand-cerulean/15">
                  <Eye className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold font-heading text-slate-900">
                  Our Vision
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
                  To establish Africa’s premier health informatics and research intelligence powerhouse—leveraging computational biology, genomic data modeling, and custom software architectures to solve complex clinical challenges and bridge health disparities.
                </CardDescription>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pioneering precision biostatistics and genomics integration</span>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Institutional Foundation Capabilities */}
        <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-8 sm:p-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
              100%
            </p>
            <p className="text-xs text-brand-cerulean font-bold uppercase tracking-wider">
              Real Clinical Schemas
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No synthetic toy datasets. All training and audits use production-standard structures.
            </p>
          </div>

          <div className="border-y sm:border-y-0 sm:border-x border-slate-200/80 py-6 sm:py-0 space-y-1">
            <p className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
              4 Core
            </p>
            <p className="text-xs text-brand-cerulean font-bold uppercase tracking-wider">
              Specialization Pillars
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Covering Clinical BI, Biostatistics, Custom Tooling, and Workforce Academy.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black font-heading text-slate-900">
              Zero
            </p>
            <p className="text-xs text-brand-cerulean font-bold uppercase tracking-wider">
              Raw Data Retention
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Client data privacy strictly enforced under bilateral NDAs and sandbox execution.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
