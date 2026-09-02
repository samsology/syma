import { NextResponse, type NextRequest } from 'next/server';
import { getPaymentProvider } from '@/lib/payments/provider';
import { verifyAndSettlePayment } from '@/lib/payments/service';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  const provider = getPaymentProvider();

  if (!provider.verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (event.event === 'charge.success' && event.data?.reference) {
    await verifyAndSettlePayment(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
