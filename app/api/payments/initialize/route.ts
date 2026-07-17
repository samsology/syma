import { NextResponse } from 'next/server';
import { z } from 'zod';
import { initializePaystackTransaction } from '@/lib/payments/paystack';
import { getPaidProgram } from '@/lib/payments/programs';

const initializePaymentSchema = z.object({
  enrollmentId: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(2),
  program: z.string().min(1),
});

function getSiteUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  try {
    const input = initializePaymentSchema.parse(await request.json());
    const program = getPaidProgram(input.program);

    if (!program) {
      return NextResponse.json(
        { error: 'This program requires a custom quote and cannot be paid online yet.' },
        { status: 400 }
      );
    }

    const payment = await initializePaystackTransaction({
      email: input.email,
      amountKobo: program.amountKobo,
      currency: program.currency,
      callbackUrl: `${getSiteUrl(request)}/payment/callback`,
      metadata: {
        enrollmentId: input.enrollmentId,
        fullName: input.fullName,
        programId: program.id,
        programName: program.name,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: payment.authorizationUrl,
        reference: payment.reference,
      },
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Unable to initialize payment.' },
      { status: 400 }
    );
  }
}

