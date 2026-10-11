import { NextResponse } from 'next/server';
import { verifyR2Connection } from '@/lib/storage/testR2Connection';

export async function GET() {
  try {
    const result = await verifyR2Connection();
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        message: `R2 test failed with error: ${error.message || 'Unknown error'}`,
        error: error.message || String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
