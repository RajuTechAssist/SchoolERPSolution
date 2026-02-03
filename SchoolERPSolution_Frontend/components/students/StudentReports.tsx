
import React, { useState } from 'react';

// --- Types ---
type ReportTab = 'dashboard' | 'scheduled' | 'explorer';
type ReportType = 'Demographics' | 'Compliance' | 'Health' | 'Financial' | 'Operations';

interface ScheduledReport {
  id: string;
  name: string;
  type: ReportType;
  frequency: 'Weekly' | 'Monthly' | 'Daily';
  recipients: string[];
  lastRun: string;
  nextRun: string;
  status: 'Active' | 'Paused';
}

interface Metric {
  label: string;
  value: string | number;
  change?: string; // e.g. "+5%"
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}

// --- Mock Data ---
const KPIS: Metric[] = [
  { label: 'Total Students', value: '1,248', change: '+12', trend: 'up', color: 'text-blue-600' },
  { label: 'Documents Pending', value: '45', change: '-5', trend: 'up', color: 'text-orange-500' },
  { label: 'Medical Alerts', value: '18', change: '+2', trend: 'down', color: 'text-red-500' },
  { label: 'Sibling Discounts', value: '₹4.5L', change: 'Yearly', trend: 'neutral', color: 'text-green-600' },
];

const MOCK_SCHEDULED: ScheduledReport[] = [
  { 
    id: 's1', name: 'Weekly Compliance Check', type: 'Compliance', frequency: 'Weekly', 
    recipients: ['principal@school.edu', 'admin@school.edu'], lastRun: 'Oct 20, 2024', nextRun: 'Oct 27, 2024', status: 'Active' 
  },
  { 
    id: 's2', name: 'Monthly Health Summary', type: 'Health', frequency: 'Monthly', 
    recipients: ['nurse@school.edu'], lastRun: 'Oct 01, 2024', nextRun: 'Nov 01, 2024', status: 'Active' 
  },
];

const DEMOGRAPHICS_DATA = [
  { label: 'Male', value: 52, color: 'bg-blue-500' },
  { label: 'Female', value: 48, color: 'bg-pink-500' },
];

const COMPLIANCE_DATA = [
  { class: 'Class 1', pending: 12, total: 40 },
  { class: 'Class 5', pending: 5, total: 38 },
  { class: 'Class 9', pending: 18, total: 42 },
  { class: 'Class 12', pending: 2, total: 35 },
];

export const StudentReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('dashboard');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledReports, setScheduledReports] = useState(MOCK_SCHEDULED);
  
  // Schedule Form
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    type: 'Demographics' as ReportType,
    frequency: 'Weekly',
    recipient: ''
  });

  // --- Handlers ---

  const handleScheduleSubmit = () => {
    if(!newSchedule.name || !newSchedule.recipient) return alert('Please fill details');
    const newReport: ScheduledReport = {
        id: Date.now().toString(),
        name: newSchedule.name,
        type: newSchedule.type,
        frequency: newSchedule.frequency as any,
        recipients: [newSchedule.recipient],
        lastRun: '-',
        nextRun: 'Next Monday',
        status: 'Active'
    };
    setScheduledReports([...scheduledReports, newReport]);
    setIsScheduleModalOpen(false);
    setNewSchedule({ name: '', type: 'Demographics', frequency: 'Weekly', recipient: '' });
  };

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPIS.map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">{kpi.label}</p>
                        <h3 className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            {kpi.trend === 'up' ? <span className="text-green-500">↑</span> : kpi.trend === 'down' ? <span className="text-red-500">↓</span> : <span>•</span>} 
                            {kpi.change}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full">
                        <span className="material-icons-outlined text-gray-400">analytics</span>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics Chart */}
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-6">Demographics Overview</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Gender Distribution</span>
                            <span className="text-gray-500">Total: 1,248</span>
                        </div>
                        <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                            {DEMOGRAPHICS_DATA.map((d, i) => (
                                <div 
                                    key={i} 
                                    className={`h-full ${d.color} flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500 hover:opacity-90`} 
                                    style={{ width: `${d.value}%` }}
                                    title={`${d.label}: ${d.value}%`}
                                >
                                    {d.value}%
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4 mt-2 justify-center">
                            {DEMOGRAPHICS_DATA.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <div className={`w-3 h-3 rounded-full ${d.color}`}></div>
                                    <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-medium mb-3">Age Bands</h4>
                        <div className="flex items-end gap-2 h-32">
                            {[15, 25, 30, 20, 10].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end group">
                                    <div 
                                        className="bg-blue-100 dark:bg-blue-900/30 rounded-t w-full relative group-hover:bg-blue-200 transition-colors"
                                        style={{ height: `${val * 3}%` }}
                                    >
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100">{val}%</span>
                                    </div>
                                    <span className="text-[10px] text-center mt-1 text-gray-400">
                                        {['5-7', '8-10', '11-13', '14-16', '17+'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance & Health */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Document Compliance</h3>
                        <button className="text-xs text-primary hover:underline">View All Classes</button>
                    </div>
                    <div className="space-y-4">
                        {COMPLIANCE_DATA.map((cls, i) => {
                            const pct = Math.round((cls.pending / cls.total) * 100);
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs font-bold w-16 text-gray-600 dark:text-gray-300">{cls.class}</span>
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div className="bg-orange-400 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                    </div>
                                    <span className="text-xs text-orange-600 font-bold w-16 text-right">{cls.pending} Pen.</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Operational Pulse</h3>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 mb-3">
                        <div>
                            <p className="text-xs text-gray-500">ID Cards Generated (YTD)</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">1,150 <span className="text-xs font-normal text-gray-400">/ 1,248</span></p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                            <span className="material-icons-outlined text-lg">badge</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div>
                            <p className="text-xs text-gray-500">Nurse Visits (This Month)</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">42 <span className="text-xs font-normal text-green-600">(-10% vs last mo)</span></p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                            <span className="material-icons-outlined text-lg">medical_services</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderScheduled = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Scheduled Reports</h3>
                <p className="text-sm text-gray-500">Automated email delivery of key metrics.</p>
            </div>
            <button 
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 shadow-sm flex items-center gap-2"
            >
                <span className="material-icons-outlined text-sm">add_alarm</span> New Schedule
            </button>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3">Report Name</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Frequency</th>
                        <th className="px-6 py-3">Recipients</th>
                        <th className="px-6 py-3">Next Run</th>
                        <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {scheduledReports.map(job => (
                        <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{job.name}</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{job.type}</span></td>
                            <td className="px-6 py-4">{job.frequency}</td>
                            <td className="px-6 py-4 text-gray-500 text-xs">{job.recipients.join(', ')}</td>
                            <td className="px-6 py-4 text-gray-500">{job.nextRun}</td>
                            <td className="px-6 py-4 text-right">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {job.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
        {/* Header Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                <span className="material-icons-outlined text-lg">dashboard</span> Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('scheduled')} 
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'scheduled' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                <span className="material-icons-outlined text-lg">schedule</span> Scheduled Reports
            </button>
            <button 
                onClick={() => setActiveTab('explorer')} 
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'explorer' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
                <span className="material-icons-outlined text-lg">table_view</span> Data Explorer
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-4">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'scheduled' && renderScheduled()}
            {activeTab === 'explorer' && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white dark:bg-card-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <span className="material-icons-outlined text-4xl mb-2">construction</span>
                    <p>Report Explorer coming soon.</p>
                </div>
            )}
        </div>

        {/* Schedule Modal */}
        {isScheduleModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)}></div>
                <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-in-down">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Schedule Automated Report</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Report Name</label>
                            <input type="text" value={newSchedule.name} onChange={e => setNewSchedule({...newSchedule, name: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" placeholder="e.g. Weekly Health Check" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                <select value={newSchedule.type} onChange={e => setNewSchedule({...newSchedule, type: e.target.value as ReportType})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none">
                                    <option>Demographics</option>
                                    <option>Compliance</option>
                                    <option>Health</option>
                                    <option>Financial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frequency</label>
                                <select value={newSchedule.frequency} onChange={e => setNewSchedule({...newSchedule, frequency: e.target.value as any})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recipient Email</label>
                            <input type="email" value={newSchedule.recipient} onChange={e => setNewSchedule({...newSchedule, recipient: e.target.value})} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm outline-none" placeholder="principal@school.edu" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">Cancel</button>
                        <button onClick={handleScheduleSubmit} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">Schedule</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
