'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardTitle } from '@/components/ui/Card';
import { Eyebrow } from '@/components/ui/Eyebrow';

const articles = [
  {
    category: 'Healthcare',
    title: 'AI and Predictive Modeling in African Public Health Systems',
    desc: 'How standardized outpatient databases are mapping disease vectors and improving local health resources.',
    time: '5 min read',
    date: 'July 28, 2026',
    author: 'Samuel Johnson',
  },
  {
    category: 'Power BI',
    title: 'Building Decision-Ready KPI Frameworks for Hospital Directors',
    desc: 'A checklist for auditing clinic operations, mapping reporting metrics, and designing dashboard layouts.',
    time: '4 min read',
    date: 'July 20, 2026',
    author: 'Samuel Johnson',
  },
  {
    category: 'Bioinformatics',
    title: 'Exploring Genomic Cohort Datasets: Practical Computational Genomics',
    desc: 'An introduction to parsing sequencing variant files and computing allele frequencies using Python libraries.',
    time: '7 min read',
    date: 'July 15, 2026',
    author: 'Samuel Johnson',
  },
];

export function InsightsSection() {
  return (
    <section className="bg-white py-20 lg:py-28 border-b border-slate-200/70">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <Eyebrow variant="yellow">Knowledge Base & Research</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Technical Briefs & Biostatistics Insights
            </h2>
            <p className="mt-4 text-base text-slate-600 font-sans leading-relaxed">
              Articles and practical walkthroughs covering clinical databases, epidemiological models, SQL, and bioinformatics.
            </p>
          </div>
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-cerulean hover:text-brand-navy transition-colors shrink-0 group"
          >
            <span>View All Insights Articles</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <Card
              key={art.title}
              hoverEffect="spring"
              className="flex flex-col justify-between p-6 border-slate-200/80 bg-white"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                  <span className="text-brand-cerulean font-semibold">{art.category}</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {art.time}
                  </span>
                </div>

                <CardTitle className="text-lg font-bold text-slate-900 font-heading mt-4 leading-snug">
                  {art.title}
                </CardTitle>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans line-clamp-3">
                  {art.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">By {art.author}</span>
                <Link
                  href="/insights"
                  className="font-bold text-brand-cerulean hover:text-brand-navy inline-flex items-center gap-0.5 group"
                >
                  <span>Read Guide</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
