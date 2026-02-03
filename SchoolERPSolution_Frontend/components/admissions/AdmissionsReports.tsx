
import React, { useState } from 'react';

// --- Types ---
type Period = 'Last 30 Days' | 'This Quarter' | 'This Session' | 'Custom';

interface FunnelStage {
  label: string;
  count: number;
  color: string;
  dropOff?: number;
}

interface SourceStat {
  source: string;
  leads: number;
  applications: number;
  enrolled: number;
  revenue: number;
}

interface OfficerPerformance {
  officer: string;
  pendingDocs: number;
  pendingInterviews: number;
  avgResponseTime: string;
}

// --- Mock Data ---
const FUNNEL_DATA: FunnelStage[] = [
  { label: 'Total Leads', count: 450, color: 'bg-blue-500' },
  { label: 'Applications', count: 180, color: 'bg-purple-500', dropOff: 60 },
  { label: 'Interviews', count: 120, color: 'bg-orange-500', dropOff: 33 },
  { label: 'Offers Sent', count: 90, color: 'bg-teal-500', dropOff: 25 },
  { label: 'Enrolled', count: 72, color: 'bg-green-600', dropOff: 20 },
];

const SOURCE_DATA: SourceStat[] = [
  { source: 'Website', leads: 150, applications: 45, enrolled: 15, revenue: 750000 },
  { source: 'Walk-in', leads: 120, applications: 80, enrolled: 40, revenue: 2000000 },
  { source: 'Referral', leads: 80, applications: 40, enrolled: 35, revenue: 1750000 },
  { source: 'Social Media', leads: 100, applications: 15, enrolled: 2, revenue: 100000 },
];

const OFFICER_DATA: OfficerPerformance[] = [
  { officer: 'Mrs. Verma', pendingDocs: 12, pendingInterviews: 5, avgResponseTime: '4h' },
  { officer: 'Mr. David', pendingDocs: 8, pendingInterviews: 8, avgResponseTime: '6h' },
  { officer: 'Admin Desk', pendingDocs: 25, pendingInterviews: 0, avgResponseTime: '2h' },
];

export const AdmissionsReports: React.FC = () => {
  const [period, setPeriod] = useState<Period>('This Session');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [isExporting, setIsExporting] = useState(false);

  // --- Handlers ---
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert(`Exported Enrollment Data for ${period} (CSV)`);
      setIsExporting(false);
    }, 1000);
  };

  const handleScheduleReport = () => {
    const emailSubject = `Weekly Admissions Summary — ${new Date().toLocaleDateString()}`;
    alert(`Report scheduled! Example Subject: "${emailSubject}"`);
  };

  // --- Renderers ---

  const renderKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {[
            { label: 'Conversion Rate', value: '16.0%', sub: 'Leads to Enrolled', icon: 'trending_up', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Est. Revenue', value: '₹46.0L', sub: 'Application + Adm. Fees', icon: 'currency_rupee', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Avg Time-to-Enroll', value: '14 Days', sub: 'Lead to Payment', icon: 'timelapse', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Active Pipeline', value: '108', sub: 'Pending Action', icon: 'filter_alt', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{kpi.value}</h3>
                    <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${kpi.bg}`}>
                    <span className={`material-icons-outlined ${kpi.color}`}>{kpi.icon}</span>
                </div>
            </div>
        ))}
    </div>
  );

  const renderFunnel = () => (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full animate-fade-in">
        <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-6">Conversion Funnel</h3>
        <div className="flex-1 flex flex-col justify-center space-y-4">
            {FUNNEL_DATA.map((stage, idx) => {
                const width = `${(stage.count / FUNNEL_DATA[0].count) * 100}%`;
                return (
                    <div key={stage.label} className="relative group">
                        <div className="flex justify-between items-end mb-1 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{stage.label}</span>
                            <span className="font-bold">{stage.count}</span>
                        </div>
                        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-r-lg relative overflow-visible">
                            <div 
                                className={`h-full rounded-r-lg ${stage.color} flex items-center justify-end pr-3 text-white text-xs font-bold transition-all duration-1000 ease-out`}
                                style={{ width }}
                            >
                                {Math.round((stage.count / FUNNEL_DATA[0].count) * 100)}%
                            </div>
                            {stage.dropOff !== undefined && (
                                <div className="absolute top-0 -right-24 h-full flex items-center text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-icons-outlined text-sm mr-1">arrow_downward</span>
                                    {stage.dropOff}% Drop
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
        <p className="text-xs text-gray-400 mt-6 text-center italic">Hover over bars to see drop-off rates.</p>
    </div>
  );

  const renderSourcePerformance = () => (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-full animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Source Performance</h3>
            <button className="text-xs text-primary hover:underline">Detailed Report</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-4 py-3 rounded-l-lg">Source</th>
                        <th className="px-4 py-3 text-center">Leads</th>
                        <th className="px-4 py-3 text-center">Conv. %</th>
                        <th className="px-4 py-3 text-right rounded-r-lg">Revenue</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {SOURCE_DATA.map((src, idx) => {
                        const conversion = Math.round((src.enrolled / src.leads) * 100);
                        return (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <td className="px-4 py-3 font-medium">{src.source}</td>
                                <td className="px-4 py-3 text-center text-gray-500">{src.leads}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${conversion > 20 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {conversion}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">₹{(src.revenue / 100000).toFixed(1)}L</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderOperational = () => (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
        <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">Operational Bottlenecks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OFFICER_DATA.map((officer, idx) => (
                <div key={idx} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {officer.officer.charAt(0)}
                        </div>
                        <span className="font-bold text-sm">{officer.officer}</span>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Pending Docs</span>
                            <span className={`font-bold ${officer.pendingDocs > 10 ? 'text-red-500' : 'text-gray-700'}`}>{officer.pendingDocs}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Scheduled Interviews</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{officer.pendingInterviews}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Avg Response</span>
                            <span className="font-bold text-green-600">{officer.avgResponseTime}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Analytics & Reports</h2>
            <p className="text-sm text-gray-500">Measure source performance, conversion, and revenue.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
            <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none"
            >
                <option>Last 30 Days</option>
                <option>This Quarter</option>
                <option>This Session</option>
                <option>Custom</option>
            </select>
            <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none"
            >
                <option>All Classes</option>
                <option>Class 1</option>
                <option>Class 5</option>
            </select>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button 
                onClick={handleScheduleReport}
                className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Schedule Email Report"
            >
                <span className="material-icons-outlined">schedule_send</span>
            </button>
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-colors disabled:opacity-70"
            >
                {isExporting ? <span className="material-icons-outlined animate-spin text-sm">refresh</span> : <span className="material-icons-outlined text-sm">download</span>}
                {isExporting ? 'Exporting...' : 'Export'}
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto space-y-6">
          {renderKPIs()}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderFunnel()}
              {renderSourcePerformance()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                  {renderOperational()}
              </div>
              <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <span className="material-icons-outlined text-3xl">school</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">2025 Intake Goal</h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full mt-2 mb-1 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500"><span className="font-bold text-gray-800 dark:text-gray-200">145</span> / 220 Seats Filled</p>
              </div>
          </div>
      </div>
    </div>
  );
};
