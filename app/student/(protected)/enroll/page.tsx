import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, Clock, Award, BookOpen, CreditCard, ArrowLeft, AlertCircle } from 'lucide-react';
import { enrollCurrentStudentAction } from '../../actions';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { formatMoney } from '@/lib/payments/rules';

type StudentEnrollPageProps = {
  searchParams: Promise<{ courseId?: string; error?: string }>;
};

export default async function StudentEnrollPage({ searchParams }: StudentEnrollPageProps) {
  const [params, student] = await Promise.all([searchParams, requireStudent()]);
  const courseParam = params?.courseId?.trim();

  if (!courseParam) {
    redirect('/programs');
  }

  const course = await db.course.findFirst({
    where: {
      OR: [{ id: courseParam }, { slug: courseParam }],
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      description: true,
      category: true,
      level: true,
      duration: true,
      isFree: true,
      priceMinor: true,
      currency: true,
      status: true,
    },
  });

  if (!course) {
    redirect('/programs');
  }

  // Check if student is already enrolled in this course
  const existingEnrollment = await db.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: course.id,
      },
    },
    select: { status: true },
  });

  if (existingEnrollment && ['ACTIVE', 'COMPLETED'].includes(existingEnrollment.status)) {
    redirect(`/student/courses/${course.id}`);
  }

  const isFree = course.isFree || course.priceMinor <= 0;
  const formattedPrice = formatMoney(course.priceMinor, course.currency);

  const errorMessages: Record<string, string> = {
    PAYMENT_PROVIDER_UNCONFIGURED: 'Paystack is currently being configured. Please contact support or retry in a few moments.',
    PAYMENT_PROVIDER_UNAVAILABLE: 'Paystack is temporarily unreachable. Please retry shortly.',
    PAYMENT_INITIALIZATION_FAILED: 'Could not initialize Paystack checkout. Please retry.',
    APP_URL_UNCONFIGURED: 'Payment configuration error. Please contact support.',
    ORDER_UNAVAILABLE: 'This course is currently not open for checkout.',
  };

  const errorMessage = params.error ? (errorMessages[params.error] || 'Payment could not be initialized. Please retry.') : null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/programs"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Programs
        </Link>

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold">Checkout Notice</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary tracking-wide uppercase">
              Course Enrollment · {course.category}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-950">{course.title}</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{course.shortDescription}</p>
          </div>

          {/* Course Details Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Duration</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">{course.duration}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Level</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">{course.level}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Format</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Interactive LMS</p>
            </div>
          </div>

          {/* Pricing & Checkout Section */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-200/60 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {isFree ? 'Tuition Status' : 'Official Tuition Fee'}
                </span>
                <p className="mt-0.5 text-2xl sm:text-3xl font-black text-slate-950">
                  {isFree ? 'Free Enrollment' : formattedPrice}
                </p>
              </div>
              {!isFree && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-2.5 py-1 text-xs font-bold text-emerald-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span>Paystack Verified</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isFree
                ? 'This course is sponsored. Activate your enrollment now to access all modules, learning slides, and knowledge assessments.'
                : 'Click below to securely proceed to Paystack checkout. You can pay with your Nigerian Debit Card, Bank Transfer, or USSD. Access is unlocked immediately upon payment confirmation.'}
            </p>

            <form action={enrollCurrentStudentAction} className="pt-1">
              <input type="hidden" name="courseId" value={course.id} />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-white hover:bg-primary/90 transition shadow-sm cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                <span>
                  {isFree ? 'Enroll Now & Start Learning' : `Pay ${formattedPrice} with Paystack`}
                </span>
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-bit TLS encrypted &amp; verified payment gateway</span>
          </div>
        </section>
      </div>
    </main>
  );
}
