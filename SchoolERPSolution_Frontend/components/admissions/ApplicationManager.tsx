
import React, { useState } from 'react';

// --- Types ---
type AppStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Interview' | 'Offer Sent' | 'Waitlisted' | 'Rejected' | 'Enrolled';
type PaymentStatus = 'Pending' | 'Paid' | 'Waived';
type DocStatus = 'Missing' | 'Uploaded' | 'Verified' | 'Rejected';

interface ApplicationDoc {
  id: string;
  name: string;
  type: string;
  status: DocStatus;
  url?: string;
  isMandatory: boolean;
}

interface Application {
  id: string;
  applicantName: string;
  photoUrl: string;
  appliedClass: string;
  academicYear: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  prevSchool: string;
  emergencyContact: string;
  status: AppStatus;
  paymentStatus: PaymentStatus;
  counselor: string;
  createdAt: string;
  documents: ApplicationDoc[];
  interviewScore?: number;
  interviewNotes?: string;
  decisionNotes?: string;
}

// --- Mock Data ---
const MOCK_APPS: Application[] = [
  {
    id: 'APP-2025-001',
    applicantName: 'Aarav Patel',
    photoUrl: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=random',
    appliedClass: 'Class 1',
    academicYear: '2025-2026',
    dob: '2019-05-15', // Eligible for Class 1 (approx 6 yrs)
    gender: 'Male',
    parentName: 'Suresh Patel',
    parentPhone: '+91 98765 43210',
    parentEmail: 'suresh.p@example.com',
    address: '123, Green Avenue, City',
    prevSchool: 'Little Stars Kindergarten',
    emergencyContact: '+91 98765 43211',
    status: 'Under Review',
    paymentStatus: 'Paid',
    counselor: 'Mrs. Verma',
    createdAt: '2024-10-15',
    documents: [
      { id: 'd1', name: 'Birth Certificate', type: 'PDF', status: 'Verified', isMandatory: true, url: '#' },
      { id: 'd2', name: 'Photo', type: 'JPG', status: 'Verified', isMandatory: true, url: '#' },
      { id: 'd3', name: 'Transfer Certificate', type: 'PDF', status: 'Uploaded', isMandatory: true, url: '#' },
      { id: 'd4', name: 'Previous Marks', type: 'PDF', status: 'Uploaded', isMandatory: false, url: '#' }
    ]
  },
  {
    id: 'APP-2025-002',
    applicantName: 'Zara Khan',
    photoUrl: 'https://ui-avatars.com/api/?name=Zara+Khan&background=random',
    appliedClass: 'Class 5',
    academicYear: '2025-2026',
    dob: '2015-08-20',
    gender: 'Female',
    parentName: 'Farhan Khan',
    parentPhone: '+91 99887 76655',
    parentEmail: 'farhan.k@example.com',
    address: '45, Civil Lines, City',
    prevSchool: 'City Public School',
    emergencyContact: '+91 99887 76600',
    status: 'Submitted',
    paymentStatus: 'Pending',
    counselor: 'Mr. David',
    createdAt: '2024-10-18',
    documents: [
      { id: 'd1', name: 'Birth Certificate', type: 'PDF', status: 'Uploaded', isMandatory: true },
      { id: 'd2', name: 'Photo', type: 'JPG', status: 'Missing', isMandatory: true },
      { id: 'd3', name: 'Transfer Certificate', type: 'PDF', status: 'Missing', isMandatory: true }
    ]
  },
  {
    id: 'APP-2025-003',
    applicantName: 'Ishaan Gupta',
    photoUrl: 'https://ui-avatars.com/api/?name=Ishaan+Gupta&background=random',
    appliedClass: 'Class 1',
    academicYear: '2025-2026',
    dob: '2020-11-05', // Too young for Class 1 (approx 4.5 yrs by April 2025)
    gender: 'Male',
    parentName: 'Meera Gupta',
    parentPhone: '+91 91234 56789',
    parentEmail: 'meera.g@example.com',
    address: 'Flat 402, Sunshine Apts',
    prevSchool: 'Kidzee',
    emergencyContact: '+91 91234 56780',
    status: 'Interview',
    paymentStatus: 'Paid',
    counselor: 'Mrs. Verma',
    createdAt: '2024-10-10',
    interviewScore: 8,
    interviewNotes: 'Bright child, good communication skills.',
    documents: [
      { id: 'd1', name: 'Birth Certificate', type: 'PDF', status: 'Verified', isMandatory: true },
      { id: 'd2', name: 'Photo', type: 'JPG', status: 'Verified', isMandatory: true },
      { id: 'd3', name: 'Transfer Certificate', type: 'PDF', status: 'Verified', isMandatory: true }
    ]
  }
];

// --- Templates & Logic ---

const getAgeCheck = (dob: string, appliedClass: string) => {
  if (!dob) return { pass: false, msg: 'DOB Missing' };
  const birthDate = new Date(dob);
  // Assume Academic Year starts April 1st, 2025
  const refDate = new Date('2025-04-01');
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const m = refDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }

  // Simple logic for Class 1 (Age 5-7)
  if (appliedClass === 'Class 1') {
    if (age >= 5 && age < 7) return { pass: true, msg: `Age ${age}: Eligible (5-7)` };
    return { pass: false, msg: `Age ${age}: Check Age (Req: 5-7)` };
  }
  return { pass: true, msg: `Age ${age}: OK` };
};

const TEMPLATES = {
  adminNote: (app: Application, ageResult: string) => `Review notes: applicant ${app.applicantName} DOB ${app.dob} - DOB check: ${ageResult}. Missing docs: ${app.documents.filter(d => d.status !== 'Verified').map(d => d.name).join(', ') || 'None'}. Recommendation: Proceed to Interview.`,
  offerEmail: (app: Application) => `Dear ${app.parentName}, We are pleased to offer admission to ${app.applicantName} for ${app.appliedClass} for session ${app.academicYear}. Please complete payment of ₹50,000 by 2024-11-15 to confirm the seat. - Springfield Academy`,
  rejectEmail: (app: Application) => `Dear ${app.parentName}, Thank you for applying to Springfield Academy. We regret to inform you that we are unable to offer admission at this time due to limited seat availability/age criteria.`,
};

export const ApplicationManager: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [applications, setApplications] = useState<Application[]>(MOCK_APPS);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Decision Modal
  const [decisionModal, setDecisionModal] = useState<{ isOpen: boolean, type: 'Offer' | 'Reject' | 'Waitlist' | null }>({ isOpen: false, type: null });
  const [decisionText, setDecisionText] = useState('');

  // --- Handlers ---

  const handleOpenDetail = (app: Application) => {
    setSelectedApp(app);
    setView('detail');
    setActiveTab('summary');
  };

  const handleBack = () => {
    setSelectedApp(null);
    setView('list');
  };

  const handleDocStatusChange = (docId: string, status: DocStatus) => {
    if (!selectedApp) return;
    const updatedDocs = selectedApp.documents.map(d => d.id === docId ? { ...d, status } : d);
    setSelectedApp({ ...selectedApp, documents: updatedDocs });
    // Update main list as well
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, documents: updatedDocs } : a));
  };

  const handleDecisionClick = (type: 'Offer' | 'Reject' | 'Waitlist') => {
    if (!selectedApp) return;
    
    // Validation Rule: Block Offer if docs pending
    if (type === 'Offer') {
        const pendingDocs = selectedApp.documents.some(d => d.isMandatory && d.status !== 'Verified');
        if (pendingDocs) {
            if (!confirm('Warning: Some mandatory documents are not verified. Proceed with Offer?')) return;
        }
    }

    const text = type === 'Offer' ? TEMPLATES.offerEmail(selectedApp) 
               : type === 'Reject' ? TEMPLATES.rejectEmail(selectedApp)
               : `Dear ${selectedApp.parentName}, ${selectedApp.applicantName} has been placed on the waitlist for ${selectedApp.appliedClass}.`;
    
    setDecisionText(text);
    setDecisionModal({ isOpen: true, type });
  };

  const submitDecision = () => {
    if (!selectedApp || !decisionModal.type) return;
    
    const newStatus: AppStatus = decisionModal.type === 'Offer' ? 'Offer Sent' 
                               : decisionModal.type === 'Reject' ? 'Rejected' 
                               : 'Waitlisted';
    
    const updatedApp = { ...selectedApp, status: newStatus, decisionNotes: decisionText };
    setSelectedApp(updatedApp);
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? updatedApp : a));
    setDecisionModal({ isOpen: false, type: null });
    alert(`Status updated to ${newStatus} and notification queued.`);
  };

  // --- Render List View ---
  const renderList = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Applications Manager</h2>
                <p className="text-sm text-gray-500">Review, verify, and process incoming admission applications.</p>
            </div>
            <div className="flex gap-2">
                <select className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none">
                    <option>Status: All</option>
                    <option>Submitted</option>
                    <option>Interview</option>
                    <option>Offer Sent</option>
                </select>
                <select className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none">
                    <option>Class: All</option>
                    <option>Class 1</option>
                    <option>Class 5</option>
                </select>
            </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3">App ID</th>
                        <th className="px-6 py-3">Applicant</th>
                        <th className="px-6 py-3">Applied Class</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Counselor</th>
                        <th className="px-6 py-3">Payment</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {applications.map(app => (
                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{app.id}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={app.photoUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                                    <div>
                                        <div className="font-medium text-text-main-light dark:text-text-main-dark">{app.applicantName}</div>
                                        <div className="text-xs text-gray-500">{app.createdAt}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">{app.appliedClass}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    app.status === 'Offer Sent' ? 'bg-green-100 text-green-700' :
                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {app.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{app.counselor}</td>
                            <td className="px-6 py-4">
                                <span className={`flex items-center gap-1 text-xs font-medium ${
                                    app.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'
                                }`}>
                                    <span className="material-icons-outlined text-sm">{app.paymentStatus === 'Paid' ? 'check_circle' : 'pending'}</span>
                                    {app.paymentStatus}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleOpenDetail(app)}
                                    className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  // --- Render Detail View ---
  const renderDetail = () => {
    if (!selectedApp) return null;
    const ageCheck = getAgeCheck(selectedApp.dob, selectedApp.appliedClass);

    return (
        <div className="flex flex-col h-full animate-slide-in-right">
            {/* Detail Header */}
            <div className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={handleBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                        <span className="material-icons-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                            {selectedApp.applicantName}
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{selectedApp.id}</span>
                        </h2>
                        <p className="text-sm text-gray-500">{selectedApp.appliedClass} • {selectedApp.academicYear}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right mr-4 hidden md:block">
                        <p className="text-xs text-gray-500">Current Status</p>
                        <p className="font-bold text-primary">{selectedApp.status}</p>
                    </div>
                    {/* Top Actions */}
                    <button onClick={() => handleDecisionClick('Offer')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm">Send Offer</button>
                    <button onClick={() => handleDecisionClick('Reject')} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100">Reject</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 px-4">
                <div className="flex gap-6 overflow-x-auto">
                    {['Summary', 'Form Data', 'Documents', 'Interview', 'Decision'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.toLowerCase() 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'summary' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                                <img src={selectedApp.photoUrl} alt="Applicant" className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200" />
                                <h3 className="font-bold text-lg">{selectedApp.applicantName}</h3>
                                <p className="text-gray-500 text-sm mb-4">{selectedApp.gender}, DOB: {selectedApp.dob}</p>
                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${ageCheck.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className="material-icons-outlined text-xs">{ageCheck.pass ? 'check_circle' : 'warning'}</span>
                                    {ageCheck.msg}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h4 className="font-bold text-gray-500 uppercase text-xs mb-3">Application Score</h4>
                                <div className="text-3xl font-bold text-blue-600 mb-1">{selectedApp.interviewScore ? `${selectedApp.interviewScore}/10` : 'N/A'}</div>
                                <p className="text-xs text-gray-400">Interview Rating</p>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h4 className="font-bold text-lg mb-4">Admin Summary</h4>
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Review Notes</span>
                                        <button 
                                            className="text-xs text-blue-600 hover:underline"
                                            onClick={() => navigator.clipboard.writeText(TEMPLATES.adminNote(selectedApp, ageCheck.msg))}
                                        >
                                            Copy Template
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                                        {TEMPLATES.adminNote(selectedApp, ageCheck.msg)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Contact Info Card */}
                            <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h4 className="font-bold text-lg mb-4">Parent/Guardian Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-gray-500 text-xs">Name</span>
                                        <span className="font-medium">{selectedApp.parentName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs">Phone</span>
                                        <span className="font-medium">{selectedApp.parentPhone}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-gray-500 text-xs">Email</span>
                                        <span className="font-medium">{selectedApp.parentEmail}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-gray-500 text-xs">Address</span>
                                        <span className="font-medium">{selectedApp.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'form data' && (
                    <div className="max-w-4xl mx-auto bg-white dark:bg-card-dark p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Full Application Form</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Applicant Name</label>
                                <input type="text" defaultValue={selectedApp.applicantName} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                                <div className="flex gap-2">
                                    <input type="date" defaultValue={selectedApp.dob} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                                    <div className={`flex items-center justify-center px-3 rounded border ${ageCheck.pass ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`} title={ageCheck.msg}>
                                        <span className="material-icons-outlined text-sm">{ageCheck.pass ? 'check' : 'close'}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                                <select defaultValue={selectedApp.gender} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm">
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Applying For</label>
                                <div className="flex gap-2">
                                    <input type="text" defaultValue={selectedApp.appliedClass} className="w-1/2 p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                                    <input type="text" defaultValue={selectedApp.academicYear} className="w-1/2 p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Previous School</label>
                                <input type="text" defaultValue={selectedApp.prevSchool} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                            </div>
                            <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="font-bold text-sm mb-4">Guardian Information</h4>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Name</label>
                                <input type="text" defaultValue={selectedApp.parentName} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Emergency Contact</label>
                                <input type="text" defaultValue={selectedApp.emergencyContact} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-lg flex items-start gap-3">
                            <span className="material-icons-outlined text-yellow-600">info</span>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">Mandatory documents must be marked as <strong>Verified</strong> before an Offer Letter can be generated.</p>
                        </div>
                        
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            {selectedApp.documents.map(doc => (
                                <div key={doc.id} className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                                            <span className="material-icons-outlined">description</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                                                {doc.name}
                                                {doc.isMandatory && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded">Required</span>}
                                            </h4>
                                            <p className="text-xs text-gray-500">{doc.type} • {doc.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {doc.status !== 'Missing' && (
                                            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                <span className="material-icons-outlined text-sm">visibility</span> View
                                            </button>
                                        )}
                                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                            <button 
                                                onClick={() => handleDocStatusChange(doc.id, 'Verified')}
                                                className={`p-1.5 rounded ${doc.status === 'Verified' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-400 hover:text-green-600'}`} 
                                                title="Verify"
                                            >
                                                <span className="material-icons-outlined text-lg">check_circle</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDocStatusChange(doc.id, 'Rejected')}
                                                className={`p-1.5 rounded ${doc.status === 'Rejected' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-red-600'}`} 
                                                title="Reject"
                                            >
                                                <span className="material-icons-outlined text-lg">cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'interview' && (
                    <div className="max-w-4xl mx-auto bg-white dark:bg-card-dark p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-6">Interview & Assessment</h3>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-500 mb-2">Overall Score (1-10)</label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5,6,7,8,9,10].map(score => (
                                    <button 
                                        key={score}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                            (selectedApp.interviewScore || 0) >= score 
                                            ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {score}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-500 mb-2">Counselor Notes</label>
                            <textarea 
                                rows={5} 
                                defaultValue={selectedApp.interviewNotes}
                                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter observation details..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm">Save Assessment</button>
                        </div>
                    </div>
                )}

                {activeTab === 'decision' && (
                    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-10 space-y-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-outlined text-4xl text-gray-400">gavel</span>
                            </div>
                            <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Final Decision</h3>
                            <p className="text-gray-500 max-w-md mx-auto mt-2">Current Status: <span className="font-bold text-primary">{selectedApp.status}</span>. Choose an action to proceed.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            <button 
                                onClick={() => handleDecisionClick('Offer')}
                                className="p-6 bg-white dark:bg-card-dark border-2 border-transparent hover:border-green-500 rounded-xl shadow-sm hover:shadow-lg transition-all group text-center"
                            >
                                <span className="material-icons-outlined text-4xl text-green-500 mb-3 group-hover:scale-110 transition-transform">verified</span>
                                <h4 className="font-bold text-lg">Grant Admission</h4>
                                <p className="text-xs text-gray-500 mt-1">Send Offer Letter & Payment Link</p>
                            </button>
                            <button 
                                onClick={() => handleDecisionClick('Waitlist')}
                                className="p-6 bg-white dark:bg-card-dark border-2 border-transparent hover:border-orange-500 rounded-xl shadow-sm hover:shadow-lg transition-all group text-center"
                            >
                                <span className="material-icons-outlined text-4xl text-orange-500 mb-3 group-hover:scale-110 transition-transform">hourglass_empty</span>
                                <h4 className="font-bold text-lg">Waitlist</h4>
                                <p className="text-xs text-gray-500 mt-1">Hold application for future vacancy</p>
                            </button>
                            <button 
                                onClick={() => handleDecisionClick('Reject')}
                                className="p-6 bg-white dark:bg-card-dark border-2 border-transparent hover:border-red-500 rounded-xl shadow-sm hover:shadow-lg transition-all group text-center"
                            >
                                <span className="material-icons-outlined text-4xl text-red-500 mb-3 group-hover:scale-110 transition-transform">block</span>
                                <h4 className="font-bold text-lg">Reject</h4>
                                <p className="text-xs text-gray-500 mt-1">Decline application & Notify</p>
                            </button>
                        </div>

                        {selectedApp.decisionNotes && (
                            <div className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h5 className="font-bold text-sm text-gray-500 mb-2 uppercase">Previous Decision Note</h5>
                                <p className="text-sm italic text-gray-700 dark:text-gray-300">"{selectedApp.decisionNotes}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Decision Modal */}
            {decisionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDecisionModal({ isOpen: false, type: null })}></div>
                    <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in-down">
                        <div className={`p-4 border-b flex justify-between items-center ${
                            decisionModal.type === 'Offer' ? 'bg-green-50 border-green-200' :
                            decisionModal.type === 'Reject' ? 'bg-red-50 border-red-200' :
                            'bg-orange-50 border-orange-200'
                        }`}>
                            <h3 className={`font-bold text-lg ${
                                decisionModal.type === 'Offer' ? 'text-green-800' :
                                decisionModal.type === 'Reject' ? 'text-red-800' :
                                'text-orange-800'
                            }`}>Confirm {decisionModal.type}</h3>
                            <button onClick={() => setDecisionModal({ isOpen: false, type: null })}><span className="material-icons-outlined text-gray-500">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                This action will update the application status and send a notification to the parent. Review the message below:
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email / SMS Content</label>
                                <textarea 
                                    rows={6} 
                                    value={decisionText} 
                                    onChange={(e) => setDecisionText(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary outline-none"
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                            <button onClick={() => setDecisionModal({ isOpen: false, type: null })} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancel</button>
                            <button 
                                onClick={submitDecision}
                                className={`px-6 py-2 text-white rounded-lg text-sm font-medium shadow-sm ${
                                    decisionModal.type === 'Offer' ? 'bg-green-600 hover:bg-green-700' :
                                    decisionModal.type === 'Reject' ? 'bg-red-600 hover:bg-red-700' :
                                    'bg-orange-500 hover:bg-orange-600'
                                }`}
                            >
                                Confirm & Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
      {view === 'list' ? renderList() : renderDetail()}
    </div>
  );
};
