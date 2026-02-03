
import React, { useState } from 'react';

// --- Types ---
type ReportTab = 'dashboard' | 'engagement' | 'cost' | 'compliance' | 'exports';

// --- Mock Data ---
const KPIS = [
  { label: 'Delivery Rate', value: '98.4%', change: '+0.2%', trend: 'up', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { label: 'Avg Open Rate', value: '42%', change: '-1.5%', trend: 'down', icon: 'mark_email_read', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Avg Response Time', value: '2h 15m', change: '-30m', trend: 'up', icon: 'timelapse', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Est. Cost (Oct)', value: '$145.20', change: '+12%', trend: 'down', icon: 'attach_money', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

const CAMPAIGN_STATS = [
  { id: 1, name: 'Oct Fee Reminder', channel: 'SMS', date: 'Oct 15', sent: 1250, delivered: 1240, openRate: 'N/A', replyRate: '5%', status: 'Completed' },
  { id: 2, name: 'Newsletter Vol 12', channel: 'Email', date: 'Oct 14', sent: 450, delivered: 450, openRate: '58%', replyRate: '2%', status: 'Completed' },
  { id: 3, name: 'Bus Delay Alert', channel: 'Push', date: 'Oct 12', sent: 80, delivered: 78, openRate: '92%', replyRate: '0%', status: 'Completed' },
  { id: 4, name: 'Science Fair Invite', channel: 'Email', date: 'Oct 10', sent: 1200, delivered: 1195, openRate: '35%', replyRate: '1%', status: 'Completed' },
  { id: 5, name: 'PTM Schedule', channel: 'WhatsApp', date: 'Oct 08', sent: 300, delivered: 298, openRate: '88%', replyRate: '12%', status: 'Completed' },
];

const COST_BREAKDOWN = [
  { department: 'Administration', smsCount: 5000, whatsappCount: 200, totalCost: 85.00 },
  { department: 'Academics', smsCount: 1200, whatsappCount: 50, totalCost: 25.50 },
  { department: 'Transport', smsCount: 800, whatsappCount: 0, totalCost: 16.00 },
  { department: 'Admissions', smsCount: 1500, whatsappCount: 400, totalCost: 45.20 },
];

const SCHEDULED_EXPORTS = [
  { id: 1, name: 'Weekly Executive Summary', frequency: 'Weekly (Mon)', recipients: ['principal@school.edu'], format: 'PDF', nextRun: 'Oct 28' },
  { id: 2, name: 'Monthly Cost Report', frequency: 'Monthly (1st)', recipients: ['accounts@school.edu'], format: 'CSV', nextRun: 'Nov 01' },
];

export const AnalyticsReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('dashboard');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <span className={`material-icons-outlined text-xl ${kpi.color}`}>{kpi.icon}</span>
              </div>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5 
                ${kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{kpi.value}</h3>
            <p className="text-xs text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Distribution */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-bold text-text-main-light dark:text-text-main-dark mb-4">Channel Volume Mix</h4>
          <div className="space-y-4">
            {[
              { label: 'SMS', count: '4,520', pct: 60, color: 'bg-blue-500' },
              { label: 'Email', count: '2,100', pct: 28, color: 'bg-purple-500' },
              { label: 'WhatsApp', count: '650', pct: 8, color: 'bg-green-500' },
              { label: 'Push', count: '300', pct: 4, color: 'bg-orange-500' },
            ].map(ch => (
              <div key={ch.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-300">{ch.label}</span>
                  <span className="text-gray-500">{ch.count} ({ch.pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Delivery Trend */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h4 className="font-bold text-text-main-light dark:text-text-main-dark">Daily Sent Volume (7 Days)</h4>
             <span className="text-xs text-green-600 font-medium">98.5% Success Rate</span>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
             {[450, 620, 300, 850, 500, 200, 150].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group relative">
                   <div 
                      className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm group-hover:bg-blue-200 transition-all relative"
                      style={{ height: `${(val / 850) * 100}%` }}
                   >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                         {val}
                      </div>
                   </div>
                   <span className="text-[10px] text-gray-400 text-center mt-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                   </span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Campaign Performance</h3>
                <button className="text-xs flex items-center gap-1 text-primary hover:underline">
                    <span className="material-icons-outlined text-sm">download</span> Export Data
                </button>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3">Campaign</th>
                        <th className="px-6 py-3">Channel</th>
                        <th className="px-6 py-3 text-center">Sent</th>
                        <th className="px-6 py-3 text-center">Open Rate</th>
                        <th className="px-6 py-3 text-center">Reply Rate</th>
                        <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {CAMPAIGN_STATS.map(camp => (
                        <tr key={camp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-3 font-medium">
                                {camp.name}
                                <div className="text-[10px] text-gray-400">{camp.date}</div>
                            </td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border 
                                    ${camp.channel === 'SMS' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                      camp.channel === 'Email' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                      camp.channel === 'WhatsApp' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                    {camp.channel}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-center text-gray-600 dark:text-gray-300">{camp.sent}</td>
                            <td className="px-6 py-3 text-center">
                                {camp.openRate !== 'N/A' ? (
                                    <span className="text-green-600 font-bold">{camp.openRate}</span>
                                ) : <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-6 py-3 text-center">{camp.replyRate}</td>
                            <td className="px-6 py-3 text-right">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{camp.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderCost = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h4 className="font-bold text-text-main-light dark:text-text-main-dark mb-4">Cost by Department</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="py-2 text-left">Dept</th>
                                <th className="py-2 text-right">SMS Vol</th>
                                <th className="py-2 text-right">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {COST_BREAKDOWN.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-3 font-medium">{item.department}</td>
                                    <td className="py-3 text-right">{item.smsCount.toLocaleString()}</td>
                                    <td className="py-3 text-right font-bold text-gray-800 dark:text-gray-200">${item.totalCost.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t border-gray-200 dark:border-gray-700 font-bold text-sm bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <td className="py-2 pl-2">Total</td>
                                <td className="py-2 text-right">{COST_BREAKDOWN.reduce((a, b) => a + b.smsCount, 0).toLocaleString()}</td>
                                <td className="py-2 text-right pr-2">${COST_BREAKDOWN.reduce((a, b) => a + b.totalCost, 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-32 h-32 rounded-full border-8 border-blue-100 dark:border-blue-900/30 flex items-center justify-center relative mb-4">
                    <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-l-transparent border-b-transparent rotate-45"></div>
                    <div>
                        <span className="block text-2xl font-bold text-gray-800 dark:text-gray-100">72%</span>
                        <span className="text-[10px] text-gray-500 uppercase">Budget Used</span>
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-1">Monthly Budget: $250.00</h3>
                <p className="text-sm text-gray-500 mb-4">Remaining: $78.30</p>
                <button className="text-sm text-primary hover:underline">Download Invoice</button>
            </div>
        </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                    <span className="material-icons-outlined">block</span>
                </div>
                <div>
                    <h3 className="font-bold text-red-800 dark:text-red-300">Opt-Outs & DND</h3>
                    <p className="text-xs text-red-600 dark:text-red-400">Total Unsubscribes this month: 12</p>
                </div>
            </div>
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 text-sm rounded-lg hover:bg-red-50">View List</button>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-bold text-text-main-light dark:text-text-main-dark mb-4">Compliance Audit Log</h4>
            <div className="space-y-3">
                {[
                    { date: 'Oct 15, 10:30 AM', event: 'User +1 555-0123 opted out via SMS Keyword STOP', type: 'Opt-Out' },
                    { date: 'Oct 12, 09:15 AM', event: 'High bounce rate detected for "Event Invite" (Bounce > 5%)', type: 'Warning' },
                    { date: 'Oct 10, 02:00 PM', event: 'User admin@school.edu exported parent contact list.', type: 'Security' },
                ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className={`mt-0.5 w-2 h-2 rounded-full ${log.type === 'Opt-Out' ? 'bg-red-500' : log.type === 'Warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                        <div className="flex-1">
                            <p className="text-sm text-gray-800 dark:text-gray-200">{log.event}</p>
                            <p className="text-xs text-gray-500">{log.date} • {log.type}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderExports = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Scheduled Reports</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">
                    <span className="material-icons-outlined text-sm">add_alarm</span> Schedule New
                </button>
            </div>
            
            <div className="space-y-4">
                {SCHEDULED_EXPORTS.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <span className="material-icons-outlined">{job.format === 'PDF' ? 'picture_as_pdf' : 'table_view'}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark">{job.name}</h4>
                                <p className="text-xs text-gray-500">{job.frequency} • Next: {job.nextRun}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-500">Recipients</p>
                                <p className="text-xs font-medium">{job.recipients.join(', ')}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><span className="material-icons-outlined text-lg">edit</span></button>
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500"><span className="material-icons-outlined text-lg">delete</span></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200">One-Time Export</h4>
                <p className="text-sm text-gray-500">Download current dashboard data immediately.</p>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">picture_as_pdf</span> PDF
                </button>
                <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">table_view</span> Excel / CSV
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Analytics & Reports</h2>
                <p className="text-sm text-gray-500">Insights into engagement, delivery performance, and budget.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
                >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Quarter</option>
                    <option>This Year</option>
                </select>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                { id: 'engagement', label: 'Engagement', icon: 'insights' },
                { id: 'cost', label: 'Cost Analysis', icon: 'payments' },
                { id: 'compliance', label: 'Compliance', icon: 'verified_user' },
                { id: 'exports', label: 'Exports', icon: 'cloud_download' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap 
                        ${activeTab === tab.id 
                            ? 'border-primary text-primary bg-blue-50 dark:bg-blue-900/10' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <span className="material-icons-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-4">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'engagement' && renderEngagement()}
            {activeTab === 'cost' && renderCost()}
            {activeTab === 'compliance' && renderCompliance()}
            {activeTab === 'exports' && renderExports()}
        </div>
    </div>
  );
};
