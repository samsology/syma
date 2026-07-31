import { Suspense } from 'react';
import { Loader2, Calendar, FileText, CheckSquare, Clock } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import ConsultationForm from '@/components/forms/ConsultationForm';

export default function Consultation() {
  return (
    <div className="bg-white text-slate-800 font-sans min-h-screen py-16 lg:py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 pointer-events-none" />

      <Container className="space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-primary/5 text-xs font-bold text-primary shadow-sm">
            Technical Consultation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
            Solve Operational Analytics Bottlenecks
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
            Partner with Syma Tech Solutions to build unified clinical dashboards, statistical research databases, and data strategies.
          </p>
        </div>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Left Column: What to expect */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-heading">Scoping Call Parameters</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Confirm your booking details. We conduct technical consultations via secure video links to align operations and scope integrations.
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-600">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Duration</strong>
                  <span>45-minute technical scoping call</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <FileText className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Database Audit</strong>
                  <span>Scoping clinical databases and variables reporting latency</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <CheckSquare className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Roadmap Outline</strong>
                  <span>Phased development models and custom scoping estimates</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-400 font-medium">
                Note: All technical datasets reviewed during consultation are protected under standard confidentiality agreements.
              </p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <Suspense
              fallback={
                <div className="max-w-xl mx-auto bg-white border border-slate-150 rounded-3xl p-8 flex items-center justify-center min-h-[300px] shadow-lg">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              }
            >
              <ConsultationForm />
            </Suspense>
          </div>
        </div>
      </Container>
    </div>
  );
}
