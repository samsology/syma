import { proxy } from './proxy';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/student'],
};
