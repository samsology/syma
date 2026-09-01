import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/constants';

const protectedAdminRoutes = [
  '/admin/dashboard',
  '/admin/courses',
  '/admin/resources',
  '/admin/settings',
  '/admin/lessons',
];

function isProtectedAdminPath(pathname: string) {
  return protectedAdminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedAdminPath(pathname) && !request.cookies.get(ADMIN_SESSION_COOKIE)?.value) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
