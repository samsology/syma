import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2, Clock, Award, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import EnrollmentForm from '@/components/forms/EnrollmentForm';

export const metadata: Metadata = {
  title: 'Apply for Enrollment',
  description:
    'Apply to Syma Tech Academy. Master practical data literacy, analytics, data science, and healthcare analytics with live labs, mentor code reviews, and certified graduation projects.',
  alternates: {
    canonical: '/enroll',
  },
  openGraph: {
    title: 'Apply to Syma Tech Academy | Data & Health Intelligence',
    description:
      'Enroll in 8-week project-based tracks. Transparent tuition, weekly live labs, and dedicated mentor code reviews.',
    url: '/enroll',
  },
};

export default function EnrollPage() {
  return (
    <div className="bg-slate-50/50 text-slate-900 font-sans min-h-screen py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-brand-cerulean/10 blur-[140px] -z-10"
      />

      <Container className="space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="flex justify-center">
            <Eyebrow variant="cerulean">Next Cohort Admissions</Eyebrow>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading text-slate-900 leading-[1.15]">
            Apply to Syma Tech Academy
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join an intensive, project-driven learning cohort. Master real-world data hygiene, production SQL modeling, and clinical analytics with practicing biostatisticians.
          </p>
        </div>

        {/* Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start max-w-6xl mx-auto">
          {/* Left Column: What to Expect in the Cohort */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  What Every Cohort Includes
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                  We maintain small cohort sizes to guarantee individualized instructor attention.
                </p>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      8-Week Structured Tracks
                    </strong>
                    <span className="text-slate-500">
                      Flexible evening & weekend live sessions designed for working professionals.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Weekly 1-on-1 Code Reviews
                    </strong>
                    <span className="text-slate-500">
                      Direct feedback on your SQL queries, Power BI models, and Python scripts.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Certified Capstone Project
                    </strong>
                    <span className="text-slate-500">
                      Graduates receive a verified credential and complete an audit-ready portfolio piece.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tuition Transparency Assurance */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 shadow-lg shadow-slate-900/10">
              <div className="flex items-center gap-2 text-brand-cerulean font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Transparent Tuition</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Accessible pricing from ₦19,900 to ₦69,900 with zero recurring subscription traps. Instant access to the student LMS upon enrollment confirmation.
              </p>
            </div>
          </div>

          {/* Right Column: Suspense Form */}
          <div className="lg:col-span-7">
            <Suspense
              fallback={
                <div className="max-w-xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] shadow-xl text-slate-500 space-y-4">
                  <Loader2 className="w-8 h-8 text-brand-cerulean animate-spin" />
                  <p className="text-sm font-medium">Loading admissions portal...</p>
                </div>
              }
            >
              <EnrollmentForm />
            </Suspense>
          </div>
        </div>
      </Container>
    </div>
  );
}
