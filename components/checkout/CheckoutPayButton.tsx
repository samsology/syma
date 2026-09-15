'use client';

import { useFormStatus } from 'react-dom';
import { Loader2, ShieldCheck } from 'lucide-react';

type CheckoutPayButtonProps = {
  label?: string;
  loadingLabel?: string;
};

export function CheckoutPayButton({
  label = 'Pay Now with Paystack',
  loadingLabel = 'Connecting to Paystack...',
}: CheckoutPayButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
