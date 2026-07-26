'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { submitContactAction } from '@/app/actions/db-actions';
import { contactSchema } from '@/lib/validation';

type ContactInput = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
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
      reset();
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
            <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Samuel Johnson"
              disabled={loading}
              {...register('name')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary transition-colors"
            />
            {errors.name && <p className="text-xs text-red-400 font-semibold">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@domain.com"
              disabled={loading}
              {...register('email')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary transition-colors"
            />
            {errors.email && <p className="text-xs text-red-400 font-semibold">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Subject Line
            </label>
            <input
              id="subject"
              type="text"
              placeholder="Healthcare analytics / Research support / BI training"
              disabled={loading}
              {...register('subject')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-secondary transition-colors"
            />
            {errors.subject && <p className="text-xs text-red-400 font-semibold">{errors.subject.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Tell us what you are trying to solve, build, study, or improve..."
              disabled={loading}
              {...register('message')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-secondary transition-colors resize-none"
            />
            {errors.message && <p className="text-xs text-red-400 font-semibold">{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer"
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
      </div>

      {isSubmitted && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-green-500">Message Sent</h3>
            <p className="text-green-400 font-semibold leading-relaxed text-sm">
              Thank you, check your email for further action
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full inline-flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 px-6 py-3 font-bold text-white transition-all text-sm shadow-md shadow-green-600/10 cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
