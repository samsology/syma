'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingDown, TrendingUp, Calendar, Info, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Container } from '@/components/ui/Container';

const dashboardData = {
  '2026': {
    visits: '12,408',
    visitsChange: '+14.2%',
    growth: '94.2%',
    growthDesc: 'Target Exceeded',
    reporting: '98.5%',
    reportingDesc: '96% Threshold Met',
    followUp: '1.2%',
    followUpChange: '-0.3%',
    chartHeights: [60, 80, 55, 95, 70, 85, 100, 75, 90],
  },
  '2025': {
    visits: '9,842',
    visitsChange: '+11.5%',
    growth: '88.5%',
    growthDesc: 'Target Met',
    reporting: '96.2%',
    reportingDesc: '94% Threshold Met',
    followUp: '1.5%',
    followUpChange: '-0.1%',
    chartHeights: [45, 60, 50, 75, 55, 80, 85, 65, 75],
  },
};

export function PortfolioShowcaseBlock() {
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [showDropdown, setShowDropdown] = useState(false);

  const activeData = dashboardData[selectedYear];

  return (
    <section className="py-20 lg:py-28 bg-slate-50/70 border-b border-slate-200/80">
      <Container>
        <SectionHeading
          badge="Interactive System Prototype"
          title="Clinical Operations Telemetry Scoping Block"
          description="Test this live interactive prototype to see how our engineered data models normalize incoming clinical feeds into clear, actionable executive trends."
          align="center"
        />

        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-900/5">
            {/* Header: Mac style buttons + File title + Year Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-rose-400" />
                <span className="flex h-3 w-3 rounded-full bg-amber-400" />
                <span className="flex h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-2 font-medium">
                  clinical_ops_tracker_v2.6.pbix
                </span>
              </div>

              {/* Year Toggle Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="inline-flex items-center justify-between gap-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/80 rounded-2xl px-4 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                  aria-expanded={showDropdown}
                >
                  <Calendar className="w-3.5 h-3.5 text-brand-cerulean shrink-0" />
                  <span>Reporting Period: {selectedYear}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-20 overflow-hidden">
                    {(['2026', '2025'] as const).map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setSelectedYear(year);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
                      >
                        Fiscal Year {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              {/* Metric 1 */}
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Patient Encounters
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeData.visits}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-extrabold font-heading text-slate-900 block"
                  >
                    {activeData.visits}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 shrink-0" /> {activeData.visitsChange}
                </span>
              </div>

              {/* Metric 2 */}
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Target Compliance
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeData.growth}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-extrabold font-heading text-slate-900 block"
                  >
                    {activeData.growth}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[10px] text-brand-cerulean font-semibold mt-1 block">
                  {activeData.growthDesc}
                </span>
              </div>

              {/* Metric 3 */}
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Reporting Completeness
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeData.reporting}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-extrabold font-heading text-slate-900 block"
                  >
                    {activeData.reporting}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                  {activeData.reportingDesc}
                </span>
              </div>

              {/* Metric 4 */}
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Missed Follow-ups
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeData.followUp}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-extrabold font-heading text-slate-900 block"
                  >
                    {activeData.followUp}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 shrink-0" /> {activeData.followUpChange}
                </span>
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div className="mt-8 h-52 bg-slate-50/60 border border-slate-200/70 rounded-2xl p-5 relative flex items-end overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none opacity-40">
                <span className="border-b border-slate-200 w-full" />
                <span className="border-b border-slate-200 w-full" />
                <span className="border-b border-slate-200 w-full" />
              </div>
              <div className="flex justify-between items-end w-full h-full pt-4 relative z-10">
                {activeData.chartHeights.map((h, i) => (
                  <div
                    key={i}
                    className="w-[8%] bg-brand-cerulean/20 rounded-t-lg relative group cursor-pointer transition-all duration-300 hover:bg-brand-cerulean/30"
                    style={{ height: '100%' }}
                  >
                    <motion.div
                      className="absolute bottom-0 inset-x-0 bg-brand-cerulean rounded-t-lg shadow-sm"
                      initial={{ height: '0%' }}
                      animate={{ height: `${h}%` }}
                      transition={{ type: 'spring', stiffness: 90, damping: 16, delay: i * 0.03 }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-[9px] font-bold text-white px-2.5 py-1 rounded-lg shadow-lg z-20 whitespace-nowrap transition-opacity pointer-events-none">
                      Month {i + 1}: {(h * 14.5).toFixed(0)} encounters
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explicit Sample Prototype Disclaimer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-brand-cerulean shrink-0" />
                <span>*Sample Interactive Prototype — Illustrative clinical operations dashboard simulation for systems scoping.*</span>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
                Latency: &lt;15ms
              </span>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
