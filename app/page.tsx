'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Activity,
  LineChart,
  Brain,
  GraduationCap,
  ChevronRight,
  Star,
  BookOpen,
  BarChart3,
  Code2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Counter } from '@/components/ui/Counter';
import {
  OFFICIAL_COURSES,
  GLOBAL_COURSE_INCLUSIONS,
  VALUE_PROPOSITION,
  COURSE_PROGRESSION,
} from '@/lib/courses/catalog';

const stats = [
  { value: '50+', label: 'Professionals Trained' },
  { value: '20+', label: 'Dashboards Delivered' },
  { value: '10+', label: 'Consultations Scoped' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '3+', label: 'Years of Experience' },
];

const industries = [
  { name: 'Healthcare', desc: 'Hospitals & Systems' },
  { name: 'Research', desc: 'Academic & Clinical' },
  { name: 'Education', desc: 'Data & BI Literacy' },
  { name: 'Government', desc: 'Public Health Data' },
  { name: 'NGOs', desc: 'Development Programs' },
  { name: 'Business', desc: 'Intelligence Layer' },
];

const solutions = [
  {
    title: 'Healthcare Analytics',
    description: 'Structure complex patient data and clinical records into clear, outcome-focused system reports.',
    icon: Activity,
  },
  {
    title: 'Business Intelligence',
    description: 'Centralize key operations metrics into real-time dashboards for executive decision-making.',
    icon: LineChart,
  },
  {
    title: 'Research Intelligence',
    description: 'Apply biostatistics, survey coding, and clean analytics pipelines for research validation.',
    icon: Brain,
  },
  {
    title: 'Professional Training',
    description: 'Empower analysts and teams with hands-on training in SQL, Python, and Power BI.',
    icon: GraduationCap,
  },
];

const courseIcons = {
  BookOpen,
  BarChart3,
  Code2,
  Activity,
};

const testimonials = [
  {
    name: 'Emmanuella A.',
    role: 'Data Analyst, Operations',
    focus: 'Data Analytics Cohort 1',
    image: '/images/Testimonials/Testimonial_001.webp',
    quote: 'The capstone project helped me explain business numbers with confidence. I left with a dashboard and a story I could defend in interviews.',
  },
  {
    name: 'Ezekiel O.',
    role: 'BI Associate',
    focus: 'Business Intelligence Cohort 1',
    image: '/images/Testimonials/Testimonial_002.webp',
    quote: 'Mentor reviews made the biggest difference. My Power BI report went from basic charts to an executive-ready project.',
  },
  {
    name: 'Ann I.',
    role: 'Python Data Intern',
    focus: 'Python for Data Science Cohort 2',
    image: '/images/Testimonials/Testimonial_003.webp',
    quote: 'I learned how to clean messy datasets, use notebooks properly, and present findings like real workplace analysis.',
  },
];

const articles = [
  {
    category: 'Healthcare',
    title: 'Data-Driven Solutions in African Public Health',
    desc: 'How standardized databases and automated clinics are changing patient reporting.',
    time: '5 min read',
  },
  {
    category: 'AI & Research',
    title: 'Leveraging AI for Genomic Variant Analysis',
    desc: 'An introductory guide to computational biology workflows for clinical research teams.',
    time: '7 min read',
  },
  {
    category: 'Power BI',
    title: 'Building Executive-Ready BI Dashboards',
    desc: 'Design systems and KPI frameworks that keep dashboard reports clear and actionable.',
    time: '4 min read',
  },
];

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div className="bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white overflow-hidden">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-10 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        <Container className="relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/10 bg-primary/5 text-xs font-bold text-primary shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span>Health & Research Intelligence Systems</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl mx-auto text-4xl sm:text-5xl lg:text-7xl font-extrabold font-heading text-slate-900 tracking-tight leading-[1.08]"
          >
            Data Intelligence for Better Healthcare Decisions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-slate-500 font-normal"
          >
            We empower healthcare systems, research groups, and businesses with analytics, business intelligence, and technology consulting.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/consultation">
              <Button size="lg" className="shadow-lg shadow-primary/10">
                Book Consultation
              </Button>
            </Link>
            <Link href="/solutions">
              <Button variant="outline" size="lg" className="border-slate-200 hover:bg-slate-50">
                Explore Solutions
              </Button>
            </Link>
          </motion.div>
        </Container>
      </section>

      {/* 2. Trusted Industries Section */}
      <section className="py-16 border-b border-slate-100 bg-white">
        <Container className="space-y-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            Trusted Across Multiple Industries & Sectors
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((ind) => (
              <div
                key={ind.name}
                className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-center hover:border-slate-200 transition-all duration-300 group hover:scale-[1.03]"
              >
                <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {ind.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">{ind.desc}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. Solutions Section */}
      <section className="py-24 lg:py-32 bg-white">
        <Container>
          <SectionHeading
            badge="Enterprise Solutions"
            title="Smarter Intelligence Systems"
            description="Phased data maturity models designed to take institutions from raw data collection to actionable clinical and business predictions."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {solutions.map((sol) => {
              const Icon = sol.icon;
              return (
                <Card
                  key={sol.title}
                  hoverEffect="lift"
                  className="flex flex-col border-slate-100 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_12px_24px_-10px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">{sol.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
                    {sol.description}
                  </CardDescription>
                  <Link
                    href="/solutions"
                    className="inline-flex items-center text-xs font-bold text-primary hover:text-secondary gap-1 group/link mt-auto"
                  >
                    Learn More <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                </Card>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* 4. Impact Metrics Section */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/50">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2 border-r border-slate-100 last:border-0">
                <p className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                  <Counter value={stat.value} />
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Featured Case Studies */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Featured Case Studies"
            title="Evidence in Practice"
            description="Examples of deployed healthcare, operational dashboards, and research datasets engineered for clarity."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Case Study 1 */}
            <Card hoverEffect="lift" className="p-8 border-slate-100 flex flex-col justify-between h-full bg-white">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                    Healthcare Operations
                  </span>
                  <span className="text-xs font-semibold text-green-600">Active Deployed Dashboard</span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold font-heading text-slate-900">
                    Regional Health Program Dashboard
                  </CardTitle>
                  <p className="text-sm leading-relaxed text-slate-500">
                    <strong>Challenge:</strong> Facility-level service metrics were isolated in spreadsheets, leading to reporting bottlenecks and slow leadership reviews.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500">
                    <strong>Outcome:</strong> Deployed a centralized dashboard, achieving immediate visibility on operational indicators and reducing reporting latency by 45%.
                  </p>
                </div>

                {/* CSS Mock Dashboard Visual */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>patient_kpi_tracker.pbix</span>
                    <span>Live Metrics</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-slate-100 p-2.5 rounded-lg text-center">
                      <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Admissions</span>
                      <span className="text-sm font-bold text-slate-900">1,240</span>
                      <span className="block text-[8px] text-green-500 font-bold mt-0.5">+14%</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-lg text-center">
                      <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Reporting Rate</span>
                      <span className="text-sm font-bold text-slate-900">96.8%</span>
                      <span className="block text-[8px] text-slate-400 font-bold mt-0.5">Optimal</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-lg text-center">
                      <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Follow-ups</span>
                      <span className="text-sm font-bold text-slate-900">89.4%</span>
                      <span className="block text-[8px] text-red-500 font-bold mt-0.5">-1.2%</span>
                    </div>
                  </div>
                  <div className="h-16 bg-white border border-slate-100 rounded-lg p-2 flex items-end justify-between gap-1">
                    {[35, 60, 45, 80, 55, 70, 95, 65, 85].map((h, i) => (
                      <div
                        key={i}
                        className="w-[8%] bg-primary/20 hover:bg-primary rounded-t-sm transition-colors cursor-pointer"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-8">
                <Link href="/portfolio" className="w-full">
                  <Button variant="outline" size="sm" className="w-full border-slate-200">
                    View Project Architecture
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Case Study 2 */}
            <Card hoverEffect="lift" className="p-8 border-slate-100 flex flex-col justify-between h-full bg-white">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                    Research Intelligence
                  </span>
                  <span className="text-xs font-semibold text-green-600">Publication-Ready Analysis</span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold font-heading text-slate-900">
                    Clinical Survey Analytics & Insights
                  </CardTitle>
                  <p className="text-sm leading-relaxed text-slate-500">
                    <strong>Challenge:</strong> An academic cohort study needed raw dataset cleaning, statistical analysis, and clear summaries for donor reporting.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500">
                    <strong>Outcome:</strong> Prepared clean analytics databases, structured descriptive models, and formatted visualizations directly matching journal submission specifications.
                  </p>
                </div>

                {/* CSS Mock Chart Visual */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>survey_regression_analysis.ipynb</span>
                    <span>SciPy Engine</span>
                  </div>
                  <div className="h-28 bg-white border border-slate-100 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span>Regression Model Fit: R² = 0.842</span>
                      <span className="text-green-600">p &lt; 0.001</span>
                    </div>
                    {/* SVG representation of scatter and line */}
                    <div className="flex-1 w-full h-full relative">
                      <svg className="w-full h-full" viewBox="0 0 300 80">
                        {/* Grid Lines */}
                        <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                        {/* Trend line */}
                        <line x1="20" y1="70" x2="280" y2="10" stroke="#022A9D" strokeWidth="2" strokeDasharray="3" />
                        {/* Scatter points */}
                        <circle cx="40" cy="62" r="3" fill="#38BDF8" />
                        <circle cx="80" cy="54" r="3" fill="#38BDF8" />
                        <circle cx="120" cy="45" r="3" fill="#38BDF8" />
                        <circle cx="160" cy="35" r="3" fill="#38BDF8" />
                        <circle cx="200" cy="30" r="3" fill="#38BDF8" />
                        <circle cx="240" cy="18" r="3" fill="#38BDF8" />
                        <circle cx="270" cy="12" r="3" fill="#38BDF8" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-8">
                <Link href="/portfolio" className="w-full">
                  <Button variant="outline" size="sm" className="w-full border-slate-200">
                    View Project Architecture
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 6. Programs Section */}
      <section className="py-24 lg:py-32 border-t border-slate-100 bg-slate-50/50 relative overflow-hidden">
        <Container className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold uppercase tracking-wider text-primary">
              {VALUE_PROPOSITION.mainHeadline}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-slate-900">
              Practical Analytics Academy
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              {VALUE_PROPOSITION.supportingHeadline}
            </p>
          </div>

          {/* Course Progression Journey */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Learning Pathway</p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Progression: From Data Literacy to Specialist</h3>
              </div>
              <Link href="/programs" className="text-xs font-bold text-primary hover:text-secondary inline-flex items-center gap-1">
                Explore Full Catalogue <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COURSE_PROGRESSION.map((step, idx) => (
                <div key={step.step} className="relative rounded-xl border border-slate-100 bg-slate-50/60 p-4 flex flex-col justify-between hover:border-primary/30 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">STEP {step.step}</span>
                      {idx < 3 && <span className="hidden lg:block text-slate-300 font-bold">→</span>}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-2">{step.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Official Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OFFICIAL_COURSES.map((course) => {
              const IconComponent = courseIcons[course.iconName] || BookOpen;
              return (
                <Card
                  key={course.slug}
                  hoverEffect="lift"
                  className="flex flex-col justify-between border-slate-200/80 bg-white p-6 relative shadow-sm hover:border-primary/40 transition-all rounded-2xl"
                >
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          COURSE {course.number}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/15">
                          {course.duration}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {course.badge}
                      </span>
                      <h3 className="text-lg font-bold font-heading text-slate-900 mt-1 line-clamp-2 leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900">{course.price}</span>
                        <span className="text-xs font-bold text-slate-400">USD</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" /> {course.support}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-50">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Benefits:</p>
                      {course.benefits.slice(0, 4).map((b, i) => (
                        <p key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{b}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <Link href={`/enroll?program=${course.slug}`} className="w-full block">
                      <Button variant="primary" className="w-full text-xs font-bold py-2.5">
                        {course.cta}
                      </Button>
                    </Link>
                    <Link
                      href={`/programs/${course.slug}`}
                      className="block text-center text-xs font-semibold text-slate-500 hover:text-primary transition-colors py-1"
                    >
                      View Curriculum & Details →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Shared Inclusions Banner */}
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-white to-primary/5 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Universal Guarantee</span>
                <h3 className="text-xl font-bold text-slate-900">Every Syma Tech Course Includes</h3>
                <p className="text-xs text-slate-500">All enrollments come backed by industry-standard learning infrastructure.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {GLOBAL_COURSE_INCLUSIONS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-white border border-slate-200/80 px-3 py-2.5 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. Success Stories Section */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <SectionHeading
            badge="Testimonials"
            title="Success Stories from our Cohorts"
            description="How professionals and graduates have applied data analytics literacy to grow their careers."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <Card
                key={test.name}
                className="p-6 border-slate-100 bg-white flex flex-col justify-between hover:border-slate-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 font-medium">
                    &ldquo;{test.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-100">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-150 bg-slate-50">
                    <Image
                      src={test.image}
                      alt={test.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{test.name}</h4>
                    <span className="block text-[10px] text-slate-400">{test.role}</span>
                    <span className="block text-[9px] text-primary font-semibold mt-0.5">{test.focus}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 9. Insights Section */}
      <section className="py-24 lg:py-32 bg-white">
        <Container className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block">Knowledge Base</span>
              <h2 className="text-3xl font-bold font-heading text-slate-900 mt-2">Latest Insights & Resources</h2>
            </div>
            <Link href="/insights">
              <Button variant="outline" size="sm" className="border-slate-250 flex items-center gap-1">
                View All Articles <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <Card
                key={art.title}
                hoverEffect="lift"
                className="border-slate-100 p-6 flex flex-col justify-between bg-white h-full shadow-sm hover:border-slate-200"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {art.category}
                  </span>
                  <CardTitle className="text-lg font-bold text-slate-900 leading-snug">{art.title}</CardTitle>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {art.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-6 text-[10px] font-semibold text-slate-400">
                  <span>{art.time}</span>
                  <Link href="/insights" className="text-primary hover:text-secondary inline-flex items-center gap-0.5">
                    Read <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 10. Final CTA Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/10">
            {/* Background elements */}
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-white/10 px-3 py-1 rounded-full">
                Partner with Syma Tech
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading leading-tight">
                Strengthen the Data Behind Your Next Decision
              </h2>
              <p className="text-sm text-slate-200 max-w-md mx-auto leading-relaxed">
                Connect with our consultants to build dashboards, design statistical research datasets, or train your clinical operations team.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/consultation">
                  <Button variant="accent" size="lg" className="w-full sm:w-auto font-sans font-bold bg-white text-primary hover:bg-slate-50">
                    Book a Consultation
                  </Button>
                </Link>
                <Link href="/solutions">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5">
                    Explore Solutions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
