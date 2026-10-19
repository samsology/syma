'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  User,
  Mail,
  FileText,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitContactAction } from '@/app/actions/db-actions';
import { contactSchema } from '@/lib/validation';
import { springCard } from '@/lib/motion';

type ContactInput = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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
      const res = await submitContactAction(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      setEmailSent(Boolean(res.data.emailSent));
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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-900/5 relative">
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
            <div
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-400" /> Your Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Dr. Samuel Adeyemi"
              disabled={loading}
              {...register('name')}
              className={cn(
                'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none',
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
              )}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Work / Professional Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="samuel@hospital.org"
              disabled={loading}
              {...register('email')}
              className={cn(
                'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none',
                errors.email
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
              )}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label
              htmlFor="subject"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Subject Line
            </label>
            <input
              id="subject"
              type="text"
              placeholder="Clinical Analytics Scope / Biostatistical Review / Academy Inquiry"
              disabled={loading}
              {...register('subject')}
              className={cn(
                'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none',
                errors.subject
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
              )}
            />
            {errors.subject && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.subject.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label
              htmlFor="message"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Message & Inquiry Details
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Describe your health system challenges, research dataset scope, team training needs, or general inquiries..."
              disabled={loading}
              {...register('message')}
              className={cn(
                'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none resize-none',
                errors.message
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
              )}
            />
            {errors.message && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-cerulean py-4 font-bold text-white shadow-xl shadow-brand-cerulean/25 hover:bg-brand-cerulean/95 disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer select-none text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <span>Send Inbound Message</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Please do not include sensitive or confidential information in this form.</span>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isSubmitted && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={springCard}
              className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-2xl text-slate-800"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
                  {emailSent ? 'Message Delivered' : 'Inquiry Received'}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {emailSent
                    ? 'Thank you for reaching out. We have received your message and sent a confirmation receipt to your inbox. Our team will follow up as soon as possible.'
                    : 'Thank you for reaching out. We have logged your inquiry securely. Our partnerships team will review your message and reply directly.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full inline-flex items-center justify-center rounded-2xl bg-brand-cerulean hover:bg-brand-cerulean/95 px-6 py-3.5 font-bold text-white transition-all text-sm shadow-lg shadow-brand-cerulean/20 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
