'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  ChevronRight,
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitEnrollmentAction } from '@/app/actions/db-actions';
import { enrollmentSchema } from '@/lib/validation';
import { OFFICIAL_COURSES } from '@/lib/courses/catalog';
import { springCard } from '@/lib/motion';

type EnrollmentInput = z.infer<typeof enrollmentSchema>;

export const programs = [
  ...OFFICIAL_COURSES.map((c) => ({
    id: c.slug,
    label: `${c.number}. ${c.title} — ${c.duration} (${c.price})`,
  })),
  { id: 'Corporate-Analytics-Training', label: 'Institutional & Team Training (Custom Scoping)' },
];

export const experienceLevels = [
  { id: 'beginner', label: 'Beginner — New to data querying and analytics' },
  { id: 'intermediate', label: 'Intermediate — Some spreadsheet, SQL, or BI experience' },
  { id: 'advanced', label: 'Advanced — Working analyst, researcher, or clinician' },
];

function normalizeProgramId(param: string | null | undefined): string {
  if (!param) return '';
  const lower = param.toLowerCase();
  const match = programs.find((p) => p.id.toLowerCase() === lower);
  if (match) return match.id;
  if (lower.includes('literacy')) return 'introduction-to-data-literacy';
  if (lower.includes('science') || lower.includes('python')) return 'introduction-to-data-science';
  if (lower.includes('health')) return 'healthcare-analytics';
  if (lower.includes('analytics')) return 'introduction-to-data-analytics';
  return param;
}

export default function EnrollmentForm({ defaultProgram = '' }: { defaultProgram?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawParam = searchParams?.get('program') || defaultProgram;
  const initialProgram = normalizeProgramId(rawParam);

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EnrollmentInput>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      program: initialProgram,
      experience: '',
      motivation: '',
      honeypot: '',
    },
  });

  const selectedProgram = watch('program');

  // Sync if query param changes dynamically
  useEffect(() => {
    if (initialProgram && !selectedProgram) {
      setValue('program', initialProgram);
    }
  }, [initialProgram, setValue, selectedProgram]);

  const selectedProgramObj = programs.find((p) => p.id === selectedProgram);

  const onSubmit = async (data: EnrollmentInput) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await submitEnrollmentAction(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      setEmailSent(Boolean(res.data.emailSent));
      setIsSuccess(true);
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
        {/* Pre-fill Banner */}
        {selectedProgramObj && (
          <div className="mb-6 p-3.5 rounded-2xl bg-brand-cerulean/10 border border-brand-cerulean/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-brand-cerulean font-bold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Applying for: {selectedProgramObj.label.split('—')[0]}</span>
            </div>
            <button
              type="button"
              onClick={() => setValue('program', '')}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
            >
              Change Track
            </button>
          </div>
        )}

        {errorMsg && (
          <div
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-start gap-2.5"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

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

          {/* Full Name */}
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Esther Freeman"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              disabled={loading}
              {...register('fullName')}
              className={cn(
                'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none',
                errors.fullName
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
              )}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="esther@example.com"
                aria-invalid={errors.email ? 'true' : 'false'}
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

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number (WhatsApp)
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+234..."
                aria-invalid={errors.phone ? 'true' : 'false'}
                disabled={loading}
                {...register('phone')}
                className={cn(
                  'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none',
                  errors.phone
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Program Selection */}
          <div className="space-y-2">
            <label
              htmlFor="program"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Selected Program
            </label>
            <select
              id="program"
              aria-invalid={errors.program ? 'true' : 'false'}
              disabled={loading}
              {...register('program')}
              className={cn(
                'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none',
                errors.program
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
              )}
            >
              <option value="">-- Choose a course --</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {errors.program && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.program.message}
              </p>
            )}
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label
              htmlFor="experience"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Prior Data Background
            </label>
            <select
              id="experience"
              aria-invalid={errors.experience ? 'true' : 'false'}
              disabled={loading}
              {...register('experience')}
              className={cn(
                'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none',
                errors.experience
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
              )}
            >
              <option value="">-- Choose your current level --</option>
              {experienceLevels.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.label}
                </option>
              ))}
            </select>
            {errors.experience && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.experience.message}
              </p>
            )}
          </div>

          {/* Motivation Statement */}
          <div className="space-y-2">
            <label
              htmlFor="motivation"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Motivation & Career Goal
            </label>
            <textarea
              id="motivation"
              rows={4}
              placeholder="Tell us about your background, what you hope to build or achieve in this track, and your commitment to weekly labs..."
              aria-invalid={errors.motivation ? 'true' : 'false'}
              disabled={loading}
              {...register('motivation')}
              className={cn(
                'w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none resize-none',
                errors.motivation
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10'
              )}
            />
            {errors.motivation && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.motivation.message}
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
                <span>Submitting Cohort Application...</span>
              </>
            ) : (
              <>
                <span>Submit Application</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Instant confirmation. Student LMS continuation link delivered by email.</span>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isSuccess && (
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
                  {emailSent ? 'Application Confirmed' : 'Application Received'}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {emailSent
                    ? 'Thank you! We have logged your application. Please check your email inbox for an enrollment receipt and your secure registration continuation link.'
                    : 'Thank you! We have securely recorded your application. Our admissions coordinator will follow up with you directly within one business day.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    router.push('/');
                  }}
                  className="w-full inline-flex items-center justify-center rounded-2xl bg-brand-cerulean hover:bg-brand-cerulean/95 px-6 py-3.5 font-bold text-white transition-all text-sm shadow-lg shadow-brand-cerulean/20 cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
