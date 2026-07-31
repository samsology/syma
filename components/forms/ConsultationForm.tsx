'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { submitConsultationAction } from '@/app/actions/db-actions';
import { consultationSchema } from '@/lib/validation';

type ConsultationInput = z.infer<typeof consultationSchema>;

const consultationTypes = [
  { id: 'healthcare-analytics', label: 'Healthcare Analytics Scopes' },
  { id: 'research-intelligence', label: 'Research & Statistical Support' },
  { id: 'business-intelligence', label: 'Business Intelligence & Dashboards' },
  { id: 'training-capacity', label: 'Corporate Team Capacity Building' },
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

          {/* Email & Organization Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
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
              <label htmlFor="companyName" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Organization Name
              </label>
              <input
                id="companyName"
                type="text"
                placeholder="Your hospital or business"
                aria-invalid={errors.companyName ? 'true' : 'false'}
                disabled={loading}
                {...register('companyName')}
                className={cn(
                  "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all",
                  errors.companyName ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                )}
              />
              {errors.companyName && (
                <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                  {errors.companyName.message}
                </p>
              )}
            </div>
          </div>

          {/* Consultation Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="consultationType" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Consultation Type
              </label>
              <select
                id="consultationType"
                aria-invalid={errors.consultationType ? 'true' : 'false'}
                disabled={loading}
                {...register('consultationType')}
                className={cn(
                  "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none transition-all",
                  errors.consultationType ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
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
                <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
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
                disabled={loading}
                {...register('preferredDate')}
                className={cn(
                  "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none transition-all",
                  errors.preferredDate ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
                )}
              />
              {errors.preferredDate && (
                <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                  {errors.preferredDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label htmlFor="message" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Scoping Message
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Detail your database schemas, clinical variables, metrics alignment, or specific dashboard goals..."
              aria-invalid={errors.message ? 'true' : 'false'}
              disabled={loading}
              {...register('message')}
              className={cn(
                "w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all resize-none",
                errors.message ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-primary"
              )}
            />
            {errors.message && (
              <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Scheduling...
              </>
            ) : (
              <>
                Confirm Booking <ChevronRight className="w-5 h-5" />
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
              Thank you. We have logged your consultation schedule. Please check your email inbox for a scoping call confirmation details.
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
