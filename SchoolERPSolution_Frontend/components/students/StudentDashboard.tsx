
import React from 'react';

export const StudentDashboard: React.FC<{ onViewChange: (view: any) => void }> = ({ onViewChange }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
         <div className="relative flex-1 md:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
               <span className="material-icons-outlined">search</span>
            </span>
            <input 
               type="text" 
               placeholder="Search name, student id or parent phone..." 
               className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
         </div>
         <div className="flex gap-2">
            <button onClick={() => onViewChange('directory')} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center gap-2">
               <span className="material-icons-outlined text-sm">person_add</span> New Student
            </button>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
               <span className="material-icons-outlined text-sm">upload_file</span> Bulk Import
            </button>
         </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
            { label: 'Total Active Students', value: '1,248', sub: '+12 this month', icon: 'groups', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Documents Pending', value: '34', sub: 'Verification Req', icon: 'pending_actions', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Medical Alerts', value: '8', sub: 'Active Conditions', icon: 'medical_services', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Unpaid Dues', value: '45', sub: 'Action Required', icon: 'money_off', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
         ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Activity Feed */}
         <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">Recent Activity</h3>
            <div className="space-y-4">
               {[
                  { user: 'Admin', action: 'Created new student profile', target: 'Aarav Patel (Class 1-A)', time: '10 mins ago', icon: 'person_add' },
                  { user: 'Nurse Sarah', action: 'Updated medical record', target: 'John Doe (Allergy)', time: '1 hour ago', icon: 'medical_services' },
                  { user: 'System', action: 'Generated ID Cards', target: 'Batch: Class 5', time: '2 hours ago', icon: 'badge' },
                  { user: 'Mrs. Verma', action: 'Updated guardian contact', target: 'Simran Singh', time: 'Yesterday', icon: 'edit' },
               ].map((act, i) => (
                  <div key={i} className="flex gap-3 items-start border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0">
                     <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <span className="material-icons-outlined text-sm">{act.icon}</span>
                     </div>
                     <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                           <span className="font-bold">{act.user}</span> {act.action}
                        </p>
                        <p className="text-xs text-primary">{act.target}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{act.time}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Alerts */}
         <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">System Alerts</h3>
            <div className="space-y-3">
               <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg flex gap-3">
                  <span className="material-icons-outlined text-red-500">warning</span>
                  <div>
                     <p className="text-sm font-bold text-red-800 dark:text-red-300">5 Expiring Documents</p>
                     <p className="text-xs text-red-600 dark:text-red-400">Passports expiring within 30 days.</p>
                  </div>
               </div>
               <div className="p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg flex gap-3">
                  <span className="material-icons-outlined text-orange-500">health_and_safety</span>
                  <div>
                     <p className="text-sm font-bold text-orange-800 dark:text-orange-300">Missing Health Records</p>
                     <p className="text-xs text-orange-600 dark:text-orange-400">12 students missing vaccination data.</p>
                  </div>
               </div>
               <button onClick={() => onViewChange('directory')} className="w-full py-2 mt-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors">
                  View All Alerts
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
