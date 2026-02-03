
import React, { useState } from 'react';

// --- Types ---
type AuditTab = 'logs' | 'overrides' | 'archive' | 'policies';
type Severity = 'Normal' | 'Warning' | 'Critical';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  severity: Severity;
}

interface ArchivedMessage {
  id: string;
  sentAt: string;
  sender: string;
  channel: string;
  subject: string;
  contentSnapshot: string; // The actual text sent
  recipientCount: number;
  retentionExpiry: string;
}

interface OverrideLog {
  id: string;
  timestamp: string;
  authorizedBy: string;
  reason: string;
  broadcastTitle: string;
  affectedCount: number;
}

// --- Mock Data ---
const MOCK_LOGS: AuditLog[] = [
  { id: 'aud_1', timestamp: '2024-10-24 14:30:22', actor: 'Principal Anderson', role: 'Principal', action: 'Approved Broadcast', module: 'Campaigns', details: 'Approved "Annual Sports Day" broadcast.', ipAddress: '192.168.1.10', severity: 'Normal' },
  { id: 'aud_2', timestamp: '2024-10-24 14:25:10', actor: 'Mrs. Verma', role: 'Teacher', action: 'Created Draft', module: 'Campaigns', details: 'Created "Math Homework" draft.', ipAddress: '192.168.1.45', severity: 'Normal' },
  { id: 'aud_3', timestamp: '2024-10-24 10:15:00', actor: 'System', role: 'Automated', action: 'Purge Data', module: 'Compliance', details: 'Auto-purged logs older than 365 days.', ipAddress: 'localhost', severity: 'Warning' },
  { id: 'aud_4', timestamp: '2024-10-23 16:45:33', actor: 'Mr. Singh', role: 'Admin', action: 'Modified Settings', module: 'Channels', details: 'Updated SMS Gateway API Key.', ipAddress: '192.168.1.5', severity: 'Critical' },
  { id: 'aud_5', timestamp: '2024-10-23 09:30:12', actor: 'Mrs. Verma', role: 'Teacher', action: 'Sent Message', module: 'Inbox', details: 'Replied to parent enquiry ticket #452.', ipAddress: '192.168.1.45', severity: 'Normal' },
];

const MOCK_OVERRIDES: OverrideLog[] = [
  { id: 'ovr_1', timestamp: '2024-10-20 08:15 AM', authorizedBy: 'Principal Anderson', broadcastTitle: 'School Closure - Heavy Rain', reason: 'Emergency Safety Protocol', affectedCount: 1250 },
  { id: 'ovr_2', timestamp: '2024-09-15 10:00 AM', authorizedBy: 'Admin', broadcastTitle: 'Fee Deadline - Final Warning', reason: 'Critical Financial Notice', affectedCount: 45 },
];

const MOCK_ARCHIVE: ArchivedMessage[] = [
  { id: 'msg_101', sentAt: '2024-10-24 14:35', sender: 'Principal Anderson', channel: 'Email', subject: 'Sports Day Invite', contentSnapshot: 'Dear Parents, You are cordially invited...', recipientCount: 1200, retentionExpiry: '2025-10-24' },
  { id: 'msg_102', sentAt: '2024-10-23 09:00', sender: 'Mrs. Verma', channel: 'SMS', subject: 'N/A', contentSnapshot: 'Reminder: Math test tomorrow for Class 10A.', recipientCount: 35, retentionExpiry: '2025-10-23' },
  { id: 'msg_103', sentAt: '2024-10-22 16:00', sender: 'Transport Dept', channel: 'Push', subject: 'Bus Delay', contentSnapshot: 'Route 5 is delayed by 20 mins due to traffic.', recipientCount: 40, retentionExpiry: '2025-10-22' },
];

export const AuditCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AuditTab>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Policy State
  const [retentionPeriod, setRetentionPeriod] = useState('365');
  const [autoPurge, setAutoPurge] = useState(true);
  const [legalHold, setLegalHold] = useState(false);

  // --- Handlers ---
  const handleExport = () => {
    alert('Generating signed PDF audit trail for selected range...');
  };

  // --- Renderers ---

  const renderLogs = () => {
    const filteredLogs = MOCK_LOGS.filter(log => 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
           <div className="relative w-full md:w-96">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
               <span className="material-icons-outlined">search</span>
             </span>
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search audit trail..." 
               className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
             />
           </div>
           <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                 <span className="material-icons-outlined text-sm">filter_list</span> Filter
              </button>
              <button className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                 <span className="material-icons-outlined text-sm">download</span> CSV
              </button>
           </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                 <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Actor</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3 text-right">IP Address</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                 {filteredLogs.map(log => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer"
                    >
                       <td className="px-6 py-3 font-mono text-xs text-gray-500">{log.timestamp}</td>
                       <td className="px-6 py-3">
                          <div className="font-medium text-text-main-light dark:text-text-main-dark">{log.actor}</div>
                          <div className="text-xs text-gray-400">{log.role}</div>
                       </td>
                       <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${
                             log.severity === 'Critical' ? 'bg-red-50 border-red-200 text-red-700' : 
                             log.severity === 'Warning' ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                             'bg-blue-50 border-blue-200 text-blue-700'
                          }`}>
                             {log.action}
                          </span>
                       </td>
                       <td className="px-6 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{log.details}</td>
                       <td className="px-6 py-3 text-right font-mono text-xs text-gray-400">{log.ipAddress}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    );
  };

  const renderOverrides = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                <span className="material-icons-outlined text-2xl">notification_important</span>
            </div>
            <div>
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Emergency Override Log</h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                    Tracking of all broadcasts that bypassed DND settings or were flagged as 'High Priority'.
                    These actions are subject to board review.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_OVERRIDES.map(ovr => (
                <div key={ovr.id} className="bg-white dark:bg-card-dark p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{ovr.timestamp}</span>
                        <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                            <span className="material-icons-outlined text-sm">lock_open</span> DND Override
                        </span>
                    </div>
                    <h4 className="font-bold text-text-main-light dark:text-text-main-dark mb-1">{ovr.broadcastTitle}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Reason: {ovr.reason}</p>
                    
                    <div className="flex justify-between items-center text-xs pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400">Authorized by:</span>
                            <span className="font-bold text-text-main-light dark:text-text-main-dark">{ovr.authorizedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400">Recipients:</span>
                            <span className="font-bold text-text-main-light dark:text-text-main-dark">{ovr.affectedCount}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderArchive = () => (
    <div className="space-y-4 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-2">Immutable Message Archive</h3>
            <p className="text-sm text-gray-500 mb-4">Read-only historical view of all outgoing communications. Content cannot be altered.</p>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Search message content, subject, or sender..." 
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
                />
                <input type="date" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none" />
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600">Search Archive</button>
            </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Channel</th>
                        <th className="px-6 py-3">Sender</th>
                        <th className="px-6 py-3">Content Snapshot</th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {MOCK_ARCHIVE.map(msg => (
                        <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-3 whitespace-nowrap text-gray-500 text-xs">{msg.sentAt}</td>
                            <td className="px-6 py-3">
                                <span className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium">
                                    {msg.channel}
                                </span>
                            </td>
                            <td className="px-6 py-3 font-medium">{msg.sender}</td>
                            <td className="px-6 py-3 max-w-sm truncate text-gray-600 dark:text-gray-400">
                                {msg.subject !== 'N/A' ? <span className="font-bold text-gray-800 dark:text-gray-200 mr-2">[{msg.subject}]</span> : ''}
                                {msg.contentSnapshot}
                            </td>
                            <td className="px-6 py-3 text-right">
                                <button className="text-primary hover:underline text-xs flex items-center justify-end gap-1">
                                    <span className="material-icons-outlined text-sm">visibility</span> View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-6 flex items-center gap-2">
                <span className="material-icons-outlined text-gray-400">policy</span> Data Retention Policy
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Retention Period (Days)</label>
                    <select 
                        value={retentionPeriod}
                        onChange={(e) => setRetentionPeriod(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none"
                    >
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                        <option value="365">1 Year (Standard)</option>
                        <option value="1095">3 Years (Compliance)</option>
                        <option value="inf">Indefinite</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Messages older than this period will be automatically purged.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Auto-Purge</span>
                            <span className="text-xs text-gray-500">Automatically delete old logs nightly.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={autoPurge} onChange={(e) => setAutoPurge(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-lg">
                        <div>
                            <span className="block text-sm font-bold text-red-800 dark:text-red-300">Legal Hold</span>
                            <span className="text-xs text-red-600 dark:text-red-400">Suspend all purging activities immediately.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={legalHold} onChange={(e) => setLegalHold(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4 flex items-center gap-2">
                <span className="material-icons-outlined text-gray-400">gavel</span> Legal Export
            </h3>
            <p className="text-sm text-gray-500 mb-6">Generate a digitally signed, immutable packet of communication logs for a specific time range for use in disputes or board reviews.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                    <input type="date" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none" />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                    <input type="date" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none" />
                </div>
                <button 
                    onClick={handleExport}
                    className="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-black dark:hover:bg-gray-600 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium"
                >
                    <span className="material-icons-outlined text-sm">assignment_returned</span> Generate Packet
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
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Audit & Compliance</h2>
                <p className="text-sm text-gray-500">Track activity, manage data retention, and handle legal requirements.</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                    { id: 'logs', label: 'Audit Logs', icon: 'list_alt' },
                    { id: 'overrides', label: 'Overrides', icon: 'lock_open' },
                    { id: 'archive', label: 'Archive', icon: 'inventory_2' },
                    { id: 'policies', label: 'Policies', icon: 'policy' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all ${
                            activeTab === tab.id 
                                ? 'bg-white dark:bg-card-dark shadow text-primary' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <span className="material-icons-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-4">
            {activeTab === 'logs' && renderLogs()}
            {activeTab === 'overrides' && renderOverrides()}
            {activeTab === 'archive' && renderArchive()}
            {activeTab === 'policies' && renderPolicies()}
        </div>

        {/* Audit Log Detail Modal */}
        {selectedLog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
                <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Log Details</h3>
                        <button onClick={() => setSelectedLog(null)}><span className="material-icons-outlined text-gray-500">close</span></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="block text-xs text-gray-500">ID</span><span className="font-mono">{selectedLog.id}</span></div>
                            <div><span className="block text-xs text-gray-500">Timestamp</span><span>{selectedLog.timestamp}</span></div>
                            <div><span className="block text-xs text-gray-500">Actor</span><span>{selectedLog.actor} ({selectedLog.role})</span></div>
                            <div><span className="block text-xs text-gray-500">IP Address</span><span className="font-mono">{selectedLog.ipAddress}</span></div>
                            <div><span className="block text-xs text-gray-500">Module</span><span>{selectedLog.module}</span></div>
                            <div>
                                <span className="block text-xs text-gray-500">Severity</span>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                    selectedLog.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                }`}>{selectedLog.severity}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Full Details</h4>
                            <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                {selectedLog.details}
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
