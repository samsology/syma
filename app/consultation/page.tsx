'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import ConsultationForm from '@/components/forms/ConsultationForm';

function ConsultationContent() {
  return <ConsultationForm />;
}

export default function Consultation() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen py-16 lg:py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] -z-10 pointer-events-none" />

      <Container className="space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 text-xs font-bold text-secondary">
            Consultation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading text-neutral-dark">
            Let&apos;s Solve Your Data Challenges
          </h1>
          <p className="text-slate-500 text-lg">
            Whether you&apos;re a healthcare organization, NGO, university, research institute, or growing business, Syma Tech Solutions partners with you to build data-informed systems that improve decision-making and create measurable impact.
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
          <ConsultationContent />
        </Suspense>
      </Container>
    </div>
  );
}

