'use client';

import { useState } from 'react';
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';

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

export default function PortfolioShowcase() {
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [showDropdown, setShowDropdown] = useState(false);

  const activeData = dashboardData[selectedYear];

  return (
    <section className="py-20 lg:py-28">
      <SectionHeading
        theme="light"
        badge="Featured Showcase"
        title="Interactive Healthcare Performance Dashboard"
        description="Toggle the timeline to see how concise dashboards can help teams monitor performance, identify risk, and communicate progress."
      />

      <div className="max-w-4xl mx-auto">
        <Card className="border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-100/50">
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
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                Select Year: {selectedYear} <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-15 overflow-hidden">
                  {['2026', '2025'].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setSelectedYear(year as '2026' | '2025');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
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
    </section>
  );
}
