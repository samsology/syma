'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'Who does Syma Tech Solutions work with?',
    a: 'We work with healthcare organizations, NGOs, government programs, universities, research institutions, businesses, students, and early-career professionals.',
  },
  {
    q: 'Do you still offer professional training?',
    a: 'Yes. Our education arm trains professionals in healthcare analytics, Python, business intelligence, Power BI, SQL, and applied reporting through practical projects.',
  },
  {
    q: 'What consulting services can we request?',
    a: 'You can request healthcare analytics, research analysis, dashboard development, KPI reporting, data strategy, BI implementation, or team capacity building.',
  },
  {
    q: 'Can you support research and healthcare datasets?',
    a: 'Yes. We approach sensitive health and research data with confidentiality, careful data handling, clear documentation, and fit-for-purpose analytical methods.',
  },
];

export default function ContactFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="border-t border-slate-100 pt-16 space-y-12 max-w-4xl mx-auto w-full font-sans">
      <h2 className="text-3xl font-extrabold text-center text-slate-900 font-heading">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-slate-150 bg-white rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-300">
            <button
              type="button"
              onClick={() => toggleFaq(i)}
              className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50/50 transition-colors focus:outline-none cursor-pointer"
            >
              <span className="font-heading text-sm sm:text-base">{faq.q}</span>
              {openFaq === i ? <Minus className="w-4 h-4 text-primary shrink-0" /> : <Plus className="w-4 h-4 text-primary shrink-0" />}
            </button>
            {openFaq === i && (
              <div className="px-6 pb-6 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
