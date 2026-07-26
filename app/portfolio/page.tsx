import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import PortfolioShowcase from '@/components/sections/PortfolioShowcase';

const caseStudies = [
  {
    id: 'apex-retail',
    title: 'Healthcare Operations Dashboard',
    client: 'Regional Health Program',
    metric: 'Clearer Service Visibility',
    challenge: 'Facility-level service data was fragmented across spreadsheets, limiting timely review of performance indicators.',
    solution: 'Structured core indicators into a Power BI dashboard for service trends, reporting completeness, and management review.',
    tools: ['Snowflake', 'dbt', 'Tableau', 'Python', 'AWS Lambda'],
    category: 'Consulting Case Study'
  },
  {
    id: 'zenith-pay',
    title: 'Survey Analytics & Insight Report',
    client: 'Research Partner',
    metric: 'Publication-Ready Findings',
    challenge: 'A survey dataset required cleaning, coding, statistical summaries, and clear interpretation for decision-makers.',
    solution: 'Prepared cleaned outputs, descriptive analysis, visual summaries, and an insight report for research and program teams.',
    tools: ['Python', 'SQL', 'Scikit-Learn', 'AWS SageMaker', 'PostgreSQL'],
    category: 'Consulting Case Study'
  },
  {
    id: 'carepulse',
    title: 'Research Evidence Dashboard',
    client: 'Academic Research Team',
    metric: 'Improved Evidence Review',
    challenge: 'Research indicators were difficult to compare across cohorts, variables, and reporting periods.',
    solution: 'Created a dashboard and statistical summary structure to support analysis, interpretation, and academic reporting.',
    tools: ['Google Cloud Platform', 'BigQuery', 'Apache Airflow', 'Terraform'],
    category: 'Consulting Case Study'
  }
];

const studentProjects = [
  {
    id: 'marketing-attribution',
    title: 'SaaS Multi-Touch Attribution Engine',
    student: 'Agbo Emmaunella (Cohort 2)',
    challenge: 'Evaluated customer acquisition pipelines across ad channels using Markov Chain regression.',
    solution: 'Built automated web scrapers pulling property logs into a Postgres warehouse with daily regression forecasts.',
    tools: ['Python', 'PostgreSQL', 'Streamlit', 'Git'],
    category: 'Graduate Project'
  },
  {
    id: 'real-estate-pipeline',
    title: 'Real Estate Price Regression Pipeline',
    student: 'Omachonu Ezekial (Cohort 2)',
    challenge: 'Needed dynamic home pricing data to forecast asset yields for regional investments.',
    solution: 'Created Scrapy spiders to extract listing variables, routing to PostgreSQL database with Power BI reporting.',
    tools: ['Python', 'Scrapy', 'PostgreSQL', 'Power BI', 'Figma'],
    category: 'Graduate Project'
  }
];

export default function Portfolio() {

  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen py-16 lg:py-24">
      {/* Background blurs */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] -z-10 pointer-events-none" />

      {/* 1. Hero */}
      <section className="pb-16 border-b border-slate-100">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 text-xs font-bold text-secondary">
              Our Portfolio
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight font-heading text-neutral-dark">
              Driving Better Decisions Through Data
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Explore healthcare analytics, research intelligence, business intelligence, survey analytics, Power BI dashboards, statistical analysis, and academic research work shaped for clearer decisions.
            </p>
          </div>
        </Container>
      </section>

      <PortfolioShowcase />

      {/* 3. Case Studies (Enterprise Consulting) */}
      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-100">
        <Container>
          <SectionHeading
            theme="light"
            badge="Case Studies"
            title="Selected Intelligence Projects"
            description="Representative examples across healthcare analytics, research intelligence, business intelligence, survey analytics, Power BI dashboards, statistical analysis, and academic research."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((cs) => (
              <Card
                key={cs.id}
                hoverEffect="lift"
                className="flex flex-col justify-between border-slate-200/80 bg-white p-6 sm:p-8"
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Client</span>
                      <span className="text-sm font-bold text-slate-900">{cs.client}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                      {cs.metric}
                    </span>
                  </div>

                  {/* Title & Challenge */}
                  <div className="space-y-3">
                    <CardTitle className="text-slate-900 text-lg font-bold font-heading">{cs.title}</CardTitle>
                    <div className="space-y-2 text-xs leading-relaxed text-slate-500">
                      <p>
                        <strong className="text-slate-800 font-bold">Challenge:</strong> {cs.challenge}
                      </p>
                      <p>
                        <strong className="text-slate-800 font-bold">Solution:</strong> {cs.solution}
                      </p>
                    </div>
                  </div>

                  {/* Tools */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Tools Applied</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cs.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-700 font-semibold"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-8">
                  <Link href="/consultation" className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs py-2 border-slate-200">
                      View Project Architecture
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Student Projects */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            theme="light"
            badge="Professional Education Showcases"
            title="Applied Analytics Portfolio Projects"
            description="Learners build practical reports, dashboards, notebooks, and analysis projects that show how evidence can support professional decisions."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {studentProjects.map((project) => (
              <Card
                key={project.id}
                hoverEffect="lift"
                className="flex flex-col justify-between border-slate-200/80 bg-white p-6 sm:p-8"
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Analyst</span>
                      <span className="text-sm font-bold text-slate-900">{project.student}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-secondary border border-primary/15">
                      {project.category}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-3">
                    <CardTitle className="text-slate-900 text-lg font-bold font-heading">{project.title}</CardTitle>
                    <div className="space-y-2 text-xs leading-relaxed text-slate-500">
                      <p>
                        <strong className="text-slate-800 font-bold">Goal:</strong> {project.challenge}
                      </p>
                      <p>
                        <strong className="text-slate-800 font-bold">Build:</strong> {project.solution}
                      </p>
                    </div>
                  </div>

                  {/* Tools */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Methods & Tools</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-700 font-semibold"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-8">
                  <Link href="/programs" className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs py-2 border-slate-200">
                      View Program Path
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. CTA */}
      <section className="pb-24 lg:pb-32 bg-white">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-xl shadow-primary/10">
            <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl mx-auto font-heading leading-tight">
              Build a Decision System That Leaders Can Use
            </h2>
            <p className="text-secondary/90 text-sm sm:text-base max-w-md mx-auto mt-4 mb-8 leading-relaxed">
              Bring structure to your health, research, or business data through analytics strategy, dashboards, research support, and capacity building.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
                <Button variant="accent" size="lg" className="w-full sm:w-auto font-sans font-bold shadow-lg shadow-secondary/10">
                  Book a Consultation
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                  Contact Our Team <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

