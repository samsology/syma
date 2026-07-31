'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, BookOpen, Clock, ChevronRight, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const categories = ['All', 'Healthcare', 'Research', 'AI', 'Power BI', 'SQL', 'Bioinformatics'];

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
  {
    category: 'SQL',
    title: 'Optimizing SQL Queries for Outpatient EHR Database Performance',
    desc: 'Practical indexing tips and database schema optimizations for handling millions of outpatient clinical records.',
    time: '6 min read',
    date: 'July 02, 2026',
    author: 'Oluyori Gabriel',
  },
  {
    category: 'Research',
    title: 'Biostatistics in Epidemiology Studies: Core Analytics Foundations',
    desc: 'Explaining confidence intervals, model regression, and variance tracking for peer-reviewed research papers.',
    time: 'June 24, 2026',
    author: 'Samuel Johnson',
  },
  {
    category: 'AI',
    title: 'Data Maturity Models: Tracing the Phased Strategic Development Pipeline',
    desc: 'A comprehensive roadmap for taking enterprise teams from basic spreadsheets to automated machine learning model runs.',
    time: '5 min read',
    date: 'June 18, 2026',
    author: 'Oluyori Gabriel',
  },
];

export default function Insights() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === 'All' || art.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      {/* Hero */}
      <section className="py-20 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white text-center">
        <Container className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-primary/5 text-xs font-bold text-primary shadow-sm">
            Insights & Library
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Knowledge Base & Resources
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-500 max-w-2xl mx-auto font-normal">
            Articles, guides, and technical walkthroughs covering clinical databases, research models, SQL, and bioinformatics.
          </p>
        </Container>
      </section>

      {/* Filter and Content section */}
      <section className="py-16 bg-white">
        <Container className="space-y-12">
          {/* Controls: Search and Categories */}
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-slate-100 pb-8">
            {/* Category Tags */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                      : 'border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-900 bg-slate-50/30'
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
                placeholder="Search resources..."
                className="w-full min-h-[38px] pl-10 pr-4 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Grid of Articles */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((art) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={art.title}
                  className="h-full"
                >
                  <Card
                    hoverEffect="lift"
                    className="flex flex-col justify-between border-slate-100 bg-white p-6 shadow-sm h-full hover:border-slate-200 relative"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>{art.category}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {art.time}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 leading-snug">{art.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {art.desc}
                      </CardDescription>
                    </div>

                    <div className="border-t border-slate-50 pt-4 mt-6 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        <span className="block font-semibold text-slate-700">By {art.author}</span>
                        <span>{art.date}</span>
                      </div>
                      <button className="text-xs font-bold text-primary hover:text-secondary inline-flex items-center gap-0.5 group cursor-pointer">
                        Read Guide <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredArticles.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 space-y-2">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-semibold">No articles found matching filters.</p>
                <p className="text-xs">Try clearing search terms or selecting another category.</p>
              </div>
            )}
          </motion.div>
        </Container>
      </section>

      {/* Newsletter Signup Form */}
      <section className="py-20 bg-slate-50/50 border-t border-slate-100">
        <Container className="max-w-4xl text-center space-y-6">
          <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5 text-secondary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Subscribe to our Health & Research Intelligence Feed
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Get monthly technical briefs, Excel pipelines, and bioinformatics study summaries sent directly to your inbox.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your professional email"
              className="flex-1 min-h-[42px] px-4 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none bg-white shadow-sm"
              required
            />
            <Button type="submit" variant="primary" className="h-[42px] px-6">
              Subscribe
            </Button>
          </form>
        </Container>
      </section>
    </div>
  );
}
