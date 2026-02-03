
import React, { useState } from 'react';

// --- Types ---
type SettingsTab = 'general' | 'id-cards' | 'finance' | 'rbac' | 'privacy';

interface CustomField {
  id: string;
  label: string;
  type: 'Text' | 'Date' | 'Select' | 'Boolean';
  section: 'Personal' | 'Health' | 'Academic';
  isActive: boolean;
}

interface DocType {
  id: string;
  name: string;
  expires: boolean;
  mandatory: boolean;
}

interface RolePermission {
  role: string;
  viewHealth: boolean;
  editProfile: boolean;
  viewFinancials: boolean;
  issueID: boolean;
}

// --- Mock Data ---
const INITIAL_FIELDS: CustomField[] = [
  { id: 'f1', label: 'House / Team', type: 'Select', section: 'Personal', isActive: true },
  { id: 'f2', label: 'Bus Route No', type: 'Text', section: 'Personal', isActive: true },
  { id: 'f3', label: 'Dietary Restriction', type: 'Text', section: 'Health', isActive: true },
];

const INITIAL_DOCS: DocType[] = [
  { id: 'd1', name: 'Birth Certificate', expires: false, mandatory: true },
  { id: 'd2', name: 'Passport / Visa', expires: true, mandatory: false },
  { id: 'd3', name: 'Transfer Certificate', expires: false, mandatory: true },
];

const INITIAL_PERMISSIONS: RolePermission[] = [
  { role: 'Admin', viewHealth: true, editProfile: true, viewFinancials: true, issueID: true },
  { role: 'Class Teacher', viewHealth: true, editProfile: true, viewFinancials: false, issueID: false },
  { role: 'Nurse', viewHealth: true, editProfile: false, viewFinancials: false, issueID: false },
  { role: 'Accountant', viewHealth: false, editProfile: false, viewFinancials: true, issueID: false },
];

export const StudentSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  
  // General State
  const [customFields, setCustomFields] = useState(INITIAL_FIELDS);
  const [docTypes, setDocTypes] = useState(INITIAL_DOCS);
  
  // ID Card State
  const [qrValidity, setQrValidity] = useState('1 Year');
  const [idTemplate, setIdTemplate] = useState('Standard');

  // Privacy State
  const [retentionPeriod, setRetentionPeriod] = useState('7'); // Years
  const [anonymizeTarget, setAnonymizeTarget] = useState('');

  // --- Handlers ---
  const toggleField = (id: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  };

  const handleAnonymize = () => {
    if (!anonymizeTarget) return;
    if (confirm(`WARNING: This action is irreversible.\n\nAre you sure you want to anonymize all PII for student ID "${anonymizeTarget}"?\n\nThis is a GDPR "Right to Erasure" request.`)) {
        alert(`Request Queued. Audit Log #9923 created for erasure of ${anonymizeTarget}.`);
        setAnonymizeTarget('');
    }
  };

  // --- Renderers ---

  const renderGeneral = () => (
    <div className="space-y-6 animate-fade-in">
        {/* Custom Fields */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Custom Profile Fields</h3>
                <button className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-blue-600 transition-colors">
                    + Add Field
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-3">Label</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Section</th>
                            <th className="px-4 py-3 text-right">Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {customFields.map(f => (
                            <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{f.label}</td>
                                <td className="px-4 py-3 text-gray-500">{f.type}</td>
                                <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{f.section}</span></td>
                                <td className="px-4 py-3 text-right">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={f.isActive} onChange={() => toggleField(f.id)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Document Config */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">Document Types</h3>
            <div className="space-y-2">
                {docTypes.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-outlined text-gray-400">description</span>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{doc.name}</p>
                                <p className="text-xs text-gray-500">{doc.mandatory ? 'Mandatory' : 'Optional'} • {doc.expires ? 'Expiring' : 'Permanent'}</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-primary"><span className="material-icons-outlined text-sm">edit</span></button>
                    </div>
                ))}
                <button className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm mt-2">
                    + Configure New Document Type
                </button>
            </div>
        </div>
    </div>
  );

  const renderIDCards = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-6">ID Card Policy</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Template</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Standard', 'Modern', 'Minimal', 'Vertical'].map(t => (
                            <div 
                                key={t} 
                                onClick={() => setIdTemplate(t)}
                                className={`p-3 border rounded-lg cursor-pointer text-center text-sm transition-all ${idTemplate === t ? 'border-primary bg-blue-50 dark:bg-blue-900/20 text-primary font-bold' : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:border-gray-300'}`}
                            >
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">QR Token Validity</label>
                        <select 
                            value={qrValidity}
                            onChange={(e) => setQrValidity(e.target.value)}
                            className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-sm"
                        >
                            <option>1 Term</option>
                            <option>1 Year</option>
                            <option>Permanent (Until Exit)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Determines how long a generated QR code remains scannable.</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                        <div>
                            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Force Re-issue</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">Invalidate all existing cards.</p>
                        </div>
                        <button className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-bold rounded hover:bg-yellow-700">Execute</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Role-Based Access Control (RBAC)</h3>
            <p className="text-sm text-gray-500">Manage visibility of sensitive student data.</p>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                <tr>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3 text-center">Medical Data</th>
                    <th className="px-6 py-3 text-center">Edit Profile</th>
                    <th className="px-6 py-3 text-center">Financials</th>
                    <th className="px-6 py-3 text-center">Issue ID</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {INITIAL_PERMISSIONS.map((perm, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{perm.role}</td>
                        <td className="px-6 py-4 text-center">
                            <input type="checkbox" checked={perm.viewHealth} disabled={perm.role === 'Admin'} className="rounded text-primary focus:ring-primary disabled:opacity-50" readOnly />
                        </td>
                        <td className="px-6 py-4 text-center">
                            <input type="checkbox" checked={perm.editProfile} disabled={perm.role === 'Admin'} className="rounded text-primary focus:ring-primary disabled:opacity-50" readOnly />
                        </td>
                        <td className="px-6 py-4 text-center">
                            <input type="checkbox" checked={perm.viewFinancials} disabled={perm.role === 'Admin'} className="rounded text-primary focus:ring-primary disabled:opacity-50" readOnly />
                        </td>
                        <td className="px-6 py-4 text-center">
                            <input type="checkbox" checked={perm.issueID} disabled={perm.role === 'Admin'} className="rounded text-primary focus:ring-primary disabled:opacity-50" readOnly />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-right">
            <button className="px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-blue-600 text-sm font-medium">Save Permissions</button>
        </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-icons-outlined text-3xl text-gray-400">shield</span>
                <div>
                    <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Data Retention Policy</h3>
                    <p className="text-sm text-gray-500">Configure how long alumni and inactive records are stored.</p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="flex justify-between text-sm font-medium mb-2">
                        <span>Retain Inactive Records For:</span>
                        <span className="font-bold text-primary">{retentionPeriod === '10' ? 'Indefinite' : `${retentionPeriod} Years`}</span>
                    </label>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1" 
                        value={retentionPeriod} 
                        onChange={(e) => setRetentionPeriod(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>1 Year</span>
                        <span>5 Years</span>
                        <span>Indefinite</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <span className="material-icons-outlined">gavel</span> GDPR Tools
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-6">
                Handle "Right to Erasure" and "Right to Access" requests. Actions here are logged in the immutable audit trail.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-red-100 dark:border-red-900/50">
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">Data Export (DSAR)</h4>
                    <p className="text-xs text-gray-500 mb-3">Generate a machine-readable archive of all data for a specific student.</p>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Enter Student ID" className="flex-1 p-2 text-sm border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                        <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm font-medium">Export</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-red-100 dark:border-red-900/50">
                    <h4 className="font-bold text-sm text-red-600 mb-2">Right to Erasure</h4>
                    <p className="text-xs text-gray-500 mb-3">Permanently anonymize PII for a student. Retains non-personal stats.</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={anonymizeTarget}
                            onChange={(e) => setAnonymizeTarget(e.target.value)}
                            placeholder="Enter Student ID" 
                            className="flex-1 p-2 text-sm border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700" 
                        />
                        <button 
                            onClick={handleAnonymize}
                            disabled={!anonymizeTarget}
                            className="px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                            Anonymize
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
         <div>
            <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Settings & Privacy</h2>
            <p className="text-sm text-gray-500">Configure profiles, security, and compliance policies.</p>
         </div>
         <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
            {[
                { id: 'general', label: 'General', icon: 'tune' },
                { id: 'id-cards', label: 'ID Cards', icon: 'badge' },
                { id: 'finance', label: 'Finance', icon: 'payments' },
                { id: 'rbac', label: 'Permissions', icon: 'security' },
                { id: 'privacy', label: 'Privacy & GDPR', icon: 'policy' },
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
                    {tab.label}
                </button>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
         {activeTab === 'general' && renderGeneral()}
         {activeTab === 'id-cards' && renderIDCards()}
         {activeTab === 'finance' && (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white dark:bg-card-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                 <span className="material-icons-outlined text-4xl mb-2">payments</span>
                 <p>Finance module integration pending.</p>
                 <button className="mt-4 px-4 py-2 bg-primary text-white rounded text-sm">Go to Finance Settings</button>
             </div>
         )}
         {activeTab === 'rbac' && renderPermissions()}
         {activeTab === 'privacy' && renderPrivacy()}
      </div>
    </div>
  );
};
