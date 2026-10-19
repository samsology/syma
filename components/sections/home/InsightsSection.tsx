import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';

export function InsightsSection() {
  return (
    <section className="border-b border-slate-200/70 bg-white py-20 lg:py-28">
      <Container>
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-8 rounded-3xl border border-slate-200 bg-marketing-light-bg p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow variant="navy">Insights</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ideas for working with data
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Explore the insights library for material on analytics, research, reporting, and data systems.
            </p>
          </div>
          <Link
            href="/insights"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:border-brand-cerulean hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean focus-visible:ring-offset-2"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Browse insights
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
