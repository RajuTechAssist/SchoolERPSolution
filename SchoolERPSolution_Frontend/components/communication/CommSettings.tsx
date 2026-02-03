
import React, { useState } from 'react';

// --- Types ---
type SettingsTab = 'general' | 'policies' | 'approvals' | 'technical';

interface EscalationRule {
  id: string;
  trigger: string;
  durationHours: number;
  action: string;
  targetRole: string;
  isActive: boolean;
}

// --- Mock Data ---
const DEFAULT_ESCALATIONS: EscalationRule[] = [
  { id: 'e1', trigger: 'Unanswered Parent Message', durationHours: 48, action: 'Notify', targetRole: 'Section Head', isActive: true },
  { id: 'e2', trigger: 'Urgent Flagged Ticket', durationHours: 4, action: 'Escalate', targetRole: 'Principal', isActive: true },
  { id: 'e3', trigger: 'Negative Sentiment Detected', durationHours: 24, action: 'Flag for Review', targetRole: 'Counselor', isActive: false },
];

export const CommSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  
  // General State
  const [defaultSenderName, setDefaultSenderName] = useState('Springfield Admin');
  const [defaultReplyTo, setDefaultReplyTo] = useState('office@springfield.edu');
  const [smsSenderId, setSmsSenderId] = useState('SCH_ALRT');
  
  // Policies State
  const [dndEnabled, setDndEnabled] = useState(true);
  const [dndStart, setDndStart] = useState('21:00');
  const [dndEnd, setDndEnd] = useState('07:00');
  const [dndChannels, setDndChannels] = useState({ sms: true, push: true, email: false, whatsapp: true });
  const [escalations, setEscalations] = useState<EscalationRule[]>(DEFAULT_ESCALATIONS);

  // Approval State
  const [approvalThreshold, setApprovalThreshold] = useState(500);
  const [requireApprovalFor, setRequireApprovalFor] = useState({ allStaff: true, allParents: true, external: false });
  
  // Technical State
  const [rateLimit, setRateLimit] = useState(60); // msgs per min
  const [maxBatchSize, setMaxBatchSize] = useState(5000);
  const [unicodeWarning, setUnicodeWarning] = useState(true);

  // --- Renderers ---

  const renderGeneral = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">Sender Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Email "From" Name</label>
                    <input 
                        type="text" 
                        value={defaultSenderName}
                        onChange={(e) => setDefaultSenderName(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Appears in parent inboxes.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reply-To Address</label>
                    <input 
                        type="email" 
                        value={defaultReplyTo}
                        onChange={(e) => setDefaultReplyTo(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Where replies should be routed.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default SMS Sender ID</label>
                    <input 
                        type="text" 
                        value={smsSenderId}
                        onChange={(e) => setSmsSenderId(e.target.value.toUpperCase().slice(0, 6))}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary font-mono"
                        maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 6 chars. Subject to carrier approval.</p>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">Email Footer & Signature</h3>
            <textarea 
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none h-32 text-sm"
                defaultValue={`--\nSpringfield Academy Administration\n123 School Lane, Cityville\nContact: +1 555-0123 | www.springfield.edu`}
            ></textarea>
            <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="append_unsubscribe" defaultChecked className="rounded text-primary focus:ring-primary" />
                <label htmlFor="append_unsubscribe" className="text-sm text-gray-700 dark:text-gray-300">Automatically append "Unsubscribe" link to bulk emails</label>
            </div>
        </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        {/* DND Settings */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Quiet Hours (Do Not Disturb)</h3>
                    <p className="text-sm text-gray-500">Prevent non-emergency notifications during specific hours.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={dndEnabled} onChange={(e) => setDndEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>

            <div className={`space-y-6 transition-opacity ${dndEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">From:</label>
                        <input type="time" value={dndStart} onChange={(e) => setDndStart(e.target.value)} className="p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">To:</label>
                        <input type="time" value={dndEnd} onChange={(e) => setDndEnd(e.target.value)} className="p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">Enforce on Channels:</label>
                    <div className="flex gap-4">
                        {(Object.entries(dndChannels) as Array<[keyof typeof dndChannels, boolean]>).map(([key, val]) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                <input 
                                    type="checkbox" 
                                    checked={val} 
                                    onChange={() => setDndChannels(prev => ({ ...prev, [key]: !val }))}
                                    className="rounded text-primary focus:ring-primary" 
                                />
                                <span className="text-sm capitalize">{key === 'sms' ? 'SMS' : key}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                    <span className="material-icons-outlined text-lg">info</span>
                    <span>Messages marked as "Emergency" or "High Priority" will bypass these settings.</span>
                </div>
            </div>
        </div>

        {/* Escalation Matrix */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Escalation Matrix</h3>
                <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    <span className="material-icons-outlined text-sm">add</span> Add Rule
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-4 py-3">Trigger Condition</th>
                            <th className="px-4 py-3">Wait Time</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Target</th>
                            <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {escalations.map(rule => (
                            <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <td className="px-4 py-3 font-medium">{rule.trigger}</td>
                                <td className="px-4 py-3">{rule.durationHours} Hours</td>
                                <td className="px-4 py-3">{rule.action}</td>
                                <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{rule.targetRole}</span></td>
                                <td className="px-4 py-3 text-right">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={rule.isActive} onChange={() => {}} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-6">Approval Workflows</h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Require Admin Approval for Broadcasts exceeding:</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="50" 
                            max="5000" 
                            step="50"
                            value={approvalThreshold}
                            onChange={(e) => setApprovalThreshold(Number(e.target.value))}
                            className="flex-1 accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                        />
                        <div className="w-32 p-2 bg-gray-100 dark:bg-gray-800 rounded text-center text-sm font-bold border border-gray-200 dark:border-gray-600">
                            {approvalThreshold} Recipients
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Any broadcast targeting more than {approvalThreshold} users will be held in "Pending Approval" state.</p>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-bold mb-3">Mandatory Approval Groups</h4>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div>
                                <span className="block text-sm font-medium">All Staff Broadcasts</span>
                                <span className="text-xs text-gray-500">Messages sent to the 'All Teachers & Staff' cohort.</span>
                            </div>
                            <input type="checkbox" checked={requireApprovalFor.allStaff} onChange={() => setRequireApprovalFor({...requireApprovalFor, allStaff: !requireApprovalFor.allStaff})} className="rounded text-primary w-5 h-5" />
                        </label>
                        <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div>
                                <span className="block text-sm font-medium">All Parent Broadcasts</span>
                                <span className="text-xs text-gray-500">Messages sent to the 'All Parents' cohort.</span>
                            </div>
                            <input type="checkbox" checked={requireApprovalFor.allParents} onChange={() => setRequireApprovalFor({...requireApprovalFor, allParents: !requireApprovalFor.allParents})} className="rounded text-primary w-5 h-5" />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderTechnical = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-6">Technical Constraints</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate Limiting (Throttle)</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={rateLimit}
                            onChange={(e) => setRateLimit(Number(e.target.value))}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">msgs / minute</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Prevents triggering carrier spam filters.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Batch Size</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={maxBatchSize}
                            onChange={(e) => setMaxBatchSize(Number(e.target.value))}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">recipients</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Maximum recipients in a single API call.</p>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Smart Unicode Detection</h4>
                        <p className="text-xs text-gray-500">Warn authors when special characters reduce SMS char limit (160 -&gt; 70).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={unicodeWarning} onChange={(e) => setUnicodeWarning(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Settings & Policies</h2>
                <p className="text-sm text-gray-500">Configure global defaults, safety rules, and operational policies.</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
                {[
                    { id: 'general', label: 'General', icon: 'tune' },
                    { id: 'policies', label: 'Policies & DND', icon: 'gavel' },
                    { id: 'approvals', label: 'Workflows', icon: 'fact_check' },
                    { id: 'technical', label: 'Technical', icon: 'code' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap 
                            ${activeTab === tab.id 
                                ? 'bg-white dark:bg-card-dark shadow text-primary' 
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <span className="material-icons-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-4">
            {activeTab === 'general' && renderGeneral()}
            {activeTab === 'policies' && renderPolicies()}
            {activeTab === 'approvals' && renderApprovals()}
            {activeTab === 'technical' && renderTechnical()}
        </div>
    </div>
  );
};
