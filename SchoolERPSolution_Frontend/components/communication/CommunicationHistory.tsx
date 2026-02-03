
import React, { useState, useMemo } from 'react';

// --- Types ---
type Channel = 'SMS' | 'Email' | 'Push' | 'WhatsApp';
type JobStatus = 'Queued' | 'Processing' | 'Paused' | 'Sent' | 'Partial' | 'Failed';

interface ScheduledJob {
  id: string;
  title: string;
  channel: Channel;
  audience: string;
  recipientCount: number;
  scheduledTime: string; // ISO String
  createdBy: string;
  status: 'Queued' | 'Paused';
}

interface BroadcastLog {
  id: string;
  title: string;
  channel: Channel;
  sentTime: string;
  audience: string;
  stats: {
    total: number;
    delivered: number;
    failed: number;
    opened?: number; // For email
  };
  status: 'Sent' | 'Partial' | 'Failed';
}

interface ErrorLog {
  recipient: string;
  error: string;
  timestamp: string;
}

// --- Mock Data ---
const MOCK_SCHEDULED: ScheduledJob[] = [
  { id: 's1', title: 'Weekend Maintenance Alert', channel: 'SMS', audience: 'All Parents', recipientCount: 1250, scheduledTime: '2024-10-25T18:00:00', createdBy: 'Admin', status: 'Queued' },
  { id: 's2', title: 'Monthly Newsletter', channel: 'Email', audience: 'All Staff', recipientCount: 140, scheduledTime: '2024-11-01T09:00:00', createdBy: 'Principal', status: 'Paused' },
  { id: 's3', title: 'Bus Route 4 Delay', channel: 'Push', audience: 'Transport Group 4', recipientCount: 45, scheduledTime: '2024-10-26T07:30:00', createdBy: 'Transport Mgr', status: 'Queued' },
];

const MOCK_HISTORY: BroadcastLog[] = [
  { id: 'h1', title: 'Fee Reminder - Oct', channel: 'SMS', sentTime: '2024-10-20 10:00 AM', audience: 'Fee Defaulters', stats: { total: 150, delivered: 142, failed: 8 }, status: 'Partial' },
  { id: 'h2', title: 'Science Fair Invite', channel: 'Email', sentTime: '2024-10-18 02:30 PM', audience: 'Class 10-12', stats: { total: 450, delivered: 450, failed: 0, opened: 320 }, status: 'Sent' },
  { id: 'h3', title: 'Emergency Drill Notice', channel: 'WhatsApp', sentTime: '2024-10-15 09:00 AM', audience: 'All Students', stats: { total: 1200, delivered: 1150, failed: 50 }, status: 'Partial' },
  { id: 'h4', title: 'Staff Meeting Reschedule', channel: 'Push', sentTime: '2024-10-12 04:00 PM', audience: 'Teachers', stats: { total: 80, delivered: 78, failed: 2 }, status: 'Sent' },
  { id: 'h5', title: 'Invalid Broadcast Test', channel: 'SMS', sentTime: '2024-10-10 11:00 AM', audience: 'Test Group', stats: { total: 10, delivered: 0, failed: 10 }, status: 'Failed' },
];

const MOCK_ERRORS: ErrorLog[] = [
  { recipient: '+1 555-0199', error: 'Invalid Number Format', timestamp: '10:01 AM' },
  { recipient: '+1 555-0288', error: 'Carrier Rejected (DND)', timestamp: '10:01 AM' },
  { recipient: '+1 555-0377', error: 'Network Timeout', timestamp: '10:02 AM' },
];

export const CommunicationHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'history'>('scheduled');
  
  // Scheduled State
  const [scheduleView, setScheduleView] = useState<'list' | 'calendar'>('list');
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>(MOCK_SCHEDULED);

  // History State
  const [historyLogs, setHistoryLogs] = useState<BroadcastLog[]>(MOCK_HISTORY);
  const [filterChannel, setFilterChannel] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedLog, setSelectedLog] = useState<BroadcastLog | null>(null);

  // --- Helpers ---
  const getChannelIcon = (channel: Channel) => {
    switch (channel) {
      case 'SMS': return 'sms';
      case 'Email': return 'email';
      case 'WhatsApp': return 'chat';
      case 'Push': return 'notifications_active';
    }
  };

  const getChannelColor = (channel: Channel) => {
    switch (channel) {
      case 'SMS': return 'text-green-600 bg-green-50 border-green-200';
      case 'Email': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'WhatsApp': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'Push': return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-green-100 text-green-700';
      case 'Partial': return 'bg-yellow-100 text-yellow-700';
      case 'Failed': return 'bg-red-100 text-red-700';
      case 'Queued': return 'bg-blue-100 text-blue-700';
      case 'Paused': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateSuccessRate = (stats: BroadcastLog['stats']) => {
    if (stats.total === 0) return 0;
    return Math.round((stats.delivered / stats.total) * 100);
  };

  // --- Actions ---
  const handleCancelJob = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled broadcast?')) {
      setScheduledJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  const handleRetryFailed = () => {
    alert(`Creating new broadcast for ${selectedLog?.stats.failed} failed recipients...`);
    // Logic to redirect to Compose with failed recipients pre-filled
    setSelectedLog(null);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    alert(`Exporting logs as ${format.toUpperCase()}...`);
  };

  // --- Views ---

  const renderScheduled = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Scheduled Queue</h3>
          <p className="text-sm text-gray-500">{scheduledJobs.length} broadcasts pending delivery.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button 
            onClick={() => setScheduleView('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${scheduleView === 'list' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
          >
            <span className="material-icons-outlined text-sm">view_list</span> List
          </button>
          <button 
            onClick={() => setScheduleView('calendar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${scheduleView === 'calendar' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
          >
            <span className="material-icons-outlined text-sm">calendar_month</span> Calendar
          </button>
        </div>
      </div>

      {scheduleView === 'list' ? (
        <div className="grid grid-cols-1 gap-4">
          {scheduledJobs.length === 0 ? (
             <div className="text-center py-12 text-gray-400">
                <span className="material-icons-outlined text-4xl mb-2">event_available</span>
                <p>No scheduled broadcasts found.</p>
             </div>
          ) : (
            scheduledJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border ${getChannelColor(job.channel)}`}>
                    <span className="material-icons-outlined text-xl">{getChannelIcon(job.channel)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main-light dark:text-text-main-dark">{job.title}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-icons-outlined text-sm">schedule</span> 
                        {new Date(job.scheduledTime).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-icons-outlined text-sm">people</span> 
                        {job.recipientCount} Recipients ({job.audience})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-icons-outlined text-sm">person</span> 
                        by {job.createdBy}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                  <div className="flex gap-1 border-l border-gray-200 dark:border-gray-600 pl-3">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 tooltip" title="Edit">
                      <span className="material-icons-outlined">edit</span>
                    </button>
                    <button onClick={() => handleCancelJob(job.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 tooltip" title="Cancel">
                      <span className="material-icons-outlined">close</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Simple Calendar Placeholder
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
           <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-bold text-gray-400 uppercase">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
           </div>
           <div className="grid grid-cols-7 gap-2">
              {Array.from({length: 31}, (_, i) => {
                 const day = i + 1;
                 // Mock finding jobs on this "day" (simplified logic)
                 const dayJobs = scheduledJobs.filter(j => new Date(j.scheduledTime).getDate() === day);
                 return (
                    <div key={i} className={`h-24 border rounded-lg p-1 text-left relative ${dayJobs.length > 0 ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'border-gray-100 dark:border-gray-700'}`}>
                       <span className="text-xs font-medium text-gray-500">{day}</span>
                       <div className="mt-1 space-y-1">
                          {dayJobs.map(j => (
                             <div key={j.id} className="text-[9px] bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded px-1 py-0.5 truncate text-blue-700 dark:text-blue-300">
                                {j.time} {j.title}
                             </div>
                          ))}
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => {
    const filteredHistory = historyLogs.filter(log => {
      const matchesSearch = log.title.toLowerCase().includes(searchQuery.toLowerCase()) || log.audience.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChannel = filterChannel === 'All' || log.channel === filterChannel;
      const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
      return matchesSearch && matchesChannel && matchesStatus;
    });

    return (
      <div className="space-y-4 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
           <div className="relative flex-1">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
               <span className="material-icons-outlined text-gray-400">search</span>
             </span>
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search logs..." 
               className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
             />
           </div>
           <div className="flex gap-2 overflow-x-auto">
              <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} className="px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none">
                 <option value="All">All Channels</option>
                 <option value="SMS">SMS</option>
                 <option value="Email">Email</option>
                 <option value="Push">Push</option>
                 <option value="WhatsApp">WhatsApp</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none">
                 <option value="All">All Status</option>
                 <option value="Sent">Sent (100%)</option>
                 <option value="Partial">Partial</option>
                 <option value="Failed">Failed</option>
              </select>
              <button onClick={() => handleExport('csv')} className="px-3 py-2 bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm flex items-center gap-1">
                 <span className="material-icons-outlined text-sm">download</span> Export
              </button>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                 <tr>
                    <th className="px-6 py-3">Broadcast</th>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Sent Time</th>
                    <th className="px-6 py-3">Delivery Rate</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                 {filteredHistory.map(log => {
                    const successRate = calculateSuccessRate(log.stats);
                    return (
                       <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-6 py-4">
                             <div className="font-bold text-text-main-light dark:text-text-main-dark">{log.title}</div>
                             <div className="text-xs text-gray-500">{log.audience} ({log.stats.total} recipients)</div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getChannelColor(log.channel)}`}>
                                <span className="material-icons-outlined text-[10px]">{getChannelIcon(log.channel)}</span> {log.channel}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{log.sentTime}</td>
                          <td className="px-6 py-4 w-48">
                             <div className="flex justify-between text-xs mb-1">
                                <span className={successRate === 100 ? 'text-green-600 font-bold' : 'text-gray-600'}>{successRate}%</span>
                                {log.stats.failed > 0 && <span className="text-red-500 font-medium">{log.stats.failed} failed</span>}
                             </div>
                             <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${successRate === 100 ? 'bg-green-500' : successRate > 80 ? 'bg-blue-500' : 'bg-red-500'}`} style={{width: `${successRate}%`}}></div>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => setSelectedLog(log)}
                                className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                             >
                                View Details
                             </button>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      </div>
    );
  };

  // --- Drill Down Modal ---
  const renderDetailModal = () => {
    if (!selectedLog) return null;
    const successRate = calculateSuccessRate(selectedLog.stats);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
         <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-in-down">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-800/50">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="font-bold text-xl text-text-main-light dark:text-text-main-dark">{selectedLog.title}</h3>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getChannelColor(selectedLog.channel)}`}>{selectedLog.channel}</span>
                  </div>
                  <p className="text-sm text-gray-500">Sent on {selectedLog.sentTime} • Audience: {selectedLog.audience}</p>
               </div>
               <button onClick={() => setSelectedLog(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500"><span className="material-icons-outlined">close</span></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
               {/* KPI Cards */}
               <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                     <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">{selectedLog.stats.total}</span>
                     <p className="text-xs text-blue-500 dark:text-blue-400 uppercase font-bold mt-1">Total Sent</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 text-center">
                     <span className="text-2xl font-bold text-green-600 dark:text-green-300">{selectedLog.stats.delivered}</span>
                     <p className="text-xs text-green-500 dark:text-green-400 uppercase font-bold mt-1">Delivered</p>
                  </div>
                  {selectedLog.channel === 'Email' && (
                     <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 text-center">
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">{selectedLog.stats.opened}</span>
                        <p className="text-xs text-purple-500 dark:text-purple-400 uppercase font-bold mt-1">Opened</p>
                     </div>
                  )}
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 text-center">
                     <span className="text-2xl font-bold text-red-600 dark:text-red-300">{selectedLog.stats.failed}</span>
                     <p className="text-xs text-red-500 dark:text-red-400 uppercase font-bold mt-1">Failed</p>
                  </div>
               </div>

               {/* Failure Analysis */}
               {selectedLog.stats.failed > 0 ? (
                  <div className="border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden">
                     <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center">
                        <h4 className="font-bold text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                           <span className="material-icons-outlined text-sm">error_outline</span> Delivery Failures
                        </h4>
                        <button 
                           onClick={handleRetryFailed}
                           className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 shadow-sm flex items-center gap-1"
                        >
                           <span className="material-icons-outlined text-[12px]">replay</span> Retry Failed ({selectedLog.stats.failed})
                        </button>
                     </div>
                     <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-xs text-left">
                           <thead className="bg-red-50/50 dark:bg-red-900/10 text-gray-500">
                              <tr>
                                 <th className="px-4 py-2">Recipient</th>
                                 <th className="px-4 py-2">Error Reason</th>
                                 <th className="px-4 py-2">Time</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                              {MOCK_ERRORS.map((err, i) => (
                                 <tr key={i} className="hover:bg-red-50/30 dark:hover:bg-red-900/10">
                                    <td className="px-4 py-2 font-mono">{err.recipient}</td>
                                    <td className="px-4 py-2 text-red-600 dark:text-red-400">{err.error}</td>
                                    <td className="px-4 py-2 text-gray-400">{err.timestamp}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               ) : (
                  <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800 text-center">
                     <span className="material-icons-outlined text-3xl text-green-500 mb-2">check_circle</span>
                     <p className="text-green-700 dark:text-green-300 font-medium">100% Delivery Success Rate</p>
                     <p className="text-xs text-green-600 dark:text-green-400">No errors reported for this broadcast.</p>
                  </div>
               )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
               <span className="text-xs text-gray-400">Log ID: {selectedLog.id} • Retained until Oct 2025</span>
               <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Download Report</button>
                  <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600">Done</button>
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Communication Logs</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Track delivery status, manage scheduled jobs, and analyze outreach.</p>
        </div>
        
        {/* Main Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'scheduled' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <span className="material-icons-outlined text-sm">schedule</span> Scheduled
            {scheduledJobs.length > 0 && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full">{scheduledJobs.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <span className="material-icons-outlined text-sm">history</span> History
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'scheduled' && renderScheduled()}
        {activeTab === 'history' && renderHistory()}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center">
         <p className="text-[10px] text-gray-400">
            <span className="material-icons-outlined text-[10px] align-middle mr-1">info</span>
            History logs are retained for 365 days as per school data retention policy.
         </p>
      </div>

      {renderDetailModal()}
    </div>
  );
};
