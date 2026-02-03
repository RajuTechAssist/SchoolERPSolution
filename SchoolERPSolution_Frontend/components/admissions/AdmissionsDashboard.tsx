
import React from 'react';

interface AdmissionsDashboardProps {
  onViewChange: (view: any) => void;
}

export const AdmissionsDashboard: React.FC<AdmissionsDashboardProps> = ({ onViewChange }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="group relative">
              <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                  Admissions Dashboard
                  <span className="material-icons-outlined text-gray-400 text-sm cursor-help" title="Admissions Dashboard — overview of leads, applications and enrollments. Click any tile to view details.">info</span>
              </h2>
              <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Overview of intake pipeline and urgent actions.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
                <button 
                    onClick={() => onViewChange('leads')}
                    className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                    <span className="material-icons-outlined text-sm">add</span> New Enquiry
                </button>
                <button 
                    onClick={() => onViewChange('enroll')}
                    className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-icons-outlined text-sm">how_to_reg</span> Quick Enrol
                </button>
                <button className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title="Import Leads">
                    <span className="material-icons-outlined text-sm">upload_file</span>
                </button>
                <button className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title="Export Pipeline">
                    <span className="material-icons-outlined text-sm">download</span>
                </button>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-card-dark p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Filters:</span>
                <select className="text-sm border-gray-300 dark:border-gray-600 rounded-lg p-1.5 bg-gray-50 dark:bg-gray-800 shadow-sm outline-none">
                    <option>Session 2025-26</option>
                    <option>Session 2024-25</option>
                </select>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:border-gray-700"></div>
            <select className="text-sm border-gray-300 dark:border-gray-600 rounded-lg p-1.5 bg-gray-50 dark:bg-gray-800 shadow-sm outline-none">
                <option>All Officers</option>
                <option>Mrs. Verma</option>
                <option>Mr. David</option>
            </select>
            <select className="text-sm border-gray-300 dark:border-gray-600 rounded-lg p-1.5 bg-gray-50 dark:bg-gray-800 shadow-sm outline-none">
                <option>Last 30 Days</option>
                <option>This Week</option>
                <option>Today</option>
                <option>Custom Range</option>
            </select>
            
            <div className="ml-auto relative w-full md:w-64">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                   <span className="material-icons-outlined text-sm">search</span>
                 </span>
                 <input 
                   type="text" 
                   placeholder="Search applicant, phone..." 
                   className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary placeholder-gray-400"
                 />
            </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'New Leads', value: '42', sub: 'Last 7 Days', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'filter_alt' },
          { label: 'App In Progress', value: '18', sub: 'Total Active', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'assignment' },
          { label: 'Interviews', value: '6', sub: 'Today', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'groups' },
          { label: 'Offers Sent', value: '12', sub: 'Last 7 Days', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', icon: 'verified' },
          { label: 'Fees Received', value: '₹4.5L', sub: 'This Month', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: 'payments' },
          { label: 'Enrolled', value: '145', sub: 'Last 30 Days', color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800', icon: 'school' },
          { label: 'Pending Docs', value: '5', sub: 'Action Req', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: 'pending_actions' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-card-dark p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                   <span className={`material-icons-outlined text-lg ${kpi.color}`}>{kpi.icon}</span>
                </div>
                {idx === 6 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark group-hover:scale-105 transition-transform origin-left">{kpi.value}</h3>
              <p className="text-[10px] text-gray-500 uppercase font-bold truncate" title={kpi.label}>{kpi.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline & Alerts Column */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Alerts Section */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full shrink-0">
                        <span className="material-icons-outlined">warning</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-red-800 dark:text-red-300 text-sm">Attention Required</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 2 Duplicate Candidates
                            </span>
                            <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 5 Missing Documents
                            </span>
                            <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> 6 Interviews Today
                            </span>
                        </div>
                    </div>
                </div>
                <button className="text-xs font-medium bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
                    Resolve All
                </button>
            </div>

            {/* Pipeline Visual */}
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Pipeline Summary</h3>
                    <div className="text-xs text-gray-500">Total in Pipeline: <span className="font-bold text-gray-800 dark:text-gray-200">128</span></div>
                </div>
                
                <div className="relative">
                    {/* Background Line */}
                    <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-100 dark:bg-gray-700 -z-0"></div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                        {[
                            { label: 'New', count: 42, color: 'border-blue-500 text-blue-600' },
                            { label: 'Contacted', count: 28, color: 'border-blue-400 text-blue-500' },
                            { label: 'App Started', count: 18, color: 'border-purple-500 text-purple-600' },
                            { label: 'Docs Pending', count: 5, color: 'border-red-400 text-red-500 bg-red-50 dark:bg-red-900/10' }, // Alert state
                            { label: 'Interview', count: 10, color: 'border-orange-500 text-orange-600' },
                            { label: 'Offer', count: 8, color: 'border-teal-500 text-teal-600' },
                            { label: 'Fee Paid', count: 6, color: 'border-green-500 text-green-600' },
                            { label: 'Enrolled', count: 5, color: 'border-green-700 text-green-800 bg-green-50 dark:bg-green-900/10' }
                        ].map((step, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center group cursor-pointer">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm bg-white dark:bg-card-dark border-2 ${step.color} transition-transform group-hover:scale-110 group-hover:shadow-md`}>
                                    {step.count}
                                </div>
                                <span className="text-[9px] font-medium mt-2 text-gray-500 text-center leading-tight px-1">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
                    <p>Funnel Conversion: <span className="font-bold text-green-600">12.5%</span> (Lead to Enrolled)</p>
                    <button className="text-primary hover:underline">View Kanban Board</button>
                </div>
            </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[500px]">
           <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-4">Activity Feed</h3>
           <div className="flex-1 overflow-y-auto space-y-4 pr-1 relative">
              {[
                { time: '10 mins ago', user: 'Admin', action: 'Verified documents', subject: 'Rahul Kumar (Class 5)', icon: 'verified', color: 'text-green-500' },
                { time: '25 mins ago', user: 'System', action: 'Flagged duplicate', subject: 'Amit Singh (Phone Match)', icon: 'warning', color: 'text-red-500' },
                { time: '45 mins ago', user: 'Accounts', action: 'Payment received', subject: 'Simran Singh (₹25,000)', icon: 'payments', color: 'text-green-600' },
                { time: '2 hours ago', user: 'Mrs. Verma', action: 'Scheduled interview', subject: 'Arjun Das (Class 1)', icon: 'event', color: 'text-orange-500' },
                { time: '4 hours ago', user: 'Admin', action: 'Created new lead', subject: 'Walk-in: Mrs. Gupta', icon: 'person_add', color: 'text-blue-500' },
                { time: '5 hours ago', user: 'System', action: 'Sent SMS reminder', subject: 'Pending Docs (5 users)', icon: 'sms', color: 'text-gray-400' },
                { time: 'Yesterday', user: 'System', action: 'Offer letter sent', subject: 'Kabir Khan (Class 9)', icon: 'mail', color: 'text-purple-500' },
                { time: 'Yesterday', user: 'Admin', action: 'Updated status', subject: 'Rohan (Waitlist -> Offer)', icon: 'edit', color: 'text-blue-400' },
                { time: '2 days ago', user: 'Portal', action: 'New application', subject: 'Online: Sarah J', icon: 'public', color: 'text-indigo-500' },
                { time: '2 days ago', user: 'Admin', action: 'Bulk import', subject: '20 Leads (Excel)', icon: 'upload', color: 'text-gray-500' },
              ].map((act, i) => (
                <div key={i} className="flex gap-3 items-start text-sm group">
                   <div className={`mt-0.5 w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 ${act.color}`}>
                      <span className="material-icons-outlined text-[12px]">{act.icon}</span>
                   </div>
                   <div className="pb-3 border-b border-gray-50 dark:border-gray-800 w-full">
                      <p className="text-gray-800 dark:text-gray-200 text-xs">
                        <span className="font-semibold">{act.user}</span> {act.action}
                      </p>
                      <p className="text-xs text-gray-500">{act.subject}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{act.time}</p>
                   </div>
                </div>
              ))}
           </div>
           <button onClick={() => onViewChange('audit')} className="w-full py-2 mt-4 text-xs font-medium text-gray-500 hover:text-primary border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
             View Full Audit Log
           </button>
        </div>
      </div>
    </div>
  );
};
