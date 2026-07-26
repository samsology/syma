'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
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
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg shadow-slate-100/50">
        <h2 className="text-2xl font-extrabold text-slate-900 font-heading mb-2">Apply for Professional Training</h2>
        <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">
          Tell us which program fits your goals and how you plan to use analytics in healthcare, research, business, or professional work.
        </p>

        {errorMsg && (
          <div
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700"
            role="alert"
          >
            {errorMsg}
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
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Samuel Johnson"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              disabled={loading}
              {...register('fullName')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all",
                errors.fullName ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
              )}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@domain.com"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={loading}
                {...register('email')}
                className={cn(
                  "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all",
                  errors.email ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
                )}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
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
                placeholder="+1 (555) 123-4567"
                aria-invalid={errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                disabled={loading}
                {...register('phone')}
                className={cn(
                  "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all",
                  errors.phone ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
                )}
              />
              {errors.phone && (
                <p id="phone-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
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
              aria-describedby={errors.program ? 'program-error' : undefined}
              disabled={loading}
              {...register('program')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:bg-white transition-all",
                errors.program ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
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
              <p id="program-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
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
              aria-describedby={errors.experience ? 'experience-error' : undefined}
              disabled={loading}
              {...register('experience')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:bg-white transition-all",
                errors.experience ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
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
              <p id="experience-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
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
              aria-describedby={errors.motivation ? 'motivation-error' : undefined}
              disabled={loading}
              {...register('motivation')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all resize-none",
                errors.motivation ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
              )}
            />
            {errors.motivation && (
              <p id="motivation-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {errors.motivation.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full font-bold shadow-md shadow-primary/10 mt-2"
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </form>
      </div>

      {isSuccess && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-green-600">Submission Successful</h3>
            <p className="text-green-700 font-semibold leading-relaxed text-sm">
              Thank you, check your email for further action
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  router.push('/');
                }}
                className="w-full inline-flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 px-6 py-3 font-bold text-white transition-all text-sm shadow-md shadow-green-600/10"
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



