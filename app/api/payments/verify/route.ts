import { NextResponse } from 'next/server';
import { verifyPaystackTransaction } from '@/lib/payments/paystack';
import { getPaidProgram } from '@/lib/payments/programs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Payment reference is required.' }, { status: 400 });
  }

  try {
    const payment = await verifyPaystackTransaction(reference);
    const programId =
      typeof payment.metadata?.programId === 'string' ? payment.metadata.programId : '';
    const program = getPaidProgram(programId);

    const amountMatches = program ? payment.amount === program.amountKobo : false;
    const isSuccessful = payment.status === 'success' && amountMatches;

    return NextResponse.json({
      success: true,
      data: {
        ...payment,
        amountMatches,
        isSuccessful,
      },
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Unable to verify payment.' },
      { status: 400 }
    );
  }
}

