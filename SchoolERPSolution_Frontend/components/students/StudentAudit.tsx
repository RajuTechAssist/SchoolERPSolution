
import React, { useState } from 'react';

// --- Types ---
type Severity = 'Info' | 'Warning' | 'Critical';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entityType: 'Student' | 'Document' | 'Health' | 'System';
  entityId: string;
  details: string;
  ip: string;
  severity: Severity;
}

// --- Mock Data ---
const MOCK_LOGS: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2024-10-27 10:45:22', actor: 'Principal Anderson', role: 'Principal', action: 'Override Promotion', entityType: 'Student', entityId: 'S5 (Evan Wright)', details: 'Promoted despite attendance shortfall. Reason: Medical.', ip: '192.168.1.10', severity: 'Warning' },
  { id: 'LOG-002', timestamp: '2024-10-27 09:30:15', actor: 'Nurse Sarah', role: 'Staff', action: 'Update Health Record', entityType: 'Health', entityId: 'STU-001', details: 'Added new allergy: Penicillin', ip: '192.168.1.45', severity: 'Critical' },
  { id: 'LOG-003', timestamp: '2024-10-26 16:00:00', actor: 'System', role: 'Automated', action: 'Bulk Archive', entityType: 'System', entityId: 'Batch 2024', details: 'Moved 42 students to Alumni archive.', ip: 'localhost', severity: 'Info' },
  { id: 'LOG-004', timestamp: '2024-10-26 14:15:10', actor: 'Admin', role: 'Admin', action: 'Generate ID Card', entityType: 'Document', entityId: 'Class 10-A', details: 'Batch printed 32 ID cards.', ip: '192.168.1.5', severity: 'Info' },
  { id: 'LOG-005', timestamp: '2024-10-26 11:20:33', actor: 'Mrs. Verma', role: 'Teacher', action: 'Edit Profile', entityType: 'Student', entityId: 'STU2025-002', details: 'Updated guardian phone number.', ip: '192.168.1.20', severity: 'Info' },
];

export const StudentAudit: React.FC = () => {
  const [logs] = useState<AuditLog[]>(MOCK_LOGS);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(search.toLowerCase()) || 
                          log.actor.toLowerCase().includes(search.toLowerCase()) ||
                          log.action.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = filterSeverity === 'All' || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (s: Severity) => {
    switch (s) {
      case 'Critical': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Warning': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Info': return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Audit Logs</h2>
          <p className="text-sm text-gray-500">Immutable record of all student system activities.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
             <span className="material-icons-outlined text-sm">download</span> Export CSV
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
             <span className="material-icons-outlined text-sm">print</span> Print
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><span className="material-icons-outlined text-lg">search</span></span>
            <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search logs by actor, action or details..."
               className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
         </div>
         <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
         >
            <option value="All">All Severity</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
         </select>
      </div>

      <div className="flex-1 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
         <div className="overflow-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                     <th className="px-6 py-3 whitespace-nowrap">Timestamp</th>
                     <th className="px-6 py-3">Actor</th>
                     <th className="px-6 py-3">Action</th>
                     <th className="px-6 py-3">Entity</th>
                     <th className="px-6 py-3">Details</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredLogs.map(log => (
                     <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{log.timestamp}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-800 dark:text-gray-200 text-xs">{log.actor}</div>
                           <div className="text-[10px] text-gray-500">{log.role}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityBadge(log.severity)}`}>
                              {log.action}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.entityType}</span>
                           <div className="text-[10px] text-gray-500 font-mono">{log.entityId}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-sm truncate" title={log.details}>
                           {log.details}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="text-primary hover:underline text-xs">View</button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {selectedLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg p-6 animate-slide-in-down">
               <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Log Details</h3>
               <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                     <div><span className="text-xs text-gray-500 block">ID</span> <span className="font-mono">{selectedLog.id}</span></div>
                     <div><span className="text-xs text-gray-500 block">IP Address</span> <span className="font-mono">{selectedLog.ip}</span></div>
                     <div><span className="text-xs text-gray-500 block">Timestamp</span> <span>{selectedLog.timestamp}</span></div>
                     <div><span className="text-xs text-gray-500 block">Severity</span> <span className={`font-bold ${selectedLog.severity === 'Critical' ? 'text-red-600' : 'text-blue-600'}`}>{selectedLog.severity}</span></div>
                  </div>
                  <div>
                     <span className="text-xs text-gray-500 block mb-1 uppercase font-bold">Action Details</span>
                     <p className="p-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-mono text-xs leading-relaxed">
                        {JSON.stringify(selectedLog, null, 2)}
                     </p>
                  </div>
               </div>
               <div className="mt-6 flex justify-end">
                  <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Close</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
