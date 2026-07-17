import { NextResponse } from 'next/server';
import { submitContactAction } from '@/app/actions/db-actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await submitContactAction(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: error?.message || 'Invalid JSON request body' },
      { status: 400 }
    );
  }
}
