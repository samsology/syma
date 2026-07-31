import { Mail, Phone, MapPin } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm';
import ContactFaq from '@/components/sections/ContactFaq';

export default function Contact() {
  return (
    <div className="relative bg-white text-slate-800 min-h-screen py-16 lg:py-24 font-sans">
      {/* Glow highlight */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-primary/5 text-xs font-bold text-primary shadow-sm">
            Contact Channels
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
            Start a Conversation with Our Team
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
            Reach out regarding health analytics audits, research design consulting, Power BI scorecards, or corporate training.
          </p>
        </div>

        {/* Form and Contact Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-heading">Consulting Scopes</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Send your operational queries or schedule a technical call. We answer partner, training, and research inquiries within 24 hours.
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-600">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Headquarters</strong>
                  <span>Nigeria (Kaduna State / Online)</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <Phone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Consulting Inquiries</strong>
                  <a href="tel:+2347026954912" className="hover:text-primary transition-colors font-semibold">+234 702 695 4912</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">General Email</strong>
                  <a href="mailto:symatechsolutions@gmail.com" className="hover:text-primary transition-colors font-semibold">symatechsolutions@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="border-t border-slate-100 pt-6 space-y-2">
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold">Scoping Hours</span>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Monday &ndash; Friday, 8:00 AM &ndash; 10:00 PM (GMT+1)</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        {/* FAQ Section */}
        <ContactFaq />
      </div>
    </div>
  );
}
