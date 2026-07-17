'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { submitEnrollmentAction } from '@/app/actions/db-actions';

// 1. Zod Validation Schema
const enrollmentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
  program: z.string().min(1, 'Please select a program'),
  experience: z.string().min(1, 'Please select your experience level'),
  motivation: z.string().min(15, 'Motivation statement must be at least 15 characters'),
  honeypot: z.string().optional(),
});

type EnrollmentInput = z.infer<typeof enrollmentSchema>;

const programs = [
  { id: 'Data-Analytics-Fundamentals', label: 'Healthcare Data Analytics (NGN 70,000)' },
  { id: 'Python-for-Data-Science', label: 'Python for Data Science (₦120,000)' },
  { id: 'Business-Intelligence', label: 'Business Intelligence (₦150,000)' },
  { id: 'Corporate-Analytics-Training', label: 'Training & Capacity Building (custom pricing)' },
];

const paidProgramIds = new Set([
  'Data-Analytics-Fundamentals',
  'Python-for-Data-Science',
  'Business-Intelligence',
]);

const experienceLevels = [
  { id: 'beginner', label: 'Beginner (new to analytics or reporting)' },
  { id: 'intermediate', label: 'Intermediate (some spreadsheet, SQL, BI, or research experience)' },
  { id: 'advanced', label: 'Advanced (professional analyst, researcher, or technical practitioner)' },
];

export default function EnrollmentForm({ defaultProgram = '' }: { defaultProgram?: string }) {
  const router = useRouter();
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
      program: defaultProgram,
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

      if (paidProgramIds.has(data.program)) {
        const paymentRes = await fetch('/api/payments/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enrollmentId: res.data.id,
            email: data.email,
            fullName: data.fullName,
            program: data.program,
          }),
        });

        const paymentPayload = await paymentRes.json();

        if (!paymentRes.ok || !paymentPayload.success) {
          throw new Error(paymentPayload.error || 'Unable to start payment.');
        }

        router.push(paymentPayload.data.authorizationUrl);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="text-center py-12 px-6 max-w-lg mx-auto space-y-6"
        role="alert"
        aria-live="assertive"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 animate-bounce" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
          Application Received
        </h2>
        <p className="text-slate-500 leading-relaxed text-sm">
          Thank you for applying to Syma Tech Solutions. Our team will review your submission and contact you with the next steps.
        </p>
        <div className="pt-4">
          <Link href="/" className="inline-flex items-center">
            <Button variant="primary">
              Return to Homepage <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
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
          {loading ? 'Preparing Secure Payment...' : 'Submit Application & Continue'}
        </Button>
      </form>
    </div>
  );
}



