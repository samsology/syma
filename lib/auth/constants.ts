export const ADMIN_SESSION_COOKIE = 'syma_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
export const ADMIN_SESSION_MAX_AGE_MS = ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

export const ADMIN_LOGIN_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

export const STUDENT_SESSION_COOKIE = 'syma_student_session';
export const STUDENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const STUDENT_SESSION_MAX_AGE_MS = STUDENT_SESSION_MAX_AGE_SECONDS * 1000;

export const STUDENT_LOGIN_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

export const PUBLIC_STUDENT_ROUTES = [
  '/student/login',
  '/student/register',
  '/student/forgot-password',
  '/student/reset-password',
  '/student/registration/resend',
];
