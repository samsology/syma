'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

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
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [showDropdown, setShowDropdown] = useState(false);

  // Dynamic numbers for dashboard showcase based on state selection
  const dashboardData = {
    '2026': {
      revenue: '$1,240,800',
      growth: '+14.2%',
      margin: '64.2%',
      churn: '1.2%',
      chartHeights: [60, 80, 55, 95, 70, 85, 100, 75, 90]
    },
    '2025': {
      revenue: '$984,200',
      growth: '+11.5%',
      margin: '61.8%',
      churn: '1.5%',
      chartHeights: [45, 60, 50, 75, 55, 80, 85, 65, 75]
    }
  };

  const activeData = dashboardData[selectedYear];

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

      {/* 2. Interactive Dashboard Showcase */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            badge="Featured Showcase"
            title="Interactive Healthcare Performance Dashboard"
            description="Toggle the timeline to see how concise dashboards can help teams monitor performance, identify risk, and communicate progress."
          />

          <div className="max-w-4xl mx-auto">
            <Card className="border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-100">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <span className="text-xs font-mono text-slate-400 ml-2">healthcare_kpi_report.pbix</span>
                </div>
                
                {/* Year Toggle Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    Select Year: {selectedYear} <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-250 rounded-xl shadow-lg z-15 overflow-hidden">
                      {['2026', '2025'].map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year as '2026' | '2025');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 text-slate-700 transition-all"
                        >
                          Year {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center sm:text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Patient Visits</span>
                  <span className="text-xl font-extrabold text-slate-900">{activeData.revenue}</span>
                  <span className="text-[10px] text-green-600 font-bold block mt-1 flex items-center gap-0.5 justify-center sm:justify-start">
                    <TrendingUp className="w-3.5 h-3.5" /> +14.2%
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center sm:text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Service Growth</span>
                  <span className="text-xl font-extrabold text-slate-900">{activeData.growth}</span>
                  <span className="text-[10px] text-secondary font-bold block mt-1">Target Met</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center sm:text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Reporting Rate</span>
                  <span className="text-xl font-extrabold text-slate-900">{activeData.margin}</span>
                  <span className="text-[10px] text-secondary font-bold block mt-1">Optimal</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center sm:text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Missed Follow-up</span>
                  <span className="text-xl font-extrabold text-slate-900">{activeData.churn}</span>
                  <span className="text-[10px] text-secondary font-bold block mt-1 flex items-center gap-0.5 justify-center sm:justify-start">
                    <TrendingDown className="w-3.5 h-3.5" /> -0.3%
                  </span>
                </div>
              </div>

              {/* Dynamic Chart Visualization */}
              <div className="mt-6 h-48 bg-primary/5 border border-slate-150 rounded-2xl p-4 relative flex items-end">
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  <span className="border-b border-slate-100 w-full" />
                  <span className="border-b border-slate-100 w-full" />
                  <span className="border-b border-slate-100 w-full" />
                </div>
                <div className="flex justify-between items-end w-full h-full pt-4">
                  {activeData.chartHeights.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-[8%] bg-primary rounded-t-md relative group cursor-pointer transition-all duration-500"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-900 text-[9px] font-bold text-white px-2 py-0.5 rounded shadow z-10 whitespace-nowrap transition-opacity">
                        Val: {h * 12}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 3. Case Studies (Enterprise Consulting) */}
      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-100">
        <Container>
          <SectionHeading
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

