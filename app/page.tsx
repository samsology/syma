'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  Activity,
  LineChart,
  Brain,
  GraduationCap,
  Clock,
  Layers,
  ChevronRight,
  CalendarDays,
  Star,
  Quote,
  MapPin,
  FileSpreadsheet,
  PieChart,
  Award
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Counter } from '@/components/ui/Counter';

const stats = [
  { value: '200+', label: 'Professionals Trained' },
  { value: '40+', label: 'Dashboards Delivered' },
  { value: '150+', label: 'Consultations Scoped' },
  { value: '100%', label: 'Satisfaction Rate' },
  { value: '5+', label: 'Years of Experience' },
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

const courses = [
  {
    title: 'Healthcare Data Analytics',
    level: 'Beginner Friendly',
    duration: '11 Weeks',
    outcomes: 'Clinical Reporting, SQL, Power BI dashboards',
    projects: 'Hospital Operations Tracker',
    price: 'NGN 70,000',
    usd: 'approx. $51',
    href: '/enroll?program=Healthcare-Data-Analytics',
  },
  {
    title: 'Python for Data Science',
    level: 'Intermediate Level',
    duration: '9 Weeks',
    outcomes: 'Pandas pipelines, APIs, automation coding',
    projects: 'Public Health Research Notebooks',
    price: 'NGN 120,000',
    usd: 'approx. $87',
    href: '/enroll?program=Python-for-Data-Science',
  },
  {
    title: 'Business Intelligence',
    level: 'Advanced Level',
    duration: '7 Weeks',
    outcomes: 'DAX modeling, KPI frameworks, executive UX',
    projects: 'Interactive Performance Board',
    price: 'NGN 150,000',
    usd: 'approx. $109',
    href: '/enroll?program=Business-Intelligence',
  },
];

const testimonials = [
  {
    name: 'Emmanuella A.',
    role: 'Data Analyst, Operations',
    focus: 'Data Analytics Cohort 8',
    image: '/images/Testimonials/Testimonial_001.webp',
    quote: 'The capstone project helped me explain business numbers with confidence. I left with a dashboard and a story I could defend in interviews.',
  },
  {
    name: 'Ezekiel O.',
    role: 'BI Associate',
    focus: 'Business Intelligence Cohort 5',
    image: '/images/Testimonials/Testimonial_002.webp',
    quote: 'Mentor reviews made the biggest difference. My Power BI report went from basic charts to an executive-ready project.',
  },
  {
    name: 'Ann I.',
    role: 'Python Data Intern',
    focus: 'Python for Data Science Cohort 3',
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

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
                        <line x1="20" y1="70" x2="280" y2="10" stroke="#3E4095" strokeWidth="2" strokeDasharray="3" />
                        {/* Scatter points */}
                        <circle cx="40" cy="62" r="3" fill="#16C7D4" />
                        <circle cx="80" cy="54" r="3" fill="#16C7D4" />
                        <circle cx="120" cy="45" r="3" fill="#16C7D4" />
                        <circle cx="160" cy="35" r="3" fill="#16C7D4" />
                        <circle cx="200" cy="30" r="3" fill="#16C7D4" />
                        <circle cx="240" cy="18" r="3" fill="#16C7D4" />
                        <circle cx="270" cy="12" r="3" fill="#16C7D4" />
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
      <section className="py-24 lg:py-32 border-t border-slate-100 bg-slate-50/50">
        <Container className="space-y-16">
          <SectionHeading
            badge="Professional Education"
            title="Practical Analytics Academy"
            description="Outcome-driven certification programs built on real-world datasets and guided by industry mentors."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course.title}
                hoverEffect="lift"
                className="flex flex-col justify-between border-slate-100 bg-white p-8 relative shadow-sm"
              >
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                      {course.level}
                    </span>
                    <h3 className="text-xl font-bold font-heading text-slate-900 mt-4">{course.title}</h3>
                  </div>

                  <div className="space-y-3 text-sm text-slate-500">
                    <p className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="font-medium text-slate-400">Duration:</span>
                      <span className="font-semibold text-slate-800">{course.duration}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="font-medium text-slate-400">Main outcome:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[160px] truncate">{course.outcomes}</span>
                    </p>
                    <p className="flex justify-between pb-2">
                      <span className="font-medium text-slate-400">Projects:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[160px] truncate">{course.projects}</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-2xl font-extrabold text-slate-900">{course.price}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{course.usd}</p>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Link href={course.href} className="w-full">
                    <Button variant="primary" className="w-full">
                      Enroll Track
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
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

      {/* 8. Founder Spotlight Section */}
      <section className="py-24 lg:py-32 border-t border-slate-100 bg-slate-50/50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left: Portait image */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto h-80 w-80 max-w-full overflow-hidden rounded-3xl border border-slate-150 bg-slate-50 shadow-xl shadow-slate-100/50">
                <Image
                  src="/images/profile_section.webp"
                  alt="Samuel Johnson, Co-founder of Syma Tech Solutions"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80vw, 320px"
                />
              </div>
            </div>

            {/* Right: Brief Bio & Timeline */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block">Executive Leadership</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900">Samuel Johnson</h2>
              <p className="text-sm leading-relaxed text-slate-500">
                Healthcare Data Analyst and technology entrepreneur. Possessing a background in Human Anatomy from Ahmadu Bello University, Samuel guides analytics solutions, bioinformatics studies, and capacity education across Africa.
              </p>

              {/* Achievements Timeline */}
              <div className="space-y-4 border-l border-slate-200 pl-4 mt-6">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Biomedical Background</h4>
                  <p className="text-xs text-slate-400">Human Anatomy Graduate (ABU, Zaria)</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Data Analyst Professional</h4>
                  <p className="text-xs text-slate-400">Focusing on Health Informatics & Data Strategy</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Founded Syma Tech</h4>
                  <p className="text-xs text-slate-400">Bridging the gap between raw data collection and strategic policy outcomes</p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link href="/about">
                  <Button variant="outline" size="sm" className="border-slate-200">
                    Learn More About Us
                  </Button>
                </Link>
                <a
                  href="https://www.linkedin.com/in/samuel-johnson-766b2a337/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Samuel Johnson LinkedIn Profile"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
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
