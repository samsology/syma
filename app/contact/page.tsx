import { Mail, Phone, MapPin } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm';
import ContactFaq from '@/components/sections/ContactFaq';

export default function Contact() {
  return (
    <div className="relative bg-slate-950 text-white min-h-screen py-16 lg:py-24">
      {/* Glow highlight */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-xs font-semibold text-secondary">
            Contact Syma Tech
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Start a Conversation About Evidence, Insight, and Impact
          </h1>
          <p className="text-slate-400 text-lg">
            Reach out about healthcare analytics, research support, business intelligence, dashboards, training, partnerships, or consulting.
          </p>
        </div>

        {/* Form and Contact Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Contact Channels</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Reach out directly by email or phone. We respond to consulting, training, research, and partnership inquiries.
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-semibold mb-0.5">Headquarters</strong>
                  <span>Kaduna State, Nigeria</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-semibold mb-0.5">Consulting & Inquiries</strong>
                  <a href="tel:+2347026954912" className="hover:text-white transition-colors">+234 702 695 4912</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white font-semibold mb-0.5">Email</strong>
                  <a href="mailto:symatechsolutions@gmail.com" className="hover:text-white transition-colors">symatechsolutions@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="border-t border-slate-900 pt-6 space-y-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">Business Hours</span>
              <p className="text-sm text-slate-400">Monday &ndash; Friday, 8:00 AM &ndash; 10:00 PM Central Time</p>
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </div>

        {/* FAQ Section */}
        <ContactFaq />
      </div>
    </div>
  );
}
