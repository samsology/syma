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
  Laptop,
  Users,
  Award,
  Layers,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import {
  OFFICIAL_COURSES,
  GLOBAL_COURSE_INCLUSIONS,
  COURSE_PROGRESSION,
  formatCoursePrice,
  getCourseBySlug,
} from '@/lib/courses/catalog';
import { fadeUp, staggerContainer } from '@/lib/motion';

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
          const formattedPrice = formatCoursePrice(course.priceMinor, course.currency, { showDecimals: false });

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
            cta: isEnrolled ? 'Continue Learning' : course.cta || official?.cta || 'Apply for Cohort',
            support: official?.support ?? '1-on-1 mentor code reviews & live labs',
            benefits:
              course.benefits && course.benefits.length > 0
                ? course.benefits
                : (official?.benefits ?? []),
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
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* 1. Hero Section (Dark & Immersive) */}
      <section className="relative overflow-hidden bg-[#031428] text-white pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-brand-cerulean/20 via-brand-navy/15 to-transparent blur-[130px] -z-10"
        />

        <Container>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <motion.div variants={fadeUp} className="flex justify-center">
              <Eyebrow variant="cerulean">
                Practical-Based Data Academy
              </Eyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.12]"
            >
              Move Beyond Theory.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cerulean via-sky-300 to-white">
                Build Real Analytical Systems.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal"
            >
              Four sequential, project-driven programs engineered by practicing biostatisticians and health data systems architects. Master data hygiene, automated pipelines, and clinical intelligence with real sanitized schemas.
            </motion.p>

            {/* Proof Badges Strip */}
            <motion.div
              variants={fadeUp}
              className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 text-left"
            >
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">100% Practical</p>
                  <p className="text-[11px] text-slate-400">Real clinical schemas</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Mentor Support</p>
                  <p className="text-[11px] text-slate-400">Weekly live code reviews</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Certification</p>
                  <p className="text-[11px] text-slate-400">Verified credential</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-brand-cerulean/15 text-brand-cerulean flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Transparent Pricing</p>
                  <p className="text-[11px] text-slate-400">₦19,900 – ₦89,900</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* 2. Structured Progression Pathway */}
      <section className="py-20 lg:py-28 bg-slate-50/70 border-b border-slate-200/80">
        <Container className="space-y-12">
          <SectionHeading
            badge="Structured Progression"
            title="A Clear 4-Step Career Pathway"
            description="Start with fundamental data literacy and progress systematically toward advanced machine learning or specialized healthcare biostatistics."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {COURSE_PROGRESSION.map((step, idx) => (
              <div
                key={step.step}
                className="relative rounded-3xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-brand-cerulean/40 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-brand-cerulean bg-brand-cerulean/10 px-3 py-1 rounded-full border border-brand-cerulean/20">
                      STEP {step.step}
                    </span>
                    {idx < 3 && (
                      <span className="hidden lg:block text-slate-300 font-black text-sm">
                        →
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 mt-4 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {step.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/programs/${step.slug}`}
                    className="text-xs font-bold text-brand-cerulean hover:text-brand-navy inline-flex items-center gap-1 group"
                  >
                    <span>View Track</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. Official Course Catalog Grid */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Official Course Catalogue"
            title="Choose Your Learning Track"
            description="Four intensive, hands-on programmes featuring real case studies, weekly live labs, mentor code reviews, and certified portfolio outcomes."
            align="center"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {displayCourses.map((course) => {
              const IconComp = iconMap[course.iconName as keyof typeof iconMap] || BookOpen;

              return (
                <motion.div key={course.slug} variants={fadeUp} className="flex">
                  <Card
                    hoverEffect="spring"
                    className="w-full flex flex-col justify-between border-slate-200/90 bg-white p-7 rounded-3xl shadow-xs hover:border-brand-cerulean/40 hover:shadow-xl transition-all relative overflow-hidden"
                  >
                    <div className="space-y-5">
                      {/* Top Row: Icon + Course Number & Duration */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/15">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            COURSE {course.number}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cerulean bg-brand-cerulean/10 px-2.5 py-0.5 rounded-full border border-brand-cerulean/20">
                            {course.duration}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          {course.badge}
                        </span>
                        <CardTitle className="text-xl font-bold font-heading text-slate-900 leading-tight">
                          {course.title}
                        </CardTitle>
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {course.description}
                        </p>
                      </div>

                      {/* Tuition Box */}
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                              Tuition
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-2xl font-black font-heading text-slate-950">
                                {course.price}
                              </span>
                              {course.currency !== 'NGN' && (
                                <span className="text-xs font-bold text-slate-400 uppercase">
                                  {course.currency}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-brand-navy bg-brand-navy/10 px-2.5 py-1 rounded-lg">
                            {course.level}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 mt-2.5 flex items-center gap-1.5 border-t border-slate-200/60 pt-2.5">
                          <Sparkles className="w-3.5 h-3.5 text-brand-cerulean shrink-0" />
                          <span>{course.support}</span>
                        </p>
                      </div>

                      {/* Key Outcomes */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          What You Will Gain
                        </span>
                        <ul className="space-y-2">
                          {course.benefits.slice(0, 4).map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-snug">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="mt-7 pt-5 border-t border-slate-100 space-y-2.5">
                      <Link href={course.enrollHref} className="w-full block">
                        <Button
                          variant="cerulean"
                          size="md"
                          className="w-full text-xs font-bold shadow-md shadow-brand-cerulean/20"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          {course.cta}
                        </Button>
                      </Link>
                      <Link
                        href={`/programs/${course.slug}`}
                        className="block text-center text-xs font-bold text-slate-500 hover:text-brand-cerulean transition-colors py-1"
                      >
                        View Full Syllabus & Modules →
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* 4. Universal Guarantee / Course Inclusions */}
      <section className="border-y border-slate-200/80 bg-slate-50/70 py-24 lg:py-32">
        <Container className="space-y-16">
          <SectionHeading
            badge="Universal Standards"
            title="Included in Every Syma Tech Programme"
            description="All courses are backed by dedicated mentors, hands-on real-world data repositories, and career certification."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {GLOBAL_COURSE_INCLUSIONS.map((benefit) => (
              <Card
                key={benefit}
                hoverEffect="spring"
                className="border-slate-200/90 bg-white p-7 shadow-xs flex flex-col items-center text-center gap-4 rounded-3xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/15">
                  <ShieldCheck className="w-6 h-6 text-brand-cerulean" />
                </div>
                <span className="text-sm font-bold text-slate-900 leading-snug">
                  {benefit}
                </span>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Frequently Asked Questions */}
      <FaqSection />

      {/* 6. High-Impact Closing CTA */}
      <section className="bg-white pb-24 lg:pb-32">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-[#031428] px-8 py-16 sm:px-12 sm:py-20 text-center text-white shadow-2xl border border-white/10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-cerulean/20 blur-[140px] -z-10"
            />
            <h2 className="mx-auto max-w-2xl font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Build Analytics Capability That Opens Doors.
            </h2>
            <p className="mx-auto mb-8 mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-slate-300">
              Apply for our upcoming cohort, or schedule a technical call to design custom institutional capacity training for your hospital or team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/enroll" className="w-full sm:w-auto">
                <Button
                  variant="cerulean"
                  size="lg"
                  className="w-full sm:w-auto shadow-xl shadow-brand-cerulean/25"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Apply for Next Cohort
                </Button>
              </Link>
              <Link href="/consultation" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  theme="dark"
                  size="lg"
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Discuss Institutional Training
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
