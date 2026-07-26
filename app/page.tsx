import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

const stats = [
  { value: '200+', label: 'professionals trained in analytics and BI' },
  { value: '40+', label: 'dashboards, studies, and portfolio projects delivered' },
  { value: '6', label: 'focus areas: health, research, BI, and education' },
];

const courses = [
  {
    title: 'Healthcare Data Analytics',
    description: 'Healthcare reporting, visualization, SQL, Power BI, and evidence-based decision-making with real health datasets.',
    duration: '12 weeks',
    tag: 'Beginner friendly',
    price: 'NGN 70,000',
    usd: 'approx. $51',
  },
  {
    title: 'Python for Data Science',
    description: 'Modern analytical workflows using Python, Pandas, APIs, automation, and exploratory analysis for health and research applications.',
    duration: '10 weeks',
    tag: 'Mentor reviewed',
    price: 'NGN 120,000',
    usd: 'approx. $87',
  },
  {
    title: 'Business Intelligence',
    description: 'Executive dashboards, KPI frameworks, reporting models, and insight communication for organizational performance.',
    duration: '8 weeks',
    tag: 'Portfolio focused',
    price: 'NGN 150,000',
    usd: 'approx. $109',
  },
  {
    title: 'Institutional Capacity Building',
    description: 'Custom analytics and BI training for healthcare teams, NGOs, universities, businesses, and research groups.',
    duration: 'Custom',
    tag: 'For teams',
    price: 'Custom',
    usd: 'Quoted on Request',
  },
];

const whySyma = [
  {
    title: 'Health and research context',
    text: 'We connect analytics methods to healthcare delivery, public health, research, and operational decision-making.',
  },
  {
    title: 'Decision-ready outputs',
    text: 'Our work leads to dashboards, reports, analysis notebooks, and evidence briefs that leaders can act on.',
  },
  {
    title: 'Professional readiness',
    text: 'Students and early-career professionals learn to communicate insight with clarity, rigor, and business awareness.',
  },
  {
    title: 'Institutional support',
    text: 'Organizations can engage us for BI dashboards, research analytics, reporting systems, and data strategy.',
  },
];

const graduateStories = [
  {
    name: 'Emmaunella A.',
    role: 'Data Analyst, Retail Operations',
    graduationYear: '2025',
    cohort: 'Data Analytics Cohort 8',
    image: '/images/Testimonials/Testimonial_001.webp',
    quote:
      'The capstone project helped me explain business numbers with confidence. I left with a dashboard and a story I could defend in interviews.',
  },
  {
    name: 'Ezekiel O.',
    role: 'BI Associate',
    graduationYear: '2024',
    cohort: 'Business Intelligence Cohort 5',
    image: '/images/Testimonials/Testimonial_002.webp',
    quote:
      'Mentor reviews made the biggest difference. My Power BI report went from basic charts to an executive-ready project.',
  },
  {
    name: 'Ann I.',
    role: 'Python Data Intern',
    graduationYear: '2025',
    cohort: 'Python for Data Science Cohort 3',
    image: '/images/Testimonials/Testimonial_003.webp',
    quote:
      'I learned how to clean messy datasets, use notebooks properly, and present findings like real workplace analysis.',
  },
];

const heroSlides = [
  {
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    alt: 'Analytics dashboard with business charts and metrics',
  },
  {
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Laptop showing data charts during analytics work',
  },
  {
    src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
    alt: 'Team collaborating around laptops on a technology project',
  },
];

const ctaClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20';

function CtaLink({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link
      href={href}
      className={cn(
        ctaClass,
        variant === 'primary'
          ? 'bg-primary text-white hover:bg-primary/90'
          : 'border border-slate-200 bg-white text-slate-950 hover:border-primary/30 hover:text-primary'
      )}
    >
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="overflow-hidden border-b border-slate-200 bg-[#f8fafc]">
        <Container className="grid min-h-[calc(100vh-4.5rem)] gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_0.88fr] lg:items-center lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              Health & Research Intelligence for African institutions
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.06] text-slate-950 sm:text-5xl lg:text-6xl">
              Advancing Healthcare and Business Through Data Intelligence
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              We empower healthcare organizations, researchers, NGOs, businesses, and professionals with analytics,
              business intelligence, and technology solutions that transform complex information into actionable insight and measurable impact.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaLink href="/solutions">
                Explore Our Solutions
                <ArrowRight className="h-4 w-4" />
              </CtaLink>
              <CtaLink href="/consultation" variant="secondary">
                Book a Consultation
              </CtaLink>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="border-l border-slate-200 pl-4">
                  <p className="text-2xl font-extrabold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                {heroSlides.map((slide, index) => (
                  <Image
                    key={slide.src}
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className={cn('hero-slide object-cover', index === 0 && 'hero-slide-one', index === 1 && 'hero-slide-two', index === 2 && 'hero-slide-three')}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs font-semibold uppercase text-secondary/90">Featured focus</p>
                  <h2 className="mt-1 text-2xl font-bold">Healthcare Intelligence Systems</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-100">
                    Dashboards, reporting models, research analysis, and professional training for evidence-led teams.
                  </p>
                </div>
              </div>
              <div className="grid gap-0 border-t border-slate-200 sm:grid-cols-3">
                {['Analytics consulting', 'Research support', 'Professional education'].map((item) => (
                  <div key={item} className="border-b border-slate-200 p-4 text-sm font-semibold text-slate-700 sm:border-b-0 sm:border-r last:sm:border-r-0">
                    <Check className="mb-2 h-4 w-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-200 bg-[#f8fafc] py-14 lg:py-20">
        <Container>
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-primary">Professional education</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-extrabold text-slate-950">
                Build the analytical capability modern health, research, and business teams need.
              </h2>
            </div>
            <Link href="/programs" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View programs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <article key={course.title} className="flex min-h-[250px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-950">{course.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{course.description}</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-lg font-extrabold text-slate-950">{course.price}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{course.usd}</p>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Clock3 className="h-3.5 w-3.5" />
                    {course.duration}
                  </span>
                  <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">{course.tag}</span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-primary">Why Syma Tech?</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                Intelligence work grounded in healthcare, research, and practical execution.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                We help organizations and professionals move from fragmented information to clear evidence, useful systems,
                and decisions that improve outcomes across healthcare, research, and business operations.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaLink href="/consultation" variant="secondary">
                  <CalendarDays className="h-4 w-4" />
                  Book consultation
                </CtaLink>
                <CtaLink href="/about" variant="secondary">
                  About Syma Tech
                </CtaLink>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {whySyma.map((item) => {
                return (
                  <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 lg:py-20">
        <Container>
          <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold text-primary">Impact stories</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
              Professionals building evidence-ready work.
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
              A few learners from recent cohorts share how applied analytics, review, and portfolio practice helped them move forward.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {graduateStories.map((story) => (
              <article key={story.name} className="rounded-lg border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <Image
                    src={story.image}
                    alt={`${story.name}, ${story.cohort} graduate`}
                    width={72}
                    height={72}
                    sizes="72px"
                    className="h-18 w-18 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-950">{story.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{story.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600">&ldquo;{story.quote}&rdquo;</p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1">Graduated {story.graduationYear}</span>
                  <span className="rounded-full bg-primary/5 px-3 py-1 text-primary">{story.cohort}</span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f8fafc] py-14 lg:py-20">
        <Container>
          <div className="grid gap-6 rounded-lg bg-primary p-6 text-white md:grid-cols-[1fr_auto] md:items-center lg:p-8">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-secondary/90">
                Partner with us
              </div>
              <h2 className="text-2xl font-extrabold">Strengthen the intelligence behind your next decision.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                Explore consulting, dashboards, research analytics, and professional training designed for measurable institutional impact.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/solutions" className={cn(ctaClass, 'bg-white text-primary hover:bg-primary/5')}>
                Explore solutions
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className={cn(ctaClass, 'border border-white/30 text-white hover:bg-white/10')}>
                Contact us
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
