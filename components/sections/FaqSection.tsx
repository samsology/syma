'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'Do I need a coding or mathematics background to enroll?',
    a: 'No prior coding or advanced math background is required for our foundational tracks. Introduction to Data Literacy and Introduction to Data Analytics start with practical data hygiene, spreadsheet principles, and business interpretation before systematically progressing to Python, machine learning, and specialized healthcare analytics.',
  },
  {
    q: 'How does mentor and instructor support work?',
    a: 'Students participate in live interactive cohorts with weekly scheduled code reviews, hands-on lab sessions, and direct community messaging channels. Our senior biostatisticians and engineers provide individualized feedback on every capstone submission.',
  },
  {
    q: 'How are course tuition and payments processed?',
    a: 'All courses feature transparent, one-time tuition (₦19,900 to ₦69,900) with no hidden fees or subscription lock-ins. You receive immediate access to the student LMS portal and curriculum upon cohort start.',
  },
  {
    q: 'What is the capstone project and completion certificate?',
    a: 'Every track concludes with an end-to-end practical project built on real sanitized datasets. Successfully completing and submitting your capstone earns you a verified Syma Tech Certificate of Completion to showcase in your portfolio and resume.',
  },
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="bg-white py-20 lg:py-28 border-t border-slate-200/80">
      <Container>
        <SectionHeading
          badge="Frequently Asked Questions"
          title="Everything You Need to Know"
          description="Clear details on cohort schedules, mentor support, tuition clarity, and project certification."
          align="center"
        />

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={faq.q}
                className={cn(
                  'overflow-hidden rounded-3xl border transition-all duration-300',
                  isOpen
                    ? 'border-brand-cerulean/40 bg-slate-50/60 shadow-sm'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 sm:px-8 text-left font-bold text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading text-base sm:text-lg leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      isOpen
                        ? 'bg-brand-cerulean text-white'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-200/60 px-6 pb-6 pt-4 sm:px-8 text-sm leading-relaxed text-slate-600 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
