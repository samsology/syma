import Link from 'next/link';
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { verifyPaystackTransaction } from '@/lib/payments/paystack';
import { getPaidProgram } from '@/lib/payments/programs';

type PaymentCallbackProps = {
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
  }>;
};

export default async function PaymentCallback({ searchParams }: PaymentCallbackProps) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;
  let status: 'success' | 'failed' | 'missing' = 'missing';
  let verifiedReference = reference;
  let programName: string | undefined;

  if (!reference) {
    return <PaymentState status="missing" />;
  }

  try {
    const payment = await verifyPaystackTransaction(reference);
    const programId =
      typeof payment.metadata?.programId === 'string' ? payment.metadata.programId : '';
    const program = getPaidProgram(programId);
    const amountMatches = program ? payment.amount === program.amountKobo : false;
    const isSuccessful = payment.status === 'success' && amountMatches;

    status = isSuccessful ? 'success' : 'failed';
    verifiedReference = payment.reference;
    programName = program?.name;
  } catch {
    status = 'failed';
  }

  return <PaymentState status={status} reference={verifiedReference} programName={programName} />;
}

function PaymentState({
  status,
  reference,
  programName,
}: {
  status: 'success' | 'failed' | 'missing';
  reference?: string;
  programName?: string;
}) {
  const isSuccess = status === 'success';
  const isMissing = status === 'missing';

  return (
    <div className="min-h-screen bg-white py-20 text-slate-900">
      <Container>
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-100">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
            {isSuccess ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : isMissing ? (
              <Loader2 className="h-8 w-8" />
            ) : (
              <CircleAlert className="h-8 w-8" />
            )}
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            {isSuccess ? 'Payment confirmed' : 'Payment review needed'}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold text-slate-950">
            {isSuccess
              ? 'Your enrollment payment was successful.'
              : 'We could not confirm this payment automatically.'}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {isSuccess
              ? `Thank you for paying for ${programName ?? 'your selected Syma Tech program'}. Our team will contact you with onboarding details.`
              : 'If money was deducted, please contact Syma Tech Solutions with your payment reference so our team can verify it manually.'}
          </p>
          {reference && (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
              Reference: {reference}
            </p>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/programs">
              <Button className="w-full sm:w-auto">View Programs</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full border-slate-300 text-slate-800 hover:bg-slate-50 sm:w-auto">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
