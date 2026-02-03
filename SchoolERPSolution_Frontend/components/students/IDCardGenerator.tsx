
import React, { useState } from 'react';

// --- Types ---
type Tab = 'design' | 'logs' | 'verify';
type GenMode = 'Batch' | 'Single';
type TemplateStyle = 'Standard' | 'Modern' | 'Minimal' | 'Vertical';

interface CardConfig {
  template: TemplateStyle;
  accentColor: string;
  showPhoto: boolean;
  showBloodGroup: boolean;
  showEmergency: boolean;
  showDOB: boolean;
  showAddress: boolean;
  includeQR: boolean;
}

interface PrintLog {
  id: string;
  date: string;
  target: string; // Class Name or Student Name
  type: 'Batch' | 'Single';
  reason: 'Annual' | 'Reissue' | 'New Admission';
  count: number;
  user: string;
}

// --- Mock Data ---
const MOCK_LOGS: PrintLog[] = [
  { id: 'job_101', date: '2024-10-25 10:30 AM', target: 'Class 10 - A', type: 'Batch', reason: 'Annual', count: 32, user: 'Admin' },
  { id: 'job_102', date: '2024-10-24 02:15 PM', target: 'Aarav Patel', type: 'Single', reason: 'Reissue', count: 1, user: 'Mrs. Verma' },
  { id: 'job_103', date: '2024-10-20 09:00 AM', target: 'Class 5 - B', type: 'Batch', reason: 'Annual', count: 28, user: 'System' },
];

export const IDCardGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('design');
  
  // Designer State
  const [mode, setMode] = useState<GenMode>('Batch');
  const [targetCohort, setTargetCohort] = useState('Class 10 - A');
  const [targetStudent, setTargetStudent] = useState('');
  const [reissueReason, setReissueReason] = useState('Lost Card');
  
  const [config, setConfig] = useState<CardConfig>({
    template: 'Standard',
    accentColor: '#3b82f6', // blue-500
    showPhoto: true,
    showBloodGroup: true,
    showEmergency: true,
    showDOB: true,
    showAddress: false,
    includeQR: true
  });

  // Verify State
  const [scanToken, setScanToken] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);

  // --- Helpers ---
  const handleGenerate = () => {
    const targetName = mode === 'Batch' ? targetCohort : (targetStudent || 'Unknown Student');
    const count = mode === 'Batch' ? 32 : 1;
    const confirmMsg = `Generate ID cards for ${mode === 'Batch' ? targetCohort : targetName} (${count} students). Include QR? [${config.includeQR ? 'Yes' : 'No'}]`;
    
    if (window.confirm(confirmMsg)) {
        alert(`Request queued! Job ID: #${Date.now().toString().slice(-6)}`);
        // Logic to append to logs would go here in a real app
    }
  };

  const handleScan = () => {
      // Mock validation
      if (scanToken === 'VALID_TOKEN') {
          setScanResult({
              status: 'Valid',
              name: 'Aarav Patel',
              id: 'STU2025-001',
              class: 'Class 10 - A',
              validTill: 'Mar 2025',
              photo: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=random'
          });
      } else {
          setScanResult({ status: 'Invalid' });
      }
  };

  // --- Renderers ---

  const renderDesigner = () => (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in">
        {/* Left: Configuration Panel */}
        <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto pr-1">
            
            {/* Mode & Target */}
            <div className="bg-white dark:bg-card-dark p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">1. Select Target</h3>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
                    <button 
                        onClick={() => setMode('Batch')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'Batch' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
                    >
                        Batch Cohort
                    </button>
                    <button 
                        onClick={() => setMode('Single')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'Single' ? 'bg-white dark:bg-card-dark shadow text-primary' : 'text-gray-500'}`}
                    >
                        Single / Reissue
                    </button>
                </div>

                {mode === 'Batch' ? (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Class</label>
                        <select 
                            value={targetCohort}
                            onChange={(e) => setTargetCohort(e.target.value)}
                            className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
                        >
                            <option>Class 10 - A</option>
                            <option>Class 10 - B</option>
                            <option>Class 12 - Science</option>
                            <option>All Staff</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-2">Est. 32 Cards will be generated.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student Name / ID</label>
                            <input 
                                type="text" 
                                value={targetStudent}
                                onChange={(e) => setTargetStudent(e.target.value)}
                                placeholder="Search..."
                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason</label>
                            <select 
                                value={reissueReason}
                                onChange={(e) => setReissueReason(e.target.value)}
                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none"
                            >
                                <option>Lost Card</option>
                                <option>Damaged</option>
                                <option>Data Correction</option>
                                <option>New Admission</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Design Controls */}
            <div className="bg-white dark:bg-card-dark p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">2. Design & Layout</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Template Style</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Standard', 'Modern', 'Minimal', 'Vertical'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setConfig({...config, template: t as TemplateStyle})}
                                    className={`py-2 text-xs border rounded transition-colors ${config.template === t ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Accent Color</label>
                        <div className="flex gap-2">
                            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#1f2937'].map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setConfig({...config, accentColor: c})}
                                    className={`w-6 h-6 rounded-full border-2 ${config.accentColor === c ? 'border-gray-400 dark:border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                ></button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Visible Fields</label>
                        <div className="space-y-2">
                            {[
                                { key: 'showPhoto', label: 'Student Photo' },
                                { key: 'showBloodGroup', label: 'Blood Group' },
                                { key: 'showDOB', label: 'Date of Birth' },
                                { key: 'showEmergency', label: 'Emergency Contact' },
                                { key: 'showAddress', label: 'Address' },
                            ].map(field => (
                                <label key={field.key} className="flex items-center justify-between cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                                    <span>{field.label}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={(config as any)[field.key]} 
                                        onChange={(e) => setConfig({...config, [field.key]: e.target.checked})}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="group relative">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                    <span className="material-icons-outlined text-sm">qr_code</span> Secure QR
                                    <span className="material-icons-outlined text-gray-400 text-xs cursor-help">info</span>
                                </span>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black text-white text-[10px] rounded hidden group-hover:block z-10">
                                    QR code opens student summary for authorized staff only. Do not expose QR publicly.
                                </div>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={config.includeQR} 
                                onChange={(e) => setConfig({...config, includeQR: e.target.checked})}
                                className="rounded text-primary focus:ring-primary w-5 h-5"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Preview & Action */}
        <div className="flex-1 flex flex-col">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center p-8 flex-1 relative overflow-hidden">
                <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</div>
                
                {/* ID Card Component */}
                <div 
                    className={`bg-white shadow-xl rounded-lg overflow-hidden relative text-gray-800 transition-all duration-300
                        ${config.template === 'Vertical' ? 'w-[300px] h-[480px]' : 'w-[480px] h-[300px]'}`}
                    style={{ fontFamily: 'sans-serif' }}
                >
                    {/* Header */}
                    <div className="h-4 w-full" style={{ backgroundColor: config.accentColor }}></div>
                    <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">LOGO</div>
                        <div>
                            <h4 className="font-bold text-sm uppercase leading-tight" style={{ color: config.accentColor }}>Springfield Academy</h4>
                            <p className="text-[10px] text-gray-500">Excellence in Education</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className={`p-6 flex gap-6 ${config.template === 'Vertical' ? 'flex-col items-center text-center' : 'items-center'}`}>
                        {config.showPhoto && (
                            <div className="w-24 h-32 bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-400 shrink-0">
                                Photo
                            </div>
                        )}
                        
                        <div className="flex-1 space-y-1">
                            <h2 className="text-xl font-bold uppercase text-gray-900">Aarav Patel</h2>
                            <p className="text-sm font-semibold text-gray-600 mb-2">Class 10 - A</p>
                            
                            <div className="text-xs space-y-0.5 text-gray-600 text-left">
                                <p><span className="font-bold">ID No:</span> STU2025-001</p>
                                {config.showDOB && <p><span className="font-bold">DOB:</span> 15 May 2008</p>}
                                {config.showBloodGroup && <p><span className="font-bold">Blood Group:</span> B+</p>}
                                {config.showEmergency && <p><span className="font-bold">Emergency:</span> +91 9876543210</p>}
                                {config.showAddress && <p><span className="font-bold">Address:</span> 123 Green Ave, City</p>}
                            </div>
                        </div>

                        {config.includeQR && (
                            <div className="w-20 h-20 bg-gray-900 shrink-0 flex items-center justify-center text-white text-[8px]">
                                Secure QR
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 w-full py-2 px-6 bg-gray-50 flex justify-between items-center text-[10px] text-gray-500 border-t border-gray-100">
                        <span>Valid till: Mar 2026</span>
                        <span>Principal Signature</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button className="px-6 py-2.5 bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
                    Download Preview PDF
                </button>
                <button 
                    onClick={handleGenerate}
                    className="px-8 py-2.5 bg-primary text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors font-bold flex items-center gap-2"
                >
                    <span className="material-icons-outlined">print</span> 
                    Generate & Print {mode === 'Batch' ? 'Batch' : 'Card'}
                </button>
            </div>
        </div>
    </div>
  );

  const renderLogs = () => (
    <div className="animate-fade-in bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                <tr>
                    <th className="px-6 py-4">Job ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Target</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Count</th>
                    <th className="px-6 py-4">Generated By</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {MOCK_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.id}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{log.date}</td>
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{log.target}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'Batch' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {log.type}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{log.reason}</td>
                        <td className="px-6 py-4 font-bold">{log.count}</td>
                        <td className="px-6 py-4 text-gray-500">{log.user}</td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-primary hover:underline text-xs flex items-center justify-end gap-1">
                                <span className="material-icons-outlined text-sm">download</span> PDF
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  const renderVerify = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in p-6">
        <div className="w-full max-w-md bg-white dark:bg-card-dark p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <span className="material-icons-outlined text-3xl">qr_code_scanner</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Scan or Enter Token</h3>
            <p className="text-sm text-gray-500 mb-6">Scan the QR code on the student ID card to verify authenticity and view details.</p>
            
            <div className="relative mb-6">
                <input 
                    type="text" 
                    value={scanToken}
                    onChange={(e) => setScanToken(e.target.value)}
                    placeholder="Enter Token ID (Try 'VALID_TOKEN')"
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
                <button 
                    onClick={handleScan}
                    className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <span className="material-icons-outlined text-lg">search</span>
                </button>
            </div>

            {scanResult && (
                <div className={`mt-6 p-4 rounded-xl border ${scanResult.status === 'Valid' ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900'} animate-slide-in-down`}>
                    {scanResult.status === 'Valid' ? (
                        <div className="text-left flex gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                <img src={scanResult.photo} alt="Student" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{scanResult.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{scanResult.id}</p>
                                <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                                    <span className="material-icons-outlined text-xs">verified</span> Verified • Valid till {scanResult.validTill}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-red-600 flex items-center justify-center gap-2 font-bold">
                            <span className="material-icons-outlined">error</span> Invalid or Expired Token
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
        {/* Header Tabs */}
        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">ID Card Generator</h2>
                <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Design, print, and verify student identity cards.</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                    { id: 'design', label: 'Design & Generate', icon: 'style' },
                    { id: 'logs', label: 'Print Logs', icon: 'history' },
                    { id: 'verify', label: 'Verify Card', icon: 'qr_code_scanner' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
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
        <div className="flex-1 overflow-hidden">
            {activeTab === 'design' && renderDesigner()}
            {activeTab === 'logs' && renderLogs()}
            {activeTab === 'verify' && renderVerify()}
        </div>
    </div>
  );
};
