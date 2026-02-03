
import React, { useState } from 'react';

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

// --- Mock Data Types ---
interface Guardian {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  isFeePayer: boolean;
  isEmergencyContact: boolean;
}

interface Sibling {
  id: string;
  name: string;
  class: string;
  admissionNo: string;
  avatarColor: string;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, onBack }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [siblingDiscount, setSiblingDiscount] = useState(false);

  // Mock Student Data
  const student = {
    id: studentId,
    admissionNo: 'ADM-2019-042',
    name: 'Aarav Patel',
    class: 'Class 1 - A',
    roll: '042',
    dob: '2019-05-15',
    gender: 'Male',
    bloodGroup: 'B+',
    aadhar: '1234-5678-9012',
    address: '123 Green Avenue, Springfield, IL',
    language: 'English (Primary), Hindi (Secondary)',
    photo: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=random&size=128',
    status: 'Active',
    
    // Family
    guardians: [
      { id: 'g1', name: 'Suresh Patel', relation: 'Father', phone: '+91 98765 43210', email: 'suresh.p@example.com', isFeePayer: true, isEmergencyContact: true },
      { id: 'g2', name: 'Priya Patel', relation: 'Mother', phone: '+91 98765 43211', email: 'priya.p@example.com', isFeePayer: false, isEmergencyContact: true }
    ] as Guardian[],
    siblings: [
      { id: 's1', name: 'Riya Patel', class: 'Class 5 - B', admissionNo: 'ADM-2015-089', avatarColor: 'bg-pink-100 text-pink-600' }
    ] as Sibling[],

    // Academics
    academics: {
      attendance: 94,
      lastGrade: 'A',
      rank: 5,
      history: [
        { year: '2023-24', class: 'KG 2', result: 'Promoted', marks: '92%' },
        { year: '2022-23', class: 'KG 1', result: 'Promoted', marks: '95%' }
      ]
    },

    // Health
    medical: {
       hasAlert: true,
       allergies: ['Peanuts', 'Dust'],
       conditions: ['Asthma'],
       medications: 'EpiPen (kept in bag)',
       doctor: 'Dr. A. Smith (+91 99999 88888)',
       vaccinations: [
         { name: 'Polio', date: '2019-06-01', status: 'Completed' },
         { name: 'Tetanus', date: '2024-01-10', status: 'Due' }
       ],
       nurseNotes: [
         { date: '2024-10-12', note: 'Mild fever reported. Sent home early.', author: 'Nurse Sarah' }
       ]
    },

    // Documents
    docs: [
       { id: 'd1', name: 'Birth Certificate', type: 'PDF', status: 'Verified', date: '2019-04-01', verifiedBy: 'Admin' },
       { id: 'd2', name: 'Transfer Certificate', type: 'PDF', status: 'Pending', date: '-', verifiedBy: '-' },
       { id: 'd3', name: 'Aadhar Card', type: 'JPG', status: 'Verified', date: '2020-02-15', verifiedBy: 'Admin' },
       { id: 'd4', name: 'Immunization Record', type: 'PDF', status: 'Rejected', date: '2024-08-10', verifiedBy: 'Nurse Sarah' }
    ],

    // Communication Log
    communications: [
      { id: 'c1', type: 'SMS', date: 'Yesterday, 10:30 AM', subject: 'Fee Reminder', status: 'Delivered' },
      { id: 'c2', type: 'Email', date: 'Oct 20, 2:00 PM', subject: 'Report Card Term 1', status: 'Opened' },
      { id: 'c3', type: 'Call', date: 'Oct 15, 9:15 AM', subject: 'Absenteeism check', status: 'Connected' }
    ],

    // Audit
    audit: [
      { id: 'a1', date: 'Oct 24, 2024 14:00', user: 'Admin', action: 'Updated Address' },
      { id: 'a2', date: 'Oct 24, 2024 13:50', user: 'Nurse Sarah', action: 'Added Medical Note' },
      { id: 'a3', date: 'Aug 10, 2024 09:00', user: 'System', action: 'Promoted to Class 1' }
    ]
  };

  // --- Handlers ---

  const handleRequestDoc = (docName: string) => {
     // Prompt Logic
     const message = `Missing: ${docName}. Click “Request Document” to send automated SMS to parent.`;
     if (confirm(message)) {
       alert(`SMS Sent to ${student.guardians[0].phone}: "Dear ${student.guardians[0].name}, please submit the ${docName} for ${student.name} at the earliest."`);
     }
  };

  const handleSiblingDiscount = (checked: boolean) => {
    setSiblingDiscount(checked);
    if (checked) {
      alert(`Sibling Discount Applied!\n\nDiscount: 10% on Tuition Fee\nApplicable: Term 2 & 3\nLinked Sibling: ${student.siblings[0].name}`);
    }
  };

  const handleAddGuardian = () => {
    prompt("Add guardian details — name, relation, phone, email (optional). Mark as primary fee payer if they will handle bills.");
  };

  const renderSummary = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Left Col: Snapshot */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Attendance</p>
                    <h3 className="text-2xl font-bold text-green-600">{student.academics.attendance}%</h3>
                    <p className="text-[10px] text-gray-400">Year to Date</p>
                </div>
                <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Current Grade</p>
                    <h3 className="text-2xl font-bold text-blue-600">{student.academics.lastGrade}</h3>
                    <p className="text-[10px] text-gray-400">Class Rank: {student.academics.rank}</p>
                </div>
                <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Fee Status</p>
                    <h3 className="text-2xl font-bold text-orange-500">Due</h3>
                    <p className="text-[10px] text-gray-400">₹12,500 Pending</p>
                </div>
                <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Alerts</p>
                    <h3 className="text-2xl font-bold text-red-500">2</h3>
                    <p className="text-[10px] text-gray-400">1 Doc, 1 Health</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Recent Timeline</h3>
                <div className="space-y-4">
                    {student.audit.slice(0, 3).map((log, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <div className="w-px h-full bg-gray-200 dark:bg-gray-700 my-1"></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{log.action}</p>
                                <p className="text-xs text-gray-500">{log.date} by {log.user}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Col: Profile Card Mini */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 className="font-bold text-sm text-gray-500 uppercase mb-4">Primary Guardian</h3>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">SP</div>
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{student.guardians[0].name}</p>
                        <p className="text-xs text-gray-500">{student.guardians[0].relation}</p>
                    </div>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="material-icons-outlined text-sm">phone</span> {student.guardians[0].phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="material-icons-outlined text-sm">email</span> {student.guardians[0].email}
                    </div>
                </div>
                <button className="w-full mt-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    View Family Details
                </button>
            </div>
        </div>
    </div>
  );

  const renderPersonal = () => (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Personal Information</h3>
            <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isEditing ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
            >
                <span className="material-icons-outlined text-sm">{isEditing ? 'save' : 'edit'}</span> {isEditing ? 'Save Changes' : 'Edit'}
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                {isEditing ? (
                    <input type="text" defaultValue={student.name} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600" />
                ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.name}</p>
                )}
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                {isEditing ? (
                    <input type="date" defaultValue={student.dob} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600" />
                ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.dob}</p>
                )}
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                {isEditing ? (
                    <select defaultValue={student.gender} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
                        <option>Male</option><option>Female</option>
                    </select>
                ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.gender}</p>
                )}
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Blood Group</label>
                <p className="text-sm font-bold text-red-500">{student.bloodGroup}</p>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aadhar Number</label>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono">{student.aadhar}</p>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Languages</label>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.language}</p>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Residential Address</label>
                {isEditing ? (
                    <textarea rows={2} defaultValue={student.address} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600" />
                ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.address}</p>
                )}
            </div>
        </div>
    </div>
  );

  const renderFamily = () => (
    <div className="space-y-6 animate-fade-in">
        {/* Guardians */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark">Guardians</h3>
                <button onClick={handleAddGuardian} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <span className="material-icons-outlined text-sm">person_add</span> Add Guardian
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.guardians.map(g => (
                    <div key={g.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200">{g.name}</h4>
                                <p className="text-xs text-gray-500">{g.relation}</p>
                            </div>
                            {g.isFeePayer && (
                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Fee Payer</span>
                            )}
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p className="flex items-center gap-2"><span className="material-icons-outlined text-xs">phone</span> {g.phone}</p>
                            <p className="flex items-center gap-2"><span className="material-icons-outlined text-xs">email</span> {g.email}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Siblings */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">Siblings</h3>
            <div className="space-y-4">
                {student.siblings.map(s => (
                    <div key={s.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${s.avatarColor}`}>
                            {s.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{s.name}</h4>
                            <p className="text-xs text-gray-500">{s.class} • {s.admissionNo}</p>
                        </div>
                        <button className="text-xs border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            View Profile
                        </button>
                    </div>
                ))}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Sibling Discount</p>
                        <p className="text-xs text-gray-500">Apply concurrent enrollment benefit.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={siblingDiscount} onChange={(e) => handleSiblingDiscount(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
            </div>
        </div>
    </div>
  );

  const renderDocs = () => (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-fade-in">
        <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">Document Repository</h3>
        <div className="grid grid-cols-1 gap-3">
            {student.docs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                            <span className="material-icons-outlined text-lg">description</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type} • {doc.date}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 
                            doc.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                            {doc.status}
                        </span>
                        {doc.status === 'Pending' && (
                            <button 
                                onClick={() => handleRequestDoc(doc.name)}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <span className="material-icons-outlined text-sm">send</span> Request
                            </button>
                        )}
                        {doc.status === 'Verified' && (
                            <span className="material-icons-outlined text-green-600 text-sm" title={`Verified by ${doc.verifiedBy}`}>check_circle</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button className="text-xs bg-primary text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-600">
                <span className="material-icons-outlined text-sm">upload</span> Upload New
            </button>
        </div>
    </div>
  );

  const renderHealth = () => (
    <div className="space-y-6 animate-fade-in">
        {student.medical.hasAlert && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start gap-4 animate-pulse-slow">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600">
                    <span className="material-icons-outlined text-2xl">medical_services</span>
                </div>
                <div>
                    <h4 className="font-bold text-red-800 dark:text-red-300">Medical Alert: {student.name}</h4>
                    <div className="mt-1 text-sm text-red-700 dark:text-red-200 space-y-1">
                        <p><strong>Allergies:</strong> {student.medical.allergies.join(', ')}</p>
                        <p><strong>Medication:</strong> {student.medical.medications}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Vaccination Record</h3>
                <div className="space-y-3">
                    {student.medical.vaccinations.map((v, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-800 pb-2 last:border-0">
                            <span className="text-gray-700 dark:text-gray-300">{v.name}</span>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${v.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {v.status}
                                </span>
                                <p className="text-[10px] text-gray-400 mt-0.5">{v.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 text-text-main-light dark:text-text-main-dark">Nurse Notes</h3>
                <div className="space-y-4">
                    {student.medical.nurseNotes.map((note, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{note.date}</span>
                                <span>{note.author}</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{note.note}</p>
                        </div>
                    ))}
                    <button className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                        + Add Note
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderComms = () => (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-fade-in">
        <h3 className="font-bold text-lg text-text-main-light dark:text-text-main-dark mb-4">Recent Communications</h3>
        <div className="space-y-4">
            {student.communications.map(comm => (
                <div key={comm.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg
                        ${comm.type === 'SMS' ? 'bg-green-500' : comm.type === 'Email' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        <span className="material-icons-outlined">
                            {comm.type === 'SMS' ? 'sms' : comm.type === 'Email' ? 'email' : 'call'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{comm.subject}</h4>
                        <p className="text-xs text-gray-500">{comm.date} • {comm.type}</p>
                    </div>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                        {comm.status}
                    </span>
                </div>
            ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-500">Auto-notify parents on absence?</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden shadow-sm z-10">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
         
         <button onClick={onBack} className="absolute top-4 left-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 z-10">
            <span className="material-icons-outlined">arrow_back</span>
         </button>

         <div className="w-24 h-24 rounded-full border-4 border-white dark:border-card-dark shadow-lg bg-gray-200 flex items-center justify-center overflow-hidden z-10 mt-6 md:mt-0">
            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
         </div>
         
         <div className="flex-1 text-center md:text-left z-10 pt-2 md:pt-0 self-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{student.name}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-sm text-gray-500">
                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{student.admissionNo}</span>
                <span>{student.class}</span>
                <span>Roll: {student.roll}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">{student.status}</span>
                {student.medical.hasAlert && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase flex items-center gap-1"><span className="material-icons-outlined text-[10px]">medical_services</span> Medical Alert</span>}
            </div>
         </div>

         <div className="flex flex-wrap gap-2 z-10 mt-4 md:mt-0 self-center justify-center">
            <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">badge</span> ID Card
            </button>
            <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">receipt_long</span> Invoice
            </button>
            <button className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-blue-600 shadow-sm flex items-center gap-1">
                <span className="material-icons-outlined text-sm">edit</span> Edit
            </button>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500">
                <span className="material-icons-outlined text-sm">more_vert</span>
            </button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark px-4 sticky top-0 z-20 shadow-sm overflow-x-auto">
         {['Summary', 'Personal', 'Family', 'Academics', 'Documents', 'Health', 'Communications', 'Audit'].map(tab => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab.toLowerCase())}
               className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
               {tab}
            </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50 dark:bg-black/20">
         <div className="max-w-6xl mx-auto">
            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'personal' && renderPersonal()}
            {activeTab === 'family' && renderFamily()}
            {activeTab === 'documents' && renderDocs()}
            {activeTab === 'health' && renderHealth()}
            {activeTab === 'communications' && renderComms()}
            
            {activeTab === 'academics' && (
                <div className="bg-white dark:bg-card-dark p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-gray-400">
                    <span className="material-icons-outlined text-4xl mb-2">school</span>
                    <p>Academics module integration pending.</p>
                </div>
            )}
            {activeTab === 'audit' && (
                <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold mb-4">Audit Trail</h3>
                    <div className="space-y-4">
                        {student.audit.map((log, i) => (
                            <div key={i} className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                                <span>{log.action}</span>
                                <span className="text-gray-500 text-xs">{log.date} • {log.user}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
