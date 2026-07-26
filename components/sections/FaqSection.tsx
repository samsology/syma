'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

const faqs = [
  {
    q: 'Do I need a coding or math background to enroll?',
    a: 'No background is required. Healthcare Data Analytics starts with practical reporting, spreadsheet analysis, query logic, and dashboard thinking before progressing into decision-ready health and business intelligence outputs.',
  },
  {
    q: 'How does mentor support work?',
    a: 'Students receive project feedback, practical guidance, and review support during the cohort so they can keep moving from lessons into portfolio-ready work.',
  },
  {
    q: 'Are there payment plans or installment options?',
    a: 'Yes. Available installment options can be discussed during enrollment or an admissions consultation.',
  },
  {
    q: 'What is the capstone project?',
    a: 'The capstone is a practical project using business-style datasets. You will clean, analyze, visualize, and present insights in a way that mirrors real analytics work.',
  },
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <SectionHeading
          theme="light"
          badge="Common Inquiries"
          title="Frequently Asked Questions"
          description="Clear details on cohort schedules, learning support, and project expectations."
        />

        <div className="mx-auto max-w-4xl space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300"
            >
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold text-slate-900 transition-colors hover:bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/25"
                aria-expanded={openFaq === i}
              >
                <span className="font-heading">{faq.q}</span>
                {openFaq === i ? (
                  <Minus className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
              {openFaq === i && (
                <div className="border-t border-slate-100 px-6 pb-6 pt-4 text-sm leading-relaxed text-slate-500">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
