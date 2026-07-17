'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronRight, Loader2, Mail, Phone, MapPin, Plus, Minus } from 'lucide-react';
import { submitContactAction } from '@/app/actions/db-actions';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().optional(),
});

type ContactInput = z.infer<typeof contactSchema>;

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

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      honeypot: '',
    },
  });

  const onSubmit = async (data: ContactInput) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log('Contact message submitted:', data);
      const res = await submitContactAction(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      setIsSubmitted(true);
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative bg-slate-950 text-white min-h-screen py-16 lg:py-24">
      {/* Glow highlight */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-xs font-semibold text-secondary">
            Contact Syma Tech
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Start a Conversation About Evidence, Insight, and Impact
          </h1>
          <p className="text-slate-400 text-lg">
            Reach out about healthcare analytics, research support, business intelligence, dashboards, training, partnerships, or consulting.
          </p>
        </div>

        {/* Form and Contact Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Contact Channels</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Reach out directly by email or phone. We respond to consulting, training, research, and partnership inquiries.
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-semibold mb-0.5">Headquarters</strong>
                  <span>Kaduna State, Nigeria</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-semibold mb-0.5">Consulting & Inquiries</strong>
                  <a href="tel:+2347026954912" className="hover:text-white transition-colors">+234 702 695 4912</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-semibold mb-0.5">Email</strong>
                  <a href="mailto:symatechsolution@gmail.com" className="hover:text-white transition-colors">symatechsolution@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="border-t border-slate-900 pt-6 space-y-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">Business Hours</span>
              <p className="text-sm text-slate-400">Monday &ndash; Friday, 8:00 AM &ndash; 10:00 PM Central Time</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Message Sent Successfully</h3>
                <p className="text-slate-400 text-sm">
                  We have received your message. A Syma Tech Solutions representative will reply as soon as possible.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary hover:bg-secondary/90 px-6 py-2.5 font-bold text-white transition-all text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot spam trap */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    {...register('honeypot')}
                  />
                </div>
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Samuel Johnson"
                    {...register('name')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                  {errors.name && <p className="text-xs text-red-400 font-semibold">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@domain.com"
                    {...register('email')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                  {errors.email && <p className="text-xs text-red-400 font-semibold">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Subject Line
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="Healthcare analytics / Research support / BI training"
                    {...register('subject')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                  {errors.subject && <p className="text-xs text-red-400 font-semibold">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us what you are trying to solve, build, study, or improve..."
                    {...register('message')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-secondary transition-colors resize-none"
                  />
                  {errors.message && <p className="text-xs text-red-400 font-semibold">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending message...
                    </>
                  ) : (
                    <>
                      Send Message <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-slate-900 pt-16 space-y-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-800/80 bg-slate-900/10 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white hover:bg-slate-900/30 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <Minus className="w-4 h-4 text-secondary" /> : <Plus className="w-4 h-4 text-secondary" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-900/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


