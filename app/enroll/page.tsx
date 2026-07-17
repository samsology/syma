'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import EnrollmentForm from '@/components/forms/EnrollmentForm';

function EnrollmentContent() {
  const searchParams = useSearchParams();
  const programParam = searchParams?.get('program') || '';

  return <EnrollmentForm defaultProgram={programParam} />;
}

export default function Enroll() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen py-16 lg:py-24">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] -z-10 pointer-events-none" />

      <Container className="space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 text-xs font-bold text-secondary">
            Professional Education
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading text-neutral-dark">
            Apply to Syma Tech
          </h1>
          <p className="text-slate-500 text-lg">
            Apply for practical analytics training built around healthcare, research, business intelligence, and evidence-based decision-making.
          </p>
        </div>

        {/* Form boundary with Suspense */}
        <Suspense
          fallback={
            <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          }
        >
          <EnrollmentContent />
        </Suspense>
      </Container>
    </div>
  );
}

