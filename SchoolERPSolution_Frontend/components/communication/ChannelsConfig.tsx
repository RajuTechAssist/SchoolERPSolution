
import React, { useState } from 'react';

// --- Types ---
type ChannelType = 'SMS' | 'Email' | 'Push' | 'WhatsApp';
type ProviderStatus = 'Operational' | 'Degraded' | 'Down' | 'Inactive';

interface ChannelConfig {
  id: string;
  type: ChannelType;
  providerName: string;
  status: ProviderStatus;
  isEnabled: boolean;
  quota?: { used: number; limit: number; unit: string };
  costPerUnit?: number;
  credentials: Record<string, string>; // Mock fields
  meta?: Record<string, any>; // e.g., DKIM verified
}

interface LogEntry {
  id: string;
  timestamp: string;
  channel: ChannelType;
  event: string;
  status: 'Success' | 'Error';
  latency: string;
}

// --- Mock Data ---
const MOCK_CHANNELS: ChannelConfig[] = [
  {
    id: 'c1',
    type: 'SMS',
    providerName: 'Twilio',
    status: 'Operational',
    isEnabled: true,
    quota: { used: 4500, limit: 10000, unit: 'Credits' },
    costPerUnit: 0.04,
    credentials: { apiKey: 'SK_...', senderId: 'SCH_ALERT' }
  },
  {
    id: 'c2',
    type: 'Email',
    providerName: 'SendGrid',
    status: 'Operational',
    isEnabled: true,
    quota: { used: 12500, limit: 50000, unit: 'Emails' },
    credentials: { apiKey: 'SG_...', fromEmail: 'admin@school.edu' },
    meta: { dkim: true, spf: true }
  },
  {
    id: 'c3',
    type: 'Push',
    providerName: 'Firebase (FCM)',
    status: 'Degraded',
    isEnabled: true,
    credentials: { serverKey: 'AAAA...' }
  },
  {
    id: 'c4',
    type: 'WhatsApp',
    providerName: 'Meta Business',
    status: 'Inactive',
    isEnabled: false,
    credentials: { accessToken: '', businessId: '' },
    costPerUnit: 0.08
  }
];

const MOCK_LOGS: LogEntry[] = [
  { id: 'l1', timestamp: '10:45:22 AM', channel: 'SMS', event: 'Message Queued', status: 'Success', latency: '120ms' },
  { id: 'l2', timestamp: '10:45:25 AM', channel: 'Email', event: 'SMTP Handshake', status: 'Success', latency: '450ms' },
  { id: 'l3', timestamp: '10:46:01 AM', channel: 'Push', event: 'Token Invalid', status: 'Error', latency: '80ms' },
  { id: 'l4', timestamp: '10:48:10 AM', channel: 'SMS', event: 'Carrier Rejected', status: 'Error', latency: '200ms' },
];

export const ChannelsConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'routing' | 'health'>('providers');
  const [channels, setChannels] = useState<ChannelConfig[]>(MOCK_CHANNELS);
  const [priorityOrder, setPriorityOrder] = useState<ChannelType[]>(['Push', 'SMS', 'Email', 'WhatsApp']);
  
  // Config Modal State
  const [editingChannel, setEditingChannel] = useState<ChannelConfig | null>(null);
  
  // Test Console State
  const [testPayload, setTestPayload] = useState({ channel: 'SMS', recipient: '', message: '' });
  const [testResult, setTestResult] = useState<{status: string, msg: string} | null>(null);

  // --- Handlers ---

  const handleToggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, isEnabled: !c.isEnabled } : c));
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...priorityOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    setPriorityOrder(newOrder);
  };

  const runTest = () => {
    if (!testPayload.recipient) return;
    setTestResult({ status: 'pending', msg: 'Sending...' });
    setTimeout(() => {
        // Mock outcome
        const success = Math.random() > 0.3;
        setTestResult({
            status: success ? 'success' : 'error',
            msg: success ? `Successfully sent to ${testPayload.recipient} via ${testPayload.channel}. ID: #msg_${Date.now()}` : `Failed to send. Provider returned: 401 Unauthorized.`
        });
    }, 1500);
  };

  const getStatusColor = (status: ProviderStatus) => {
      switch(status) {
          case 'Operational': return 'text-green-600 bg-green-50 border-green-200';
          case 'Degraded': return 'text-orange-600 bg-orange-50 border-orange-200';
          case 'Down': return 'text-red-600 bg-red-50 border-red-200';
          case 'Inactive': return 'text-gray-500 bg-gray-100 border-gray-200';
      }
  };

  // --- Renderers ---

  const renderProviders = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {channels.map(channel => (
            <div key={channel.id} className={`rounded-xl border p-5 transition-all ${channel.isEnabled ? 'bg-white dark:bg-card-dark border-gray-200 dark:border-gray-700 shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${channel.isEnabled ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                            <span className="material-icons-outlined text-2xl">
                                {channel.type === 'SMS' ? 'sms' : channel.type === 'Email' ? 'email' : channel.type === 'Push' ? 'notifications_active' : 'chat'}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">{channel.type}</h3>
                            <p className="text-xs text-gray-500">{channel.providerName}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={channel.isEnabled} onChange={() => handleToggleChannel(channel.id)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>

                <div className="space-y-4 mb-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(channel.status)}`}>{channel.status}</span>
                    </div>
                    {channel.quota && (
                        <div>
                            <div className="flex justify-between items-end text-xs mb-1">
                                <span className="text-gray-500">Quota Usage</span>
                                <span className="font-bold text-gray-700 dark:text-gray-300">{channel.quota.used.toLocaleString()} / {channel.quota.limit.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(channel.quota.used / channel.quota.limit) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                    {channel.type === 'Email' && channel.meta && (
                        <div className="flex gap-2">
                            <span className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1 ${channel.meta.dkim ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50'}`}>
                                <span className="material-icons-outlined text-[10px]">{channel.meta.dkim ? 'verified' : 'error'}</span> DKIM
                            </span>
                            <span className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1 ${channel.meta.spf ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50'}`}>
                                <span className="material-icons-outlined text-[10px]">{channel.meta.spf ? 'verified' : 'error'}</span> SPF
                            </span>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setEditingChannel(channel)}
                    className="w-full py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                    <span className="material-icons-outlined text-sm">settings</span> Configure
                </button>
            </div>
        ))}
    </div>
  );

  const renderRouting = () => (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
        <div className="lg:w-1/2 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-2">Fallback Priority Sequence</h3>
            <p className="text-sm text-gray-500 mb-6">Define the order in which the system attempts to deliver notifications. If a higher priority channel fails, the next one is attempted.</p>
            
            <div className="space-y-3">
                {priorityOrder.map((type, idx) => (
                    <div key={type} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <span className="font-bold text-gray-400 w-6 text-center">{idx + 1}</span>
                        <div className="flex-1 font-medium text-text-main-light dark:text-text-main-dark">{type}</div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => movePriority(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 disabled:opacity-30"
                            >
                                <span className="material-icons-outlined">arrow_upward</span>
                            </button>
                            <button 
                                onClick={() => movePriority(idx, 'down')}
                                disabled={idx === priorityOrder.length - 1}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 disabled:opacity-30"
                            >
                                <span className="material-icons-outlined">arrow_downward</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="lg:w-1/2 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">Rate Limiting & Throttling</h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Global Throughput (Messages/Sec)</label>
                    <div className="flex items-center gap-4">
                        <input type="range" min="1" max="100" defaultValue="20" className="flex-1 accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <span className="text-sm font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">20/s</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Limits the burst rate to prevent downstream provider rejection.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Max SMS per Day/User</label>
                        <input type="number" defaultValue={5} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Max Emails per Day/User</label>
                        <input type="number" defaultValue={10} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Smart Batching (Group notifications within 5 mins)</span>
                    </label>
                </div>

                <div className="flex justify-end pt-2">
                    <button className="px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors text-sm font-medium">Save Settings</button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderHealth = () => (
    <div className="space-y-6 animate-fade-in">
        {/* Test Console */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4 flex items-center gap-2">
                <span className="material-icons-outlined text-gray-400">build</span> Connection Test Console
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Channel</label>
                    <select 
                        value={testPayload.channel}
                        onChange={(e) => setTestPayload({...testPayload, channel: e.target.value})}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
                    >
                        <option value="SMS">SMS</option>
                        <option value="Email">Email</option>
                        <option value="Push">Push Notification</option>
                    </select>
                </div>
                <div className="flex-[2] w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recipient (Phone/Email)</label>
                    <input 
                        type="text" 
                        value={testPayload.recipient}
                        onChange={(e) => setTestPayload({...testPayload, recipient: e.target.value})}
                        placeholder="+1 555... or test@example.com"
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button 
                    onClick={runTest}
                    disabled={!testPayload.recipient}
                    className="w-full md:w-auto px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-black dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                >
                    <span className="material-icons-outlined text-sm">send</span> Test Send
                </button>
            </div>
            {testResult && (
                <div className={`mt-4 p-3 rounded-lg text-sm border flex items-start gap-2 ${testResult.status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : testResult.status === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    <span className={`material-icons-outlined text-lg ${testResult.status === 'pending' ? 'animate-spin' : ''}`}>
                        {testResult.status === 'success' ? 'check_circle' : testResult.status === 'error' ? 'error' : 'refresh'}
                    </span>
                    {testResult.msg}
                </div>
            )}
        </div>

        {/* Recent Logs Table */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <h3 className="font-bold text-text-main-light dark:text-text-main-dark">System Logs (Last Hour)</h3>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">2 Errors</span>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Channel</th>
                        <th className="px-6 py-3">Event</th>
                        <th className="px-6 py-3">Latency</th>
                        <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {MOCK_LOGS.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-6 py-3 font-mono text-xs text-gray-500">{log.timestamp}</td>
                            <td className="px-6 py-3">{log.channel}</td>
                            <td className="px-6 py-3">{log.event}</td>
                            <td className="px-6 py-3 text-gray-500 text-xs">{log.latency}</td>
                            <td className="px-6 py-3 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {log.status}
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
        {/* Header */}
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Channels & Integrations</h2>
                <p className="text-sm text-gray-500">Configure gateways, routing logic, and monitor API health.</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                    { id: 'providers', label: 'Providers', icon: 'hub' },
                    { id: 'routing', label: 'Routing & Limits', icon: 'alt_route' },
                    { id: 'health', label: 'System Health', icon: 'monitor_heart' },
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-4">
            {activeTab === 'providers' && renderProviders()}
            {activeTab === 'routing' && renderRouting()}
            {activeTab === 'health' && renderHealth()}
        </div>

        {/* Configuration Modal */}
        {editingChannel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingChannel(null)}></div>
                <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Configure {editingChannel.type}</h3>
                        <button onClick={() => setEditingChannel(null)}><span className="material-icons-outlined text-gray-500">close</span></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Provider Name</label>
                            <input type="text" defaultValue={editingChannel.providerName} className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" />
                        </div>
                        {Object.entries(editingChannel.credentials || {}).map(([key, val]) => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                <input 
                                    type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') ? 'password' : 'text'} 
                                    defaultValue={val as string} 
                                    className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-mono"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                        <button onClick={() => setEditingChannel(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
                        <button onClick={() => { alert('Configuration Saved!'); setEditingChannel(null); }} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm">Save Changes</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
