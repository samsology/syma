import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import ContactForm from '@/components/forms/ContactForm';
import ContactFaq from '@/components/sections/ContactFaq';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Start a conversation with Syma Tech Solutions. Inquire about health analytics audits, clinical research design, Power BI dashboards, or corporate training.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Syma Tech Solutions | Health Intelligence Systems',
    description:
      'Reach out regarding clinical analytics audits, biostatistical consulting, or academy programs.',
    url: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="relative bg-white text-slate-900 min-h-screen py-16 sm:py-20 lg:py-24 font-sans overflow-hidden">
      {/* Background radial highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-cerulean/10 blur-[140px] -z-10"
      />

      <Container className="space-y-16 sm:space-y-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="flex justify-center">
            <Eyebrow variant="cerulean">Direct Inquiries & Partnerships</Eyebrow>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading text-slate-900 leading-[1.15]">
            Start a Conversation with Our Team
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Reach out regarding clinical analytics audits, research design consulting, Power BI scorecards, or corporate team upskilling.
          </p>
        </div>

        {/* Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start max-w-6xl mx-auto">
          {/* Details / Channels Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-7 rounded-3xl bg-slate-50/80 border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Inquiry Channels
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                  Our team reviews organizational, healthcare, and research inquiries and follows up as soon as possible.
                </p>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Headquarters
                    </strong>
                    <span className="text-slate-500">Abuja, FCT, Nigeria</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Consulting Inquiries & WhatsApp
                    </strong>
                    <a
                      href="tel:+2347026954912"
                      className="hover:text-brand-cerulean font-semibold text-slate-700 transition-colors"
                    >
                      +234 702 695 4912
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Official Inbound Email
                    </strong>
                    <a
                      href="mailto:solutions@symatechsolutions.com"
                      className="hover:text-brand-cerulean font-semibold text-slate-700 transition-colors"
                    >
                      solutions@symatechsolutions.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cerulean/10 text-brand-cerulean flex items-center justify-center shrink-0 border border-brand-cerulean/20">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Operating Hours
                    </strong>
                    <span className="text-slate-500">
                      Monday – Friday, 8:00 AM – 8:00 PM (GMT+1)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response SLA Assurance */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 shadow-lg shadow-slate-900/10">
              <div className="flex items-center gap-2 text-brand-cerulean font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1-Business-Day Response Commitment</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                We review consultation and project inquiries and follow up as soon as possible.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        {/* FAQ Section */}
        <ContactFaq />
      </Container>
    </div>
  );
}
