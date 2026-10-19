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
  Building2,
  Layers,
  Calendar,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitConsultationAction } from '@/app/actions/db-actions';
import { consultationSchema } from '@/lib/validation';
import { springSmooth, springCard } from '@/lib/motion';

type ConsultationInput = z.infer<typeof consultationSchema>;

export const consultationTypes = [
  { id: 'healthcare-analytics', label: 'Healthcare Analytics & Clinical BI' },
  { id: 'research-intelligence', label: 'Research Intelligence & Biostatistics' },
  { id: 'business-intelligence', label: 'Digital Health Tooling & Automation' },
  { id: 'training-capacity', label: 'Corporate Team Capacity Building' },
];

function normalizeParamType(val: string | null): string {
  if (!val) return '';
  const lower = val.toLowerCase();
  if (lower.includes('health') || lower.includes('clinic')) return 'healthcare-analytics';
  if (lower.includes('research') || lower.includes('stat') || lower.includes('bio')) return 'research-intelligence';
  if (lower.includes('business') || lower.includes('dash') || lower.includes('tool') || lower.includes('software')) return 'business-intelligence';
  if (lower.includes('train') || lower.includes('capac') || lower.includes('acad') || lower.includes('corp')) return 'training-capacity';
  return '';
}

export default function ConsultationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawParamType = searchParams.get('type');
  const initialType = normalizeParamType(rawParamType);

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Minimum date selectable is tomorrow
  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      companyName: '',
      consultationType: initialType,
      message: '',
      preferredDate: '',
      honeypot: '',
    },
  });

  const selectedType = watch('consultationType');

  // Sync if query param changes dynamically
  useEffect(() => {
    if (initialType && !selectedType) {
      setValue('consultationType', initialType);
    }
  }, [initialType, setValue, selectedType]);

  const onSubmit = async (data: ConsultationInput) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await submitConsultationAction(data);
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

  const selectedTypeObj = consultationTypes.find((t) => t.id === selectedType);

  return (
    <>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-900/5 relative">
        {/* Header indicator when pre-filled from solutions */}
        {selectedTypeObj && (
          <div className="mb-6 p-3.5 rounded-2xl bg-brand-cerulean/10 border border-brand-cerulean/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-brand-cerulean font-bold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Inquiring about: {selectedTypeObj.label}</span>
            </div>
            <button
              type="button"
              onClick={() => setValue('consultationType', '')}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
            >
              Change
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
            <label htmlFor="fullName" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Dr. Esther Freeman"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              disabled={loading}
              {...register('fullName')}
              className={cn(
                "w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none",
                errors.fullName
                  ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10"
              )}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Work Email & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Work Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="esther@hospital.org"
                aria-invalid={errors.email ? 'true' : 'false'}
                disabled={loading}
                {...register('email')}
                className={cn(
                  "w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none",
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10"
                )}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="companyName" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Organization / Facility
              </label>
              <input
                id="companyName"
                type="text"
                placeholder="Apex Specialist Hospital"
                aria-invalid={errors.companyName ? 'true' : 'false'}
                disabled={loading}
                {...register('companyName')}
                className={cn(
                  "w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none",
                  errors.companyName
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10"
                )}
              />
              {errors.companyName && (
                <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {errors.companyName.message}
                </p>
              )}
            </div>
          </div>

          {/* Consultation Type & Preferred Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="consultationType" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Scoping Category
              </label>
              <select
                id="consultationType"
                aria-invalid={errors.consultationType ? 'true' : 'false'}
                disabled={loading}
                {...register('consultationType')}
                className={cn(
                  "w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none",
                  errors.consultationType
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10"
                )}
              >
                <option value="">-- Choose Technical Scope --</option>
                {consultationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.consultationType && (
                <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {errors.consultationType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="preferredDate" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Preferred Date
              </label>
              <input
                id="preferredDate"
                type="date"
                min={minDate}
                aria-invalid={errors.preferredDate ? 'true' : 'false'}
                disabled={loading}
                {...register('preferredDate')}
                className={cn(
                  "w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none",
                  errors.preferredDate
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10"
                )}
              />
              {errors.preferredDate && (
                <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {errors.preferredDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Scoping Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Project & Technical Context
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Outline your primary data bottlenecks, active systems (e.g., MySQL, EHR, Excel, REDCap), and target deliverables..."
              aria-invalid={errors.message ? 'true' : 'false'}
              disabled={loading}
              {...register('message')}
              className={cn(
                "w-full bg-slate-50/70 border rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none resize-none",
                errors.message
                  ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-slate-200 focus:border-brand-cerulean focus:ring-4 focus:ring-brand-cerulean/10"
              )}
            />
            {errors.message && (
              <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
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
                <span>Submitting Technical Scope...</span>
              </>
            ) : (
              <>
                <span>Confirm Scoping Booking</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          {/* Trust guarantee footer */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Please do not include sensitive or confidential data in this form.</span>
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
                  {emailSent ? 'Consultation Confirmed' : 'Request Logged'}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {emailSent
                    ? 'Thank you. We have logged your consultation schedule. Please check your email inbox for scoping call confirmation and meeting link details.'
                    : 'Thank you. Your consultation request has been successfully recorded. Our team will review it and follow up as soon as possible.'}
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
