'use client';

import Link from 'next/link';
import FaqSection from '@/components/sections/FaqSection';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  Code2,
  Activity,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import {
  OFFICIAL_COURSES,
  GLOBAL_COURSE_INCLUSIONS,
  VALUE_PROPOSITION,
  COURSE_PROGRESSION,
  formatCoursePrice,
  getCourseBySlug,
} from '@/lib/courses/catalog';

const iconMap = {
  BookOpen,
  BarChart3,
  Code2,
  Activity,
};

type PublishedCourseItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  priceMinor: number;
  currency: string;
  benefits: string[];
  cta: string | null;
  sortOrder: number;
  thumbnailUrl: string | null;
};

type ProgramsPageContentProps = {
  publishedCourses?: PublishedCourseItem[];
  enrolledCourseIds?: string[];
  isStudentSignedIn?: boolean;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function ProgramsPageContent({
  publishedCourses = [],
  enrolledCourseIds = [],
  isStudentSignedIn = false,
}: ProgramsPageContentProps) {
  const enrolledCourseIdSet = new Set(enrolledCourseIds);

  // Map published courses from DB, matching with catalog metadata or falling back to OFFICIAL_COURSES
  const displayCourses =
    publishedCourses.length > 0
      ? publishedCourses.map((course, idx) => {
          const official = getCourseBySlug(course.slug);
          const isEnrolled = enrolledCourseIdSet.has(course.id);
          const formattedPrice = formatCoursePrice(course.priceMinor, course.currency);

          return {
            id: course.id,
            number: official?.number ?? `0${idx + 1}`,
            title: course.title,
            slug: course.slug,
            duration: course.duration,
            price: formattedPrice,
            currency: course.currency,
            description: course.description || course.shortDescription,
            category: course.category,
            level: course.level,
            badge: official?.badge ?? course.category,
            cta: isEnrolled ? 'Continue Learning' : course.cta || official?.cta || 'Apply Today',
            support: official?.support ?? 'Instructor & mentor support',
            benefits: course.benefits && course.benefits.length > 0 ? course.benefits : (official?.benefits ?? []),
            iconName: official?.iconName ?? ('BookOpen' as const),
            isEnrolled,
            enrollHref: isEnrolled
              ? `/student/courses/${course.id}`
              : isStudentSignedIn
                ? `/student/enroll?courseId=${course.id}`
                : `/enroll?program=${course.slug}`,
          };
        })
      : OFFICIAL_COURSES.map((course) => ({
          id: course.slug,
          number: course.number,
          title: course.title,
          slug: course.slug,
          duration: course.duration,
          price: course.price,
          currency: course.currency,
          description: course.description,
          category: course.category,
          level: course.level,
          badge: course.badge,
          cta: course.cta,
          support: course.support,
          benefits: course.benefits,
          iconName: course.iconName,
          isEnrolled: false,
          enrollHref: `/enroll?program=${course.slug}`,
        }));

  return (
    <div className="min-h-screen bg-white py-16 font-sans text-slate-900 lg:py-24">
      {/* Hero */}
      <section className="border-b border-slate-100 pb-16 bg-gradient-to-b from-slate-50/70 via-white to-white text-center">
        <Container className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
            {VALUE_PROPOSITION.mainHeadline}
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 max-w-4xl mx-auto">
            Practical-Based Data Programs
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
            {VALUE_PROPOSITION.supportingHeadline}
          </p>
        </Container>
      </section>

      {/* Course Progression Pathway */}
      <section className="py-16 bg-slate-50/50 border-b border-slate-100">
        <Container className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Structured Progression</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
              Clear Step-by-Step Pathway
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Start with fundamentals and progress toward machine learning or domain specialization in healthcare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {COURSE_PROGRESSION.map((step, idx) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                      STEP {step.step}
                    </span>
                    {idx < 3 && <span className="hidden lg:block text-slate-300 font-black">→</span>}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-3">{step.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.subtitle}</p>
                </div>
                <Link
                  href={`/programs/${step.slug}`}
                  className="mt-4 text-xs font-bold text-primary hover:text-secondary inline-flex items-center gap-1"
                >
                  View Details <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Grid of 4 Programs */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Official Course Catalogue"
            title="Choose Your Learning Track"
            description="Four hands-on programmes with real datasets, weekly live labs, mentor code reviews, and certified outcomes."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {displayCourses.map((course, index) => {
              const IconComp = iconMap[course.iconName as keyof typeof iconMap] || BookOpen;

              return (
                <Card
                  key={course.slug}
                  shouldAnimate
                  hoverEffect="lift"
                  variants={fadeInUp}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="group flex flex-col justify-between border-slate-200/80 bg-white p-6 shadow-sm hover:border-primary/40 hover:shadow-lg transition-all rounded-2xl relative"
                >
                  <div className="space-y-5">
                    {/* Top row with icon & course number */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <IconComp className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          COURSE {course.number}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/15">
                          {course.duration}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {course.badge}
                      </span>
                      <CardTitle className="text-lg font-extrabold text-slate-900 leading-tight mt-1">
                        {course.title}
                      </CardTitle>
                      <p className="mt-2.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                            Tuition
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-black text-slate-950">{course.price}</span>
                            <span className="text-xs font-bold text-slate-400">USD</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {course.level}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-500 mt-2 flex items-center gap-1 border-t border-slate-100 pt-2">
                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                        <span>{course.support}</span>
                      </p>
                    </div>

                    {/* Key Benefits (All 8 benefits) */}
                    <div className="space-y-2 pt-2 border-t border-slate-50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        What You&apos;ll Gain
                      </span>
                      <ul className="space-y-1.5">
                        {course.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="leading-snug">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <Link href={course.enrollHref} className="w-full block">
                      <Button variant="primary" className="w-full text-xs font-bold py-2.5">
                        {course.cta}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                    <Link
                      href={`/programs/${course.slug}`}
                      className="block text-center text-xs font-semibold text-slate-500 hover:text-primary transition-colors py-1"
                    >
                      View Full Curriculum →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* Shared Benefits Section */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-24 lg:py-32">
        <Container className="space-y-16">
          <SectionHeading
            theme="light"
            badge="Universal Guarantee"
            title="Every Syma Tech Course Includes"
            description="All programmes come backed by comprehensive learning materials, dedicated mentors, and career support."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {GLOBAL_COURSE_INCLUSIONS.map((benefit, index) => (
              <Card
                key={benefit}
                shouldAnimate
                hoverEffect="lift"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="border-slate-200/80 bg-white p-6 shadow-sm flex flex-col items-center text-center gap-3 rounded-2xl"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-bold text-slate-900">{benefit}</span>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <FaqSection />

      {/* Final CTA */}
      <section className="bg-white pb-24 lg:pb-32">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/15">
            <h2 className="mx-auto max-w-2xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
              Build Analytics Capability That Stands Out
            </h2>
            <p className="mx-auto mb-8 mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              Apply for our next cohort, or book a scoping call to arrange custom team capacity training.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/enroll">
                <Button variant="accent" size="lg" className="w-full bg-white font-sans font-bold text-primary shadow-lg shadow-white/10 hover:bg-white/90 sm:w-auto">
                  Apply for Enrollment
                </Button>
              </Link>
              <Link href="/consultation">
                <Button variant="outline" size="lg" className="w-full border-white/25 text-white hover:bg-white/5 sm:w-auto">
                  Talk to Scoping Consultant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
