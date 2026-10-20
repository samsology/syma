import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BarChart3,
  Code2,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ShieldCheck,
  Layers,
  FileText,
  Users,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { db } from '@/lib/db';
import {
  OFFICIAL_COURSES,
  GLOBAL_COURSE_INCLUSIONS,
  getCourseBySlug,
  formatCoursePrice,
} from '@/lib/courses/catalog';
import FaqSection from '@/components/sections/FaqSection';

const iconMap = {
  BookOpen,
  BarChart3,
  Code2,
  Activity,
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return OFFICIAL_COURSES.map((course) => ({
    slug: course.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const official = getCourseBySlug(slug);

  if (!official) {
    return {
      title: 'Course Not Found',
      description: 'The requested Syma Tech Solutions course could not be found.',
    };
  }

  const course = await db.course
    .findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: {
        title: true,
        shortDescription: true,
        description: true,
        category: true,
      },
    })
    .catch(() => null);

  const title = course?.title || official?.title || 'Course Details';
  const description =
    course?.shortDescription || official?.shortDescription || 'Syma Tech Solutions Course';

  return {
    title,
    description,
    alternates: {
      canonical: `/programs/${slug}`,
    },
    openGraph: {
      title: `${title} | Syma Tech Solutions`,
      description,
      type: 'website',
      url: `/programs/${slug}`,
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const official = getCourseBySlug(slug);

  if (!official) {
    notFound();
  }

  const course = await db.course
    .findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        weeks: {
          orderBy: { weekNumber: 'asc' },
          include: {
            modules: {
              orderBy: { sortOrder: 'asc' },
              include: {
                lessons: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    })
    .catch(() => null);

  const title = course?.title || official?.title || '';
  const description = course?.description || official?.description || '';
  const shortDescription = course?.shortDescription || official?.shortDescription || '';
  const duration = course?.duration || official.duration;
  const priceMinor = course?.priceMinor ?? official.priceMinor;
  const priceCurrency = course?.currency ?? official.currency;
  const priceFormatted = formatCoursePrice(priceMinor, priceCurrency, { showDecimals: false });
  const benefits =
    course?.benefits && course.benefits.length > 0 ? course.benefits : (official?.benefits ?? []);
  const cta = course?.cta || official?.cta || 'Apply for Cohort';
  const support = official?.support ?? '1-on-1 mentor code reviews & live labs';
  const category = course?.category || official?.category || 'Professional Education';
  const level = course?.level || official?.level || 'Beginner';
  const courseNumber = official?.number ?? '01';
  const IconComp = iconMap[official?.iconName ?? 'BookOpen'] || BookOpen;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description: shortDescription,
    provider: {
      '@type': 'Organization',
      name: 'Syma Tech Solutions',
      sameAs: 'https://syma-nine.vercel.app',
    },
    timeRequired: duration,
    offers: {
      '@type': 'Offer',
      price: (priceMinor / 100).toFixed(2),
      priceCurrency,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Dark Immersive Course Header */}
      <section className="relative overflow-hidden bg-[#031428] text-white pt-20 pb-20 lg:pt-28 lg:pb-28 border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-brand-cerulean/20 via-brand-navy/15 to-transparent blur-[130px] -z-10"
        />

        <Container className="space-y-8">
          {/* Back Navigation */}
          <div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 hover:text-white uppercase transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to All Programs
            </Link>
          </div>

          <div className="grid items-start gap-12 lg:grid-cols-[1fr_400px]">
            {/* Left Header Column */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="border-brand-cerulean/30 bg-brand-cerulean/15 text-brand-cerulean inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-black tracking-wider uppercase">
                  <IconComp className="h-3.5 w-3.5" /> COURSE {courseNumber}
                </span>
                <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-bold tracking-wider text-slate-300 uppercase">
                  {category}
                </span>
                <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-bold tracking-wider text-slate-300 uppercase">
                  {level} Level
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                {title}
              </h1>

              <p className="max-w-3xl text-base sm:text-lg leading-relaxed text-slate-300 font-normal">
                {description}
              </p>

              {/* Highlights strip */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs sm:text-sm text-slate-300 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="text-brand-cerulean h-4 w-4" />
                  <span className="font-semibold text-white">{duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-brand-cerulean h-4 w-4" />
                  <span className="font-semibold text-white">{support}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="text-brand-cerulean h-4 w-4" />
                  <span className="font-semibold text-white">Certificate of Completion</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Tuition & Enrollment Box */}
            <Card className="sticky top-24 rounded-3xl border-slate-200/90 bg-white p-7 sm:p-8 shadow-2xl text-slate-900">
              <div className="space-y-6">
                <div>
                  <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    PROGRAMME TUITION
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-black font-heading text-slate-950">
                      {priceFormatted}
                    </span>
                    {priceCurrency !== 'NGN' && (
                      <span className="text-xs font-bold text-slate-400 uppercase">{priceCurrency}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Transparent, one-time enrollment fee covering all curriculum modules and mentor reviews.
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                    Learning Support:
                  </p>
                  <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <Sparkles className="text-brand-cerulean h-4 w-4 shrink-0" />
                    <span>{support}</span>
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Link href={`/enroll?program=${slug}`} className="block w-full">
                    <Button
                      variant="cerulean"
                      size="lg"
                      className="w-full font-bold shadow-xl shadow-brand-cerulean/25"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      {cta}
                    </Button>
                  </Link>
                  <p className="text-center text-[11px] text-slate-400">
                    Cohort spots are limited. Instant LMS access upon enrollment confirmation.
                  </p>
                  <p className="text-center text-xs text-slate-500 pt-1">
                    Already enrolled?{' '}
                    <Link
                      href="/student/login"
                      className="font-semibold text-brand-cerulean hover:underline"
                    >
                      Student login
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 2. Main Content: Outcomes + Detailed Curriculum + Inclusions */}
      <section className="py-20 lg:py-28 bg-white">
        <Container className="space-y-16">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_400px]">
            <div className="space-y-16">
              {/* Outcomes Section */}
              <div className="space-y-6">
                <div>
                  <Eyebrow variant="cerulean">Key Outcomes</Eyebrow>
                  <h2 className="font-heading mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                    What You Will Gain
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Specific, demonstrable competencies and practical portfolio assets built throughout this track.
                  </p>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  {benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4"
                    >
                      <CheckCircle2 className="text-emerald-500 mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus Breakdown */}
              <div className="space-y-6">
                <div>
                  <Eyebrow variant="navy">Syllabus</Eyebrow>
                  <h2 className="font-heading mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                    Curriculum & Module Breakdown
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    A week-by-week roadmap of theoretical principles, live labs, and capstone submissions.
                  </p>
                </div>

                {course?.weeks && course.weeks.length > 0 ? (
                  <div className="space-y-5">
                    {course.weeks.map((week) => (
                      <div
                        key={week.id}
                        className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                          <div>
                            <span className="text-brand-cerulean text-[10px] font-black tracking-wider uppercase">
                              WEEK {week.weekNumber}
                            </span>
                            <h3 className="mt-0.5 text-base font-bold text-slate-900 font-heading">
                              {week.title}
                            </h3>
                          </div>
                          <span className="text-xs font-semibold text-slate-400">
                            {week.modules.length} {week.modules.length === 1 ? 'module' : 'modules'}
                          </span>
                        </div>

                        <div className="space-y-4 p-6">
                          {week.description && (
                            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-sans">
                              {week.description}
                            </p>
                          )}

                          <div className="space-y-3">
                            {week.modules.map((module) => (
                              <div
                                key={module.id}
                                className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
                              >
                                <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                                  <Layers className="text-brand-cerulean h-4 w-4 shrink-0" />
                                  <span>{module.title}</span>
                                </h4>
                                {module.description && (
                                  <p className="text-xs text-slate-500 leading-relaxed">
                                    {module.description}
                                  </p>
                                )}
                                <div className="grid gap-2 pt-1.5">
                                  {module.lessons.map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 text-xs text-slate-600"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <span className="font-medium text-slate-800">
                                          {lesson.title}
                                        </span>
                                      </div>
                                      {lesson.duration && (
                                        <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                          {lesson.duration}m
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-800">
                      Curriculum updates are published on cohort launch.
                    </p>
                    <p className="text-xs text-slate-500">
                      Contact admissions to request the comprehensive syllabus outline.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Aside: Universal Guarantee */}
            <aside className="space-y-6">
              <Card className="space-y-5 rounded-3xl border-slate-200/90 bg-slate-50/70 p-7">
                <div>
                  <span className="text-brand-cerulean text-xs font-bold tracking-wider uppercase">
                    Universal Guarantee
                  </span>
                  <h3 className="mt-1 text-lg font-bold font-heading text-slate-900">
                    Included in this Course
                  </h3>
                </div>

                <ul className="space-y-3">
                  {GLOBAL_COURSE_INCLUSIONS.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <ShieldCheck className="text-brand-cerulean mt-0.5 h-4 w-4 shrink-0" />
                      <span className="font-semibold leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-200 pt-5">
                  <Link href={`/enroll?program=${slug}`} className="block w-full">
                    <Button variant="cerulean" className="w-full text-xs font-bold">
                      {cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </section>

      {/* 3. FAQ Section */}
      <FaqSection />
    </div>
  );
}
