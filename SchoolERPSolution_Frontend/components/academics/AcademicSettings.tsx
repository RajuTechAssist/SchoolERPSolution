import React, { useState } from 'react';

// --- Types ---
type SettingsTab = 'general' | 'permissions' | 'integrations' | 'audit';
type Role = 'Admin' | 'Principal' | 'HOD' | 'Teacher' | 'ExamController' | 'Student';

interface PermissionModule {
  id: string;
  name: string;
  actions: {
    id: string;
    label: string;
    roles: Role[];
  }[];
}

interface IntegrationConfig {
  id: string;
  name: string;
  icon: string;
  status: 'Connected' | 'Disconnected' | 'Pending';
  fields: { label: string; type: 'text' | 'password'; value: string }[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

// --- Mock Data ---

const PERMISSION_MATRIX: PermissionModule[] = [
  {
    id: 'marks',
    name: 'Gradebook & Marks',
    actions: [
      { id: 'view_marks', label: 'View Marks', roles: ['Admin', 'Principal', 'HOD', 'Teacher', 'ExamController', 'Student'] },
      { id: 'enter_marks', label: 'Enter/Edit Marks', roles: ['Admin', 'Teacher'] },
      { id: 'lock_gradebook', label: 'Lock/Finalize Gradebook', roles: ['Admin', 'Principal', 'ExamController'] },
    ]
  },
  {
    id: 'attendance',
    name: 'Attendance',
    actions: [
      { id: 'mark_daily', label: 'Mark Daily Attendance', roles: ['Teacher', 'Admin'] },
      { id: 'modify_past', label: 'Modify Past Records', roles: ['Admin', 'Principal'] },
    ]
  },
  {
    id: 'exams',
    name: 'Examinations',
    actions: [
      { id: 'schedule_exam', label: 'Create Schedule', roles: ['Admin', 'ExamController'] },
      { id: 'upload_qpaper', label: 'Upload Question Papers', roles: ['Teacher', 'HOD'] },
      { id: 'approve_qpaper', label: 'Approve Question Papers', roles: ['HOD', 'Principal'] },
    ]
  }
];

const INITIAL_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'biometric',
    name: 'Biometric Devices',
    icon: 'fingerprint',
    status: 'Connected',
    fields: [
      { label: 'Device IP / Endpoint', type: 'text', value: '192.168.1.50' },
      { label: 'API Secret', type: 'password', value: '••••••••' }
    ]
  },
  {
    id: 'zoom',
    name: 'Zoom / Google Meet',
    icon: 'video_camera_front',
    status: 'Disconnected',
    fields: [
      { label: 'Client ID', type: 'text', value: '' },
      { label: 'Client Secret', type: 'password', value: '' }
    ]
  },
  {
    id: 'payment',
    name: 'Payment Gateway (Stripe/Razorpay)',
    icon: 'payments',
    status: 'Connected',
    fields: [
      { label: 'Merchant ID', type: 'text', value: 'acc_123456789' },
      { label: 'Publishable Key', type: 'text', value: 'pk_live_...' }
    ]
  },
  {
    id: 'sso',
    name: 'Single Sign-On (Google/Microsoft)',
    icon: 'vpn_key',
    status: 'Connected',
    fields: [
      { label: 'Tenant ID', type: 'text', value: 'school-erp-tenant' },
      { label: 'Metadata URL', type: 'text', value: 'https://...' }
    ]
  }
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'l1', timestamp: '2024-10-15 14:30', user: 'Mrs. Verma', role: 'Teacher', action: 'Update Marks', module: 'Gradebook', details: 'Changed Physics marks for Adrian Miller (35 -> 40). Reason: Retotaling.', severity: 'medium' },
  { id: 'l2', timestamp: '2024-10-15 10:00', user: 'Principal Anderson', role: 'Principal', action: 'Approve Plan', module: 'Lesson Planner', details: 'Approved Math Lesson Plan for Grade 10-A.', severity: 'low' },
  { id: 'l3', timestamp: '2024-10-14 16:45', user: 'System', role: 'Automated', action: 'Sync Failure', module: 'Integrations', details: 'Biometric sync failed for Device #2. Timeout.', severity: 'high' },
  { id: 'l4', timestamp: '2024-10-14 09:15', user: 'Mr. Singh', role: 'Admin', action: 'Delete Exam', module: 'Exams', details: 'Deleted Draft Exam: Chemistry Pop Quiz.', severity: 'high' },
  { id: 'l5', timestamp: '2024-10-13 11:20', user: 'Mrs. Verma', role: 'Teacher', action: 'Upload File', module: 'Assignments', details: 'Uploaded reference material for Chapter 4.', severity: 'low' },
];

export const AcademicSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  
  // State for General Config
  const [generalConfig, setGeneralConfig] = useState({
    currentYear: '2024-2025',
    lockPastTerms: true,
    autoPromotionThreshold: 33,
    attendanceRequirement: 75,
    enableParentPortal: true,
    enableStudentPortal: true,
  });

  // State for Permissions
  const [permissions, setPermissions] = useState(PERMISSION_MATRIX);

  // State for Integrations
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);

  // State for Audit
  const [auditSearch, setAuditSearch] = useState('');

  // --- Handlers ---

  const togglePermission = (moduleId: string, actionId: string, role: Role) => {
    setPermissions(prev => prev.map(mod => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        actions: mod.actions.map(act => {
          if (act.id !== actionId) return act;
          const hasRole = act.roles.includes(role);
          return {
            ...act,
            roles: hasRole ? act.roles.filter(r => r !== role) : [...act.roles, role]
          };
        })
      };
    }));
  };

  const toggleIntegrationStatus = (id: string) => {
    setIntegrations(prev => prev.map(int => 
        int.id === id ? { ...int, status: int.status === 'Connected' ? 'Disconnected' : 'Connected' } : int
    ));
  };

  // --- Renderers ---

  const renderGeneralConfig = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Academic Year & Promotion</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Academic Session</label>
                    <select 
                        value={generalConfig.currentYear}
                        onChange={(e) => setGeneralConfig({...generalConfig, currentYear: e.target.value})}
                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 outline-none text-sm"
                    >
                        <option>2023-2024 (Closed)</option>
                        <option>2024-2025 (Active)</option>
                        <option>2025-2026 (Upcoming)</option>
                    </select>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                        <span className="block text-sm font-medium">Lock Past Terms</span>
                        <span className="text-xs text-gray-500">Prevent editing of grades/attendance for closed terms.</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={generalConfig.lockPastTerms} onChange={(e) => setGeneralConfig({...generalConfig, lockPastTerms: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Auto-Promotion Threshold (%)</label>
                    <input 
                        type="number" 
                        value={generalConfig.autoPromotionThreshold}
                        onChange={(e) => setGeneralConfig({...generalConfig, autoPromotionThreshold: Number(e.target.value)})}
                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 outline-none text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Students scoring below this aggregate will be flagged as 'Detained'.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min. Attendance Required (%)</label>
                    <input 
                        type="number" 
                        value={generalConfig.attendanceRequirement}
                        onChange={(e) => setGeneralConfig({...generalConfig, attendanceRequirement: Number(e.target.value)})}
                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 outline-none text-sm"
                    />
                </div>
            </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Portal Access</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="block text-sm font-medium">Student Portal Access</span>
                        <span className="text-xs text-gray-500">Allow students to view their own grades, attendance, and schedule.</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={generalConfig.enableStudentPortal} onChange={(e) => setGeneralConfig({...generalConfig, enableStudentPortal: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="block text-sm font-medium">Parent Portal Access</span>
                        <span className="text-xs text-gray-500">Allow parents to view reports and pay fees.</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={generalConfig.enableParentPortal} onChange={(e) => setGeneralConfig({...generalConfig, enableParentPortal: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end">
            <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm transition-colors">
                Save Changes
            </button>
        </div>
    </div>
  );

  const renderPermissions = () => {
    const roles: Role[] = ['Admin', 'Principal', 'HOD', 'Teacher', 'ExamController', 'Student'];

    return (
        <div className="animate-fade-in bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 min-w-[200px]">Action / Capability</th>
                            {roles.map(role => (
                                <th key={role} className="px-4 py-4 text-center min-w-[100px]">{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {permissions.map((module) => (
                            <React.Fragment key={module.id}>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                                    <td colSpan={roles.length + 1} className="px-6 py-2 font-bold text-xs text-primary uppercase tracking-wider">
                                        {module.name}
                                    </td>
                                </tr>
                                {module.actions.map(action => (
                                    <tr key={action.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">
                                            {action.label}
                                        </td>
                                        {roles.map(role => {
                                            const isChecked = action.roles.includes(role);
                                            // Admin always has permission
                                            const isDisabled = role === 'Admin'; 
                                            return (
                                                <td key={role} className="px-4 py-3 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked || role === 'Admin'}
                                                        disabled={isDisabled}
                                                        onChange={() => togglePermission(module.id, action.id, role)}
                                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <p className="text-xs text-gray-500">Note: 'Admin' role has full access by default and cannot be modified here.</p>
                <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm transition-colors text-sm">
                    Save Matrix
                </button>
            </div>
        </div>
    );
  };

  const renderIntegrations = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {integrations.map(integration => (
            <div key={integration.id} className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${integration.status === 'Connected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <span className="material-icons-outlined text-2xl">{integration.icon}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-text-main-light dark:text-text-main-dark">{integration.name}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${integration.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {integration.status}
                            </span>
                        </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={integration.status === 'Connected'} onChange={() => toggleIntegrationStatus(integration.id)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </div>
                </div>
                <div className="p-6 space-y-4 flex-1 bg-gray-50/50 dark:bg-gray-800/30">
                    {integration.fields.map((field, idx) => (
                        <div key={idx}>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                            <input 
                                type={field.type} 
                                defaultValue={field.value}
                                disabled={integration.status === 'Disconnected'}
                                className="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button 
                        disabled={integration.status === 'Disconnected'}
                        className="text-xs font-medium text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
                    >
                        Test Connection
                    </button>
                </div>
            </div>
        ))}
    </div>
  );

  const renderAudit = () => {
    const filteredLogs = MOCK_AUDIT_LOGS.filter(log => 
        log.user.toLowerCase().includes(auditSearch.toLowerCase()) || 
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearch.toLowerCase())
    );

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <span className="material-icons-outlined">search</span>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search logs by user, action or details..." 
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span className="material-icons-outlined text-sm">download</span> Export CSV
                </button>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4 text-right">Severity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.timestamp}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-text-main-light dark:text-text-main-dark">{log.user}</div>
                                    <div className="text-xs text-gray-400">{log.role}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-bold border border-blue-100 dark:border-blue-800">
                                        {log.action}
                                    </span>
                                    <div className="text-[10px] text-gray-400 mt-1 uppercase">{log.module}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-md truncate" title={log.details}>
                                    {log.details}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`w-3 h-3 rounded-full inline-block ${
                                        log.severity === 'high' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 
                                        log.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                                    }`} title={log.severity}></span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Settings & Integrations</h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Configure academic rules, permissions, and external services.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
          {[
            { id: 'general', label: 'General Config', icon: 'tune' },
            { id: 'permissions', label: 'Permissions', icon: 'security' },
            { id: 'integrations', label: 'Integrations', icon: 'hub' },
            { id: 'audit', label: 'Audit Logs', icon: 'visibility' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-card-dark shadow text-primary' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="material-icons-outlined text-sm">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'general' && renderGeneralConfig()}
        {activeTab === 'permissions' && renderPermissions()}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'audit' && renderAudit()}
      </div>
    </div>
  );
};
