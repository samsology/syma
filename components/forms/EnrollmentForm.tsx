'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { submitEnrollmentAction } from '@/app/actions/db-actions';
import { enrollmentSchema } from '@/lib/validation';

type EnrollmentInput = z.infer<typeof enrollmentSchema>;

const programs = [
  { id: 'Data-Analytics-Fundamentals', label: 'Healthcare Data Analytics (NGN 70,000)' },
  { id: 'Python-for-Data-Science', label: 'Python for Data Science (₦120,000)' },
  { id: 'Business-Intelligence', label: 'Business Intelligence (₦150,000)' },
  { id: 'Corporate-Analytics-Training', label: 'Training & Capacity Building (custom pricing)' },
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner (new to analytics or reporting)' },
  { id: 'intermediate', label: 'Intermediate (some spreadsheet, SQL, BI, or research experience)' },
  { id: 'advanced', label: 'Advanced (professional analyst, researcher, or technical practitioner)' },
];

export default function EnrollmentForm({ defaultProgram = '' }: { defaultProgram?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programParam = searchParams?.get('program') || defaultProgram;
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentInput>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      program: programParam,
      experience: '',
      motivation: '',
      honeypot: '',
    },
  });

  const onSubmit = async (data: EnrollmentInput) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log('Enrolling data:', data);
      const res = await submitEnrollmentAction(data);
      if (!res.success) {
        throw new Error(res.error);
      }
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
      <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50">
        {errorMsg && (
          <div
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-650"
            role="alert"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Esther Freeman"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              disabled={loading}
              {...register('fullName')}
              className={cn(
                "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all",
                errors.fullName ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
              )}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@domain.com"
                aria-invalid={errors.email ? 'true' : 'false'}
                disabled={loading}
                {...register('email')}
                className={cn(
                  "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all",
                  errors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                )}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+234..."
                aria-invalid={errors.phone ? 'true' : 'false'}
                disabled={loading}
                {...register('phone')}
                className={cn(
                  "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all",
                  errors.phone ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Program Selection */}
          <div className="space-y-1.5">
            <label htmlFor="program" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Select Program
            </label>
            <select
              id="program"
              aria-invalid={errors.program ? 'true' : 'false'}
              disabled={loading}
              {...register('program')}
              className={cn(
                "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none transition-all",
                errors.program ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
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
              <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {errors.program.message}
              </p>
            )}
          </div>

          {/* Experience Level */}
          <div className="space-y-1.5">
            <label htmlFor="experience" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Prior Data Experience
            </label>
            <select
              id="experience"
              aria-invalid={errors.experience ? 'true' : 'false'}
              disabled={loading}
              {...register('experience')}
              className={cn(
                "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none transition-all",
                errors.experience ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
              )}
            >
              <option value="">-- Choose experience --</option>
              {experienceLevels.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.label}
                </option>
              ))}
            </select>
            {errors.experience && (
              <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {errors.experience.message}
              </p>
            )}
          </div>

          {/* Motivation Statement */}
          <div className="space-y-1.5">
            <label htmlFor="motivation" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Statement of Motivation
            </label>
            <textarea
              id="motivation"
              rows={4}
              placeholder="Tell us about your professional background, why you want to learn data analytics, and how you plan to commit to this track..."
              aria-invalid={errors.motivation ? 'true' : 'false'}
              disabled={loading}
              {...register('motivation')}
              className={cn(
                "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all resize-none",
                errors.motivation ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
              )}
            />
            {errors.motivation && (
              <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {errors.motivation.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit Application <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {isSuccess && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-scale-up text-slate-800">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Submission Successful</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Thank you. We have received your program application. Please check your email inbox for an enrollment receipt and details.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  router.push('/');
                }}
                className="w-full inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/95 px-6 py-3 font-bold text-white transition-all text-sm shadow-md cursor-pointer"
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
