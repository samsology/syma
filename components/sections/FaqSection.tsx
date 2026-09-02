'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

const faqs = [
  {
    q: 'Do I need a coding or math background to enroll?',
    a: 'No prior technical background is required for our foundational tracks. Introduction to Data Literacy and Introduction to Data Analytics start with practical data thinking and spreadsheets before progressing to Python, machine learning, and specialist healthcare analytics.',
  },
  {
    q: 'How does mentor and instructor support work?',
    a: 'Students receive live and recorded lessons, weekly project reviews, and community access with instructor guidance throughout their 6 to 8-week programme.',
  },
  {
    q: 'How are course tuition and payments handled?',
    a: 'All courses have transparent, accessible USD pricing ($19.90 to $69.90). You can enroll directly with immediate access to materials upon cohort start.',
  },
  {
    q: 'What is the capstone project and certificate?',
    a: 'Every course features practical exercises, real-world case studies, and capstone deliverables. Completing your track earns you an official Certificate of Completion to showcase in your portfolio.',
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
