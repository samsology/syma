import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, STUDENT_SESSION_COOKIE, PUBLIC_STUDENT_ROUTES } from '@/lib/auth/constants';

const protectedAdminRoutes = [
  '/admin/dashboard',
  '/admin/courses',
  '/admin/resources',
  '/admin/settings',
  '/admin/lessons',
  '/admin/students',
  '/admin/enrollments',
  '/admin/orders',
  '/admin/payments',
];

function isProtectedAdminPath(pathname: string) {
  return protectedAdminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedStudentPath(pathname: string) {
  if (PUBLIC_STUDENT_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return false;
  return pathname === '/student' || pathname.startsWith('/student/');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedAdminPath(pathname) && !request.cookies.get(ADMIN_SESSION_COOKIE)?.value) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedStudentPath(pathname) && !request.cookies.get(STUDENT_SESSION_COOKIE)?.value) {
    const loginUrl = new URL('/student/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*'],
};
