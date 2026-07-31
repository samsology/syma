'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingDown, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';

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
    chartHeights: [60, 80, 55, 95, 70, 85, 100, 75, 90]
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
    chartHeights: [45, 60, 50, 75, 55, 80, 85, 65, 75]
  }
};

export default function PortfolioShowcase() {
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [showDropdown, setShowDropdown] = useState(false);

  const activeData = dashboardData[selectedYear];

  return (
    <section className="py-20 lg:py-24 bg-transparent w-full">
      <SectionHeading
        theme="light"
        badge="Interactive Showcase"
        title="Operations Dashboard Scoping Block"
        description="Interact with the year toggle below to see how live database parameters animate to present clinical trends."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <Card className="border-slate-100 bg-white p-6 sm:p-8 shadow-xl shadow-slate-100/50">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="flex h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="text-[11px] font-mono text-slate-400 ml-2">clinical_ops_tracker.pbix</span>
            </div>
            
            {/* Year Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                Select Year: {selectedYear} <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-150 rounded-xl shadow-lg z-20 overflow-hidden animate-scale-up">
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

          {/* Metrics grids */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            {/* Metric 1 */}
            <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Patient Visits</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeData.visits}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-extrabold text-slate-900 block"
                >
                  {activeData.visits}
                </motion.span>
              </AnimatePresence>
              <span className="text-[9px] text-green-600 font-bold block mt-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 shrink-0" /> {activeData.visitsChange}
              </span>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Service Growth</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeData.growth}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-extrabold text-slate-900 block"
                >
                  {activeData.growth}
                </motion.span>
              </AnimatePresence>
              <span className="text-[9px] text-primary font-semibold block mt-1">
                {activeData.growthDesc}
              </span>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Reporting Rate</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeData.reporting}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-extrabold text-slate-900 block"
                >
                  {activeData.reporting}
                </motion.span>
              </AnimatePresence>
              <span className="text-[9px] text-slate-400 font-semibold block mt-1">
                {activeData.reportingDesc}
              </span>
            </div>

            {/* Metric 4 */}
            <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 text-left">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Missed Follow-up</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeData.followUp}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-extrabold text-slate-900 block"
                >
                  {activeData.followUp}
                </motion.span>
              </AnimatePresence>
              <span className="text-[9px] text-red-500 font-bold block mt-1 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3 shrink-0" /> {activeData.followUpChange}
              </span>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="mt-6 h-48 bg-primary/5 border border-slate-100 rounded-xl p-4 relative flex items-end">
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-40">
              <span className="border-b border-slate-200/50 w-full" />
              <span className="border-b border-slate-200/50 w-full" />
              <span className="border-b border-slate-200/50 w-full" />
            </div>
            <div className="flex justify-between items-end w-full h-full pt-4 relative z-10">
              {activeData.chartHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-[8%] bg-primary/25 rounded-t relative group cursor-pointer transition-all duration-300 hover:bg-primary"
                  style={{ height: '0%' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-primary rounded-t"
                    initial={{ height: '0%' }}
                    animate={{ height: `${h}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15, delay: i * 0.03 }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-[8px] font-bold text-white px-2 py-0.5 rounded shadow z-10 whitespace-nowrap transition-opacity duration-200">
                    Visits: {(h * 15).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Interactive chart bounds calculated dynamically via DB streams</span>
          </div>
        </Card>
      </div>
    </section>
  );
}
