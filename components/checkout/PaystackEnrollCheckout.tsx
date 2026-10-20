'use client';

import { useState, useTransition } from 'react';
import Script from 'next/script';
import { CreditCard, Loader2, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import {
  prepareStudentCheckoutAction,
  verifyStudentPaymentAndEnrollAction,
  enrollCurrentStudentAction,
} from '@/app/student/actions';

type PaystackEnrollCheckoutProps = {
  courseId: string;
  isFree: boolean;
  formattedPrice: string;
};

export function PaystackEnrollCheckout({
  courseId,
  isFree,
  formattedPrice,
}: PaystackEnrollCheckoutProps) {
  const [isPending, startTransition] = useTransition();
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handlePayClick = () => {
    setErrorMessage(null);
    setNoticeMessage(null);

    startTransition(async () => {
      try {
        const prep = await prepareStudentCheckoutAction(courseId);

        if ('alreadyEnrolled' in prep && prep.alreadyEnrolled) {
          window.location.href = `/student/courses/${prep.courseId}`;
          return;
        }

        if ('freeEnrollment' in prep && prep.freeEnrollment) {
          window.location.href = `/student/courses/${prep.courseId}`;
          return;
        }

        if ('error' in prep) {
          setErrorMessage(prep.error);
          return;
        }

        if (!('success' in prep) || !prep.success) {
          setErrorMessage('Could not prepare checkout. Please try again.');
          return;
        }

        const win = typeof window !== 'undefined' ? (window as unknown as { PaystackPop?: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } } }) : null;

        // If Paystack inline JS popup is ready and public key is available
        if (win?.PaystackPop && prep.publicKey) {
          const handler = win.PaystackPop.setup({
            key: prep.publicKey,
            email: prep.email,
            amount: prep.amountMinor,
            currency: prep.currency,
            ref: prep.reference,
            ...(prep.accessCode ? { access_code: prep.accessCode } : {}),
            metadata: {
              orderNumber: prep.orderNumber,
              courseId: prep.courseId,
              courseTitle: prep.courseTitle,
            },
            callback: async (response: { reference?: string }) => {
              setIsVerifying(true);
              const ref = response?.reference || prep.reference;
              try {
                const verifyRes = await verifyStudentPaymentAndEnrollAction({
                  reference: ref,
                  orderNumber: prep.orderNumber,
                });

                if (verifyRes.success || !verifyRes.error) {
                  window.location.href = `/student/courses/${prep.courseId}`;
                } else {
                  window.location.href = `/checkout/${prep.orderNumber}/status?reference=${encodeURIComponent(ref)}`;
                }
              } catch {
                window.location.href = `/checkout/${prep.orderNumber}/status?reference=${encodeURIComponent(ref)}`;
              }
            },
            onClose: () => {
              setNoticeMessage('Checkout window closed. You can proceed with payment whenever you are ready.');
            },
          });

          handler.openIframe();
        } else if (prep.authorizationUrl) {
          // Fallback if popup script blocked or not yet loaded: redirect to Paystack hosted checkout
          window.location.href = prep.authorizationUrl;
        } else {
          setErrorMessage('Payment gateway is currently unavailable. Please retry shortly.');
        }
      } catch (err) {
        console.error('Checkout error:', err);
        setErrorMessage('An unexpected error occurred while launching payment. Please retry.');
      }
    });
  };

  if (isFree) {
    return (
      <form action={enrollCurrentStudentAction} className="pt-1">
        <input type="hidden" name="courseId" value={courseId} />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-white hover:bg-primary/90 transition shadow-sm cursor-pointer"
        >
          <CreditCard className="h-4 w-4" />
          <span>Enroll Now &amp; Start Learning</span>
        </button>
      </form>
    );
  }

  const isLoading = isPending || isVerifying;

  return (
    <div className="space-y-3 pt-1">
      {/* Paystack Inline Script */}
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-bold">Checkout Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {noticeMessage && !errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <Info className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
          <p>{noticeMessage}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handlePayClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-white hover:bg-primary/90 transition shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span>Confirming payment &amp; unlocking course...</span>
          </>
        ) : isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span>Preparing Paystack checkout...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            <span>Pay {formattedPrice} with Paystack</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>256-bit TLS encrypted &amp; verified payment gateway</span>
      </div>
    </div>
  );
}
