'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Clock,
  ChevronRight,
  Mail,
  X,
  CheckCircle2,
  Info,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';

type Article = {
  id: string;
  category: string;
  badgeVariant: 'cerulean' | 'coral' | 'navy' | 'yellow' | 'default';
  title: string;
  desc: string;
  fullOverview: string;
  keyTakeaways: string[];
  time: string;
  date: string;
  author: string;
  authorRole: string;
  relatedLink: string;
  relatedLabel: string;
};

const categories = [
  'All',
  'Healthcare',
  'Biostatistics',
  'Power BI',
  'SQL',
  'Bioinformatics',
  'AI & Strategy',
];

const articles: Article[] = [
  {
    id: 'ai-african-health',
    category: 'Healthcare',
    badgeVariant: 'cerulean',
    title: 'AI and Predictive Modeling in African Public Health Systems',
    desc: 'How standardized outpatient databases are mapping regional disease vectors and accelerating local healthcare resource allocation.',
    fullOverview:
      'Predictive epidemiological models are only as robust as the raw facility-level records feeding them. In this technical brief, we analyze how standardizing outpatient diagnostic codes across secondary care hospitals eliminates reporting lag, allowing regional health authorities to identify seasonal malaria and respiratory surges weeks before traditional sentinel alerts.',
    keyTakeaways: [
      'Standardized diagnostic codelists (ICD-11 / custom subsets) prevent multi-facility naming discrepancies.',
      'Automated nightly data transformations identify variance spikes across patient catchments.',
      'Supervised regression models trained on 3-year historical queues predict bed occupancy with 88%+ accuracy.',
    ],
    time: '5 min read',
    date: 'July 28, 2026',
    author: 'Samuel Johnson',
    authorRole: 'Lead Biostatistician & Systems Architect',
    relatedLink: '/solutions',
    relatedLabel: 'Explore Healthcare Analytics Solutions',
  },
  {
    id: 'powerbi-hospital-kpis',
    category: 'Power BI',
    badgeVariant: 'yellow',
    title: 'Building Decision-Ready KPI Frameworks for Hospital Directors',
    desc: 'A checklist for auditing clinic operations, mapping reporting metrics, and designing role-tailored dashboard hierarchies.',
    fullOverview:
      'Most hospital executive dashboards fail because they overload medical directors with raw transactional tables rather than decision-oriented indicators. This guide details a top-down information hierarchy separating operational throughput (bed wait times, triage delays) from clinical outcomes and revenue metrics.',
    keyTakeaways: [
      'Implement the 5-second rule: An administrator should understand urgent anomalies within 5 seconds of opening the screen.',
      'Separate executive summaries from operational nurse-lead drilldowns using row-level security (RLS).',
      'Replace static spreadsheets with automated daily refreshes connecting PostgreSQL or MySQL hospital backends.',
    ],
    time: '4 min read',
    date: 'July 20, 2026',
    author: 'Samuel Johnson',
    authorRole: 'Lead Biostatistician & Systems Architect',
    relatedLink: '/programs/healthcare-analytics',
    relatedLabel: 'Healthcare Analytics Programme',
  },
  {
    id: 'bioinformatics-cohorts',
    category: 'Bioinformatics',
    badgeVariant: 'coral',
    title: 'Exploring Genomic Cohort Datasets: Practical Computational Genomics',
    desc: 'An introduction to parsing high-throughput sequencing variant files and computing population allele frequencies using Python.',
    fullOverview:
      'Next-generation sequencing produces massive Variant Call Format (VCF) files that overwhelm traditional spreadsheet tools. We step through parsing multi-sample VCF archives using BioPython and Pandas, filtering low-quality calls, and calculating minor allele frequencies across population sub-cohorts.',
    keyTakeaways: [
      'Stream large genomic archives using chunked iterators to prevent memory exhaustion.',
      'Calculate population allele frequencies and transition/transversion (Ti/Tv) ratios with validated formulas.',
      'Export clean, annotated genomic tables directly into relational schemas for downstream clinical interpretation.',
    ],
    time: '7 min read',
    date: 'July 15, 2026',
    author: 'Samuel Johnson',
    authorRole: 'Lead Biostatistician & Systems Architect',
    relatedLink: '/programs/introduction-to-data-science',
    relatedLabel: 'Data Science Specialization',
  },
  {
    id: 'sql-ehr-performance',
    category: 'SQL',
    badgeVariant: 'navy',
    title: 'Optimizing SQL Queries for Outpatient EHR Database Performance',
    desc: 'Practical indexing strategies, window functions, and database partitioning for handling millions of outpatient clinical records.',
    fullOverview:
      'When clinical databases grow beyond millions of encounter rows, poorly indexed queries cause reporting timeouts and freeze administrative workstations. This walkthrough demonstrates B-tree and composite indexing strategies, CTE restructuring, and partitioning by fiscal quarter.',
    keyTakeaways: [
      'Use composite indices on (facility_id, encounter_date) to accelerate temporal patient lookups.',
      'Replace costly subqueries with optimized window functions (ROW_NUMBER(), LAG()) for patient re-admission tracking.',
      'Implement read-replica database pools to isolate analytical queries from active patient intake workflows.',
    ],
    time: '6 min read',
    date: 'July 02, 2026',
    author: 'Oluyori Gabriel',
    authorRole: 'Head of Operations & Analytics Engineering',
    relatedLink: '/programs/introduction-to-data-analytics',
    relatedLabel: 'Data Analytics Programme',
  },
  {
    id: 'biostatistics-epidemiology',
    category: 'Biostatistics',
    badgeVariant: 'coral',
    title: 'Biostatistics in Epidemiology Studies: Core Analytics Foundations',
    desc: 'Explaining confidence intervals, multivariable logistic regression, and survival analysis for peer-reviewed research papers.',
    fullOverview:
      'Publishing clinical research requires rigorous adherence to reporting guidelines such as STROBE and CONSORT. In this brief, we break down multivariable model building, testing for collinearity, selecting appropriate link functions, and visualizing hazard ratios with high-DPI forest plots.',
    keyTakeaways: [
      'Always test for multicollinearity using Variance Inflation Factors (VIF) prior to regression fitting.',
      'Report absolute risk differences alongside odds ratios (OR) to prevent overstating clinical effect sizes.',
      'Format Kaplan-Meier survival curves with numbers at risk at every milestone to ensure editorial compliance.',
    ],
    time: '8 min read',
    date: 'June 24, 2026',
    author: 'Samuel Johnson',
    authorRole: 'Lead Biostatistician & Systems Architect',
    relatedLink: '/solutions',
    relatedLabel: 'Research Intelligence Scoping',
  },
  {
    id: 'data-maturity-roadmap',
    category: 'AI & Strategy',
    badgeVariant: 'cerulean',
    title: 'Data Maturity Models: Tracing the Phased Strategic Development Pipeline',
    desc: 'A comprehensive roadmap for taking healthcare teams from basic spreadsheets to automated machine learning model runs.',
    fullOverview:
      'Organizations cannot jump directly from manual Excel files to artificial intelligence without establishing foundational data hygiene and automated ETL pipelines. We outline our 4-stage maturity framework: Descriptive Audits -> Diagnostic Warehousing -> Real-time Intelligence -> Predictive Clinical Support.',
    keyTakeaways: [
      'Stage 1 focuses on eliminating duplicate entry points and establishing standardized data dictionaries.',
      'Stage 2 centralizes reporting into an automated warehouse with governed access control.',
      'Only once pipelines are 99% reliable should teams invest in predictive machine learning models.',
    ],
    time: '5 min read',
    date: 'June 18, 2026',
    author: 'Oluyori Gabriel',
    authorRole: 'Head of Operations & Analytics Engineering',
    relatedLink: '/consultation',
    relatedLabel: 'Book Strategy Scoping Call',
  },
];

export function InsightsContent() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      art.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Biostatistics' && art.category === 'Biostatistics') ||
      (selectedCategory === 'AI & Strategy' && art.category === 'AI & Strategy');

    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <section className="py-16 lg:py-24 bg-white">
        <Container className="space-y-12">
          {/* Controls: Search and Categories */}
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-slate-200/80 pb-8">
            {/* Category Tags */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-brand-cerulean border-brand-cerulean text-white shadow-md shadow-brand-cerulean/20'
                      : 'border-slate-200/90 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-slate-50/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles & authors..."
                className="w-full min-h-[42px] pl-10 pr-4 rounded-2xl border border-slate-200/90 text-sm bg-slate-50/70 focus:bg-white focus:border-brand-cerulean focus:outline-none focus:ring-4 focus:ring-brand-cerulean/10 transition-all text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Grid of Articles */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((art) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  key={art.id}
                  className="h-full flex"
                >
                  <Card
                    hoverEffect="spring"
                    className="w-full flex flex-col justify-between border-slate-200/90 bg-white p-7 rounded-3xl shadow-xs hover:border-brand-cerulean/40 hover:shadow-xl transition-all relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Category + Reading Time */}
                      <div className="flex items-center justify-between text-xs">
                        <Eyebrow variant={art.badgeVariant}>{art.category}</Eyebrow>
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-brand-cerulean" />
                          {art.time}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <CardTitle className="text-xl font-bold font-heading text-slate-900 leading-snug">
                        {art.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                        {art.desc}
                      </CardDescription>
                    </div>

                    {/* Footer Row */}
                    <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500">
                        <span className="block font-bold text-slate-900">{art.author}</span>
                        <span className="text-[10px] text-slate-400">{art.date}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveArticle(art)}
                        className="text-xs font-bold text-brand-cerulean hover:text-brand-navy inline-flex items-center gap-1 group cursor-pointer"
                      >
                        <span>Read Brief</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredArticles.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 space-y-3">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-base font-bold text-slate-700">No articles found matching filters.</p>
                <p className="text-xs text-slate-500">
                  Try clearing search keywords or choosing another category tag.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-bold text-brand-cerulean hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </motion.div>
        </Container>
      </section>

      {/* Article Detail Reading Modal */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-slate-900 shadow-2xl relative space-y-6 my-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close article modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="space-y-3 pr-8">
                <div className="flex items-center gap-2">
                  <Eyebrow variant={activeArticle.badgeVariant}>{activeArticle.category}</Eyebrow>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeArticle.time} • {activeArticle.date}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 leading-snug">
                  {activeArticle.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <User className="w-3.5 h-3.5 text-brand-cerulean" />
                  <span className="font-bold text-slate-800">{activeArticle.author}</span>
                  <span>({activeArticle.authorRole})</span>
                </div>
              </div>

              {/* Full Overview Body */}
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-sans border-t border-slate-100 pt-4">
                <p>{activeArticle.fullOverview}</p>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-cerulean" /> Key Methodological Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {activeArticle.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Related Action & Close */}
              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href={activeArticle.relatedLink}
                  onClick={() => setActiveArticle(null)}
                  className="text-xs font-bold text-brand-cerulean hover:text-brand-navy inline-flex items-center gap-1.5"
                >
                  <span>{activeArticle.relatedLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveArticle(null)}
                  className="w-full sm:w-auto text-xs"
                >
                  Close Article
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Publication Channel Notice */}
      <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <Container className="max-w-3xl text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center mx-auto border border-brand-cerulean/15">
            <Mail className="w-6 h-6 text-brand-cerulean" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-brand-cerulean bg-brand-cerulean/10 px-3 py-1 rounded-full border border-brand-cerulean/20 inline-block">
              Editorial Briefing In Preparation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              The Health Intelligence Brief
            </h2>
          </div>

          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Monthly technical summaries on biostatistics, clinical dashboard schemas, and SQL optimization are currently in editorial preparation. Dedicated email subscriptions will open ahead of our inaugural publication.
          </p>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs text-slate-600 flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-brand-cerulean shrink-0" />
            <span>Email subscription channel will open alongside our first release. Explore our active technical guides above.</span>
          </div>
        </Container>
      </section>
    </>
  );
}
