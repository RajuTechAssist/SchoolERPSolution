
import React, { useState } from 'react';

// --- Types ---
type Severity = 'Info' | 'Warning' | 'Critical';
type ActionType = 'Create' | 'Update' | 'Delete' | 'Verify' | 'Override' | 'Status Change';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: ActionType;
  entityType: 'Lead' | 'Application' | 'Document' | 'Fee' | 'System';
  entityId: string;
  summary: string;
  details?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
  };
  ipAddress: string;
  severity: Severity;
}

// --- Mock Data ---
const MOCK_LOGS: AuditLogEntry[] = [
  {
    id: 'log_101',
    timestamp: '2024-10-26 14:30:05',
    actorName: 'Principal Anderson',
    actorRole: 'Principal',
    action: 'Override',
    entityType: 'Document',
    entityId: 'APP-2025-001',
    summary: 'Overrode mandatory document requirement: Transfer Certificate',
    details: {
      field: 'Document Status',
      oldValue: 'Missing',
      newValue: 'Waived',
      reason: 'Parent provided affidavit regarding delay. TC expected by Nov 1st.'
    },
    ipAddress: '192.168.1.10',
    severity: 'Critical'
  },
  {
    id: 'log_102',
    timestamp: '2024-10-26 11:15:22',
    actorName: 'Mrs. Verma',
    actorRole: 'Admissions Officer',
    action: 'Status Change',
    entityType: 'Application',
    entityId: 'APP-2025-003',
    summary: 'Moved application to Interview stage',
    details: {
      field: 'Status',
      oldValue: 'Submitted',
      newValue: 'Interview Scheduled'
    },
    ipAddress: '192.168.1.45',
    severity: 'Info'
  },
  {
    id: 'log_103',
    timestamp: '2024-10-25 16:45:00',
    actorName: 'System',
    actorRole: 'Automated',
    action: 'Create',
    entityType: 'Lead',
    entityId: 'L-105',
    summary: 'New Web Enquiry captured',
    ipAddress: '10.0.0.1',
    severity: 'Info'
  },
  {
    id: 'log_104',
    timestamp: '2024-10-25 09:30:10',
    actorName: 'Mr. David',
    actorRole: 'Clerk',
    action: 'Verify',
    entityType: 'Document',
    entityId: 'APP-2025-002',
    summary: 'Verified Birth Certificate',
    ipAddress: '192.168.1.50',
    severity: 'Info'
  },
  {
    id: 'log_105',
    timestamp: '2024-10-24 13:20:55',
    actorName: 'Mrs. Verma',
    actorRole: 'Admissions Officer',
    action: 'Update',
    entityType: 'Application',
    entityId: 'APP-2025-001',
    summary: 'Updated Parent Contact Information',
    details: {
      field: 'Phone',
      oldValue: '+91 98765 00000',
      newValue: '+91 98765 43210'
    },
    ipAddress: '192.168.1.45',
    severity: 'Warning'
  },
  {
    id: 'log_106',
    timestamp: '2024-10-24 10:00:00',
    actorName: 'Admin',
    actorRole: 'Admin',
    action: 'Create',
    entityType: 'Fee',
    entityId: 'INV-2025-001',
    summary: 'Generated Admission Fee Invoice',
    ipAddress: '192.168.1.2',
    severity: 'Info'
  }
];

export const AdmissionsAuditLogs: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>(MOCK_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('All');
  const [filterEntity, setFilterEntity] = useState<string>('All');
  const [filterDate, setFilterDate] = useState<string>('');
  
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // --- Helpers ---
  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Warning': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Info': return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'All' || log.action === filterAction;
    const matchesEntity = filterEntity === 'All' || log.entityType === filterEntity;
    const matchesDate = !filterDate || log.timestamp.startsWith(filterDate);

    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  return (
    <div className="space-y-6 h-full flex flex-col relative animate-fade-in">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Audit & Compliance</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Immutable record of all admission lifecycle events.</p>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => alert('Exporting audit logs to encrypted CSV...')}
             className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
           >
             <span className="material-icons-outlined text-sm">download</span> Export
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm shadow-sm hover:bg-blue-600 transition-colors">
             <span className="material-icons-outlined text-sm">print</span> Print Report
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
               <span className="material-icons-outlined text-lg">search</span>
            </span>
            <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search by user, ID, or description..."
               className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
         </div>
         
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <input 
               type="date" 
               value={filterDate}
               onChange={(e) => setFilterDate(e.target.value)}
               className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
            />
            <select 
               value={filterEntity} 
               onChange={(e) => setFilterEntity(e.target.value)}
               className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
            >
               <option value="All">All Entities</option>
               <option value="Application">Application</option>
               <option value="Lead">Lead</option>
               <option value="Document">Document</option>
               <option value="Fee">Fee</option>
            </select>
            <select 
               value={filterAction} 
               onChange={(e) => setFilterAction(e.target.value)}
               className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
            >
               <option value="All">All Actions</option>
               <option value="Create">Create</option>
               <option value="Update">Update</option>
               <option value="Override">Override</option>
               <option value="Status Change">Status Change</option>
            </select>
         </div>
      </div>

      {/* Log Table */}
      <div className="flex-1 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
         <div className="overflow-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                     <th className="px-6 py-3 whitespace-nowrap">Timestamp</th>
                     <th className="px-6 py-3">Actor</th>
                     <th className="px-6 py-3">Entity</th>
                     <th className="px-6 py-3">Action</th>
                     <th className="px-6 py-3">Description</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredLogs.map(log => (
                     <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{log.timestamp}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-text-main-light dark:text-text-main-dark text-xs">{log.actorName}</div>
                           <div className="text-[10px] text-gray-500">{log.actorRole} • {log.ipAddress}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.entityType}</span>
                           <div className="text-[10px] text-gray-500 font-mono">{log.entityId}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityBadge(log.severity)}`}>
                              {log.action}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-sm truncate">
                           {log.summary}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                              onClick={() => setSelectedLog(log)}
                              className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded text-xs font-medium transition-colors"
                           >
                              Details
                           </button>
                        </td>
                     </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                           <span className="material-icons-outlined text-4xl mb-2">search_off</span>
                           <p>No audit logs found matching your criteria.</p>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down">
               <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="material-icons-outlined text-gray-500">receipt_long</span>
                     <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Log Details</h3>
                  </div>
                  <button onClick={() => setSelectedLog(null)}><span className="material-icons-outlined text-gray-500">close</span></button>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <span className="text-xs text-gray-500 block">Transaction ID</span>
                        <span className="font-mono text-sm font-bold">{selectedLog.id}</span>
                     </div>
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getSeverityBadge(selectedLog.severity)}`}>
                        {selectedLog.severity}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">Actor</span>
                        <div className="font-bold">{selectedLog.actorName}</div>
                        <div className="text-xs text-gray-500">{selectedLog.actorRole}</div>
                        <div className="text-xs text-gray-400 font-mono mt-1">{selectedLog.ipAddress}</div>
                     </div>
                     <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">Target</span>
                        <div className="font-bold">{selectedLog.entityType}</div>
                        <div className="text-xs font-mono text-primary">{selectedLog.entityId}</div>
                     </div>
                  </div>

                  <div>
                     <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Activity Summary</span>
                     <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        {selectedLog.summary}
                     </p>
                  </div>

                  {selectedLog.details && (
                     <div>
                        <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Change Details</span>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                           <table className="w-full text-xs">
                              <tbody>
                                 {selectedLog.details.field && (
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                       <td className="p-2 font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 w-1/3">Field</td>
                                       <td className="p-2 font-bold">{selectedLog.details.field}</td>
                                    </tr>
                                 )}
                                 {selectedLog.details.oldValue && (
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                       <td className="p-2 font-medium text-gray-500 bg-gray-50 dark:bg-gray-800">Old Value</td>
                                       <td className="p-2 text-red-600 line-through">{selectedLog.details.oldValue}</td>
                                    </tr>
                                 )}
                                 {selectedLog.details.newValue && (
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                       <td className="p-2 font-medium text-gray-500 bg-gray-50 dark:bg-gray-800">New Value</td>
                                       <td className="p-2 text-green-600 font-bold">{selectedLog.details.newValue}</td>
                                    </tr>
                                 )}
                                 {selectedLog.details.reason && (
                                    <tr>
                                       <td className="p-2 font-medium text-gray-500 bg-gray-50 dark:bg-gray-800">Reason</td>
                                       <td className="p-2 italic text-gray-600 dark:text-gray-400">"{selectedLog.details.reason}"</td>
                                    </tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}
               </div>

               <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                  <button onClick={() => setSelectedLog(null)} className="px-4 py-2 text-sm bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
