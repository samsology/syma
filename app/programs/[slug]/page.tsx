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
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
      title: 'Course Not Found | Syma Tech Solutions',
      description: 'The requested Syma Tech Solutions course could not be found.',
    };
  }

  const course = await db.course.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: {
      title: true,
      shortDescription: true,
      description: true,
      category: true,
    },
  });

  const title = course?.title || official?.title || 'Course Details';
  const description =
    course?.shortDescription || official?.shortDescription || 'Syma Tech Solutions Course';

  return {
    title: `${title} | Syma Tech Solutions`,
    description,
    openGraph: {
      title: `${title} | Syma Tech Solutions`,
      description,
      type: 'website',
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const official = getCourseBySlug(slug);

  if (!official) {
    notFound();
  }

  const course = await db.course.findFirst({
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
  });

  const title = course?.title || official?.title || '';
  const description = course?.description || official?.description || '';
  const shortDescription = course?.shortDescription || official?.shortDescription || '';
  const duration = course?.duration || official?.duration || '8 Weeks';
  const priceFormatted = course
    ? formatCoursePrice(course.priceMinor, course.currency)
    : (official?.price ?? '$19.90');
  const benefits =
    course?.benefits && course.benefits.length > 0 ? course.benefits : (official?.benefits ?? []);
  const cta = course?.cta || official?.cta || 'Start Your Data Journey';
  const support = official?.support ?? 'Instructor & community support';
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
      sameAs: 'https://symatechsolutions.com',
    },
    timeRequired: duration,
    offers: {
      '@type': 'Offer',
      price: course ? (course.priceMinor / 100).toFixed(2) : '19.90',
      priceCurrency: course?.currency ?? 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-white py-12 font-sans text-slate-900 lg:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb / Back */}
      <Container className="mb-8">
        <Link
          href="/programs"
          className="hover:text-primary inline-flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Programs
        </Link>
      </Container>

      {/* Course Hero Banner */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/70 via-white to-white pb-16">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black tracking-wider uppercase">
                  <IconComp className="h-3.5 w-3.5" /> COURSE {courseNumber}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  {category}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  {level} Level
                </span>
              </div>

              <h1 className="font-heading text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {title}
              </h1>

              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="font-semibold text-slate-800">{duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary h-4 w-4" />
                  <span className="font-semibold text-slate-800">{support}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="text-primary h-4 w-4" />
                  <span className="font-semibold text-slate-800">Certificate of Completion</span>
                </div>
              </div>
            </div>

            {/* Tuition & Enrollment Card */}
            <Card className="sticky top-24 rounded-3xl border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-100/80 sm:p-8">
              <div className="space-y-6">
                <div>
                  <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    PROGRAMME TUITION
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-950">{priceFormatted}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">USD</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    One-time enrollment fee covering full access
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                    Support & Guidance:
                  </p>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Sparkles className="text-primary h-3.5 w-3.5 shrink-0" />
                    <span>{support}</span>
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Link href={`/enroll?program=${slug}`} className="block w-full">
                    <Button
                      variant="primary"
                      size="lg"
                      className="shadow-primary/20 w-full font-bold shadow-md"
                    >
                      {cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="text-center text-[11px] text-slate-400">
                    Cohort spots are limited. Instant access upon confirmation.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Main Content: Benefits + Curriculum + Inclusions */}
      <section className="py-16">
        <Container className="space-y-16">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_380px]">
            <div className="space-y-12">
              {/* What You'll Gain (8 Key Benefits) */}
              <div className="space-y-6">
                <div>
                  <span className="text-primary text-xs font-bold tracking-wider uppercase">
                    Key Outcomes
                  </span>
                  <h2 className="font-heading mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    What You&apos;ll Gain
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Specific competencies and practical assets you will build during this course.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
                    >
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 sm:text-sm">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum Breakdown */}
              <div className="space-y-6">
                <div>
                  <span className="text-primary text-xs font-bold tracking-wider uppercase">
                    Syllabus
                  </span>
                  <h2 className="font-heading mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Curriculum & Modules
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    A hands-on breakdown of weeks, learning modules, and practical lessons.
                  </p>
                </div>

                {course?.weeks && course.weeks.length > 0 ? (
                  <div className="space-y-4">
                    {course.weeks.map((week) => (
                      <div
                        key={week.id}
                        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                          <div>
                            <span className="text-primary text-[10px] font-black tracking-wider uppercase">
                              WEEK {week.weekNumber}
                            </span>
                            <h3 className="mt-0.5 text-base font-bold text-slate-900">
                              {week.title}
                            </h3>
                          </div>
                          <span className="text-xs font-semibold text-slate-400">
                            {week.modules.length} {week.modules.length === 1 ? 'module' : 'modules'}
                          </span>
                        </div>

                        <div className="space-y-4 p-6">
                          {week.description && (
                            <p className="text-xs leading-relaxed text-slate-500">
                              {week.description}
                            </p>
                          )}

                          <div className="space-y-3">
                            {week.modules.map((module) => (
                              <div
                                key={module.id}
                                className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/30 p-4"
                              >
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                  <Layers className="text-primary h-3.5 w-3.5" />
                                  <span>{module.title}</span>
                                </h4>
                                {module.description && (
                                  <p className="text-xs text-slate-500">{module.description}</p>
                                )}
                                <div className="grid gap-1.5 pt-1">
                                  {module.lessons.map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600"
                                    >
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="font-medium text-slate-800">
                                          {lesson.title}
                                        </span>
                                      </div>
                                      {lesson.duration && (
                                        <span className="font-mono text-[11px] text-slate-400">
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
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      Curriculum updates are published on cohort launch. Contact admissions for the
                      comprehensive syllabus outline.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Aside: Shared Guarantee */}
            <aside className="space-y-6">
              <Card className="space-y-5 rounded-3xl border-slate-200/80 bg-slate-50/60 p-6">
                <div>
                  <span className="text-primary text-xs font-bold tracking-wider uppercase">
                    Guarantee
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Included in this Course</h3>
                </div>
                <ul className="space-y-3">
                  {GLOBAL_COURSE_INCLUSIONS.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <ShieldCheck className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span className="font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-200 pt-4">
                  <Link href={`/enroll?program=${slug}`} className="block w-full">
                    <Button variant="primary" className="w-full text-xs font-bold">
                      {cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </section>

      <FaqSection />
    </div>
  );
}
