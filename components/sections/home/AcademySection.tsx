'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, BarChart3, Code2, Activity, Clock, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { OFFICIAL_COURSES } from '@/lib/courses/catalog';

const courseIcons = {
  BookOpen,
  BarChart3,
  Code2,
  Activity,
};

export function AcademySection() {
  return (
    <section className="bg-marketing-dark-bg text-white py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle lighting accents */}
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[600px] rounded-full bg-brand-cerulean/10 blur-[130px]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <Eyebrow variant="cerulean">Professional Education</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              Practical Analytics Academy
            </h2>
            <p className="mt-4 text-base text-slate-300 font-sans leading-relaxed">
              Curriculum engineered around real healthcare datasets, statistical modeling, and business intelligence pipelines.
            </p>
          </div>
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-cerulean hover:text-white transition-colors shrink-0 group"
          >
            <span>Explore All Academy Tracks</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OFFICIAL_COURSES.map((course) => {
            const Icon = courseIcons[course.iconName] || BookOpen;
            return (
              <Card
                key={course.slug}
                surface="dark"
                hoverEffect="spring"
                className="flex flex-col justify-between p-6 border-white/10 bg-marketing-dark-surface/90"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cerulean bg-brand-cerulean/10 px-2 py-0.5 rounded-full">
                      {course.badge}
                    </span>
                    <Icon className="h-5 w-5 text-slate-300" />
                  </div>

                  <CardTitle className="text-lg font-bold text-white font-heading mt-5 leading-snug">
                    {course.title}
                  </CardTitle>

                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                    {course.shortDescription}
                  </p>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Tuition</span>
                      <span className="text-xl font-extrabold text-white font-heading">{course.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Duration</span>
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-brand-cerulean" />
                        {course.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <Link href={`/programs/${course.slug}`} className="w-full block">
                    <Button
                      variant="cerulean"
                      size="sm"
                      className="w-full rounded-xl font-bold"
                    >
                      View Syllabus & Enroll
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
