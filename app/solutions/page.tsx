import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, Building2, GraduationCap, HeartPulse, LineChart } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

const solutions = [
  {
    title: 'Healthcare Analytics',
    icon: HeartPulse,
    problem: 'Clinical, operational, and public health data often sit in disconnected systems, making it difficult to see risk, performance, and outcomes clearly.',
    approach: 'We structure healthcare datasets, design reporting models, and translate complex indicators into insight for management, program, and clinical decision-making.',
    outcomes: 'Cleaner reporting, stronger performance monitoring, improved service visibility, and better evidence for health planning.',
    industries: 'Hospitals, clinics, HMOs, public health programs, NGOs, and government agencies.',
  },
  {
    title: 'Business Intelligence',
    icon: BarChart3,
    problem: 'Executives and teams need timely answers, but manual spreadsheets and fragmented reports slow decisions.',
    approach: 'We build KPI frameworks, Power BI dashboards, executive scorecards, and reporting systems that make performance easier to monitor.',
    outcomes: 'Faster reporting cycles, clearer accountability, and decision support for growth, finance, operations, and leadership teams.',
    industries: 'Healthcare, education, retail, professional services, SMEs, and enterprise teams.',
  },
  {
    title: 'Research Intelligence',
    icon: Brain,
    problem: 'Research teams need rigorous analysis, clean survey outputs, and publication-ready reporting without losing the meaning behind the evidence.',
    approach: 'We support study design, data cleaning, statistical analysis, visualization, interpretation, and research reporting.',
    outcomes: 'Stronger research outputs, credible findings, clear tables and figures, and reports ready for academic, donor, or policy audiences.',
    industries: 'Universities, research institutes, NGOs, public health teams, and academic authors.',
  },
  {
    title: 'Data Strategy',
    icon: LineChart,
    problem: 'Many organizations collect data but lack a practical roadmap for governance, reporting, quality, and analytics maturity.',
    approach: 'We assess current systems, map decision needs, define metrics, and design phased analytics roadmaps that teams can execute.',
    outcomes: 'A clearer operating model for data, better metric discipline, and a practical path from raw information to institutional intelligence.',
    industries: 'Healthcare organizations, NGOs, government programs, universities, and growing businesses.',
  },
  {
    title: 'Dashboard Development',
    icon: Building2,
    problem: 'Important indicators are difficult to track when reporting depends on static files, delayed updates, or unclear visuals.',
    approach: 'We design interactive dashboards with clean data models, audience-specific views, and concise narratives for leadership and program teams.',
    outcomes: 'Live performance visibility, fewer reporting bottlenecks, and dashboards people can use in real management conversations.',
    industries: 'Healthcare, research, donor-funded programs, operations, sales, and executive teams.',
  },
  {
    title: 'Training & Capacity Building',
    icon: GraduationCap,
    problem: 'Professionals and teams need analytics capability that connects tools to real health, research, and business decisions.',
    approach: 'We deliver practical training in analytics, SQL, Power BI, Python, research workflows, and executive communication using realistic datasets.',
    outcomes: 'Confident analysts, stronger internal reporting teams, and professionals prepared for meaningful analytics work.',
    industries: 'Students, early-career professionals, corporate teams, NGOs, universities, and healthcare institutions.',
  },
];

export default function Solutions() {
  return (
    <div className="min-h-screen bg-white py-16 font-sans text-slate-900 lg:py-24">
      <section className="border-b border-slate-100 pb-16">
        <Container>
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Enterprise Solutions
            </div>
            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-neutral-dark sm:text-5xl">
              Intelligence systems for healthcare, research, and business decisions.
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-500">
              Syma Tech Solutions helps organizations turn complex information into clear evidence, operational visibility, and measurable action.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            badge="What We Deliver"
            title="Health and Research Intelligence Services"
            description="Consulting, dashboards, analytics strategy, and capacity building for institutions that need better evidence behind important decisions."
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <Card key={solution.title} hoverEffect="lift" className="border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl text-slate-950">{solution.title}</CardTitle>
                  </div>
                  <div className="grid gap-4 text-sm leading-6 text-slate-600">
                    <p><strong className="text-slate-900">Problem:</strong> {solution.problem}</p>
                    <p><strong className="text-slate-900">Approach:</strong> {solution.approach}</p>
                    <p><strong className="text-slate-900">Outcomes:</strong> {solution.outcomes}</p>
                    <p><strong className="text-slate-900">Industries served:</strong> {solution.industries}</p>
                  </div>
                  <Link href="/consultation" className="mt-6 inline-flex text-sm font-bold text-primary">
                    Discuss this solution <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="pb-24 lg:pb-32">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/15">
            <h2 className="mx-auto max-w-2xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
              Build the intelligence layer your organization needs.
            </h2>
            <p className="mx-auto mb-8 mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
              Partner with Syma Tech Solutions to improve reporting, research quality, and decision-making across your institution.
            </p>
            <Link href="/consultation">
              <Button variant="accent" size="lg" className="bg-white font-sans font-bold text-primary hover:bg-white/90">
                Schedule a Consultation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
