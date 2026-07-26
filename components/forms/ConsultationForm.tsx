'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { submitConsultationAction } from '@/app/actions/db-actions';

import { consultationSchema } from '@/lib/validation';

type ConsultationInput = z.infer<typeof consultationSchema>;

const consultationTypes = [
  { id: 'healthcare-analytics', label: 'Healthcare Analytics' },
  { id: 'research-intelligence', label: 'Research Intelligence' },
  { id: 'business-intelligence', label: 'Business Intelligence & Dashboards' },
  { id: 'training-capacity', label: 'Training & Capacity Building' },
];

export default function ConsultationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      companyName: '',
      consultationType: '',
      message: '',
      preferredDate: '',
      honeypot: '',
    },
  });

  const onSubmit = async (data: ConsultationInput) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log('Booking consultation:', data);
      const res = await submitConsultationAction(data);
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
        <h2 className="text-2xl font-extrabold text-slate-900 font-heading mb-2">Schedule a Consultation</h2>
        <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">
          Share the challenge, dataset, program, or decision system you want to improve so we can prepare a focused conversation.
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

          {/* Email & Organization Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
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
              <label htmlFor="companyName" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Organization Name
              </label>
              <input
                id="companyName"
                type="text"
                placeholder="Your organization"
                aria-invalid={errors.companyName ? 'true' : 'false'}
                aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                disabled={loading}
                {...register('companyName')}
                className={cn(
                  "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all",
                  errors.companyName ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
                )}
              />
              {errors.companyName && (
                <p id="companyName-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
                  {errors.companyName.message}
                </p>
              )}
            </div>
          </div>

          {/* Consultation Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="consultationType" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Consultation Type
              </label>
              <select
                id="consultationType"
                aria-invalid={errors.consultationType ? 'true' : 'false'}
                aria-describedby={errors.consultationType ? 'consultationType-error' : undefined}
                disabled={loading}
                {...register('consultationType')}
                className={cn(
                  "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:bg-white transition-all",
                  errors.consultationType ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
                )}
              >
                <option value="">-- Choose option --</option>
                {consultationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.consultationType && (
                <p id="consultationType-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
                  {errors.consultationType.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="preferredDate" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Preferred Date
              </label>
              <input
                id="preferredDate"
                type="date"
                aria-invalid={errors.preferredDate ? 'true' : 'false'}
                aria-describedby={errors.preferredDate ? 'preferredDate-error' : undefined}
                disabled={loading}
                {...register('preferredDate')}
                className={cn(
                  "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:bg-white transition-all",
                  errors.preferredDate ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
                )}
              />
              {errors.preferredDate && (
                <p id="preferredDate-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
                  {errors.preferredDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label htmlFor="message" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Tell us about your database tables, warehousing setups, report delays, or analytical goals..."
              aria-invalid={errors.message ? 'true' : 'false'}
              aria-describedby={errors.message ? 'message-error' : undefined}
              disabled={loading}
              {...register('message')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all resize-none",
                errors.message ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-primary"
              )}
            />
            {errors.message && (
              <p id="message-error" className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full font-bold shadow-md shadow-primary/10 mt-2"
          >
            {loading ? 'Scheduling consultation...' : 'Schedule Consultation'}
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


