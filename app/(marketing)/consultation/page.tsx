import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  Loader2,
  Clock,
  ShieldCheck,
  CheckCircle,
  Mail,
  Phone,
  FileCode,
  Building,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import ConsultationForm from '@/components/forms/ConsultationForm';

export const metadata: Metadata = {
  title: 'Schedule a Consultation',
  description:
    'Book a 45-minute technical scoping call with our biostatistical and health data systems team to audit your data infrastructure, resolve reporting bottlenecks, or scope custom clinical tools.',
  alternates: {
    canonical: '/consultation',
  },
  openGraph: {
    title: 'Technical Consultation & Scoping | Syma Tech Solutions',
    description:
      'Book a 45-minute technical scoping session to audit your data infrastructure and scope custom analytics.',
    url: '/consultation',
  },
};

export default function ConsultationPage() {
  return (
    <div className="bg-slate-50/50 text-slate-900 font-sans min-h-screen py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-brand-cerulean/10 blur-[130px] -z-10"
      />

      <Container className="space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="flex justify-center">
            <Eyebrow variant="cerulean">Direct Technical Engagement</Eyebrow>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading text-slate-900 leading-[1.15]">
            Schedule Your Technical Scoping Call
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Connect directly with our biostatistical and health data systems leads to evaluate your operational data bottlenecks, audit schema readiness, and receive a phased engineering roadmap.
          </p>
        </div>

        {/* Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start max-w-6xl mx-auto">
          {/* Left Column: What to expect & Trust assurances */}
          <div className="lg:col-span-5 space-y-8">
            {/* Scoping Call Parameters */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  What We Cover in 45 Minutes
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                  Our technical sessions are conducted via secure video links to align operations and scope systems directly.
                </p>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      1. Bottleneck & KPI Audit
                    </strong>
                    <span className="text-slate-500">
                      Identify current reporting delays, spreadsheet dependencies, and clinical metrics gaps.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      2. Architecture & Schema Review
                    </strong>
                    <span className="text-slate-500">
                      Review database compatibility (SQL, EHR, REDCap, CSV) and data cleanliness constraints.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      3. Actionable Scoping Blueprint
                    </strong>
                    <span className="text-slate-500">
                      Receive an estimated sprint schedule, key milestones, and a clear budget scope.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidentiality & Security Card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 shadow-lg shadow-slate-900/10">
              <div className="flex items-center gap-2.5 text-brand-cerulean font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Confidentiality</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                For work involving proprietary information, confidentiality terms can be discussed before any review begins. Please do not include sensitive data in this form.
              </p>
            </div>

            {/* Direct Contact Fallback */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Prefer Direct Inquiries?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You can reach our technical partnerships desk directly via email or phone:
              </p>
              <div className="space-y-2 pt-1 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-cerulean shrink-0" />
                  <a
                    href="mailto:symatechsolutions@gmail.com"
                    className="hover:text-brand-cerulean font-medium transition-colors"
                  >
                    symatechsolutions@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-brand-cerulean shrink-0" />
                  <span className="font-medium">+234 810 528 5057</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Consultation Booking Form */}
          <div className="lg:col-span-7">
            <Suspense
              fallback={
                <div className="max-w-xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] shadow-xl text-slate-500 space-y-4">
                  <Loader2 className="w-8 h-8 text-brand-cerulean animate-spin" />
                  <p className="text-sm font-medium">Loading consultation scheduler...</p>
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
